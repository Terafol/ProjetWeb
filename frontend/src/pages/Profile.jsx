import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api";
import "./Profile.css";
import Footer from "../components/Footer"; // ← Import du Footer

const Profile = () => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await API.get("/profile");
        setUser(res.data);
        setName(res.data.name);
        setEmail(res.data.email);
      } catch (err) {
        console.error("Erreur profile :", err);
        setError("Impossible de charger le profil. Veuillez vous reconnecter.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setError("");
    setSuccess("");

    try {
      const res = await API.put("/profile", { name, email });
      setUser(res.data.user);
      setSuccess("✅ Profil mis à jour avec succès !");
    } catch (err) {
      console.error("Erreur update :", err);
      setError("❌ Erreur lors de la mise à jour. Veuillez réessayer.");
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "⚠️ ATTENTION ⚠️\n\nÊtes-vous sûr(e) de vouloir supprimer définitivement votre compte ?\n\n" +
      "Cette action est IRRÉVERSIBLE et entraînera :\n" +
      "• La suppression de toutes vos données\n" +
      "• La perte de vos réservations\n" +
      "• La suppression de vos favoris\n\n" +
      "Tapez 'SUPPRIMER' pour confirmer cette action."
    );

    if (confirmed) {
      const finalConfirm = prompt(
        "Pour confirmer la suppression, tapez exactement : SUPPRIMER"
      );

      if (finalConfirm === "SUPPRIMER") {
        try {
          await API.delete("/auth/delete");
          localStorage.removeItem("token");
          alert("Votre compte a été supprimé. Vous allez être redirigé.");
          window.location.href = "/";
        } catch (err) {
          console.error("Erreur suppression :", err);
          setError("❌ Erreur lors de la suppression du compte.");
        }
      } else {
        alert("Suppression annulée - texte de confirmation incorrect.");
      }
    }
  };

  const handleLogout = () => {
    if (window.confirm("Êtes-vous sûr(e) de vouloir vous déconnecter ?")) {
      localStorage.removeItem("token");
      window.location.href = "/";
    }
  };

  // Fonction pour obtenir les initiales du nom
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <div className="loading-text">Chargement de votre profil...</div>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="profile-container">
        <div className="profile-wrapper">
          <div className="profile-card">
            <div className="error-message">
              {error}
            </div>
            <div className="navigation-buttons">
              <Link to="/login" className="nav-button">
                🔑 Se reconnecter
              </Link>
              <Link to="/" className="nav-button">
                🏠 Retour à l'accueil
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-wrapper">
        {/* En-tête du profil */}
        <div className="profile-header">
          <div className="profile-avatar">
            {user?.name ? getInitials(user.name) : '👤'}
          </div>
          <h1 className="profile-title">
            Bonjour {user?.name?.split(' ')[0] || 'Voyageur'} ! 👋
          </h1>
          <p className="profile-subtitle">
            Gérez votre profil et vos préférences de voyage
          </p>
        </div>

        <div className="profile-content">
       

          {/* Formulaire de modification */}
          <div className="profile-card">
            <h2 className="card-title">
              <span className="card-icon">✏️</span>
              Modifier mes informations
            </h2>

            <form className="profile-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Nom complet</label>
                <input
                  type="text"
                  className="form-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={updating}
                  placeholder="Votre nom complet"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Adresse e-mail</label>
                <input
                  type="email"
                  className="form-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={updating}
                  placeholder="votre@email.com"
                />
              </div>

              <button 
                type="submit" 
                className="profile-button"
                disabled={updating}
              >
                {updating ? "Mise à jour..." : "💾 Sauvegarder"}
              </button>
            </form>

            {success && (
              <div className="success-message">
                {success}
              </div>
            )}

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}
          </div>

         

          {/* Zone de danger */}
          <div className="profile-card">
            <h2 className="card-title">
              <span className="card-icon">⚠️</span>
              Zone de danger
            </h2>
            
            <div className="danger-zone">
              <div className="danger-zone-title">
                🗑️ Suppression du compte
              </div>
              <div className="danger-zone-description">
                La suppression de votre compte est définitive et irréversible. 
                Toutes vos données, réservations et favoris seront perdus.
                <br /><br />
                <strong>Cette action ne peut pas être annulée.</strong>
              </div>
              
              <button 
                onClick={handleDelete}
                className="profile-button danger-button"
              >
                🗑️ Supprimer définitivement mon compte
              </button>
            </div>
          </div>
        </div>
      </div>
        {/* FOOTER */}
      <Footer />
    </div>
    
  );
};

export default Profile;