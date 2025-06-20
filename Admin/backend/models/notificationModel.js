// /backend/models/notificationModel.js

const mongoose = require('mongoose');

/**
 * Notification Schema: Represents an alert sent by an admin to targeted groups.
 *
 * Fields:
 * - title: The title of the notification.
 * - message: The main content of the notification.
 * - targetGroups: An array of strings specifying which groups should receive the notification (e.g., "Jeunesse", "Familles").
 * - isInteractive: A flag indicating whether the notification expects an interactive response from users.
 * - imageUrl: Optional URL pointing to an associated image.
 * - sentAt: Timestamp indicating when the notification was sent.
 * - responses: Array containing response objects, each recording a user's ID and their respective response.
 */
const notificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  targetGroups: [
    {
      type: String, // Example values: "Jeunesse", "Familles"
    },
  ],
  isInteractive: {  // Renamed to match the controller property "isInteractive"
    type: Boolean,
    default: false,
  },
 imageUrl: {
  type: [String],
  default: [],
  },

 sentAt: {
    type: Date,
    default: Date.now,
  },
  scheduledFor: {
    type: Date,
    default: null,
  },
  responses: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      response: {
        type: String,
        enum: ['available', 'not available'],
      },
    },
  ],

});


module.exports = mongoose.model('Notification', notificationSchema);
