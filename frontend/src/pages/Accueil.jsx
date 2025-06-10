import React, { useEffect, useState } from "react";
import API from "../api";
import VoyageCarousel from "../components/VoyageCarousel";
import VoyageCard from "../components/VoyageCard";
import Footer from "../components/Footer"; // ← Import du Footer
import "./Accueil.css";

const Accueil = () => {
  const [promo, setPromo] = useState([]);
  const [nouveaux, setNouveaux] = useState([]);
  const [top, setTop] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterPrice, setFilterPrice] = useState("");
  const [isSearchActive, setIsSearchActive] = useState(false);

  useEffect(() => {
    loadData();
    const token = localStorage.getItem("token");
    if (token) {
      setUser(true);
      loadFavorites();
    }
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const all = await API.get("/voyages");
      const voyages = all.data;

      setPromo(
        voyages
          .filter((v) => v.isPromo)
          .sort((a, b) => a.price - b.price)
          .slice(0, 10)
      );
      setNouveaux(
        voyages
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 10)
      );
      setTop(
        voyages
          .sort((a, b) => (b.reservations?.length || 0) - (a.reservations?.length || 0))
          .slice(0, 10)
      );
    } catch (err) {
      console.error("Erreur voyages :", err);
    } finally {
      setLoading(false);
    }
  };

  const loadFavorites = async () => {
    try {
      const res = await API.get("/favorites");
      setFavorites(res.data.map((f) => f.voyageId));
    } catch (err) {
      console.error("Erreur favoris :", err);
    }
  };

  const handleToggleFavorite = async (id) => {
    try {
      if (favorites.includes(id)) {
        await API.delete(`/favorites/${id}`);
        setFavorites(favorites.filter((fid) => fid !== id));
      } else {
        await API.post(`/favorites/${id}`);
        setFavorites([...favorites, id]);
      }
    } catch (err) {
      console.error("Erreur like :", err);
    }
  };

  // Recherche globale dans la base de données
  const performSearch = async () => {
    if (!search && !filterType && !filterPrice) {
      setIsSearchActive(false);
      setSearchResults([]);
      return;
    }

    try {
      setSearchLoading(true);
      setIsSearchActive(true);

      // Construire les paramètres de recherche
      const params = new URLSearchParams();
      if (search) params.append('country', search);
      if (filterType) params.append('type', filterType);
      if (filterPrice) params.append('maxPrice', filterPrice);
      params.append('sort', 'price'); // Trier par prix par défaut

      const response = await API.get(`/voyages?${params.toString()}`);
      setSearchResults(response.data);
    } catch (err) {
      console.error("Erreur recherche :", err);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    performSearch();
  };

  // Recherche en temps réel quand les filtres changent
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (search || filterType || filterPrice) {
        performSearch();
      } else {
        setIsSearchActive(false);
        setSearchResults([]);
      }
    }, 500); // Délai de 500ms pour éviter trop de requêtes

    return () => clearTimeout(timeoutId);
  }, [search, filterType, filterPrice]);

  const clearFilters = () => {
    setSearch("");
    setFilterType("");
    setFilterPrice("");
    setIsSearchActive(false);
    setSearchResults([]);
  };

  const hasActiveFilters = search || filterType || filterPrice;

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'linear-gradient(135deg, #00bfa6, #00acc1)',
        color: 'white',
        fontSize: '1.2rem'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '50px', 
            height: '50px', 
            border: '3px solid rgba(255,255,255,0.3)',
            borderTop: '3px solid white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }}></div>
          Chargement de vos destinations de rêve...
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* HERO */}
      <div className="hero">
        <img src="http://localhost:5000/uploads/accueil/AC4.png" className="logo" alt="logo" />
        <a href="/profile" className="account">
          <img src="http://localhost:5000/uploads/accueil/AC2.png" alt="compte" />
        </a>
        <div className="hero-overlay">
          <h1>Avec Lolas, laissez vous guider pour votre prochain voyage</h1>
          <p className="hero-subtitle">
            Découvrez des destinations uniques aux quatre coins du monde
          </p>
        </div>
      </div>

      {/* BARRE DE RECHERCHE STICKY */}
      <div className="sticky-search">
        <form className="search-bar" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="🔍 Quelle destination vous fait rêver ?"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select 
            value={filterType} 
            onChange={(e) => setFilterType(e.target.value)}
            style={{ color: filterType ? '#333' : '#999' }}
          >
            <option value="">🏷️ Type de voyage</option>
            <option value="plage">🏖️ Plage</option>
            <option value="montagne">🏔️ Montagne</option>
            <option value="culture">🏛️ Culture</option>
          </select>
          <input
            type="number"
            placeholder="💰 Budget maximum"
            value={filterPrice}
            onChange={(e) => setFilterPrice(e.target.value)}
          />
          <button type="submit">
            <img src="http://localhost:5000/uploads/accueil/AC3.png" alt="rechercher" />
          </button>
        </form>
      </div>

      {/* Indicateur de filtres actifs */}
      {hasActiveFilters && (
        <div style={{ 
          padding: '1rem', 
          textAlign: 'center', 
          background: 'rgba(0, 191, 166, 0.1)',
          borderBottom: '1px solid rgba(0, 191, 166, 0.2)'
        }}>
          <span style={{ color: '#00bfa6', fontWeight: '500' }}>
            Filtres actifs : 
            {search && ` "${search}"`}
            {filterType && ` ${filterType}`}
            {filterPrice && ` ≤${filterPrice}€`}
          </span>
          <button 
            onClick={clearFilters}
            style={{
              marginLeft: '1rem',
              padding: '0.3rem 0.8rem',
              background: 'transparent',
              border: '1px solid #00bfa6',
              borderRadius: '20px',
              color: '#00bfa6',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            ✕ Effacer
          </button>
        </div>
      )}

      {/* CONTENU PRINCIPAL */}
      <div className="carousel-container" style={{ flex: 1 }}>
        {/* RÉSULTATS DE RECHERCHE */}
        {isSearchActive ? (
          <div className="search-results-section">
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              marginBottom: '2rem'
            }}>
              <h2 style={{
                fontSize: '2rem',
                fontWeight: '700',
                color: '#333',
                position: 'relative',
                display: 'inline-block'
              }}>
                🔍 Résultats de recherche
                <span style={{
                  content: '',
                  position: 'absolute',
                  bottom: '-8px',
                  left: '0',
                  width: '60px',
                  height: '4px',
                  background: 'linear-gradient(90deg, #00bfa6, #00acc1)',
                  borderRadius: '2px',
                  display: 'block'
                }}></span>
              </h2>
              
              <div style={{ 
                color: '#666', 
                fontSize: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                {searchLoading ? (
                  <>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      border: '2px solid rgba(0, 191, 166, 0.3)',
                      borderTop: '2px solid #00bfa6',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}></div>
                    Recherche...
                  </>
                ) : (
                  `${searchResults.length} voyage${searchResults.length > 1 ? 's' : ''} trouvé${searchResults.length > 1 ? 's' : ''}`
                )}
              </div>
            </div>

            {searchLoading ? (
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
                gap: '2rem',
                padding: '2rem 0'
              }}>
                {[...Array(6)].map((_, index) => (
                  <VoyageCard key={index} loading={true} />
                ))}
              </div>
            ) : searchResults.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '4rem 2rem',
                color: '#666',
                background: 'white',
                borderRadius: '20px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚫</div>
                <h3>Aucun voyage trouvé</h3>
                <p>Essayez de modifier vos critères de recherche</p>
                <button 
                  onClick={clearFilters}
                  style={{
                    marginTop: '1rem',
                    padding: '0.8rem 2rem',
                    background: '#00bfa6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '30px',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: '500'
                  }}
                >
                  Voir tous les voyages
                </button>
              </div>
            ) : (
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
                gap: '2rem',
                padding: '2rem',
                background: 'white',
                borderRadius: '20px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)'
              }}>
                {searchResults.map((voyage) => (
                  <VoyageCard
                    key={voyage.id}
                    voyage={voyage}
                    isFavorite={favorites.includes(voyage.id)}
                    onToggleFavorite={handleToggleFavorite}
                    isLoggedIn={user}
                    variant="default"
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          /* LISTES PAR DÉFAUT */
          <>
            {promo.length > 0 && (
              <VoyageCarousel
                title="🔥 En promotion"
                voyages={promo}
                isLoggedIn={user}
                favorites={favorites}
                onToggleFavorite={handleToggleFavorite}
              />
            )}
            
            {nouveaux.length > 0 && (
              <VoyageCarousel
                title="🆕 Nouveautés"
                voyages={nouveaux}
                isLoggedIn={user}
                favorites={favorites}
                onToggleFavorite={handleToggleFavorite}
              />
            )}
            
            {top.length > 0 && (
              <VoyageCarousel
                title="🏆 Les plus réservés"
                voyages={top}
                isLoggedIn={user}
                favorites={favorites}
                onToggleFavorite={handleToggleFavorite}
              />
            )}
          </>
        )}
      </div>

        {/* FOOTER */}
      <Footer />
    </div>
  );
};

export default Accueil;