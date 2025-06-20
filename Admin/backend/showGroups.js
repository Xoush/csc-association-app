//modifier tout enfant en Enfance

const mongoose = require('mongoose');
const Notification = require('./models/notificationModel') // adapte le chemin si besoin
require('dotenv').config(); // Charger .env si tu as un .env avec MONGODB_URI

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});


mongoose.connect(process.env.MONGODB_URI);

const normalizeGroups = async () => {
  try {
    const result = await Notification.updateMany(
      { targetGroups: 'Enfence/réseau ' }, // filtre tous ceux avec "Enfant"
      { $set: { 'targetGroups.$': 'Enfance' } } // remplace "Enfant" par "Enfance"
    );

    console.log(`✅ ${result.modifiedCount} document(s) modifié(s).`);
  } catch (err) {
    console.error('❌ Erreur lors de la mise à jour :', err);
  } finally {
    mongoose.connection.close();
  }
};

normalizeGroups();

