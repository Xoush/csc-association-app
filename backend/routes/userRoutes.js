// /backend/routes/userRoutes.js

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { profileUpload } = require('../middleware/uploadMiddleware');

// ✅ Create a new user (Registration/Signup)
router.post('/create', userController.createUser);

// ✅ Update user info (name or birthdate with group recalculation)
router.put('/:userId/update-info', userController.updateUserInfo);

// ✅ Upload or update a user's profile picture
router.post('/upload-profile/:userId', profileUpload.single('profilePicture'), userController.uploadProfilePicture);

// ✅ Get users by group (admin interface)
router.get('/group/:groupName', userController.getUsersByGroup);

// ✅ Admin deletes any user by their ID
router.delete('/:userId', userController.deleteUser);

// ✅ Check if a user exists via deviceId (for auto-login/skip registration)
router.get('/check-device/:deviceId', userController.checkUserByDeviceId);

module.exports = router;
