import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import API from "../api";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "./VoyageDetails.css";
import Footer from "../components/Footer"; 

// Fix icône Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

const VoyageDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [voyage, setVoyage] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [date, setDate] = useState("");
  const [people, setPeople] = useState(1);
  const [message, setMessage] = useState("");
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Date minimum (aujourd'hui)
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);

    const fetchVoyage = async () => {
      try {
        const res = await API.get(`/voyages/${id}`);
        setVoyage(res.data);
      } catch (err) {
        console.error("Erreur chargement voyage :", err);
        // Rediriger vers l'accueil si le voyage n'existe pas
        setTimeout(() => navigate("/"), 2000);
      } finally {
        setLoading(false);
      }
    };

    const checkFavorite = async () => {
      if (!token) return;
      
      try {
        const favs = await API.get("/favorites");
        const liked = favs.data.some((f) => f.voyageId === parseInt(id));
        setIsFavorite(liked);
      } catch (err) {
        console.error("Erreur favoris :", err);
      }
    };

    fetchVoyage();
    if (token) {
      checkFavorite();
    }
  }, [id, navigate]);

  const toggleFavorite = async () => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    try {
      if (isFavorite) {
        await API.delete(`/favorites/${id}`);
      } else {
        await API.post(`/favorites/${id}`);
      }
      setIsFavorite(!isFavorite);
    } catch (err) {
      console.error("Erreur toggle favoris :", err);
      setMessage("❌ Erreur lors de la mise à jour des favoris");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleReservation = async (e) => {
    e.preventDefault();
    
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    setSubmitting(true);
    setMessage("");

    try {
      await API.post("/reservations", {
        voyageId: parseInt(id),
        date,
        people: parseInt(people),
      });
      
      setMessage("✅ Réservation confirmée ! Vous allez recevoir un email de confirmation.");
      
      // Réinitialiser le formulaire
      setDate("");
      setPeople(1);
      
      // Effacer le message après 5 secondes
      setTimeout(() => setMessage(""), 5000);
    } catch (err) {
      console.error("Erreur réservation :", err);
      setMessage("❌ Erreur lors de la réservation. Veuillez réessayer.");
      setTimeout(() => setMessage(""), 5000);
    } finally {
      setSubmitting(false);
    }
  };

  // Calcul du prix total
  const totalPrice = voyage ? voyage.price * people : 0;

  // Générer des images factices si aucune image n'est disponible
  const getImages = () => {
    if (voyage?.images?.length > 0) {
      return voyage.images;
    }
    
    // Images factices basées sur l'image principale
    return [
      { id: 1, url: voyage?.imageUrl },
      { id: 2, url: voyage?.imageUrl },
      { id: 3, url: voyage?.imageUrl }
    ].filter(img => img.url);
  };

  const images = getImages();

  if (loading) {
    return (
      <div className="voyage-details-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <div className="loading-text">Chargement du voyage...</div>
        </div>
      </div>
    );
  }

  if (!voyage) {
    return (
      <div className="voyage-details-container">
        <div className="loading-container">
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>❌</div>
          <div className="loading-text">Voyage introuvable</div>
          <p style={{ color: '#999', marginTop: '1rem' }}>
            Redirection vers l'accueil...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="voyage-details-container">
      {/* Navigation */}
      <nav className="voyage-nav">
        <div className="nav-content">
          <Link to="/" className="back-button">
            ← Retour à l'accueil
          </Link>
          
          <div className="voyage-breadcrumb">
            Voyage › {voyage.country} › {voyage.city}
          </div>
          

        </div>
      </nav>

      <div className="voyage-details">
        <div className="voyage-content">
          {/* Header avec image principale */}
          <div className="voyage-header">
            <div className="main-image-container">
              {voyage.isPromo && (
                <div className="promo-overlay">
                  🔥 Promotion
                </div>
              )}
              
              <img
                src={images[selectedImageIndex]?.url || voyage.imageUrl}
                alt={voyage.title}
                className="main-image"
              />
              
              <div className="image-overlay">
                <button 
                  onClick={toggleFavorite} 
                  className={`favorite-btn ${isFavorite ? 'active' : ''}`}
                  title={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
                >
                  {isFavorite ? "❤️" : "🤍"}
                </button>
              </div>
            </div>
            
            <div className="voyage-info">
              <h1 className="voyage-title">{voyage.title}</h1>
              
              <div className="voyage-meta">
                <div className="meta-item">
                  <span className="meta-icon">📍</span>
                  <div className="meta-content">
                    <div className="meta-label">Destination</div>
                    <div className="meta-value">{voyage.city}, {voyage.country}</div>
                  </div>
                </div>
                
                <div className="meta-item">
                  <span className="meta-icon">💰</span>
                  <div className="meta-content">
                    <div className="meta-label">Prix par personne</div>
                    <div className="meta-value">{voyage.price}€</div>
                  </div>
                </div>
                
                <div className="meta-item">
                  <span className="meta-icon">🏷️</span>
                  <div className="meta-content">
                    <div className="meta-label">Type de voyage</div>
                    <div className="meta-value">{voyage.type}</div>
                  </div>
                </div>
              </div>
              
              {voyage.description && (
                <div className="voyage-description">
                  <strong>À propos de ce voyage :</strong><br />
                  {voyage.description}
                </div>
              )}
            </div>
          </div>

          {/* Galerie d'images */}
          {images.length > 1 && (
            <div className="gallery-section">
              <h3 className="section-title">📸 Galerie photos</h3>
              <div className="image-gallery">
                {images.map((img, index) => (
                  <div
                    key={img.id || index}
                    className={`gallery-item ${index === selectedImageIndex ? 'active' : ''}`}
                    onClick={() => setSelectedImageIndex(index)}
                  >
                    <img
                      src={img.url}
                      alt={`${voyage.title} - Photo ${index + 1}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Carte */}
          {voyage.latitude && voyage.longitude && (
            <div className="map-section">
              <h3 className="section-title">🗺️ Localisation</h3>
              <div className="map-container">
                <MapContainer
                  center={[voyage.latitude, voyage.longitude]}
                  zoom={13}
                  scrollWheelZoom={false}
                  style={{ height: "100%", width: "100%" }}
                >
                  <TileLayer
                    attribution='© OpenStreetMap'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker position={[voyage.latitude, voyage.longitude]}>
                    <Popup>
                      <strong>{voyage.title}</strong><br />
                      {voyage.city}, {voyage.country}
                    </Popup>
                  </Marker>
                </MapContainer>
              </div>
            </div>
          )}

          {/* Section réservation */}
          <div className="reservation-section">
            <div className="reservation-card">
              <h3>🎫 Réserver ce voyage</h3>
              
              {!isLoggedIn ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔐</div>
                  <p style={{ marginBottom: '2rem', color: '#666' }}>
                    Vous devez être connecté pour effectuer une réservation
                  </p>
                  <Link 
                    to="/login" 
                    className="reservation-btn"
                    style={{ textDecoration: 'none', display: 'inline-block' }}
                  >
                    Se connecter
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleReservation} className="reservation-form">
                  <div className="form-group">
                    <label htmlFor="date">📅 Date de départ</label>
                    <input
                      id="date"
                      type="date"
                      value={date}
                      min={today}
                      onChange={(e) => setDate(e.target.value)}
                      required
                      disabled={submitting}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="people">👥 Nombre de personnes</label>
                    <input
                      id="people"
                      type="number"
                      value={people}
                      min="1"
                      max="20"
                      onChange={(e) => setPeople(e.target.value)}
                      required
                      disabled={submitting}
                    />
                  </div>

                  <div className="price-summary">
                    <div className="price-breakdown">
                      Détail du prix :
                    </div>
                    <div className="price-detail">
                      <span>{voyage.price}€ × {people} personne{people > 1 ? 's' : ''}</span>
                      <span>{voyage.price * people}€</span>
                    </div>
                    {voyage.isPromo && (
                      <div className="price-detail" style={{ color: '#e91e63', fontSize: '0.9rem' }}>
                        <span>🔥 Prix promotionnel appliqué</span>
                        <span></span>
                      </div>
                    )}
                    <div className="total-price">
                      Total : {totalPrice}€
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className="reservation-btn"
                    disabled={submitting || !date}
                  >
                    {submitting ? (
                      <>
                        <span className="loading-spinner" style={{ 
                          width: '20px', 
                          height: '20px', 
                          marginRight: '0.5rem',
                          border: '2px solid rgba(255,255,255,0.3)',
                          borderTop: '2px solid white'
                        }}></span>
                        Réservation...
                      </>
                    ) : (
                      `Réserver pour ${totalPrice}€`
                    )}
                  </button>
                </form>
              )}

              {message && (
                <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
                  {message}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
       {/* FOOTER */}
      <Footer />
    </div>
  );
};


export default VoyageDetails;