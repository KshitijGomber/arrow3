const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const Drone = require('../models/Drone');
const { upload, deleteFromCloudinary, getOptimizedUrl } = require('../services/cloudinaryService');

const router = express.Router();

// Upload single file endpoint
router.post('/upload', authenticate, authorize(['admin']), upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileData = {
      id: req.file.public_id,
      url: req.file.secure_url,
      publicId: req.file.public_id,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.bytes,
      format: req.file.format,
      resourceType: req.file.resource_type,
      uploadedAt: new Date(),
    };

    res.json({
      success: true,
      message: 'File uploaded successfully',
      file: fileData,
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      error: 'Upload failed',
      details: error.message,
    });
  }
});

// Upload multiple files endpoint
router.post('/upload-multiple', authenticate, authorize(['admin']), upload.array('files', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const uploadedFiles = req.files.map(file => ({
      id: file.public_id,
      url: file.secure_url,
      publicId: file.public_id,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.bytes,
      format: file.format,
      resourceType: file.resource_type,
      uploadedAt: new Date(),
    }));

    res.json({
      success: true,
      message: `${uploadedFiles.length} files uploaded successfully`,
      files: uploadedFiles,
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      error: 'Upload failed',
      details: error.message,
    });
  }
});

// Upload media files for a specific drone
router.post('/drones/:id/upload', authenticate, authorize(['admin']), upload.array('files', 10), async (req, res) => {
  try {
    const { id: droneId } = req.params;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    // Find the drone
    const drone = await Drone.findById(droneId);
    if (!drone) {
      return res.status(404).json({ error: 'Drone not found' });
    }

    const uploadedFiles = req.files.map(file => ({
      id: file.public_id,
      url: file.secure_url,
      publicId: file.public_id,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.bytes,
      format: file.format,
      resourceType: file.resource_type,
      uploadedAt: new Date(),
    }));

    // Separate images and videos
    const images = uploadedFiles.filter(file => file.resourceType === 'image').map(file => file.url);
    const videos = uploadedFiles.filter(file => file.resourceType === 'video').map(file => file.url);

    // Update drone with new media URLs
    if (images.length > 0) {
      drone.images = [...(drone.images || []), ...images];
    }
    
    if (videos.length > 0) {
      drone.videos = [...(drone.videos || []), ...videos];
    }

    await drone.save();

    res.json({
      success: true,
      message: `${uploadedFiles.length} files uploaded and associated with drone successfully`,
      files: uploadedFiles,
      drone: {
        id: drone._id,
        name: drone.name,
        totalImages: drone.images?.length || 0,
        totalVideos: drone.videos?.length || 0,
      },
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      error: 'Upload failed',
      details: error.message,
    });
  }
});

// Delete file endpoint
router.delete('/delete/:publicId', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const { publicId } = req.params;
    
    if (!publicId) {
      return res.status(400).json({ error: 'Public ID is required' });
    }

    // Delete from Cloudinary
    const result = await deleteFromCloudinary(publicId);
    
    if (result.result === 'ok') {
      res.json({
        success: true,
        message: 'File deleted successfully',
      });
    } else {
      res.status(404).json({
        error: 'File not found or already deleted',
      });
    }
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      error: 'Delete failed',
      details: error.message,
    });
  }
});

// Get optimized URL for a file
router.get('/optimize/:publicId', async (req, res) => {
  try {
    const { publicId } = req.params;
    const { width, height, quality, format } = req.query;
    
    const options = {};
    if (width) options.width = parseInt(width);
    if (height) options.height = parseInt(height);
    if (quality) options.quality = quality;
    if (format) options.format = format;

    const optimizedUrl = getOptimizedUrl(publicId, options);
    
    res.json({
      success: true,
      url: optimizedUrl,
    });
  } catch (error) {
    console.error('Optimization error:', error);
    res.status(500).json({
      error: 'Optimization failed',
      details: error.message,
    });
  }
});

// Associate media with drone
router.post('/associate/:droneId', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const { droneId } = req.params;
    const { images, videos, mainImage } = req.body;

    if (!images && !videos && !mainImage) {
      return res.status(400).json({ error: 'At least one media field is required' });
    }

    const drone = await Drone.findById(droneId);
    if (!drone) {
      return res.status(404).json({ error: 'Drone not found' });
    }

    // Update drone with new media URLs
    if (images) {
      drone.images = [...(drone.images || []), ...images];
    }
    
    if (videos) {
      drone.videos = [...(drone.videos || []), ...videos];
    }
    
    if (mainImage) {
      drone.mainImage = mainImage;
    }

    await drone.save();

    res.json({
      success: true,
      message: 'Media associated with drone successfully',
      drone: drone,
    });
  } catch (error) {
    console.error('Association error:', error);
    res.status(500).json({
      error: 'Failed to associate media with drone',
      details: error.message,
    });
  }
});

// Remove media from drone
router.delete('/disassociate/:droneId', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const { droneId } = req.params;
    const { imageUrl, videoUrl, removeMainImage } = req.body;

    const drone = await Drone.findById(droneId);
    if (!drone) {
      return res.status(404).json({ error: 'Drone not found' });
    }

    // Remove specific image or video
    if (imageUrl) {
      drone.images = drone.images?.filter(url => url !== imageUrl) || [];
    }
    
    if (videoUrl) {
      drone.videos = drone.videos?.filter(url => url !== videoUrl) || [];
    }
    
    if (removeMainImage) {
      drone.mainImage = null;
    }

    await drone.save();

    res.json({
      success: true,
      message: 'Media removed from drone successfully',
      drone: drone,
    });
  } catch (error) {
    console.error('Disassociation error:', error);
    res.status(500).json({
      error: 'Failed to remove media from drone',
      details: error.message,
    });
  }
});

// Get all media files for a drone
router.get('/drones/:id', async (req, res) => {
  try {
    const { id: droneId } = req.params;

    const drone = await Drone.findById(droneId).select('name images videos mainImage');
    
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
          mainImage: drone.mainImage,
          totalImages: (drone.images || []).length,
          totalVideos: (drone.videos || []).length
        }
      }
    });
  } catch (error) {
    console.error('Get drone media error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve drone media'
    });
  }
});

// Get all media files (for admin dashboard)
router.get('/list', authenticate, authorize(['admin']), async (req, res) => {
  try {
    // Return files associated with drones
    const drones = await Drone.find({}, 'name images videos mainImage');
    
    const allMedia = [];
    drones.forEach(drone => {
      if (drone.mainImage) {
        allMedia.push({
          url: drone.mainImage,
          type: 'image',
          droneId: drone._id,
          droneName: drone.name,
        });
      }
      
      drone.images?.forEach(image => {
        allMedia.push({
          url: image,
          type: 'image',
          droneId: drone._id,
          droneName: drone.name,
        });
      });
      
      drone.videos?.forEach(video => {
        allMedia.push({
          url: video,
          type: 'video',
          droneId: drone._id,
          droneName: drone.name,
        });
      });
    });

    res.json({
      success: true,
      media: allMedia,
    });
  } catch (error) {
    console.error('List media error:', error);
    res.status(500).json({
      error: 'Failed to list media',
      details: error.message,
    });
  }
});

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Media service is healthy',
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;