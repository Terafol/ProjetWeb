import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import API from "../api";
import Footer from "../components/Footer";
import "./Auth.css";
import "./ResetPassword.css";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState(null);
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(5);

  // Vérifier la validité du token au chargement
  useEffect(() => {
    const verifyToken = async () => {
      try {
        await API.get(`/auth/verify-reset-token/${token}`);
        setTokenValid(true);
      } catch (err) {
        setTokenValid(false);
        setError("Ce lien de réinitialisation est invalide ou expiré.");
      }
    };

    if (token) {
      verifyToken();
    } else {
      setTokenValid(false);
      setError("Token de réinitialisation manquant.");
    }
  }, [token]);

  // Compte à rebours après succès
  useEffect(() => {
    if (success && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (success && countdown === 0) {
      navigate("/login");
    }
  }, [success, countdown, navigate]);

  const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < minLength) {
      return "Le mot de passe doit contenir au moins 8 caractères";
    }
    if (!hasUpperCase) {
      return "Le mot de passe doit contenir au moins une majuscule";
    }
    if (!hasLowerCase) {
      return "Le mot de passe doit contenir au moins une minuscule";
    }
    if (!hasNumbers) {
      return "Le mot de passe doit contenir au moins un chiffre";
    }
    if (!hasSpecialChar) {
      return "Le mot de passe doit contenir au moins un caractère spécial";
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validation des mots de passe
    if (password !== confirm) {
      setError("Les mots de passe ne correspondent pas.");
      setLoading(false);
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      setLoading(false);
      return;
    }

    try {
      const res = await API.post(`/auth/reset-password/${token}`, { password });
      setMessage(res.data.message);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || "Une erreur s'est produite. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  // État de chargement initial
  if (tokenValid === null) {
    return (
      <div className="reset-password-container">
        <div className="auth-container">
          <div className="auth-card">
            <div className="auth-header">
              <div className="verification-icon">🔍</div>
              <h2>Vérification...</h2>
              <p>Validation du lien de réinitialisation</p>
            </div>
            <div className="loading-container-center">
              <div className="loading-spinner"></div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Token invalide
  if (tokenValid === false) {
    return (
      <div className="reset-password-container">
        <div className="auth-container">
          <div className="auth-card">
            <div className="auth-header">
              <div className="error-icon">❌</div>
              <h2>Lien invalide</h2>
              <p>Ce lien de réinitialisation n'est plus valide</p>
            </div>

            <div className="error-message">
              <strong>Erreur !</strong> {error}
            </div>

            <div className="invalid-token-content">
              <p className="invalid-token-description">
                Le lien de réinitialisation a peut-être expiré ou été déjà utilisé.
                <br />Vous pouvez demander un nouveau lien.
              </p>
              
              <Link to="/forgot-password" className="auth-button reset-link-button">
                Demander un nouveau lien
              </Link>
              
              <br />
              
              <Link to="/login" className="back-to-login">
                ← Retour à la connexion
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Succès
  if (success) {
    return (
      <div className="reset-password-container">
        <div className="auth-container">
          <div className="auth-card">
            <div className="auth-header">
              <div className="success-icon">🎉</div>
              <h2>Mot de passe modifié !</h2>
              <p>Votre mot de passe a été réinitialisé avec succès</p>
            </div>

            <div className="success-message">
              <strong>Parfait !</strong> {message}
            </div>

            <div className="success-content">
              <div className="countdown-container">
                <div className="countdown-icon">⏰</div>
                <p className="countdown-text">
                  Redirection automatique dans <strong>{countdown}</strong> seconde{countdown > 1 ? 's' : ''}...
                </p>
              </div>
              
              <Link to="/login" className="auth-button success-login-button">
                Se connecter maintenant
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Formulaire de réinitialisation
  return (
    <div className="reset-password-container">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <img src="/images/logo.png" alt="Logo" className="auth-logo" />
            <h2>Nouveau mot de passe 🔐</h2>
            <p>Choisissez un mot de passe sécurisé pour votre compte</p>
          </div>

          {error && (
            <div className="error-message">
              <strong>Erreur !</strong> {error}
            </div>
          )}

          <div className="info-message">
            <strong>🛡️ Critères de sécurité :</strong><br />
            • Au moins 8 caractères<br />
            • Au moins une majuscule et une minuscule<br />
            • Au moins un chiffre<br />
            • Au moins un caractère spécial (!@#$%...)
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <input
                type="password"
                className="form-input"
                placeholder="🔒 Nouveau mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                minLength={8}
              />
            </div>

            <div className="form-group">
              <input
                type="password"
                className="form-input"
                placeholder="🔒 Confirmer le mot de passe"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                disabled={loading}
                minLength={8}
              />
            </div>

            {/* Indicateur de force du mot de passe */}
            {password && (
              <div className="password-strength">
                <div className="password-strength-label">
                  Force du mot de passe :
                </div>
                <div className="password-strength-bar">
                  <div 
                    className={`password-strength-fill ${validatePassword(password) ? 'weak' : 'strong'}`}
                  ></div>
                </div>
                <div className={`password-strength-text ${validatePassword(password) ? 'weak' : 'strong'}`}>
                  {validatePassword(password) || 'Mot de passe sécurisé ✓'}
                </div>
              </div>
            )}

            {/* Indicateur de correspondance */}
            {confirm && (
              <div className={`password-match ${password === confirm ? 'match' : 'no-match'}`}>
                <span className="password-match-icon">
                  {password === confirm ? '✓' : '✗'}
                </span>
                <span className="password-match-text">
                  {password === confirm ? 
                    'Les mots de passe correspondent' : 
                    'Les mots de passe ne correspondent pas'
                  }
                </span>
              </div>
            )}

            <button 
              type="submit" 
              className="auth-button"
              disabled={loading || !password || !confirm}
            >
              {loading && <span className="loading-spinner"></span>}
              {loading ? "Mise à jour..." : "Réinitialiser le mot de passe"}
            </button>
          </form>

          <div className="auth-links">
            <p>
              Vous vous souvenez de votre mot de passe ? 
              <Link to="/login"> Se connecter</Link>
            </p>
            
            <p className="back-home-link">
              <Link to="/" className="back-home">
                ← Retour à l'accueil
              </Link>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ResetPassword;