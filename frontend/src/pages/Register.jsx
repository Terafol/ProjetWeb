import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api";
import "./Auth.css";
import Footer from "../components/Footer"; // ← Import du Footer

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validation côté client
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      setLoading(false);
      return;
    }

    try {
      await API.post("/auth/register", { name, email, password });
      setSuccess(true);
      
      // Redirection automatique après 5 secondes
      setTimeout(() => {
        navigate("/login");
      }, 5000);
      
    } catch (err) {
      console.error("Erreur register :", err);
      setError(
        err.response?.data?.message || 
        "Cette adresse e-mail est déjà utilisée ou une erreur s'est produite."
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
            <h2>Inscription réussie !</h2>
            <p>Votre compte a été créé avec succès</p>
          </div>

          <div className="success-message">
            <strong>Félicitations !</strong> Votre compte a été créé.
          </div>

          <div className="info-message">
            <strong>📧 Activation requise</strong><br />
            Un e-mail d'activation a été envoyé à <strong>{email}</strong>.<br />
            <strong>Cliquez sur le lien dans l'e-mail pour activer votre compte</strong> avant de vous connecter.
          </div>

          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <p style={{ color: '#666', marginBottom: '1rem' }}>
              Redirection automatique dans 5 secondes...
            </p>
            <Link to="/login" className="auth-button" style={{ textDecoration: 'none', display: 'inline-block' }}>
              Aller à la page de connexion
            </Link>
          </div>

          <div className="auth-links">
            <p>
              <Link to="/">← Retour à l'accueil</Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <img src="http://localhost:5000/uploads/accueil/AC4.png" alt="Logo" className="auth-logo" />
          <h2>Créer un compte 🚀</h2>
          <p>Rejoignez notre communauté de voyageurs</p>
        </div>

        {error && (
          <div className="error-message">
            <strong>Erreur !</strong> {error}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              className="form-input"
              placeholder="👤 Votre nom complet"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
              minLength={2}
            />
          </div>

          <div className="form-group">
            <input
              type="email"
              className="form-input"
              placeholder="📧 Votre adresse e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <input
              type="password"
              className="form-input"
              placeholder="🔒 Mot de passe (min. 6 caractères)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              minLength={6}
            />
          </div>

          <div className="form-group">
            <input
              type="password"
              className="form-input"
              placeholder="🔒 Confirmer le mot de passe"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading}
              minLength={6}
            />
          </div>

          <button 
            type="submit" 
            className="auth-button"
            disabled={loading}
          >
            {loading && <span className="loading-spinner"></span>}
            {loading ? "Création..." : "Créer mon compte"}
          </button>
        </form>

        <div className="auth-links">
          <p>
            Déjà un compte ? 
            <Link to="/login"> Se connecter</Link>
          </p>
          
          <p style={{ marginTop: '1.5rem', fontSize: '0.9rem', color: '#999' }}>
            <Link to="/" style={{ color: '#666' }}>
              ← Retour à l'accueil
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;