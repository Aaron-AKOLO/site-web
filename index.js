const express = require("express");
const nodemailer = require("nodemailer");
const path = require("path");

// Import dynamique pour node-fetch (compatible CommonJS)
const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));

const app = express();

// CONFIG EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Log pour vérifier le chemin des vues
console.log("📂 Chemin des vues utilisé par Express:", app.get("views"));

// fichiers statiques
app.use(express.static("public"));

// Middleware pour lire les données POST
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ROUTES
app.get("/", (req, res) => res.render("accueil"));
app.get("/bio", (req, res) => res.render("bio"));
app.get("/video", (req, res) => res.render("video"));
app.get("/playlist", (req, res) => res.render("playlist"));
app.get("/galerie", (req, res) => res.render("galerie"));
app.get("/contact", (req, res) => res.render("contact"));

// CONTACT POST
app.post("/contact", async (req, res) => {
    const { nom, email, message } = req.body;

    // Vérification via Mailboxlayer
    try {
        const response = await fetch(`http://apilayer.net/api/check?access_key=ce49ce170e184f669d96ddd170807534&email=${email}`);
        const data = await response.json();

        if (!data.format_valid || !data.mx_found || !data.smtp_check) {
            return res.json({ message: "❌ Adresse email invalide ou inexistante." });
        }
    } catch (err) {
        console.error("Erreur API Mailboxlayer:", err);
        return res.json({ message: "❌ Impossible de vérifier l'adresse email." });
    }

    // Config SMTP Gmail (identifiants en clair comme avant)
    let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
            user: "Operadeuxiemedunom@gmail.com", // ton adresse Gmail
            pass: "yrqg hsjs okqc bblv"          // mot de passe d’application
        }
    });

    try {
        await transporter.sendMail({
            from: `"${nom}" <${email}>`,
            to: "Operadeuxiemedunom@gmail.com", // destinataire
            subject: "🎶 Nouveau message depuis le site de Donjuan JR",
            html: `
              <table style="width:100%; font-family: 'Open Sans', Arial; background:#F9F9F9; border:1px solid #DDD;">
                <tr style="background:#111111; color:#FFD700;">
                  <td style="padding:15px; font-size:20px; font-family:'Montserrat';">
                    <img src="https://site-web-jade-nine.vercel.app/image/logo.jpeg" alt="Logo Donjuan JR" style="height:40px; vertical-align:middle; margin-right:10px;">
                    🎶 Nouveau message depuis le site de Donjuan JR
                  </td>
                </tr>
                <tr>
                  <td style="padding:20px; color:#111111;">
                    <strong>Nom :</strong> ${nom} <br>
                    <strong>Email :</strong> ${email} <br><br>
                    <strong style="color:#8B0000;">Message :</strong><br>
                    ${message}
                  </td>
                </tr>
              </table>
            `
        });

        res.json({ message: "✅ Message envoyé avec succès !" });
    } catch (error) {
        console.error(error);
        res.json({ message: "❌ Erreur lors de l'envoi." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Serveur lancé sur le port ${PORT}`);
});
