import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import VoyageCard from "../components/VoyageCard";
import Footer from "../components/Footer"; // ← Import du Footer

const Account = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");
  
  // Profile states
  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");
  
  // Reservations states
  const [reservations, setReservations] = useState([]);
  const [reservationToCancel, setReservationToCancel] = useState(null);
  const [reservationMessage, setReservationMessage] = useState("");
  
  // Favorites states
  const [favorites, setFavorites] = useState([]);
  
  // Common states
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAccountData();
  }, []);

  const fetchAccountData = async () => {
    setLoading(true);
    try {
      const [profileRes, reservationsRes, favoritesRes] = await Promise.all([
        API.get("/profile"),
        API.get("/reservations"),
        API.get("/favorites")
      ]);
      
      setUser(profileRes.data);
      setName(profileRes.data.name);
      setEmail(profileRes.data.email);
      setReservations(reservationsRes.data);
      setFavorites(favoritesRes.data);
      setError("");
    } catch (err) {
      console.error("Erreur chargement compte :", err);
      setError("Impossible de charger les données du compte.");
    }
    setLoading(false);
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.put("/profile", { name, email });
      setUser(res.data.user);
      setProfileSuccess("✅ Profil mis à jour avec succès !");
      setTimeout(() => setProfileSuccess(""), 3000);
    } catch (err) {
      console.error("Erreur update :", err);
      setError("❌ Erreur lors de la mise à jour du profil.");
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm("⚠️ Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.")) {
      try {
        await API.delete("/auth/delete");
        localStorage.removeItem("token");
        navigate("/login");
      } catch (err) {
        console.error("Erreur suppression :", err);
        setError("❌ Erreur lors de la suppression du compte.");
      }
    }
  };

  const confirmCancelReservation = async () => {
    try {
      await API.delete(`/reservations/${reservationToCancel}`);
      setReservationMessage("✅ Réservation annulée avec succès.");
      setReservationToCancel(null);
      fetchAccountData();
      setTimeout(() => setReservationMessage(""), 3000);
    } catch (err) {
      console.error("Erreur annulation :", err);
      setReservationMessage("❌ Échec de l'annulation de la réservation.");
    }
  };

  const handleVoyageClick = (voyageId) => {
    navigate(`/voyage/${voyageId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de votre compte...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Mon Compte</h1>
          <p className="text-gray-600">Gérez votre profil, réservations et favoris</p>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6 overflow-hidden">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab("profile")}
              className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                activeTab === "profile"
                  ? "bg-indigo-50 text-indigo-600 border-b-2 border-indigo-600"
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
              }`}
            >
              👤 Profil
            </button>
            <button
              onClick={() => setActiveTab("reservations")}
              className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                activeTab === "reservations"
                  ? "bg-indigo-50 text-indigo-600 border-b-2 border-indigo-600"
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
              }`}
            >
              📅 Réservations ({reservations.length})
            </button>
            <button
              onClick={() => setActiveTab("favorites")}
              className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                activeTab === "favorites"
                  ? "bg-indigo-50 text-indigo-600 border-b-2 border-indigo-600"
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
              }`}
            >
              ❤️ Favoris ({favorites.length})
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Informations personnelles</h2>
              
              {profileSuccess && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
                  {profileSuccess}
                </div>
              )}

              <form onSubmit={handleProfileSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom complet
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                      placeholder="Votre nom complet"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Adresse email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                      placeholder="votre@email.com"
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4">
                  <button
                    type="submit"
                    className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                  >
                    💾 Mettre à jour le profil
                  </button>

                  <button
                    type="button"
                    onClick={handleDeleteAccount}
                    className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-medium"
                  >
                    🗑️ Supprimer le compte
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Reservations Tab */}
          {activeTab === "reservations" && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Mes réservations</h2>
              
              {reservationMessage && (
                <div className={`border px-4 py-3 rounded-lg mb-6 ${
                  reservationMessage.includes('✅') 
                    ? 'bg-green-50 border-green-200 text-green-700'
                    : 'bg-red-50 border-red-200 text-red-700'
                }`}>
                  {reservationMessage}
                </div>
              )}

              {reservations.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📅</div>
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">Aucune réservation</h3>
                  <p className="text-gray-500">Vous n'avez pas encore effectué de réservation.</p>
                  <button
                    onClick={() => navigate("/")}
                    className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Découvrir les voyages
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {reservations.map((reservation) => (
                    <div
                      key={reservation.id}
                      className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-gray-800 mb-2">
                            {reservation.voyage.title}
                          </h3>
                          <div className="flex items-center text-gray-600 mb-2">
                            <span className="mr-4">🌍 {reservation.voyage.country}</span>
                            <span>🏙️ {reservation.voyage.city}</span>
                          </div>
                          <div className="flex items-center text-gray-600 mb-2">
                            <span className="mr-4">📅 {new Date(reservation.date).toLocaleDateString('fr-FR')}</span>
                            <span>👥 {reservation.people} personne{reservation.people > 1 ? 's' : ''}</span>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => setReservationToCancel(reservation.id)}
                          className="bg-red-100 text-red-600 px-4 py-2 rounded-lg hover:bg-red-200 transition-colors font-medium"
                        >
                          🗑️ Annuler
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Favorites Tab */}
          {activeTab === "favorites" && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Mes voyages favoris</h2>

              {favorites.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">❤️</div>
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">Aucun favori</h3>
                  <p className="text-gray-500">Vous n'avez pas encore ajouté de voyage à vos favoris.</p>
                  <button
                    onClick={() => navigate("/")}
                    className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Découvrir les voyages
                  </button>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {favorites.map((fav) => (
                    <div
                      key={fav.voyage.id}
                      onClick={() => handleVoyageClick(fav.voyage.id)}
                      className="cursor-pointer transform hover:scale-105 transition-transform"
                    >
                      <VoyageCard
                        voyage={fav.voyage}
                        isFavoriteInit={true}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal for Reservation Cancellation */}
      {reservationToCancel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="text-center">
              <div className="text-4xl mb-4">⚠️</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Confirmer l'annulation
              </h3>
              <p className="text-gray-600 mb-6">
                Êtes-vous sûr de vouloir annuler cette réservation ? Cette action est irréversible.
              </p>
              
              <div className="flex space-x-4">
                <button
                  onClick={confirmCancelReservation}
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  ✅ Confirmer
                </button>
                <button
                  onClick={() => setReservationToCancel(null)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                >
                  ❌ Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* FOOTER */}
      <Footer />
    </div>
  );
};

export default Account;