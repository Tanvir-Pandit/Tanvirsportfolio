// File-based Image Manager - Handles image copying to appropriate directories
class FileImageManager {
  constructor() {
    this.imageCounter = 0;
    this.supportedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    this.maxFileSize = 5 * 1024 * 1024; // 5MB
  }

  // Process uploaded file and generate appropriate path
  async processImageUpload(file, category = 'projects') {
    return new Promise((resolve, reject) => {
      if (!file) {
        reject(new Error('No file provided'));
        return;
      }

      // Validate file type
      if (!this.supportedFormats.includes(file.type)) {
        reject(new Error('Unsupported file format. Please use JPG, PNG, GIF, or WebP.'));
        return;
      }

      // Validate file size
      if (file.size > this.maxFileSize) {
        reject(new Error('File too large. Maximum size is 5MB.'));
        return;
      }

      // Generate filename
      const timestamp = Date.now();
      const extension = file.name.split('.').pop().toLowerCase();
      
      let fileName, relativePath;
      
      if (category === 'profile') {
        fileName = `profile-${timestamp}.${extension}`;
        relativePath = `assets/images/${fileName}`;
      } else {
        fileName = `project-${timestamp}.${extension}`;
        relativePath = `assets/images/projects/${fileName}`;
      }

      // Create FileReader to read the file
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const arrayBuffer = e.target.result;
        
        // In a real application, you would send this to a server
        // For now, we'll simulate the file save and return the path
        
        // Store file data for later use (simulating file system)
        const imageData = {
          fileName: fileName,
          relativePath: relativePath,
          data: arrayBuffer,
          mimeType: file.type,
          size: file.size,
          uploadDate: new Date().toISOString()
        };
        
        // Store in localStorage for persistence
        this.saveImageMetadata(imageData);
        
        resolve({
          success: true,
          fileName: fileName,
          relativePath: relativePath,
          fullPath: relativePath,
          imageId: fileName.replace(/\.[^/.]+$/, ''), // Remove extension for ID
          metadata: imageData
        });
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      reader.readAsArrayBuffer(file);
    });
  }

  // Save image metadata to localStorage
  saveImageMetadata(imageData) {
    try {
      const existingImages = JSON.parse(localStorage.getItem('uploaded_images') || '{}');
      existingImages[imageData.fileName] = {
        fileName: imageData.fileName,
        relativePath: imageData.relativePath,
        mimeType: imageData.mimeType,
        size: imageData.size,
        uploadDate: imageData.uploadDate
      };
      localStorage.setItem('uploaded_images', JSON.stringify(existingImages));
    } catch (error) {
      console.error('Error saving image metadata:', error);
    }
  }

  // Get image source with fallback
  getImageSrc(imagePath) {
    if (!imagePath) return 'assets/images/profile.png';
    
    // If it's already a full path, return as is
    if (imagePath.startsWith('assets/') || imagePath.startsWith('http')) {
      return imagePath;
    }
    
    // Check if it's a filename we need to resolve
    const uploadedImages = JSON.parse(localStorage.getItem('uploaded_images') || '{}');
    
    // Look for the image by filename or ID
    for (const [fileName, metadata] of Object.entries(uploadedImages)) {
      if (fileName === imagePath || fileName.startsWith(imagePath)) {
        return metadata.relativePath;
      }
    }
    
    // Fallback - construct path based on category
    if (imagePath.includes('profile')) {
      return `assets/images/${imagePath}`;
    } else {
      return `assets/images/projects/${imagePath}`;
    }
  }

  // Get all uploaded images
  getUploadedImages() {
    return JSON.parse(localStorage.getItem('uploaded_images') || '{}');
  }

  // Delete image metadata
  deleteImage(fileName) {
    try {
      const existingImages = JSON.parse(localStorage.getItem('uploaded_images') || '{}');
      delete existingImages[fileName];
      localStorage.setItem('uploaded_images', JSON.stringify(existingImages));
      return true;
    } catch (error) {
      console.error('Error deleting image metadata:', error);
      return false;
    }
  }

  // Get storage statistics
  getStorageStats() {
    const uploadedImages = this.getUploadedImages();
    const totalImages = Object.keys(uploadedImages).length;
    const totalSize = Object.values(uploadedImages).reduce((sum, img) => sum + (img.size || 0), 0);
    
    return {
      totalImages,
      totalSize: this.formatFileSize(totalSize),
      images: uploadedImages
    };
  }

  // Format file size for display
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Export image metadata
  exportImageMetadata() {
    const uploadedImages = this.getUploadedImages();
    return JSON.stringify(uploadedImages, null, 2);
  }

  // Clear all image metadata
  clearAllImages() {
    localStorage.removeItem('uploaded_images');
  }
}

// Initialize global instance
window.fileImageManager = new FileImageManager();
