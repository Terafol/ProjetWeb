const prisma = require("../config/prisma");

exports.addFavorite = async (req, res) => {
  const userId = req.user.id;
  const voyageId = parseInt(req.params.voyageId);

  try {
    const existing = await prisma.favorite.findUnique({
      where: {
        userId_voyageId: {
          userId,
          voyageId,
        },
      },
    });

    if (existing) {
      return res.status(400).json({ message: "Déjà dans les favoris" });
    }

    const favorite = await prisma.favorite.create({
      data: {
        userId,
        voyageId,
      },
    });

    res.status(201).json({ message: "Ajouté aux favoris", favorite });
  } catch (err) {
    console.error("Erreur addFavorite :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};


exports.getFavorites = async (req, res) => {
  const userId = req.user.id; // <--- très important

  try {
    const favorites = await prisma.favorite.findMany({
      where: { userId },
      include: { voyage: true }, // <--- pour avoir les infos du voyage
    });

    res.json(favorites);
  } catch (err) {
    console.error("Erreur getFavorites :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

exports.removeFavorite = async (req, res) => {
  const userId = req.user.id; // avec middleware auth
  const voyageId = parseInt(req.params.voyageId);

  try {
    await prisma.favorite.delete({
      where: {
        userId_voyageId: {
          userId,
          voyageId,
        },
      },
    });

    res.json({ message: "Favori supprimé." });
  } catch (err) {
    console.error("Erreur suppression favori :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
