const cloudinary = require('cloudinary').v2;
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Custom storage engine for Cloudinary without multer-storage-cloudinary dependency
class CloudinaryStorage {
  constructor(options) {
    this.options = options;
  }

  _handleFile(req, file, cb) {
    const uploadOptions = {
      folder: this.options.params.folder || 'arrow3-drones',
      allowed_formats: this.options.params.allowed_formats || ['jpg', 'jpeg', 'png', 'gif', 'mp4', 'mov', 'avi', 'webm'],
      resource_type: 'auto', // Automatically detect if it's image or video
      transformation: this.options.params.transformation || [
        {
          quality: 'auto',
          fetch_format: 'auto',
        },
      ],
    };

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          return cb(error);
        }
        
        // Format result to match expected structure
        const fileInfo = {
          fieldname: file.fieldname,
          originalname: file.originalname,
          encoding: file.encoding,
          mimetype: file.mimetype,
          public_id: result.public_id,
          secure_url: result.secure_url,
          url: result.url,
          bytes: result.bytes,
          format: result.format,
          resource_type: result.resource_type,
          created_at: result.created_at,
        };
        
        cb(null, fileInfo);
      }
    );

    file.stream.pipe(uploadStream);
  }

  _removeFile(req, file, cb) {
    // Cleanup logic if needed
    cb(null);
  }
}

// Configure multer with custom Cloudinary storage
const storage = new CloudinaryStorage({
  params: {
    folder: 'arrow3-drones',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'mp4', 'mov', 'avi', 'webm'],
    transformation: [
      {
        quality: 'auto',
        fetch_format: 'auto',
      },
    ],
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'video/mp4',
      'video/mov',
      'video/avi',
      'video/webm',
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images and videos are allowed.'), false);
    }
  },
});

// Helper function to delete file from Cloudinary
const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw error;
  }
};

// Helper function to get optimized URL
const getOptimizedUrl = (publicId, options = {}) => {
  return cloudinary.url(publicId, {
    quality: 'auto',
    fetch_format: 'auto',
    ...options,
  });
};

module.exports = {
  cloudinary,
  upload,
  deleteFromCloudinary,
  getOptimizedUrl,
};
