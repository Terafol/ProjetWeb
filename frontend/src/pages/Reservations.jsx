import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api";
import Layout from "../components/Layout";
import "./Reservations.css";
import Footer from "../components/Footer"; // ← Import du Footer

const Reservations = () => {
  const [reservations, setReservations] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [reservationToCancel, setReservationToCancel] = useState(null);

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const res = await API.get("/reservations");
      setReservations(res.data);
      setError("");
    } catch (err) {
      console.error("Erreur réservations :", err);
      setError("❌ Impossible de charger les réservations.");
    } finally {
      setLoading(false);
    }
  };

  const confirmCancel = async () => {
    try {
      await API.delete(`/reservations/${reservationToCancel}`);
      setMessage("✅ Réservation annulée avec succès.");
      setReservationToCancel(null);
      fetchReservations();
      
      // Effacer le message après 5 secondes
      setTimeout(() => setMessage(""), 5000);
    } catch (err) {
      console.error("Erreur annulation :", err);
      setError("❌ Échec de l'annulation. Veuillez réessayer.");
    }
  };

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      weekday: 'long'
    };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  const getReservationStatus = (date) => {
    const reservationDate = new Date(date);
    const today = new Date();
    const diffTime = reservationDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { status: 'passed', label: 'Terminé', class: 'status-cancelled' };
    if (diffDays <= 7) return { status: 'soon', label: 'Bientôt', class: 'status-pending' };
    return { status: 'confirmed', label: 'Confirmé', class: 'status-confirmed' };
  };

  const calculateTotalAmount = () => {
    return reservations.reduce((total, res) => {
      return total + (res.voyage.price * res.people);
    }, 0);
  };

  if (loading) {
    return (
      <Layout>
        <div className="reservations-container">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <div className="loading-text">Chargement de vos réservations...</div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="reservations-container">
        <div className="reservations-wrapper">
          {/* En-tête */}
          <div className="reservations-header">
            <h1 className="reservations-title">📅 Mes réservations</h1>
            <p className="reservations-subtitle">
              Gérez et suivez tous vos voyages réservés
            </p>
            
            <div className="reservations-stats">
              <div className="stat-item">
                <span className="stat-number">{reservations.length}</span>
                <span className="stat-label">Réservations</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{calculateTotalAmount()}€</span>
                <span className="stat-label">Total dépensé</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">
                  {reservations.filter(r => getReservationStatus(r.date).status === 'confirmed').length}
                </span>
                <span className="stat-label">À venir</span>
              </div>
            </div>
          </div>

          <div className="reservations-content">
            {message && (
              <div className="success-message">
                <span>✅</span>
                {message}
              </div>
            )}

            {error && (
              <div className="error-message">
                <span>⚠️</span>
                {error}
              </div>
            )}

            {reservations.length === 0 ? (
              <div className="empty-reservations">
                <div className="empty-icon">📭</div>
                <h2 className="empty-title">Aucune réservation</h2>
                <p className="empty-description">
                  Vous n'avez pas encore effectué de réservation. 
                  Découvrez nos destinations incroyables et réservez 
                  votre prochain voyage dès maintenant !
                </p>
                <Link to="/" className="cta-button">
                  🌍 Explorer les voyages
                </Link>
              </div>
            ) : (
              <div className="reservations-list">
                {reservations.map((reservation) => {
                  const status = getReservationStatus(reservation.date);
                  const totalPrice = reservation.voyage.price * reservation.people;
                  
                  return (
                    <div key={reservation.id} className="reservation-card">
                      <div className="reservation-content">
                        <img 
                          src={reservation.voyage.imageUrl} 
                          alt={reservation.voyage.title}
                          className="reservation-image"
                        />
                        
                        <div className="reservation-info">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                            <h3 className="reservation-title">{reservation.voyage.title}</h3>
                            <span className={`status-badge ${status.class}`}>
                              {status.label}
                            </span>
                          </div>
                          
                          <p className="reservation-location">
                            📍 {reservation.voyage.city}, {reservation.voyage.country}
                          </p>
                          
                          <div className="reservation-details">
                            <div className="detail-item">
                              <span className="detail-icon">📅</span>
                              <div>
                                <div className="detail-label">Date du voyage</div>
                                <div className="detail-value">
                                  {formatDate(reservation.date)}
                                </div>
                              </div>
                            </div>
                            
                            <div className="detail-item">
                              <span className="detail-icon">👥</span>
                              <div>
                                <div className="detail-label">Voyageurs</div>
                                <div className="detail-value">
                                  {reservation.people} personne{reservation.people > 1 ? 's' : ''}
                                </div>
                              </div>
                            </div>
                            
                            <div className="detail-item">
                              <span className="detail-icon">💰</span>
                              <div>
                                <div className="detail-label">Prix total</div>
                                <div className="detail-value">{totalPrice}€</div>
                              </div>
                            </div>
                            
                            <div className="detail-item">
                              <span className="detail-icon">🏷️</span>
                              <div>
                                <div className="detail-label">Type</div>
                                <div className="detail-value">{reservation.voyage.type}</div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="reservation-actions">
                          <Link 
                            to={`/voyages/${reservation.voyage.id}`}
                            className="action-button"
                          >
                            👁️ Voir le voyage
                          </Link>
                          
                          {status.status !== 'passed' && (
                            <button
                              onClick={() => setReservationToCancel(reservation.id)}
                              className="action-button cancel-button"
                            >
                              🗑️ Annuler
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de confirmation */}
      {reservationToCancel && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-icon">⚠️</div>
            <h2 className="modal-title">Confirmer l'annulation</h2>
            <p className="modal-description">
              Êtes-vous sûr(e) de vouloir annuler cette réservation ? 
              Cette action est irréversible et peut entraîner des frais d'annulation.
            </p>
            <div className="modal-actions">
              <button 
                onClick={confirmCancel}
                className="modal-button confirm"
              >
                ✅ Confirmer
              </button>
              <button 
                onClick={() => setReservationToCancel(null)}
                className="modal-button cancel"
              >
                ❌ Annuler
              </button>
            </div>
          </div>
        </div>
      )}
        {/* FOOTER */}
      <Footer />
    </Layout>
    
  );
};

export default Reservations;