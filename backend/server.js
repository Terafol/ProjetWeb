const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

// Initialise l'application Express
const app = express();

const authRoutes = require("./routes/authRoutes");
const voyageRoutes = require("./routes/voyageRoutes"); // <-- ici, après `app` !
const favoriteRoutes = require("./routes/favoriteRoutes");
const reservationRoutes = require("./routes/reservationRoutes");
const profileRoutes = require("./routes/profileRoutes");
const uploadRoutes = require("./routes/uploadRoutes");



// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/voyages", voyageRoutes); // <-- ici aussi
app.use("/api/favorites", favoriteRoutes);
app.use("/api/reservations", reservationRoutes);
app.use("/api/profile", profileRoutes);
app.use("/uploads", express.static("uploads"));
app.use("/api/upload", uploadRoutes);



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Serveur lancé sur http://localhost:${PORT}`);
});
