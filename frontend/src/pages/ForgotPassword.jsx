import React, { useState } from "react";
import { Link } from "react-router-dom";
import API from "../api";
import "./Auth.css";
import Footer from "../components/Footer"; // ← Import du Footer

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await API.post("/auth/forgot-password", { email });
      setMessage(res.data.message);
      setEmailSent(true);
    } catch (err) {
      setError(
        err.response?.data?.message || 
        "Une erreur s'est produite. Vérifiez votre adresse e-mail."
      );
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📧</div>
            <h2>E-mail envoyé !</h2>
            <p>Vérifiez votre boîte de réception</p>
          </div>

          <div className="success-message">
            <strong>C'est fait !</strong> {message}
          </div>

          <div className="info-message">
            <strong>📬 Étapes suivantes :</strong><br />
            1. Vérifiez votre boîte e-mail <strong>{email}</strong><br />
            2. Cliquez sur le lien de réinitialisation<br />
            3. Créez votre nouveau mot de passe<br /><br />
            <em>Pensez à vérifier vos spams si vous ne voyez pas l'e-mail !</em>
          </div>

          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <button 
              onClick={() => {
                setEmailSent(false);
                setEmail("");
                setMessage("");
              }}
              className="auth-button"
              style={{ 
                background: 'transparent', 
                color: '#00bfa6', 
                border: '2px solid #00bfa6',
                marginBottom: '1rem'
              }}
            >
              Renvoyer un e-mail
            </button>
          </div>

          <div className="auth-links">
            <p>
              <Link to="/login">← Retour à la connexion</Link>
            </p>
            <p>
              <Link to="/">Retour à l'accueil</Link>
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
          <h2>Mot de passe oublié ? 🔐</h2>
          <p>Pas de panique, ça arrive aux meilleurs d'entre nous !</p>
        </div>

        {error && (
          <div className="error-message">
            <strong>Erreur !</strong> {error}
          </div>
        )}

        <div className="info-message">
          <strong>Comment ça marche :</strong><br />
          Entrez votre adresse e-mail ci-dessous et nous vous enverrons un lien pour réinitialiser votre mot de passe.
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
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

          <button 
            type="submit" 
            className="auth-button"
            disabled={loading || !email}
          >
            {loading && <span className="loading-spinner"></span>}
            {loading ? "Envoi..." : "Envoyer le lien de réinitialisation"}
          </button>
        </form>

        <div className="auth-links">
          <p>
            Vous vous souvenez de votre mot de passe ? 
            <Link to="/login"> Se connecter</Link>
          </p>
          
          <p>
            Pas encore de compte ? 
            <Link to="/register"> Créer un compte</Link>
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

export default ForgotPassword;