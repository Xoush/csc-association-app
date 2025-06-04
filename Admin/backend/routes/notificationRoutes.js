// /backend/routes/notificationRoutes.js

const express = require('express');
const router = express.Router();

const Notification = require('../models/notificationModel'); 

const notificationController = require('../controllers/notificationController');
const { notificationUpload } = require('../middleware/uploadMiddleware');


/**
 * Notification Routes:
 * These routes allow administrators to create and manage notifications,
 * while users can respond and fetch related media.
 */ 


// ✅ Send a notification (without using file upload middleware)
//     Call this endpoint when no image is provided in the request.
router.post('/', notificationController.createNotification);

// ✅ Send a notification with an image file upload
//     Uses Multer middleware to handle a single file uploaded with the field name 'image'.


router.post('/send', notificationUpload.array('files'), async (req, res) => {
  try {
    console.log('Fichiers reçus :', req.files);
    const { title, message, targetGroups, scheduledFor } = req.body;

    if (!title || !message || !targetGroups) {
      return res.status(400).json({ error: 'Champs manquants' });
    }

    // targetGroups peut être une chaîne CSV, il faut la transformer en tableau
    let groupsArray = [];
    if (typeof targetGroups === 'string') {
      groupsArray = targetGroups.split(',').map(g => g.trim());
    } else if (Array.isArray(targetGroups)) {
      groupsArray = targetGroups;
    }

    // Préparer les images (chemins)
    const imagesUrls = req.files.map(file => file.path);

    // Gérer la date de planification (si elle est fournie)
    let scheduledDate = null;
    if (scheduledFor) {
      scheduledDate = new Date(scheduledFor);
      if (isNaN(scheduledDate)) {
        return res.status(400).json({ error: 'Date de planification invalide' });
      }
      console.log('Date de planification reçue :', scheduledDate);
    }

    // Création de la notification avec la date planifiée
    const notification = new Notification({
      title,
      message,
      targetGroups: groupsArray,
      imageUrl: imagesUrls.length > 0 ? imagesUrls : null,
      sentAt: new Date(),
      scheduledFor: scheduledDate,  // Ajout de la date planifiée
    });

    await notification.save();

    // Ici, tu peux aussi appeler une fonction pour planifier l'envoi si scheduledDate est dans le futur

    res.status(201).json({ message: 'Notification créée', notification });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});


// ✅ User responds to a notification ------------de ma part------------------------------
router.get('/filter', notificationController.getNotificationsByGroups);
//     Requires :notificationId parameter in the URL.-------------------------------------
router.post('/:notificationId/respond', notificationController.respondToNotification);

// ✅ Admin: Get notification history for a specific group
//     Returns notifications for the provided group along with interested counts.
router.get('/group/:groupName/history', notificationController.getNotificationHistoryByGroup);

// ✅ Admin: Get list of users who responded "available" to a notification
//     Fetches a list of users based on their response to the notification.
router.get('/:notificationId/interested', notificationController.getInterestedUsers);

// ✅ Admin: Get all photo URLs sent to a particular group
//     This endpoint returns a list of image URLs (without any additional message content).
router.get('/group/:groupName/photos', notificationController.getPhotosByGroup);

// ✅ User: Get photo URLs for notifications sent to the user's group
//     Provides a list of image URLs based on the user's group association.
router.get('/user/:userId/photos', notificationController.getPhotosForUser);

module.exports = router;
