// Base64 Image Manager - Handles image storage as base64 in JSON format
class Base64ImageManager {
  constructor() {
    this.images = {};
    this.defaultImages = {};
    this.initialized = false;
  }

  async init() {
    if (this.initialized) return;
    
    try {
      // Load default images from JSON
      const response = await fetch('assets/data/images.json');
      if (response.ok) {
        this.defaultImages = await response.json();
        console.log('Default images loaded');
      }
      
      // Load custom images from localStorage
      const customImages = localStorage.getItem('portfolio_images');
      if (customImages) {
        try {
          this.images = JSON.parse(customImages);
          console.log('Custom images loaded from localStorage');
        } catch (e) {
          console.warn('Failed to parse custom images, using defaults');
          this.images = { ...this.defaultImages };
        }
      } else {
        this.images = { ...this.defaultImages };
      }
      
      this.initialized = true;
    } catch (error) {
      console.error('Error initializing Base64ImageManager:', error);
      this.images = { images: { profile: '', projects: {} } };
      this.initialized = true;
    }
  }

  // Convert file to base64
  fileToBase64(file) {
    return new Promise((resolve, reject) => {
      if (!file) {
        reject(new Error('No file provided'));
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        reject(new Error('File must be an image'));
        return;
      }

      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        reject(new Error('Image must be smaller than 2MB'));
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result);
      };
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      reader.readAsDataURL(file);
    });
  }

  // Store image as base64
  async storeImage(file, category = 'projects', imageId = null) {
    try {
      if (!this.initialized) {
        await this.init();
      }

      const base64 = await this.fileToBase64(file);
      
      if (!imageId) {
        imageId = 'img_' + Date.now();
      }

      // Ensure the category structure exists
      if (!this.images.images) {
        this.images.images = {};
      }
      
      if (category === 'profile') {
        this.images.images.profile = base64;
        imageId = 'profile';
      } else {
        if (!this.images.images[category]) {
          this.images.images[category] = {};
        }
        this.images.images[category][imageId] = base64;
      }

      // Save to localStorage
      this.saveImages();
      
      return {
        success: true,
        imageId: imageId,
        path: imageId, // For compatibility with existing code
        base64: base64
      };
    } catch (error) {
      console.error('Error storing image:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get image base64 by ID
  getImage(category, imageId = null) {
    if (!this.initialized) {
      console.warn('Base64ImageManager not initialized');
      return null;
    }

    if (category === 'profile') {
      return this.images.images?.profile || this.defaultImages.images?.profile || null;
    }

    if (imageId) {
      return this.images.images?.[category]?.[imageId] || 
             this.defaultImages.images?.[category]?.[imageId] || null;
    }

    return this.images.images?.[category] || this.defaultImages.images?.[category] || {};
  }

  // Get image source (for use in img src attributes)
  getImageSrc(imagePath) {
    if (!imagePath) return 'assets/images/profile.png'; // Default fallback
    
    // If it's already a base64 string, return it
    if (imagePath.startsWith('data:image/')) {
      return imagePath;
    }

    // If it's a reference to stored image
    if (imagePath.startsWith('img_') || imagePath === 'profile') {
      const base64 = this.getImage('projects', imagePath) || this.getImage('profile');
      return base64 || `assets/images/${imagePath}.png`;
    }

    // If it's a traditional file path, return as is
    return imagePath;
  }

  // Save images to localStorage
  saveImages() {
    try {
      localStorage.setItem('portfolio_images', JSON.stringify(this.images));
      console.log('Images saved to localStorage');
    } catch (error) {
      console.error('Error saving images:', error);
    }
  }

  // Delete an image
  deleteImage(category, imageId) {
    if (category === 'profile') {
      this.images.images.profile = '';
    } else if (this.images.images?.[category]?.[imageId]) {
      delete this.images.images[category][imageId];
    }
    this.saveImages();
  }

  // List all images in a category
  listImages(category) {
    return this.images.images?.[category] || {};
  }

  // Get storage usage info
  getStorageInfo() {
    const imagesStr = JSON.stringify(this.images);
    const sizeBytes = new Blob([imagesStr]).size;
    const sizeMB = (sizeBytes / (1024 * 1024)).toFixed(2);
    
    return {
      totalImages: Object.keys(this.images.images?.projects || {}).length + (this.images.images?.profile ? 1 : 0),
      storageUsed: sizeMB + ' MB',
      maxRecommended: '5 MB'
    };
  }

  // Reset to default images
  resetToDefault() {
    this.images = { ...this.defaultImages };
    this.saveImages();
    console.log('Images reset to default');
  }

  // Export images data
  exportImages() {
    return JSON.stringify(this.images, null, 2);
  }

  // Import images data
  importImages(jsonData) {
    try {
      const importedData = JSON.parse(jsonData);
      this.images = importedData;
      this.saveImages();
      return { success: true };
    } catch (error) {
      console.error('Error importing images:', error);
      return { success: false, error: error.message };
    }
  }
}

// Initialize global instance
window.base64ImageManager = new Base64ImageManager();
