const path = require('path');
const Notification = require('../models/notificationModel');
const User = require('../models/userModel');
const scheduleNotification = require('../planificationDate/notificationScheduler');


exports.createNotification = async (req, res) => {
  try {
    const { title, message, targetGroups, isInteractive, scheduledFor } = req.body;
    console.log("📨 Date de planification reçue :", req.body.scheduledFor);

    // Conversion de scheduledFor en objet Date (si présent)
    console.log('Valeur brute reçue pour scheduledFor :', scheduledFor);

    const scheduledDate = scheduledFor ? new Date(scheduledFor) : null;
    if (scheduledDate) {
  const now = new Date();
  console.log('Date planifiée est dans le futur ?', scheduledDate > now);
}


    let imageUrl = null;
    if (req.file) {
      imageUrl = `/uploads/notification-images/${req.file.filename}`;
    }

    let groups = [];
    if (targetGroups) {
      groups = Array.isArray(targetGroups)
        ? targetGroups
        : targetGroups.split(',').map(g => g.trim());
    }

    const newNotification = new Notification({
      title,
      message,
      targetGroups: groups,
      imageUrl,
      isInteractive,
      scheduledFor: scheduledDate,
      sentAt: scheduledDate ? null : new Date(),
    });

    await newNotification.save();

    if (scheduledDate) {
      scheduleNotification(newNotification);
    }

    res.status(201).json({ message: "Notification créée avec succès", notification: newNotification });

  } catch (error) {
    console.error("Erreur lors de la création de la notification :", error.message);
    res.status(500).json({ error: "Erreur lors de la création de la notification" });
  }
};



exports.respondToNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const { userId, response } = req.body;
    const validResponses = ['available', 'not available'];
    if (!validResponses.includes(response)) {
      return res.status(400).json({ error: 'Invalid response' });
    }
    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    const existingResponseIndex = notification.responses.findIndex(r => r.userId.toString() === userId);
    if (existingResponseIndex !== -1) {
      notification.responses[existingResponseIndex].response = response;
    } else {
      notification.responses.push({ userId, response });
    }
    await notification.save();
    res.status(200).json({ message: 'Response saved' });
  } catch (err) {
    console.error('Response error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getNotificationHistoryByGroup = async (req, res) => {
  try {
    const { groupName } = req.params;
    const { userId } = req.query;
    if (!VALID_GROUPS.includes(groupName)) {
      return res.status(400).json({ error: 'Invalid group name' });
    }
    const notifications = await Notification.find({ targetGroups: groupName }).sort({ sentAt: -1 });
    const result = notifications.map(notif => {
      const interestedCount = notif.responses?.filter(r => r.response === 'available').length || 0;
      let userResponse = null;
      if (userId) {
        const response = notif.responses.find(r => r.userId.toString() === userId);
        userResponse = response ? response.response : null;
      }
      return {
        _id: notif._id,
        title: notif.title,
        message: notif.message,
        imageUrl: notif.imageUrl,
        targetGroups: notif.targetGroups,
        sentAt: notif.sentAt,
        isInteractive: notif.isInteractive,
        interestedCount,
        userResponse,
      };
    });
    res.status(200).json(result);
  } catch (err) {
    console.error('Group notification history error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getInterestedUsers = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    const interestedResponses = notification.responses?.filter(resp => resp.response === 'available') || [];
    const userIds = interestedResponses.map(resp => resp.userId);
    const users = await User.find({ _id: { $in: userIds } })
      .select('firstName lastName birthdate group profilePicture');
    res.status(200).json(users);
  } catch (err) {
    console.error('Fetch interested users error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getPhotosByGroup = async (req, res) => {
  try {
    const { groupName } = req.params;

    if (!VALID_GROUPS.includes(groupName)) {
      return res.status(400).json({ error: 'Invalid group name' });
    }

    const notificationsWithPhotos = await Notification.find({
      targetGroups: groupName,
      imageUrl: { $ne: null },
    })
      .sort({ sentAt: -1 })
      .select('imageUrl sentAt');

    // ✅ Correction ici : forcer imageUrl en tableau
    const photoData = notificationsWithPhotos.map((notif) => ({
      photo: Array.isArray(notif.imageUrl) ? notif.imageUrl : [notif.imageUrl],
      sentAt: notif.sentAt, // bien écrit
    }));

    res.status(200).json(photoData);

  } catch (err) {
    console.error('Error fetching group photos:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getPhotosForUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user || !user.group) {
      return res.status(404).json({ error: 'User or group not found' });
    }
    const notificationsWithPhotos = await Notification.find({
      targetGroups: user.group,
      imageUrl: { $ne: null },
    }).sort({ sentAt: -1 }).select('imageUrl');
    const photoUrls = notificationsWithPhotos.map(n => n.imageUrl);
    res.status(200).json(photoUrls);
  } catch (err) {
    console.error('Error fetching user photos:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Controller (extrait)
// En haut du fichier notificationController.js
const VALID_GROUPS = ['Familles', 'Jeunesse', 'Enfant', 'Generale'];

// Controller (extrait)
exports.getNotificationsByGroups = async (req, res) => {
  try {
    let { groups } = req.query;  // groups = "Familles,Jeunesse"
    if (!groups) {
      return res.status(400).json({ error: 'Paramètre groups manquant' });
    }
    groups = groups.split(',').map(g => g.trim());

    // Vérifier que les groupes sont valides
    const invalidGroups = groups.filter(g => !VALID_GROUPS.includes(g));
    if (invalidGroups.length > 0) {
      return res.status(400).json({ error: `Groupes invalides : ${invalidGroups.join(', ')}` });
    }

    const notifications = await Notification.find({
      targetGroups: { $in: groups }
    }).sort({ sentAt: -1 });

    // Logs pour debug
    console.log('Groups reçus:', groups);
    console.log('Notifications trouvées:', notifications.length);

    res.status(200).json(notifications);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }

};
