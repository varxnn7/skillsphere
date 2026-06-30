const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

const isCloudinaryConfigured = 
  process.env.CLOUDINARY_CLOUD_NAME && 
  process.env.CLOUDINARY_CLOUD_NAME !== 'mock_cloud' &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_KEY !== 'mock_key' &&
  process.env.CLOUDINARY_API_SECRET &&
  process.env.CLOUDINARY_API_SECRET !== 'mock_secret';

// Configure Cloudinary if valid
if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

// Middleware to check configuration and return clear error
const checkCloudinaryConfig = (req, res, next) => {
  if (!isCloudinaryConfigured) {
    return res.status(500).json({
      success: false,
      message: 'Cloudinary not configured - add credentials to .env'
    });
  }
  next();
};

let storage;
if (isCloudinaryConfigured) {
  storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'skillsphere',
      resource_type: 'auto',
      public_id: (req, file) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        return file.fieldname + '-' + uniqueSuffix;
      }
    }
  });
} else {
  // Dummy storage engine to prevent multer startup errors when not configured
  storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, '/tmp');
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname);
    }
  });
}

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, JPG, and PDF files are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

const handleFileUpload = async (req) => {
  if (!isCloudinaryConfigured) {
    throw new Error('Cloudinary not configured - add credentials to .env');
  }
  if (!req.file) return null;
  // CloudinaryStorage sets the file URL inside req.file.path or req.file.secure_url
  return req.file.path;
};

module.exports = {
  upload,
  handleFileUpload,
  checkCloudinaryConfig,
  isCloudinaryConfigured
};
