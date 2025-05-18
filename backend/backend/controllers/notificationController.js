// /backend/controllers/notificationController.js

const path = require('path');
const Notification = require('../models/notificationModel');
const User = require('../models/userModel');

// Constant array for valid user groups used in multiple endpoints.
// Note: Double-check the group name "Enfence/Réseau" to ensure it’s not a typo.
const VALID_GROUPS = ['Familles', 'Jeunesse', 'Enfence/Réseau'];

/**
 * Create and send a new notification.
 * - Supports optional image upload.
 * - Accepts either an array or a comma-separated string for target groups.
 */
exports.createNotification = async (req, res) => {
  try {
    // Destructure required notification fields from the request body.
    const { title, message, targetGroups, isInteractive } = req.body;

    // If an image file was uploaded, construct its URL for later serving.
    let imageUrl = null;
    if (req.file) {
      imageUrl = `/uploads/notification-images/${req.file.filename}`;
    }

    // Ensure targetGroups is an array.
    const groups = Array.isArray(targetGroups)
      ? targetGroups
      : targetGroups.split(',').map(g => g.trim());

    // Create a new notification document.
    const newNotification = new Notification({
      title,
      message,
      targetGroups: groups,
      imageUrl,
      isInteractive,
      sentAt: new Date(),
    });

    // Save the notification in the database.
    await newNotification.save();

    // Respond with the newly created notification object.
    res.status(201).json({ message: 'Notification sent', notification: newNotification });
  } catch (err) {
    console.error('Notification creation error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Allow a user to respond to a notification.
 * - Accepts a response value: either "available" or "not available".
 * - Updates the notification’s response record for the given user.
 */
exports.respondToNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const { userId, response } = req.body;

    // Validate response value.
    const validResponses = ['available', 'not available'];
    if (!validResponses.includes(response)) {
      return res.status(400).json({ error: 'Invalid response' });
    }

    // Find the notification by its ID.
    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    // Check if there's already a response from this user.
    const existingResponseIndex = notification.responses.findIndex(
      (r) => r.userId.toString() === userId
    );

    // Update existing response or add a new one.
    if (existingResponseIndex !== -1) {
      notification.responses[existingResponseIndex].response = response;
    } else {
      notification.responses.push({ userId, response });
    }

    // Save the updated notification.
    await notification.save();
    res.status(200).json({ message: 'Response saved' });
  } catch (err) {
    console.error('Response error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Admin endpoint: Get notification history for a specific group.
 * - Returns notifications with a count of users who responded "available".
 */
exports.getNotificationHistoryByGroup = async (req, res) => {
  try {
    const { groupName } = req.params;

    // Validate the group name.
    if (!VALID_GROUPS.includes(groupName)) {
      return res.status(400).json({ error: 'Invalid group name' });
    }

    // Fetch notifications targeting the specified group and sort by send date (desc).
    const notifications = await Notification.find({ targetGroups: groupName }).sort({ sentAt: -1 });

    // Map notifications and calculate "available" response counts.
    const result = notifications.map((notif) => {
      const interestedCount = notif.responses?.filter((r) => r.response === 'available').length || 0;
      return {
        _id: notif._id,
        title: notif.title,
        message: notif.message,
        imageUrl: notif.imageUrl,
        targetGroups: notif.targetGroups,
        sentAt: notif.sentAt,
        interestedCount,
      };
    });

    res.status(200).json(result);
  } catch (err) {
    console.error('Group notification history error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Admin endpoint: Retrieve a list of users who responded "available" to a notification.
 */
exports.getInterestedUsers = async (req, res) => {
  try {
    const { notificationId } = req.params;

    // Find the notification by its ID.
    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    // Filter responses to get only those with "available".
    const interestedResponses = notification.responses?.filter(
      (resp) => resp.response === 'available'
    ) || [];

    // Extract user IDs from these responses.
    const userIds = interestedResponses.map((resp) => resp.userId);

    // Fetch user details.
    const users = await User.find({ _id: { $in: userIds } })
      .select('firstName lastName birthdate group profilePicture');

    res.status(200).json(users);
  } catch (err) {
    console.error('Fetch interested users error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Admin endpoint: Get all photo URLs from notifications sent to a particular group.
 */
exports.getPhotosByGroup = async (req, res) => {
  try {
    const { groupName } = req.params;

    // Validate the group name.
    if (!VALID_GROUPS.includes(groupName)) {
      return res.status(400).json({ error: 'Invalid group name' });
    }

    // Find notifications with non-null images for the group.
    const notificationsWithPhotos = await Notification.find({
      targetGroups: groupName,
      imageUrl: { $ne: null },
    })
      .sort({ sentAt: -1 })
      .select('imageUrl');

    // Return a list of image URLs.
    const photoUrls = notificationsWithPhotos.map((n) => n.imageUrl);
    res.status(200).json(photoUrls);
  } catch (err) {
    console.error('Error fetching group photos:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * User endpoint: Get all photo URLs for notifications sent to the user's group.
 */
exports.getPhotosForUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Find the user and verify they have an associated group.
    const user = await User.findById(userId);
    if (!user || !user.group) {
      return res.status(404).json({ error: 'User or group not found' });
    }

    // Retrieve notifications with non-null photos for the user's group.
    const notificationsWithPhotos = await Notification.find({
      targetGroups: user.group,
      imageUrl: { $ne: null },
    })
      .sort({ sentAt: -1 })
      .select('imageUrl');

    const photoUrls = notificationsWithPhotos.map((n) => n.imageUrl);
    res.status(200).json(photoUrls);
  } catch (err) {
    console.error('Error fetching user photos:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
