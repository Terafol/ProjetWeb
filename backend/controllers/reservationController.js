const prisma = require("../config/prisma");
const sendEmail = require("../utils/sendEmail");

exports.createReservation = async (req, res) => {
  const userId = req.user.id;
  const { voyageId, date, people } = req.body;

  try {
    // ✅ Crée d'abord la réservation
    const reservation = await prisma.reservation.create({
      data: {
        userId,
        voyageId: parseInt(voyageId),
        date: new Date(date),
        people: parseInt(people),
      },
    });

    // Ensuite récupère l'utilisateur et le voyage
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const voyageData = await prisma.voyage.findUnique({ where: { id: parseInt(voyageId) } });

    // ✅ Envoie l'e-mail
    await sendEmail(user.email, "Confirmation de réservation", `
      <p>Bonjour ${user.name},</p>
      <p>Votre réservation pour <strong>${voyageData.title}</strong> le ${new Date(reservation.date).toLocaleDateString()} est confirmée pour ${reservation.people} personne(s).</p>
    `);

    res.status(201).json({ message: "Réservation enregistrée", reservation });
  } catch (err) {
    console.error("Erreur createReservation :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};


exports.getMyReservations = async (req, res) => {
  const userId = req.user.id;

  try {
    const reservations = await prisma.reservation.findMany({
      where: { userId },
      include: { voyage: true },
    });

    res.json(reservations);
  } catch (err) {
    console.error("Erreur getMyReservations :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
exports.getAllReservations = async (req, res) => {
    try {
      const reservations = await prisma.reservation.findMany({
        include: {
          user: true,
          voyage: true,
        },
      });
  
      res.json(reservations);
    } catch (err) {
      console.error("Erreur getAllReservations :", err);
      res.status(500).json({ message: "Erreur serveur" });
    }
  };

exports.cancelReservation = async (req, res) => {
  const id = parseInt(req.params.id);
  const userId = req.user.id;

  try {
    const reservation = await prisma.reservation.findUnique({ where: { id } });

    if (!reservation || reservation.userId !== userId) {
      return res.status(403).json({ message: "Non autorisé" });
    }

    await prisma.reservation.delete({ where: { id } });

    res.json({ message: "Réservation annulée" });
  } catch (err) {
    console.error("Erreur annulation :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
