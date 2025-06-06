const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../config/prisma");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");
const { addMinutes } = require("date-fns");

// Inscription
exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ message: "Email déjà utilisé" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const emailToken = crypto.randomBytes(32).toString("hex");

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        emailToken,
      },
    });

    const link = `${process.env.BASE_URL}/api/auth/confirm/${emailToken}`;
    console.log("Lien de confirmation :", link);

    await sendEmail(email, "Confirmation de votre compte", `
      <p>Bonjour ${name},</p>
      <p>Merci pour votre inscription. Cliquez sur le lien pour confirmer votre compte :</p>
      <a href="${link}">${link}</a>
    `);

    res.status(201).json({
      message: "Compte créé. Vérifiez votre e-mail pour confirmation.",
    });
  } catch (err) {
    console.error("Erreur register :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// Confirmation d'e-mail
exports.confirmEmail = async (req, res) => {
  const { token } = req.params;

  try {
    const user = await prisma.user.update({
      where: { emailToken: token },
      data: {
        emailConfirmed: true,
        emailToken: null,
      },
    });

    res.send("✅ E-mail confirmé. Vous pouvez maintenant vous connecter.");
  } catch (err) {
    console.error("Erreur confirmation :", err);
    res.status(400).send("Lien invalide ou expiré.");
  }
};

// Connexion
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ message: "Utilisateur non trouvé" });
    if (!user.emailConfirmed) return res.status(401).json({ message: "E-mail non confirmé" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Mot de passe incorrect" });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.json({
      message: "Connexion réussie",
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("Erreur login :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

exports.deleteAccount = async (req, res) => {
  const userId = req.user.id;

  try {
    await prisma.favorite.deleteMany({ where: { userId } });
    await prisma.reservation.deleteMany({ where: { userId } });
    await prisma.user.delete({ where: { id: userId } });

    res.json({ message: "Compte supprimé" });
  } catch (err) {
    console.error("Erreur suppression :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

    const token = crypto.randomBytes(32).toString("hex");

    await prisma.user.update({
      where: { email },
      data: {
        resetToken: token,
        resetTokenExpiry: addMinutes(new Date(), 30),
      },
    });

    const link = `http://localhost:3000/reset-password/${token}`;
    console.log("🔗 Lien de reset :", link);

    await sendEmail(email, "Réinitialisation de mot de passe", `
      <p>Cliquez sur ce lien pour réinitialiser votre mot de passe :</p>
      <a href="${link}">${link}</a>
      <p>Ce lien expire dans 30 minutes.</p>
    `);

    res.json({ message: "Lien envoyé. Vérifiez votre e-mail." });
  } catch (err) {
    console.error("Erreur forgotPassword :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: { gt: new Date() },
      },
    });

    if (!user) return res.status(400).json({ message: "Lien invalide ou expiré" });

    const hashed = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashed,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    res.json({ message: "Mot de passe mis à jour avec succès" });
  } catch (err) {
    console.error("Erreur resetPassword :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
