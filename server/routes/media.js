const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { authenticate, authorize } = require('../middleware/auth');
const Drone = require('../models/Drone');

const router = express.Router();

// Create uploads directory if it doesn't exist
const createUploadsDir = async () => {
  const uploadsDir = path.join(__dirname, '../uploads');
  const imagesDir = path.join(uploadsDir, 'images');
  const videosDir = path.join(uploadsDir, 'videos');
  
  try {
    await fs.access(uploadsDir);
  } catch {
    await fs.mkdir(uploadsDir, { recursive: true });
  }
  
  try {
    await fs.access(imagesDir);
  } catch {
    await fs.mkdir(imagesDir, { recursive: true });
  }
  
  try {
    await fs.access(videosDir);
  } catch {
    await fs.mkdir(videosDir, { recursive: true });
  }
};

// Initialize uploads directory
createUploadsDir().catch(console.error);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isImage = file.mimetype.startsWith('image/');
    const isVideo = file.mimetype.startsWith('video/');
    
    if (isImage) {
      cb(null, path.join(__dirname, '../uploads/images'));
    } else if (isVideo) {
      cb(null, path.join(__dirname, '../uploads/videos'));
    } else {
      cb(new Error('Invalid file type'), null);
    }
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp and random string
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, extension)
      .replace(/[^a-zA-Z0-9]/g, '-')
      .toLowerCase();
    
    cb(null, `${baseName}-${uniqueSuffix}${extension}`);
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/mov', 'video/avi'];
  
  if (allowedImageTypes.includes(file.mimetype) || allowedVideoTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images (JPEG, PNG, WebP, GIF) and videos (MP4, WebM, MOV, AVI) are allowed.'), false);
  }
};

// Configure multer with size limits
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
    files: 10 // Maximum 10 files per request
  }
});

// Helper function to generate file URL
const generateFileUrl = (req, filename, type) => {
  const baseUrl = process.env.API_BASE_URL || `${req.protocol}://${req.get('host')}`;
  return `${baseUrl}/uploads/${type}/${filename}`;
};

// Helper function to validate drone ownership for admin
const validateDroneAccess = async (droneId, userId, userRole) => {
  if (userRole !== 'admin') {
    throw new Error('Access denied. Admin privileges required.');
  }
  
  if (!droneId.match(/^[0-9a-fA-F]{24}$/)) {
    throw new Error('Invalid drone ID format');
  }
  
  const drone = await Drone.findById(droneId);
  if (!drone) {
    throw new Error('Drone not found');
  }
  
  return drone;
};

// @route   POST /api/media/drones/:id/upload
// @desc    Upload media files for a specific drone
// @access  Private (Admin)
router.post('/drones/:id/upload', authenticate, authorize('admin'), (req, res) => {
  upload.array('files', 10)(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'File too large. Maximum size is 50MB per file.'
        });
      } else if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({
          success: false,
          message: 'Too many files. Maximum 10 files per upload.'
        });
      }
      return res.status(400).json({
        success: false,
        message: `Upload error: ${err.message}`
      });
    } else if (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }

    try {
      const { id: droneId } = req.params;
      const userId = req.user._id;
      const userRole = req.user.role;

      // Validate drone access
      const drone = await validateDroneAccess(droneId, userId, userRole);

      // Check if files were uploaded
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No files uploaded'
        });
      }

      // Process uploaded files
      const uploadedFiles = {
        images: [],
        videos: []
      };

      const fileUrls = {
        images: [],
        videos: []
      };

      req.files.forEach(file => {
        const fileUrl = generateFileUrl(req, file.filename, file.mimetype.startsWith('image/') ? 'images' : 'videos');
        
        if (file.mimetype.startsWith('image/')) {
          uploadedFiles.images.push(file.filename);
          fileUrls.images.push(fileUrl);
        } else if (file.mimetype.startsWith('video/')) {
          uploadedFiles.videos.push(file.filename);
          fileUrls.videos.push(fileUrl);
        }
      });

      // Update drone with new media URLs
      const updateData = {};
      if (fileUrls.images.length > 0) {
        updateData.$push = { images: { $each: fileUrls.images } };
      }
      if (fileUrls.videos.length > 0) {
        if (updateData.$push) {
          updateData.$push.videos = { $each: fileUrls.videos };
        } else {
          updateData.$push = { videos: { $each: fileUrls.videos } };
        }
      }

      const updatedDrone = await Drone.findByIdAndUpdate(
        droneId,
        updateData,
        { new: true, runValidators: true }
      );

      res.status(201).json({
        success: true,
        message: 'Media files uploaded successfully',
        data: {
          uploadedFiles: {
            images: fileUrls.images,
            videos: fileUrls.videos
          },
          drone: {
            id: updatedDrone._id,
            name: updatedDrone.name,
            totalImages: updatedDrone.images.length,
            totalVideos: updatedDrone.videos.length
          }
        }
      });
    } catch (error) {
      console.error('Media upload error:', error);
      
      // Clean up uploaded files on error
      if (req.files) {
        req.files.forEach(async (file) => {
          try {
            await fs.unlink(file.path);
          } catch (unlinkError) {
            console.error('Error cleaning up file:', unlinkError);
          }
        });
      }

      if (error.message.includes('Access denied') || error.message.includes('not found') || error.message.includes('Invalid')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to upload media files. Please try again.'
      });
    }
  });
});

