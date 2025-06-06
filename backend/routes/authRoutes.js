const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");

const {
  forgotPassword,
  resetPassword,
  register,
  login,
  confirmEmail,
  deleteAccount,
} = require("../controllers/authController");

// 🔓 PUBLIQUES (pas besoin de token)
router.post("/register", register);
router.post("/login", login);
router.get("/confirm/:token", confirmEmail);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

// 🔒 PROTÉGÉES (besoin de token)
router.delete("/delete", auth, deleteAccount);

module.exports = router;
