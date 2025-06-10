import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./VoyageCard.css";

const VoyageCard = ({ 
  voyage, 
  isFavorite = false, 
  onToggleFavorite, 
  isLoggedIn = false,
  variant = "default", // default, compact, featured
  showActions = true,
  clickable = true,
  loading = false
}) => {
  const navigate = useNavigate();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [likeAnimating, setLikeAnimating] = useState(false);

  const handleLike = async (e) => {
    e.stopPropagation(); // Empêcher la navigation quand on clique sur le cœur
    
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    if (onToggleFavorite && !likeAnimating) {
      setLikeAnimating(true);
      await onToggleFavorite(voyage.id);
      
      // Animation terminée après un délai
      setTimeout(() => {
        setLikeAnimating(false);
      }, 300);
    }
  };

  const handleCardClick = () => {
    if (clickable && !loading) {
      navigate(`/voyages/${voyage.id}`);
    }
  };

  const getTypeClass = (type) => {
    const typeMap = {
      'plage': 'plage',
      'montagne': 'montagne',
      'culture': 'culture'
    };
    return typeMap[type?.toLowerCase()] || '';
  };

  const generateRating = () => {
    // Génère une note fictive basée sur l'ID pour la cohérence
    const rating = (3.5 + (voyage.id % 15) / 10).toFixed(1);
    const stars = '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));
    return { rating, stars };
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR').format(price);
  };

  if (loading) {
    return (
      <div className={`voyage-card loading ${variant}`}>
        <div className="image-container"></div>
        <div className="info">
          <div className="voyage-location">Chargement...</div>
          <div className="voyage-price">000 €</div>
        </div>
      </div>
    );
  }

  const { rating, stars } = generateRating();

  return (
    <div 
      className={`voyage-card ${variant} ${clickable ? 'clickable' : ''}`}
      onClick={handleCardClick}
    >
      <div className="image-container">
        <img 
          src={voyage.imageUrl} 
          alt={voyage.title}
          onLoad={() => setImageLoaded(true)}
          style={{ opacity: imageLoaded ? 1 : 0 }}
        />
        
        {/* Badge promo */}
        {voyage.isPromo && (
          <div className="promo-badge">
            🔥 Promo
          </div>
        )}
        
        {/* Bouton favori */}
        <div 
          className={`like-icon ${isFavorite ? 'favorited' : ''} ${likeAnimating ? 'animating' : ''}`}
          onClick={handleLike}
          style={{
            transform: likeAnimating ? 'scale(1.2)' : 'scale(1)',
            transition: 'all 0.3s ease'
          }}
        >
          {isFavorite ? "❤️" : "🤍"}
        </div>
        
        {/* Tag type de voyage */}
        <div className={`tags-overlay ${getTypeClass(voyage.type)}`}>
          {voyage.type}
        </div>
      </div>
      
      <div className="info">
        <div className="voyage-location">
          <span className="location-icon">📍</span>
          {voyage.country} – {voyage.city}
        </div>
        
        <div className="voyage-price">
          {formatPrice(voyage.price)}€
        </div>
        
      </div>
    </div>
  );
};

export default VoyageCard;