// @route   GET /api/media/images/:filename
// @desc    Serve uploaded image files
// @access  Public
router.get('/images/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(__dirname, '../uploads/images', filename);
    
    // Check if file exists
    try {
      await fs.access(filePath);
    } catch {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }

    // Set appropriate headers
    res.setHeader('Content-Type', 'image/*');
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
    
    res.sendFile(filePath);
  } catch (error) {
    console.error('Serve image error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to serve image'
    });
  }
});

// @route   GET /api/media/videos/:filename
// @desc    Serve uploaded video files
// @access  Public
router.get('/videos/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(__dirname, '../uploads/videos', filename);
    
    // Check if file exists
    try {
      await fs.access(filePath);
    } catch {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    // Set appropriate headers for video streaming
    res.setHeader('Content-Type', 'video/*');
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
    
    res.sendFile(filePath);
  } catch (error) {
    console.error('Serve video error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to serve video'
    });
  }
});

// @route   DELETE /api/media/drones/:id/media
// @desc    Delete specific media files from a drone
// @access  Private (Admin)
router.delete('/drones/:id/media', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { id: droneId } = req.params;
    const { imageUrls = [], videoUrls = [] } = req.body;
    const userId = req.user._id;
    const userRole = req.user.role;

    // Validate drone access
    const drone = await validateDroneAccess(droneId, userId, userRole);

    if (imageUrls.length === 0 && videoUrls.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No media URLs provided for deletion'
      });
    }

    // Remove URLs from drone document
    const updateData = {};
    if (imageUrls.length > 0) {
      updateData.$pullAll = { images: imageUrls };
    }
    if (videoUrls.length > 0) {
      if (updateData.$pullAll) {
        updateData.$pullAll.videos = videoUrls;
      } else {
        updateData.$pullAll = { videos: videoUrls };
      }
    }

    const updatedDrone = await Drone.findByIdAndUpdate(
      droneId,
      updateData,
      { new: true, runValidators: true }
    );

    // Extract filenames from URLs and delete physical files
    const deletedFiles = [];
    const allUrls = [...imageUrls, ...videoUrls];
    
    for (const url of allUrls) {
      try {
        const filename = path.basename(url);
        const isImage = imageUrls.includes(url);
        const filePath = path.join(
          __dirname, 
          '../uploads', 
          isImage ? 'images' : 'videos', 
          filename
        );
        
        await fs.unlink(filePath);
        deletedFiles.push(filename);
      } catch (fileError) {
        console.error(`Error deleting file from URL ${url}:`, fileError);
        // Continue with other files even if one fails
      }
    }

    res.json({
      success: true,
      message: 'Media files deleted successfully',
      data: {
        deletedFiles,
        drone: {
          id: updatedDrone._id,
          name: updatedDrone.name,
          totalImages: updatedDrone.images.length,
          totalVideos: updatedDrone.videos.length
        }
      }
    });
  } catch (error) {
    console.error('Delete media error:', error);
    
    if (error.message.includes('Access denied') || error.message.includes('not found') || error.message.includes('Invalid')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to delete media files. Please try again.'
    });
  }
});

// @route   GET /api/media/drones/:id
// @desc    Get all media files for a specific drone
// @access  Public
router.get('/drones/:id', async (req, res) => {
  try {
    const { id: droneId } = req.params;

    // Validate ObjectId format
    if (!droneId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid drone ID format'
      });
    }

    const drone = await Drone.findById(droneId).select('name images videos');
    
    if (!drone) {
      return res.status(404).json({
        success: false,
        message: 'Drone not found'
      });
    }

    res.json({
      success: true,
      message: 'Drone media retrieved successfully',
      data: {
        drone: {
          id: drone._id,
          name: drone.name,
          images: drone.images || [],
          videos: drone.videos || [],
          totalImages: (drone.images || []).length,
          totalVideos: (drone.videos || []).length
        }
      }
    });
  } catch (error) {
    console.error('Get drone media error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve drone media. Please try again.'
    });
  }
});

// @route   POST /api/media/drones/:id/reorder
// @desc    Reorder media files for a drone
// @access  Private (Admin)
router.post('/drones/:id/reorder', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { id: droneId } = req.params;
    const { images, videos } = req.body;
    const userId = req.user._id;
    const userRole = req.user.role;

    // Validate drone access
    const drone = await validateDroneAccess(droneId, userId, userRole);

    // Validate that provided arrays contain only existing URLs
    if (images && !Array.isArray(images)) {
      return res.status(400).json({
        success: false,
        message: 'Images must be an array'
      });
    }

    if (videos && !Array.isArray(videos)) {
      return res.status(400).json({
        success: false,
        message: 'Videos must be an array'
      });
    }

    // Update drone with reordered media
    const updateData = {};
    if (images) updateData.images = images;
    if (videos) updateData.videos = videos;

    const updatedDrone = await Drone.findByIdAndUpdate(
      droneId,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Media files reordered successfully',
      data: {
        drone: {
          id: updatedDrone._id,
          name: updatedDrone.name,
          images: updatedDrone.images,
          videos: updatedDrone.videos
        }
      }
    });
  } catch (error) {
    console.error('Reorder media error:', error);
    
    if (error.message.includes('Access denied') || error.message.includes('not found') || error.message.includes('Invalid')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to reorder media files. Please try again.'
    });
  }
});

module.exports = router;