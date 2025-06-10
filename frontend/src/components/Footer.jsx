import React from "react";
import { Link } from "react-router-dom";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="main-footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>Lolas</h3>
            <p>Votre compagnon de voyage idéal pour découvrir le monde.</p>

          </div>
          
          <div className="footer-section">
            <h4>Navigation</h4>
            <ul>
              <li><Link to="/">Accueil</Link></li>
              <li><Link to="/favorites">Mes favoris</Link></li>
              <li><Link to="/reservations">Mes réservations</Link></li>
              <li><Link to="/profile">Mon profil</Link></li>
            </ul>
          </div>
          
          
          <div className="footer-section">
            <h4>Support</h4>
            <ul>
              <li>Aide</li>
              <li>Contact</li>
              <li>Conditions générales</li>
              <li>Politique de confidentialité</li>
            </ul>
          </div>
        </div>
        
        <div className="footer-bottom">
          <div className="footer-bottom-left">
            <p>&copy; 2025 Lolas. Tous droits réservés.</p>
          </div>
          
          <div className="footer-bottom-right">
            <div className="footer-contact">
              <span>Loup Langard</span>
              <span>Nicolas Coinin</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;