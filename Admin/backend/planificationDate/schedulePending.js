const Notification = require('../models/notificationModel');
const scheduleNotification = require('./notificationScheduler');

const scheduleAllPendingNotifications = async () => {
  const pendingNotifications = await Notification.find({
    scheduledFor: { $gt: new Date() }, 
    
  });

  pendingNotifications.forEach(scheduleNotification);
};

module.exports = scheduleAllPendingNotifications;
