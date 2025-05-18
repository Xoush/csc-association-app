// /backend/utils/multer.js

/**
 * Multer configuration for handling image uploads.
 *
 * Files are stored in the 'uploads/' directory with a unique filename composed of
 * a timestamp and the original file name. Only files with .jpeg, .jpg, or .png extensions
 * are accepted.
 */

const multer = require('multer');
const path = require('path');

// Regular expression to check allowed file extensions.
const allowedFileTypes = /jpeg|jpg|png/;

// Configure storage settings for multer.
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Ensure that the 'uploads/' directory exists.
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    // Create a unique file name using the current timestamp and original file name.
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

// File filter function to only accept images (JPEG or PNG).
const fileFilter = (req, file, cb) => {
  const fileExtension = path.extname(file.originalname).toLowerCase();
  if (allowedFileTypes.test(fileExtension)) {
    // Accept the file.
    cb(null, true);
  } else {
    // Reject the file with an error.
    cb(new Error('Only JPG and PNG images are allowed'), false);
  }
};

// Create the multer instance with storage and file filtering options.
const upload = multer({
  storage,
  fileFilter,
});

module.exports = upload;
