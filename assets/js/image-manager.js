// Static Portfolio Image Manager
// Uses base64 encoding for images - perfect for static hosting
class ImageManager {
  constructor() {
    this.uploadedImages = this.loadUploadedImages();
  }

  // Validate uploaded file
  validateFile(file) {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      return { 
        valid: false, 
        error: 'Invalid file type. Please upload JPG, PNG, GIF, or WebP images.' 
      };
    }

    if (file.size > maxSize) {
      return { 
        valid: false, 
        error: 'File too large. Maximum size is 5MB.' 
      };
    }

    return { valid: true };
  }

  // Process image upload for static hosting (base64 encoding)
  async processImageUpload(file, category = 'general') {
    return new Promise((resolve, reject) => {
      // Validate file
      const validation = this.validateFile(file);
      if (!validation.valid) {
        resolve({ success: false, error: validation.error });
        return;
      }

      // Generate filename with timestamp
      const timestamp = Date.now();
      const extension = file.name.split('.').pop().toLowerCase();
      
      let fileName, relativePath;
      
      if (category === 'profile') {
        fileName = `profile-${timestamp}.${extension}`;
        relativePath = `assets/images/${fileName}`;
      } else if (category === 'project') {
        fileName = `project-${timestamp}.${extension}`;
        relativePath = `assets/images/projects/${fileName}`;
      } else {
        fileName = `image-${timestamp}.${extension}`;
        relativePath = `assets/images/${fileName}`;
      }

      // Create FileReader to convert to base64
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const base64Data = e.target.result;
        
        // Store image data with base64 for Netlify compatibility
        const imageData = {
          fileName: fileName,
          relativePath: relativePath,
          base64Data: base64Data,
          mimeType: file.type,
          size: file.size,
          uploadDate: new Date().toISOString(),
          category: category,
          staticCompatible: true
        };
        
        // Store in localStorage
        this.saveImageMetadata(fileName, imageData);
        
        // Auto-download the image file for manual placement
        this.downloadImageFile(file, fileName, category);
        
        console.log('📁 Image processed for static hosting (base64):', relativePath);
        
        resolve({
          success: true,
          fileName: fileName,
          relativePath: relativePath,
          base64Data: base64Data,
          staticCompatible: true
        });
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      reader.readAsDataURL(file);
    });
  }

  // Get image source with base64 support for static hosting
  getImageSrc(imagePath, defaultPath = 'assets/images/profile.png') {
    if (!imagePath) return defaultPath;

    // Check if it's an uploaded image
    const fileName = imagePath.split('/').pop();
    const metadata = this.uploadedImages[fileName];

    if (metadata && metadata.base64Data) {
      // Return base64 data URL for uploaded images
      return metadata.base64Data;
    }

    // Return original path for default images
    return imagePath;
  }

  // Download image file for manual placement
  downloadImageFile(file, fileName, category) {
    const url = URL.createObjectURL(file);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // Show instruction notification
    this.showImageInstructions(fileName, category);
  }

  // Show instructions for image placement
  showImageInstructions(fileName, category) {
    let targetPath;
    if (category === 'profile') {
      targetPath = 'assets/images/';
    } else if (category === 'project') {
      targetPath = 'assets/images/projects/';
    } else {
      targetPath = 'assets/images/';
    }
    
    const message = `📸 ${fileName} downloaded! Place the file at: ${targetPath}${fileName}`;
    
    if (typeof showAlert === 'function') {
      showAlert(message, 'info', 8000);
    } else if (window.showAlert) {
      window.showAlert(message, 'info', 8000);
    } else {
      console.log('📸 ' + message);
      alert(message);
    }
  }

  // Save image metadata to localStorage
  saveImageMetadata(fileName, metadata) {
    this.uploadedImages[fileName] = metadata;
    localStorage.setItem('uploaded_images', JSON.stringify(this.uploadedImages));
  }

  // Load uploaded images from localStorage
  loadUploadedImages() {
    try {
      const stored = localStorage.getItem('uploaded_images');
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Error loading uploaded images:', error);
      return {};
    }
  }

  // Get all uploaded images
  getUploadedImages() {
    return this.uploadedImages;
  }

  // Get storage statistics
  getStorageStats() {
    const images = Object.values(this.uploadedImages);
    const totalSize = images.reduce((sum, img) => sum + (img.size || 0), 0);
    
    return {
      totalImages: images.length,
      totalSize: totalSize,
      staticCompatible: images.filter(img => img.staticCompatible).length,
      formattedSize: this.formatFileSize(totalSize)
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

  // Clear all uploaded images
  clearUploadedImages() {
    this.uploadedImages = {};
    localStorage.removeItem('uploaded_images');
    console.log('🗑️ All uploaded images cleared');
  }

  // Export image data for static hosting deployment
  exportImageData() {
    const exportData = {
      images: this.uploadedImages,
      stats: this.getStorageStats(),
      exportDate: new Date().toISOString(),
      staticInstructions: {
        message: "Images are embedded as base64 data - no file copying needed for static hosting",
        steps: [
          "1. Images are already embedded in the exported JSON",
          "2. Just deploy your portfolio to any static hosting service",
          "3. All images will work automatically",
          "4. No manual file copying required"
        ]
      }
    };

    return exportData;
  }

  // Import image data from backup
  importImageData(data) {
    if (data && data.images) {
      this.uploadedImages = data.images;
      localStorage.setItem('uploaded_images', JSON.stringify(this.uploadedImages));
      console.log('📥 Image data imported successfully');
      return true;
    }
    return false;
  }

  // Generate deployment-ready instructions
  getStaticHostingInstructions() {
    return {
      title: "Static Hosting Image Deployment",
      description: "Images are stored as base64 data, making deployment to any static host simple:",
      advantages: [
        "✅ No file copying required",
        "✅ Images embedded in portfolio data",
        "✅ Works immediately on any static host",
        "✅ Self-contained deployment package"
      ],
      steps: [
        "1. Export your portfolio data",
        "2. Update JSON files with exported data",
        "3. Deploy to any static hosting service",
        "4. Images work automatically!"
      ],
      limitations: [
        "⚠️ Base64 images increase file size",
        "⚠️ Best for small to medium image collections",
        "⚠️ Consider optimizing images before upload"
      ]
    };
  }
}

// Initialize the static image manager
window.imageManager = new ImageManager();

// For backward compatibility
window.fileImageManager = window.imageManager;
