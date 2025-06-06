const prisma = require("../config/prisma");

// 🟢 Obtenir tous les voyages avec filtres avancés
exports.getAllVoyages = async (req, res) => {
  const { country, maxPrice, type, promo, sort, search, city } = req.query;

  try {
    // Construction dynamique des filtres
    const whereClause = {};

    // Recherche par pays ou ville (recherche partielle)
    if (country) {
      whereClause.OR = [
        { country: { contains: country } },
        { city: { contains: country } },
        { title: { contains: country } }
      ];
    }

    // Recherche globale (si paramètre search est utilisé)
    if (search) {
      whereClause.OR = [
        { country: { contains: search } },
        { city: { contains: search } },
        { title: { contains: search } },
        { description: { contains: search } }
      ];
    }

    // Filtre par ville spécifique
    if (city) {
      whereClause.city = { contains: city };
    }

    // Filtre par prix maximum
    if (maxPrice) {
      whereClause.price = { lte: parseFloat(maxPrice) };
    }

    // Filtre par type
    if (type) {
      whereClause.type = { contains: type };
    }

    // Filtre par promotion
    if (promo === "true") {
      whereClause.isPromo = true;
    }

    // Déterminer l'ordre de tri
    let orderBy = { createdAt: "desc" }; // Par défaut : plus récents
    
    switch (sort) {
      case "price":
        orderBy = { price: "asc" };
        break;
      case "price_desc":
        orderBy = { price: "desc" };
        break;
      case "name":
        orderBy = { title: "asc" };
        break;
      case "popularity":
        orderBy = { createdAt: "desc" };
        break;
      default:
        orderBy = { createdAt: "desc" };
    }

    const voyages = await prisma.voyage.findMany({
      where: whereClause,
      orderBy: orderBy,
      include: {
        images: true,
        _count: {
          select: {
            reservations: true
          }
        }
      }
    });

    // Si on trie par popularité, faire le tri en JavaScript
    if (sort === "popularity") {
      voyages.sort((a, b) => b._count.reservations - a._count.reservations);
    }

    res.json(voyages);
  } catch (err) {
    console.error("Erreur getAllVoyages :", err);
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

// 🟢 Créer un nouveau voyage
exports.createVoyage = async (req, res) => {
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
};

// 🟢 Obtenir un voyage par ID
exports.getVoyageById = async (req, res) => {
  const { id } = req.params;

  try {
    // Validation de l'ID
    const voyageId = parseInt(id);
    if (isNaN(voyageId)) {
      return res.status(400).json({ message: "ID de voyage invalide" });
    }

    const voyage = await prisma.voyage.findUnique({
      where: { id: voyageId },
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
      return res.status(404).json({ message: "Voyage non trouvé" });
    }

    res.json(voyage);
  } catch (err) {
    console.error("Erreur dans getVoyageById :", err);
    res.status(500).json({ 
      message: "Erreur lors de la récupération du voyage", 
      error: err.message 
    });
  }
};

// 🟢 Mettre à jour un voyage
exports.updateVoyage = async (req, res) => {
  const { id } = req.params;
  const { title, country, city, price, type, description, imageUrl, isPromo, latitude, longitude } = req.body;

  try {
    const voyageId = parseInt(id);
    if (isNaN(voyageId)) {
      return res.status(400).json({ message: "ID de voyage invalide" });
    }

    // Vérifier que le voyage existe
    const existingVoyage = await prisma.voyage.findUnique({
      where: { id: voyageId }
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
      where: { id: voyageId },
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
};

// 🟢 Supprimer un voyage
exports.deleteVoyage = async (req, res) => {
  const { id } = req.params;

  try {
    const voyageId = parseInt(id);
    if (isNaN(voyageId)) {
      return res.status(400).json({ message: "ID de voyage invalide" });
    }

    // Vérifier que le voyage existe
    const existingVoyage = await prisma.voyage.findUnique({
      where: { id: voyageId }
    });

    if (!existingVoyage) {
      return res.status(404).json({ message: "Voyage non trouvé" });
    }

    // Supprimer le voyage
    await prisma.voyage.delete({
      where: { id: voyageId }
    });

    res.json({ message: "Voyage supprimé avec succès" });
  } catch (err) {
    console.error("Erreur dans deleteVoyage :", err);
    res.status(500).json({ 
      message: "Erreur lors de la suppression du voyage", 
      error: err.message 
    });
  }
};

// 🟢 Obtenir les voyages populaires
exports.getPopularVoyages = async (req, res) => {
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
};

// 🟢 Obtenir des suggestions de destinations
exports.getDestinationSuggestions = async (req, res) => {
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
};

// 🟢 Recherche avancée avec filtres multiples
exports.searchVoyages = async (req, res) => {
  const { 
    query, 
    types, 
    minPrice, 
    maxPrice, 
    countries, 
    isPromo, 
    sortBy = 'createdAt',
    sortOrder = 'desc',
    page = 1,
    limit = 20 
  } = req.query;

  try {
    const whereClause = {};

    // Recherche textuelle globale
    if (query) {
      whereClause.OR = [
        { title: { contains: query } },
        { description: { contains: query } },
        { country: { contains: query } },
        { city: { contains: query } }
      ];
    }

    // Filtres par types (peut être multiple)
    if (types) {
      const typeArray = Array.isArray(types) ? types : [types];
      whereClause.type = { in: typeArray };
    }

    // Filtre par gamme de prix
    if (minPrice || maxPrice) {
      whereClause.price = {};
      if (minPrice) whereClause.price.gte = parseFloat(minPrice);
      if (maxPrice) whereClause.price.lte = parseFloat(maxPrice);
    }

    // Filtres par pays (peut être multiple)
    if (countries) {
      const countryArray = Array.isArray(countries) ? countries : [countries];
      whereClause.country = { in: countryArray };
    }

    // Filtre promotion
    if (isPromo === 'true') {
      whereClause.isPromo = true;
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Ordre de tri
    const orderBy = {};
    orderBy[sortBy] = sortOrder;

    const [voyages, totalCount] = await Promise.all([
      prisma.voyage.findMany({
        where: whereClause,
        orderBy: orderBy,
        skip: skip,
        take: take,
        include: {
          images: true,
          _count: {
            select: {
              reservations: true,
              favorites: true
            }
          }
        }
      }),
      prisma.voyage.count({ where: whereClause })
    ]);

    res.json({
      voyages,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        pages: Math.ceil(totalCount / parseInt(limit))
      }
    });
  } catch (err) {
    console.error("Erreur dans searchVoyages :", err);
    res.status(500).json({ 
      message: "Erreur lors de la recherche", 
      error: err.message 
    });
  }
};