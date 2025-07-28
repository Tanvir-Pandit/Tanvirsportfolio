// Image Manager - Handles image uploads and storage
class ImageManager {
  constructor() {
    this.imageStore = 'portfolioImages';
    this.init();
  }

  init() {
    // Create image storage if it doesn't exist
    if (!localStorage.getItem(this.imageStore)) {
      localStorage.setItem(this.imageStore, JSON.stringify({}));
    }
  }

  // Store image as base64 in localStorage with metadata
  storeImage(file, callback) {
    if (!file) {
      callback(null);
      return;
    }

    // Validate file
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Please select a valid image file (JPEG, PNG, GIF, WebP)');
      callback(null);
      return;
    }

    // Validate size (max 2MB for better performance)
    if (file.size > 2 * 1024 * 1024) {
      alert('Image size must be less than 2MB');
      callback(null);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        // Generate unique ID for the image
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 8);
        const extension = file.name.split('.').pop().toLowerCase();
        const imageId = `img-${timestamp}-${randomString}`;
        const imagePath = `assets/images/projects/${imageId}.${extension}`;

        // Store image data
        const imageData = {
          id: imageId,
          path: imagePath,
          filename: `${imageId}.${extension}`,
          originalName: file.name,
          base64: e.target.result,
          type: file.type,
          size: file.size,
          uploadDate: new Date().toISOString()
        };

        // Save to localStorage
        const images = this.getAllImages();
        images[imageId] = imageData;
        localStorage.setItem(this.imageStore, JSON.stringify(images));

        callback(imagePath, imageData);
      } catch (error) {
        console.error('Error storing image:', error);
        callback(null);
      }
    };

    reader.onerror = () => {
      console.error('Error reading file');
      callback(null);
    };

    reader.readAsDataURL(file);
  }

  // Get all stored images
  getAllImages() {
    try {
      return JSON.parse(localStorage.getItem(this.imageStore)) || {};
    } catch {
      return {};
    }
  }

  // Get image by path
  getImageByPath(path) {
    const images = this.getAllImages();
    return Object.values(images).find(img => img.path === path);
  }

  // Get image base64 data by path
  getImageData(path) {
    const image = this.getImageByPath(path);
    return image ? image.base64 : null;
  }

  // Delete image
  deleteImage(path) {
    const images = this.getAllImages();
    const imageToDelete = Object.values(images).find(img => img.path === path);
    
    if (imageToDelete) {
      delete images[imageToDelete.id];
      localStorage.setItem(this.imageStore, JSON.stringify(images));
      return true;
    }
    return false;
  }

  // Clean up unused images (images not referenced in projects)
  cleanupUnusedImages(projects) {
    const images = this.getAllImages();
    const usedPaths = projects.map(p => p.image);
    
    Object.values(images).forEach(image => {
      if (!usedPaths.includes(image.path)) {
        delete images[image.id];
      }
    });
    
    localStorage.setItem(this.imageStore, JSON.stringify(images));
  }

  // Export all images as a downloadable zip-like structure
  exportImages() {
    const images = this.getAllImages();
    const exportData = {};
    
    Object.values(images).forEach(image => {
      exportData[image.filename] = {
        path: image.path,
        base64: image.base64,
        originalName: image.originalName
      };
    });
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'portfolio-images-export.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Get storage usage info
  getStorageInfo() {
    const images = this.getAllImages();
    const count = Object.keys(images).length;
    const totalSize = Object.values(images).reduce((sum, img) => sum + img.size, 0);
    
    return {
      count,
      totalSize,
      totalSizeFormatted: this.formatFileSize(totalSize),
      storageUsed: new Blob([localStorage.getItem(this.imageStore)]).size,
      storageUsedFormatted: this.formatFileSize(new Blob([localStorage.getItem(this.imageStore)]).size)
    };
  }

  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// Global instance
window.imageManager = new ImageManager();
