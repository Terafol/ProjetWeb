import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api";
import "./Auth.css";
import Footer from "../components/Footer"; // ← Import du Footer

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await API.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      
      // Petit délai pour l'effet visuel
      setTimeout(() => {
        navigate("/profile");
      }, 500);
    } catch (err) {
      setError(err.response?.data?.message || "Erreur de connexion. Vérifiez vos identifiants.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <img src="http://localhost:5000/uploads/accueil/AC4.png" alt="Logo" className="auth-logo" />
          <h2>Bon retour ! 👋</h2>
          <p>Connectez-vous pour continuer votre aventure</p>
        </div>

        {error && (
          <div className="error-message">
            <strong>Oups !</strong> {error}
          </div>
        )}

        <form className="auth-form" onSubmit={handleLogin}>
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
              placeholder="🔒 Votre mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            className="auth-button"
            disabled={loading}
          >
            {loading && <span className="loading-spinner"></span>}
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        <div className="auth-links">
          <p>
            <Link to="/forgot-password">
              🔐 Mot de passe oublié ?
            </Link>
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

export default Login;