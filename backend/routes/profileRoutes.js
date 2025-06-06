const express = require("express");
const router = express.Router();
const prisma = require("../config/prisma");
const auth = require("../middleware/authMiddleware");

router.get("/", auth, async (req, res) => {
  res.json({
    id: req.user.id,
    name: req.user.name,
    email: req.user.email,
    createdAt: req.user.createdAt
  });
});

router.put("/", auth, async (req, res) => {
  const { name, email } = req.body;

  try {
    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: { name, email },
    });

    res.json({ message: "Profil mis à jour", user: updated });
  } catch (err) {
    console.error("Erreur update profile :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

module.exports = router;
