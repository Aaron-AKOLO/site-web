const express = require("express");
const nodemailer = require("nodemailer");
const path = require("path");

// Import dynamique pour node-fetch (compatible CommonJS)
const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));

const app = express();

// CONFIG EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

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

    // Config SMTP Gmail
    let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
            user: "lakumutrimenokosh@gmail.com", // ton adresse Gmail
            pass: "yrqg hsjs okqc bblv"          // mot de passe d’application
        }
    });

    try {
        await transporter.sendMail({
            from: `"${nom}" <${email}>`,
            to: "lakumutrimenokosh@gmail.com", // destinataire
            subject: "🎶 Nouveau message depuis le site de Donjuan JR",
            html: `
              <table style="width:100%; font-family: 'Open Sans', Arial; background:#F9F9F9; border:1px solid #DDD;">
                <tr style="background:#111111; color:#FFD700;">
                  <td style="padding:15px; font-size:20px; font-family:'Montserrat';">
                    <img src="/public/image/logo.jpeg" alt="Logo Donjuan JR" style="height:40px; vertical-align:middle; margin-right:10px;">
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
                <tr>
                  <td style="padding:20px; text-align:center;">
                    <a href="mailto:${email}" 
                       style="background:#FFD700; color:#111111; padding:10px 20px; text-decoration:none; font-weight:bold; border-radius:5px; font-family:'Montserrat';">
                      ✉️ Répondre à l’artiste
                    </a>
                  </td>
                </tr>
                <tr style="background:#EEE;">
                  <td style="padding:10px; font-size:12px; text-align:center; font-family:'Playfair Display'; color:#555;">
                    Ce message a été envoyé automatiquement via le site officiel de Donjuan JR.
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

// SERVEUR
app.listen(3000, () => {
    console.log("Serveur lancé sur http://localhost:3000");
});
