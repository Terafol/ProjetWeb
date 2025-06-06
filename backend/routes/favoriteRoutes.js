const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const {
  addFavorite,
  removeFavorite,
  getFavorites,
} = require("../controllers/favoriteController");

router.post("/:voyageId", auth, addFavorite);
router.delete("/:voyageId", auth, removeFavorite);
router.get("/", auth, getFavorites);

module.exports = router;
