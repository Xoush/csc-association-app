// /backend/models/userModel.js

const mongoose = require('mongoose');

/**
 * User Schema: Represents a registered user in the system.
 *
 * Fields:
 * - firstName & lastName: User's names.
 * - birthdate: Date of birth (used to calculate age and group).
 * - age: Numerically calculated from the birthdate (auto-updated before saving).
 * - gender: User's gender, accepts 'male' or 'female'.
 * - photo: Boolean flag indicating if a photo is present (may be redundant with profilePicture).
 * - adhesion: Indicates membership or subscription status.
 * - phone: User's contact number.
 * - group: User's age group/category (e.g., 'Familles', 'Jeunesse', 'Enfence/Réseau').
 * - firebaseToken: Token used for Firebase push notifications.
 * - responses: Array that records the user's responses to notifications.
 * - deviceId: Unique identifier for the user's device (used for auto-login or registration bypass).
 * - profilePicture: URL for the user's profile picture.
 */
const userSchema = new mongoose.Schema({
  firstName: { 
    type: String, 
    required: true 
  },
  lastName: { 
    type: String, 
    required: true 
  },
  birthdate: { 
    type: Date, 
    required: true 
  },
  age: { 
    type: Number // This field is calculated automatically before saving.
  },
  gender: { 
    type: String, 
    enum: ['male', 'female'], 
    default: null 
  },
  photo: { 
    type: Boolean, 
    default: false 
  },
  adhesion: { 
    type: Boolean, 
    default: false 
  },
  phone: { 
    type: String, 
    default: null 
  },
  group: { 
    type: String 
  },
  firebaseToken: { 
    type: String, 
    required: true 
  },
  responses: [
    {
      notificationId: { 
        type: mongoose.Schema.Types.ObjectId 
      },
      response: { 
        type: String, 
        enum: ['available', 'not available'] 
      },
    },
  ],
  deviceId: {
    type: String,
    required: true,
    unique: true
  },
  profilePicture: {
    type: String,
    default:
      'https://lh3.googleusercontent.com/gps-cs-s/AC9h4npxB8OeM7bT-UmCD0j2_gQUJf0uvM67ikwrNmkDsZB8fS64VAw5O2qQihNMrjMntkvWsfizCeoZpl7-TNdkYyh_xt2SBtZvbZCtFz-0zGjVP0sbOsIPQmqLX-d1tXtrwBQW5JI=s1360-w1360-h1020-rw'
  }
});

/**
 * Pre-save middleware to calculate the user's age from their birthdate.
 * This hook ensures that the "age" field is always up-to-date before saving.
 */
userSchema.pre('save', function (next) {
  if (this.birthdate) {
    const birth = new Date(this.birthdate);
    const today = new Date();
    let calculatedAge = today.getFullYear() - birth.getFullYear();
    const monthDifference = today.getMonth() - birth.getMonth();

    // Adjust age if the birthday hasn't occurred yet this year.
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birth.getDate())) {
      calculatedAge--;
    }
    this.age = calculatedAge;
  }
  next();
});

module.exports = mongoose.model('User', userSchema);
