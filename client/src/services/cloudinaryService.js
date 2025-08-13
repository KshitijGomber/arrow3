import { Cloudinary } from '@cloudinary/url-gen';
import { auto } from '@cloudinary/url-gen/actions/resize';
import { autoGravity } from '@cloudinary/url-gen/qualifiers/gravity';
import { format, quality } from '@cloudinary/url-gen/actions/delivery';

class CloudinaryService {
  constructor() {
    this.cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
    this.uploadPreset = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;
    
    if (!this.cloudName || !this.uploadPreset) {
      console.error('Cloudinary configuration missing. Please set REACT_APP_CLOUDINARY_CLOUD_NAME and REACT_APP_CLOUDINARY_UPLOAD_PRESET');
    }
    
    this.cld = new Cloudinary({
      cloud: {
        cloudName: this.cloudName
      }
    });
  }

  /**
   * Upload a file directly to Cloudinary
   * @param {File} file - The file to upload
   * @param {Object} options - Upload options
   * @returns {Promise<Object>} Upload result with secure_url
   */
  async uploadFile(file, options = {}) {
    if (!this.cloudName || !this.uploadPreset) {
      throw new Error('Cloudinary not configured properly');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', this.uploadPreset);
    
    // Add optional parameters
    if (options.folder) {
      formData.append('folder', options.folder);
    }
    
    if (options.tags) {
      formData.append('tags', Array.isArray(options.tags) ? options.tags.join(',') : options.tags);
    }

    // Add resource type based on file type
    const resourceType = file.type.startsWith('video/') ? 'video' : 'image';
    
    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${this.cloudName}/${resourceType}/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Upload failed');
      }

      const result = await response.json();
      return {
        success: true,
        data: {
          secure_url: result.secure_url,
          public_id: result.public_id,
          resource_type: result.resource_type,
          format: result.format,
          width: result.width,
          height: result.height,
          bytes: result.bytes,
          created_at: result.created_at
        }
      };
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Upload multiple files
   * @param {File[]} files - Array of files to upload
   * @param {Object} options - Upload options
   * @returns {Promise<Object[]>} Array of upload results
   */
  async uploadMultipleFiles(files, options = {}) {
    const uploadPromises = files.map(file => this.uploadFile(file, {
      ...options,
      folder: options.folder || 'arrow3/drones'
    }));

    try {
      const results = await Promise.all(uploadPromises);
      return results;
    } catch (error) {
      console.error('Multiple file upload error:', error);
      throw error;
    }
  }

  /**
   * Get optimized image URL
   * @param {string} publicId - Cloudinary public ID
   * @param {Object} transformations - Image transformations
   * @returns {string} Optimized image URL
   */
  getOptimizedImageUrl(publicId, transformations = {}) {
    if (!publicId) return null;

    let img = this.cld.image(publicId);

    // Apply default optimizations
    img = img
      .format(format.auto())
      .quality(quality.auto());

    // Apply custom transformations
    if (transformations.width || transformations.height) {
      const resizeOptions = auto().gravity(autoGravity());
      
      if (transformations.width) {
        resizeOptions.width(transformations.width);
      }
      
      if (transformations.height) {
        resizeOptions.height(transformations.height);
      }
      
      img = img.resize(resizeOptions);
    }

    return img.toURL();
  }

  /**
   * Delete a file from Cloudinary
   * @param {string} publicId - The public ID of the file to delete
   * @param {string} resourceType - 'image' or 'video'
   * @returns {Promise<Object>} Deletion result
   */
  async deleteFile(publicId, resourceType = 'image') {
    // Note: Deletion requires server-side implementation with API secret
    // This is a placeholder for the client-side service
    console.warn('File deletion should be implemented on the server side for security');
    return { success: false, message: 'Deletion not implemented on client side' };
  }

  /**
   * Extract public ID from Cloudinary URL
   * @param {string} url - Cloudinary URL
   * @returns {string|null} Public ID
   */
  extractPublicId(url) {
    if (!url || !url.includes('cloudinary.com')) return null;
    
    try {
      const parts = url.split('/');
      const uploadIndex = parts.findIndex(part => part === 'upload');
      if (uploadIndex === -1) return null;
      
      // Get everything after version (if present) or after upload
      let publicIdParts = parts.slice(uploadIndex + 1);
      
      // Remove version if present (starts with 'v' followed by numbers)
      if (publicIdParts[0] && /^v\d+$/.test(publicIdParts[0])) {
        publicIdParts = publicIdParts.slice(1);
      }
      
      // Join and remove file extension
      const publicId = publicIdParts.join('/');
      return publicId.replace(/\.[^/.]+$/, '');
    } catch (error) {
      console.error('Error extracting public ID:', error);
      return null;
    }
  }
}

export default new CloudinaryService();