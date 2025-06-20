// /backend/utils/notificationScheduler.js
const schedule = require('node-schedule');
const Notification = require('../models/notificationModel');

const scheduleNotification = (notification) => {
  // Si aucune date programmée, on ne fait rien
  if (!notification.scheduledFor) return;

  // Planifie l'envoi à la date prévue
  schedule.scheduleJob(notification._id.toString(), new Date(notification.scheduledFor), async () => {
    try {
      // Marque la notification comme envoyée (optionnel)
      notification.sentAt = new Date();
      await notification.save();

      // Tu peux ici faire l'envoi réel (ex: push mobile, socket, email, etc.)
      console.log(`Notification "${notification.title}" envoyée à ${notification.targetGroups.join(', ')}`);
      
      // 👉 Tu peux aussi déclencher ici un appel à une fonction de diffusion (ex: envoyerSocket(notification))

    } catch (err) {
      console.error('Erreur lors de l’envoi programmé :', err);
    }
  });
};

module.exports = scheduleNotification;
