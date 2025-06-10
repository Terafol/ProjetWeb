import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./Layout.css";

const Layout = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    if (window.confirm("Êtes-vous sûr(e) de vouloir vous déconnecter ?")) {
      localStorage.removeItem("token");
      navigate("/");
    }
  };

  const navItems = [
    { path: "/", label: "Accueil", icon: "🏠" },
    { path: "/favorites", label: "Mes favoris", icon: "❤️" },
    { path: "/reservations", label: "Mes réservations", icon: "📅" },
    { path: "/profile", label: "Mon profil", icon: "👤" }
  ];

  const isActive = (path) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="layout-container">
      {/* Navigation */}
      <nav className="main-nav">
        <div className="nav-container">
          {/* Logo */}
          <Link to="/" className="nav-logo">
            <img src="http://localhost:5000/uploads/accueil/AC4.png" alt="Logo" className="logo-image" />
            <span className="logo-text">Lolas</span>
          </Link>

          {/* Menu burger pour mobile */}
          <button 
            className={`menu-toggle ${isMenuOpen ? 'active' : ''}`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          {/* Navigation links */}
          <div className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-text">{item.label}</span>
              </Link>
            ))}
            
            <button 
              onClick={handleLogout}
              className="nav-link logout-button"
            >
              <span className="nav-icon">🚪</span>
              <span className="nav-text">Déconnexion</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Contenu principal */}
      <main className="main-content">
        {children}
      </main>

     
    </div>
  );
};

export default Layout;