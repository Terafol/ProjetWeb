const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const prisma = require("../config/prisma");

// GET tous les voyages (avec filtres)
router.get("/", async (req, res) => {
  const { country, maxPrice, type, promo, search } = req.query;

  try {
    // Construction dynamique des filtres
    const whereClause = {};

    // Filtre par pays (recherche partielle)
    if (country) {
      whereClause.OR = [
        { country: { contains: country } },
        { city: { contains: country } },
        { title: { contains: country } }
      ];
    }

    // Recherche globale
    if (search) {
      whereClause.OR = [
        { country: { contains: search } },
        { city: { contains: search } },
        { title: { contains: search } },
        { description: { contains: search } }
      ];
    }

    // Filtre par prix maximum
    if (maxPrice) {
      whereClause.price = { lte: parseFloat(maxPrice) };
    }

    // Filtre par type (recherche partielle)
    if (type) {
      whereClause.type = { contains: type };
    }

    // Filtre par promotion
    if (promo === "true") {
      whereClause.isPromo = true;
    }

    const voyages = await prisma.voyage.findMany({
      where: whereClause,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        images: true,
        _count: {
          select: {
            reservations: true
          }
        }
      }
    });

    res.json(voyages);
  } catch (err) {
    console.error("Erreur dans getAllVoyages :", err);
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
});

// GET un voyage par ID
router.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    // Validation de l'ID
    if (isNaN(id)) {
      return res.status(400).json({ message: "ID de voyage invalide" });
    }

    const voyage = await prisma.voyage.findUnique({
      where: { id },
      include: { 
        images: true,
        _count: {
          select: {
            reservations: true,
            favorites: true
          }
        }
      }
    });

    if (!voyage) {
      return res.status(404).json({ message: "Voyage introuvable" });
    }

    res.json(voyage);
  } catch (err) {
    console.error("Erreur get voyage :", err);
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
});

// GET voyages populaires
router.get("/popular", async (req, res) => {
  const { limit = 10 } = req.query;

  try {
    const voyages = await prisma.voyage.findMany({
      include: {
        _count: {
          select: {
            reservations: true
          }
        },
        images: true
      }
    });

    // Trier par popularité en JavaScript
    const sortedVoyages = voyages
      .sort((a, b) => b._count.reservations - a._count.reservations)
      .slice(0, parseInt(limit));

    res.json(sortedVoyages);
  } catch (err) {
    console.error("Erreur dans getPopularVoyages :", err);
    res.status(500).json({ 
      message: "Erreur lors de la récupération des voyages populaires", 
      error: err.message 
    });
  }
});

// GET suggestions de destinations
router.get("/suggestions", async (req, res) => {
  const { query } = req.query;

  if (!query || query.length < 2) {
    return res.json([]);
  }

  try {
    const suggestions = await prisma.voyage.findMany({
      where: {
        OR: [
          { country: { contains: query } },
          { city: { contains: query } }
        ]
      },
      select: {
        country: true,
        city: true
      },
      take: 10
    });

    // Enlever les doublons
    const uniqueSuggestions = [];
    const seen = new Set();

    suggestions.forEach(s => {
      const key = `${s.city}, ${s.country}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueSuggestions.push({
          label: key,
          country: s.country,
          city: s.city
        });
      }
    });

    res.json(uniqueSuggestions);
  } catch (err) {
    console.error("Erreur dans getDestinationSuggestions :", err);
    res.status(500).json({ 
      message: "Erreur lors de la récupération des suggestions", 
      error: err.message 
    });
  }
});

// Routes protégées (nécessitent une authentification)
// POST créer un voyage
router.post("/", auth, async (req, res) => {
  const { title, country, city, price, type, description, imageUrl, isPromo, latitude, longitude } = req.body;

  try {
    // Validation des données
    if (!title || !country || !city || !price || !type) {
      return res.status(400).json({ 
        message: "Champs obligatoires manquants: title, country, city, price, type" 
      });
    }

    const voyage = await prisma.voyage.create({
      data: {
        title: title.trim(),
        country: country.trim(),
        city: city.trim(),
        price: parseFloat(price),
        type: type.trim(),
        description: description ? description.trim() : null,
        imageUrl: imageUrl || null,
        isPromo: Boolean(isPromo),
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null
      },
    });

    res.status(201).json({ 
      message: "Voyage créé avec succès", 
      voyage 
    });
  } catch (err) {
    console.error("Erreur dans createVoyage :", err);
    res.status(500).json({ 
      message: "Erreur lors de la création du voyage", 
      error: err.message 
    });
  }
});

// PUT mettre à jour un voyage
router.put("/:id", auth, async (req, res) => {
  const { title, country, city, price, type, description, imageUrl, isPromo, latitude, longitude } = req.body;
  const id = parseInt(req.params.id);

  try {
    if (isNaN(id)) {
      return res.status(400).json({ message: "ID de voyage invalide" });
    }

    // Vérifier que le voyage existe
    const existingVoyage = await prisma.voyage.findUnique({
      where: { id }
    });

    if (!existingVoyage) {
      return res.status(404).json({ message: "Voyage non trouvé" });
    }

    // Préparer les données à mettre à jour
    const updateData = {};
    if (title !== undefined) updateData.title = title.trim();
    if (country !== undefined) updateData.country = country.trim();
    if (city !== undefined) updateData.city = city.trim();
    if (price !== undefined) updateData.price = parseFloat(price);
    if (type !== undefined) updateData.type = type.trim();
    if (description !== undefined) updateData.description = description ? description.trim() : null;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl || null;
    if (isPromo !== undefined) updateData.isPromo = Boolean(isPromo);
    if (latitude !== undefined) updateData.latitude = latitude ? parseFloat(latitude) : null;
    if (longitude !== undefined) updateData.longitude = longitude ? parseFloat(longitude) : null;

    const updatedVoyage = await prisma.voyage.update({
      where: { id },
      data: updateData,
      include: { images: true }
    });

    res.json({ 
      message: "Voyage mis à jour avec succès", 
      voyage: updatedVoyage 
    });
  } catch (err) {
    console.error("Erreur dans updateVoyage :", err);
    res.status(500).json({ 
      message: "Erreur lors de la mise à jour du voyage", 
      error: err.message 
    });
  }
});

// DELETE supprimer un voyage
router.delete("/:id", auth, async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    if (isNaN(id)) {
      return res.status(400).json({ message: "ID de voyage invalide" });
    }

    // Vérifier que le voyage existe
    const existingVoyage = await prisma.voyage.findUnique({
      where: { id }
    });

    if (!existingVoyage) {
      return res.status(404).json({ message: "Voyage non trouvé" });
    }

    // Supprimer le voyage
    await prisma.voyage.delete({
      where: { id }
    });

    res.json({ message: "Voyage supprimé avec succès" });
  } catch (err) {
    console.error("Erreur dans deleteVoyage :", err);
    res.status(500).json({ 
      message: "Erreur lors de la suppression du voyage", 
      error: err.message 
    });
  }
});

module.exports = router;