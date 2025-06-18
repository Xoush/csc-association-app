const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { notificationUpload } = require('../middleware/uploadMiddleware');

// Existing routes
router.post('/', notificationController.createNotification);
router.post('/send', notificationUpload.array('images'), notificationController.createNotification);
router.post('/:notificationId/respond', notificationController.respondToNotification);
router.get('/group/:groupName/history', notificationController.getNotificationHistoryByGroup);
router.get('/:notificationId/interested', notificationController.getInterestedUsers);
router.get('/group/:groupName/photos', notificationController.getPhotosByGroup);
router.get('/user/:userId/photos', notificationController.getPhotosForUser);

// New routes for flexible notification and photo retrieval
router.get('/history', notificationController.getNotifications);
router.get('/photos', notificationController.getPhotos);

module.exports = router;