const Notification = require('./models/notificationModel');
const scheduleNotification = require('./planificationDate/notificationScheduler');

const scheduleAllPendingNotifications = async () => {
  const pendingNotifications = await Notification.find({
    scheduledFor: { $gt: new Date() }, 
    // si tu n'as pas de champ status, enlève cette ligne
    // status: { $ne: 'sent' },
  });

  pendingNotifications.forEach(scheduleNotification);
};

module.exports = scheduleAllPendingNotifications;
