// Importe les modules nécessaires
const path = require('path'); // Pour gérer les chemins de fichiers
const express = require('express'); // Framework pour créer le serveur
const mongoose = require('mongoose'); // Pour se connecter à MongoDB
const dotenv = require('dotenv'); // Pour utiliser un fichier .env avec les variables secrètes (comme la DB)
const cors = require('cors'); // Pour permettre les requêtes d’autres domaines (comme le frontend)

// Charge les variables d’environnement depuis le fichier .env
dotenv.config();

// Crée l’application Express
const app = express();

// Active CORS pour que l’API accepte les requêtes venant d’un autre domaine (comme React Native ou React.js)
app.use(cors());

// Middleware pour que le serveur comprenne les données envoyées en JSON (format utilisé par le frontend)
app.use(express.json());

///////////////////////// PLANIFICATION /////////////////////////////
// On importe la fonction qui va replanifier toutes les notifications à envoyer plus tard
const scheduleAllPendingNotifications = require('./schedulePending');

///////////////////////// ROUTES DE L’API /////////////////////////////
// On importe les différents fichiers de routes (gestion des utilisateurs, notifications, authentification)
const userRoutes = require('./routes/userRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const authRoutes = require('./routes/authRoutes');

///////////////////////// CONNEXION À LA BASE DE DONNÉES /////////////////////////////
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true, // Utilise le nouvel analyseur d’URL Mongo
    useUnifiedTopology: true, // Utilise le nouveau moteur de détection des serveurs
  })
  .then(() => {
    console.log('Connexion à MongoDB réussie ✅');

    // ⚠️ Très important :
    // Quand le serveur démarre, on replanifie l’envoi de toutes les notifications
    // qui sont encore programmées pour une date future
    scheduleAllPendingNotifications();
  })
  .catch((err) => {
    console.error('Erreur de connexion MongoDB ❌:', err);
  });

///////////////////////// DÉCLARATION DES ROUTES /////////////////////////////
// Quand une requête commence par /api/users, elle sera traitée par userRoutes
app.use('/api/users', userRoutes);

// Quand une requête commence par /api/notifications, elle sera traitée par notificationRoutes
app.use('/api/notifications', notificationRoutes);

// Quand une requête commence par /api/auth, elle sera traitée par authRoutes (connexion/déconnexion)
app.use('/api/auth', authRoutes);

///////////////////////// FICHIERS STATIQUES /////////////////////////////
// On rend certains dossiers accessibles depuis l’extérieur (images, pièces jointes, etc.)

// Ce dossier contient tous les fichiers uploadés
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Dossier spécifique pour les photos de profil
app.use(
  '/uploads/profile-pictures',
  express.static(path.join(__dirname, 'uploads/profile-pictures'))
);

// Dossier spécifique pour les images attachées aux notifications
app.use(
  '/uploads/notification-images',
  express.static(path.join(__dirname, 'uploads/notification-images'))
);

///////////////////////// LANCEMENT DU SERVEUR /////////////////////////////
// Définit le port sur lequel le serveur va écouter (5000 par défaut si pas défini dans .env)
const PORT = process.env.PORT || 5000;

// Démarre le serveur sur toutes les adresses (0.0.0.0) et affiche un message quand ça fonctionne
app.listen(PORT, '0.0.0.0', () => console.log(`✅ Serveur démarré sur le port ${PORT}`));
