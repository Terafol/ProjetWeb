import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api";
import VoyageCard from "../components/VoyageCard";
import Layout from "../components/Layout";
import "./Favorites.css";
import Footer from "../components/Footer"; // ← Import du Footer

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid"); // grid ou list
  const [sortBy, setSortBy] = useState("recent"); // recent, price, name

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const res = await API.get("/favorites");
      setFavorites(res.data);
    } catch (err) {
      console.error("Erreur favoris :", err);
      setError("❌ Impossible de charger vos favoris. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async (voyageId) => {
    try {
      // Retirer le favori
      await API.delete(`/favorites/${voyageId}`);
      setFavorites(favorites.filter(fav => fav.voyage.id !== voyageId));
    } catch (err) {
      console.error("Erreur suppression favori :", err);
      setError("❌ Erreur lors de la suppression du favori.");
    }
  };

  const sortedFavorites = [...favorites].sort((a, b) => {
    switch (sortBy) {
      case 'price':
        return a.voyage.price - b.voyage.price;
      case 'name':
        return a.voyage.title.localeCompare(b.voyage.title);
      case 'recent':
      default:
        return new Date(b.createdAt) - new Date(a.createdAt);
    }
  });

  if (loading) {
    return (
      <Layout>
        <div className="favorites-container">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <div className="loading-text">Chargement de vos favoris...</div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="favorites-container">
        <div className="favorites-wrapper">
          {/* En-tête */}
          <div className="favorites-header">
            <h1 className="favorites-title">❤️ Mes voyages favoris</h1>
            <p className="favorites-subtitle">
              Retrouvez tous les voyages qui vous font rêver
            </p>
            
            <div className="favorites-stats">
              <div className="stat-item">
                <span className="stat-number">{favorites.length}</span>
                <span className="stat-label">Favoris</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">
                  {favorites.length > 0 ? 
                    Math.min(...favorites.map(f => f.voyage.price)) + '€' : 
                    '0€'
                  }
                </span>
                <span className="stat-label">Prix min</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">
                  {new Set(favorites.map(f => f.voyage.country)).size}
                </span>
                <span className="stat-label">Pays</span>
              </div>
            </div>
          </div>

          <div className="favorites-content">
            {error && (
              <div className="error-message">
                <span>⚠️</span>
                {error}
              </div>
            )}

            {favorites.length === 0 ? (
              <div className="empty-favorites">
                <div className="empty-icon">💔</div>
                <h2 className="empty-title">Aucun favori pour le moment</h2>
                <p className="empty-description">
                  Vous n'avez pas encore ajouté de voyages à vos favoris. 
                  Explorez nos destinations et cliquez sur le cœur pour sauvegarder 
                  vos voyages préférés !
                </p>
                <Link to="/" className="cta-button">
                  🌍 Découvrir les voyages
                </Link>
              </div>
            ) : (
              <>
                {/* Actions et filtres */}
                <div className="favorites-actions">
                  <div className="view-toggle">
                    <button 
                      className={`view-button ${viewMode === 'grid' ? 'active' : ''}`}
                      onClick={() => setViewMode('grid')}
                    >
                      🔲 Grille
                    </button>
                    <button 
                      className={`view-button ${viewMode === 'list' ? 'active' : ''}`}
                      onClick={() => setViewMode('list')}
                    >
                      📋 Liste
                    </button>
                  </div>

                  <select 
                    className="sort-select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="recent">📅 Plus récents</option>
                    <option value="price">💰 Prix croissant</option>
                    <option value="name">🔤 Nom A-Z</option>
                  </select>
                </div>

                {/* Affichage des favoris */}
                {viewMode === 'grid' ? (
                  <div className="favorites-grid">
                    {sortedFavorites.map((fav) => (
                      <VoyageCard
                        key={fav.voyage.id}
                        voyage={fav.voyage}
                        isFavorite={true}
                        onToggleFavorite={handleToggleFavorite}
                        isLoggedIn={true}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="favorites-list">
                    {sortedFavorites.map((fav) => (
                      <div key={fav.voyage.id} className="favorite-item">
                        <img 
                          src={fav.voyage.imageUrl} 
                          alt={fav.voyage.title}
                          className="favorite-image"
                        />
                        <div className="favorite-info">
                          <h3 className="favorite-title">{fav.voyage.title}</h3>
                          <p className="favorite-location">
                            📍 {fav.voyage.city}, {fav.voyage.country}
                          </p>
                          <p className="favorite-price">
                            💰 {fav.voyage.price}€
                          </p>
                        </div>
                        <div className="favorite-actions">
                          <Link 
                            to={`/voyages/${fav.voyage.id}`}
                            className="action-button"
                          >
                            👁️ Voir
                          </Link>
                          <button 
                            onClick={() => handleToggleFavorite(fav.voyage.id)}
                            className="action-button remove-button"
                          >
                            🗑️ Retirer
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      
      </div>
        {/* FOOTER */}
      <Footer />
    </Layout>
    
  );
};

export default Favorites;