const mongoose = require('mongoose');

const uri = 'mongodb://localhost:27017/notifications-app'; // remplace par ton URI MongoDB

const notificationSchema = new mongoose.Schema({
  targetGroups: [String],
}, { collection: 'notifications' }); // Assure-toi que c'est bien le nom de ta collection

const Notification = mongoose.model('Notification', notificationSchema);

async function showGroups() {
  try {
    await mongoose.connect(uri);
    console.log('Connecté à MongoDB');

    // Trouver les groupes distincts
    const groups = await Notification.distinct('targetGroups');
    console.log('Groupes distincts dans les notifications :');
    console.log(groups);

    await mongoose.disconnect();
  } catch (err) {
    console.error('Erreur :', err);
  }
}

showGroups();
