// /backend/routes/notificationRoutes.js

const express = require('express');
const router = express.Router();

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
router.post('/send', notificationUpload.single('image'), notificationController.createNotification);

// ✅ User responds to a notification
//     Requires :notificationId parameter in the URL.
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
