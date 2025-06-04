// /backend/controllers/userController.js

const User = require('../models/userModel');

/**
 * Helper function to determine a user's group based on age.
 * @param {number} age - The user's age.
 * @returns {string|null} - Returns "Familles" if age ≥ 26,
 *                           "Jeunesse" if age is between 12 and 25,
 *                           "Enfence/Réseau" if age is between 6 and 11,
 *                           or null if under 6.
 */
function determineGroup(age) {
  if (age >= 26) return 'Familles';
  else if (age >= 12) return 'Jeunesse';
  else if (age >= 6) return 'Enfence/Réseau';
  else return null;
}

/**
 * Create a new user (Registration/Signup).
 * Expected fields in req.body:
 * - firstName (String, required)
 * - lastName (String, required)
 * - birthdate (Date, required)
 * - firebaseToken (String, required)
 * - deviceId (String, required)
 * Optional fields: phone, gender, photo, adhesion.
 * Automatically calculates the user's age and assigns the age-based group.
 */
exports.createUser = async (req, res) => {
  try {
    const { firstName, lastName, birthdate, firebaseToken, deviceId, phone, gender, photo, adhesion } = req.body;

    // Convert birthdate string to Date object and calculate age
    const birthDateObj = new Date(birthdate);
    const currentYear = new Date().getFullYear();
    const age = currentYear - birthDateObj.getFullYear();
    const group = determineGroup(age);

    const newUser = new User({
      firstName,
      lastName,
      birthdate: birthDateObj,
      firebaseToken,
      deviceId,
      phone,
      gender,
      photo,
      adhesion,
      age,
      group
    });

    await newUser.save();
    res.status(201).json({ message: 'User created successfully', user: newUser });
  } catch (err) {
    console.error('Error creating user:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Update user's name or birthdate (recalculates age and assigns group accordingly).
 * Endpoint: PUT /api/users/:userId/update-info
 */
exports.updateUserInfo = async (req, res) => {
  try {
    const { userId } = req.params;
    const { firstName, lastName, birthdate } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;

    // If birthdate is provided, recalculate age and group
    if (birthdate) {
      const birthDateObj = new Date(birthdate);
      user.birthdate = birthDateObj;
      const currentYear = new Date().getFullYear();
      const age = currentYear - birthDateObj.getFullYear();
      user.age = age;
      user.group = determineGroup(age);
    }

    await user.save();
    res.status(200).json({ message: 'User updated successfully', user });
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Upload or update a user's profile picture.
 * Expects a file upload (using multer).
 * Endpoint: POST /api/users/upload-profile/:userId
 */
exports.uploadProfilePicture = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const profilePicUrl = `/uploads/profile-pictures/${req.file.filename}`;
    const user = await User.findByIdAndUpdate(
      userId,
      { profilePicture: profilePicUrl },
      { new: true }
    ).select('firstName lastName profilePicture');

    if (!user) return res.status(404).json({ error: 'User not found' });
    res.status(200).json({ message: 'Profile picture uploaded', user });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Get all users belonging to a specific group.
 * Endpoint: GET /api/users/group/:groupName
 */
exports.getUsersByGroup = async (req, res) => {
  try {
    const { groupName } = req.params;
    const users = await User.find({ group: groupName }).select(
      'firstName lastName birthdate group profilePicture'
    );
    res.status(200).json(users);
  } catch (err) {
    console.error('Group fetch error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Admin deletes any user by their ID.
 * Endpoint: DELETE /api/users/:userId
 */
exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findByIdAndDelete(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.status(200).json({ message: `User ${user.firstName} ${user.lastName} deleted.` });
  } catch (err) {
    console.error('Admin delete error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Check if a user exists via deviceId (for auto-login/skip registration).
 * Endpoint: GET /api/users/check-device/:deviceId
 */
exports.checkUserByDeviceId = async (req, res) => {
  try {
    const { deviceId } = req.params;
    const user = await User.findOne({ deviceId });
    if (user) {
      res.status(200).json({ exists: true, user });
    } else {
      res.status(200).json({ exists: false });
    }
  } catch (err) {
    console.error('Device check error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
