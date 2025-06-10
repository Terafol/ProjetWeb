import React from "react";
import { Link } from "react-router-dom";
import "./VoyageCarousel.css";

const VoyageCarousel = ({ title, voyages, isLoggedIn, favorites, onToggleFavorite }) => {
  return (
    <div className="carousel-section">
      <h2>{title}</h2>
      <div className="carousel-wrapper">
        <div className="carousel-track">
          {voyages.map((voyage) => (
            <div key={voyage.id} className="carousel-card">
              <Link to={`/voyages/${voyage.id}`}>
                <img src={voyage.imageUrl} alt={voyage.title} className="carousel-img" />
              </Link>
              <div className="carousel-info">
                <h4>{voyage.title}</h4>
                <p>{voyage.city}, {voyage.country}</p>
                <p><strong>{voyage.price} €</strong></p>
                <div className="carousel-tags">
                  <span className="tag">{voyage.type}</span>
                  {voyage.isPromo && <span className="tag promo">Promo</span>}
                </div>
              </div>
              <button
                className="like-btn"
                onClick={() => {
                  if (!isLoggedIn) return (window.location.href = "/login");
                  onToggleFavorite(voyage.id);
                }}
              >
                {favorites.includes(voyage.id) ? "❤️" : "🤍"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VoyageCarousel;
