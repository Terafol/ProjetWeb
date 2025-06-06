const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");

const {
  createReservation,
  getMyReservations,
  getAllReservations,
  cancelReservation, // ✅ ajoute cette ligne
} = require("../controllers/reservationController");



// Appliquer auth ici 👇
router.post("/", auth, createReservation);
router.get("/", auth, getMyReservations);
router.get("/all", getAllReservations); // réservé à l'admin ?
router.delete("/:id", auth, cancelReservation);


module.exports = router;
