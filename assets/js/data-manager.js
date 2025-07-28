// Data Manager - Handles dynamic data loading for portfolio
class DataManager {
  constructor() {
    this.projects = [];
    this.skills = [];
    this.profile = {};
    this.initialized = false;
  }

  async init() {
    if (this.initialized) return;
    
    await Promise.all([
      this.loadProjects(),
      this.loadSkills(),
      this.loadProfile()
    ]);
    
    this.initialized = true;
  }

  async loadProjects() {
    try {
      // First check if admin has modified data in localStorage
      const adminProjects = localStorage.getItem('portfolioProjects');
      
      if (adminProjects) {
        try {
          this.projects = JSON.parse(adminProjects);
          console.log('Loaded projects from admin modifications');
          return this.projects;
        } catch (e) {
          console.warn('Failed to parse admin projects, falling back to original');
        }
      }
      
      // Fallback to original JSON file
      const response = await fetch('assets/data/projects.json');
      if (response.ok) {
        this.projects = await response.json();
        console.log('Loaded projects from original JSON file');
      } else {
        throw new Error('Failed to load projects.json');
      }
    } catch (error) {
      console.error('Error loading projects:', error);
      this.projects = [];
    }
    
    return this.projects;
  }

  async loadSkills() {
    try {
      // First check if admin has modified data in localStorage
      const adminSkills = localStorage.getItem('portfolioSkills');
      
      if (adminSkills) {
        try {
          this.skills = JSON.parse(adminSkills);
          console.log('Loaded skills from admin modifications');
          return this.skills;
        } catch (e) {
          console.warn('Failed to parse admin skills, falling back to original');
        }
      }
      
      // Fallback to original JSON file
      const response = await fetch('assets/data/skills.json');
      if (response.ok) {
        this.skills = await response.json();
        console.log('Loaded skills from original JSON file');
      } else {
        throw new Error('Failed to load skills.json');
      }
    } catch (error) {
      console.error('Error loading skills:', error);
      this.skills = [];
    }
    
    return this.skills;
  }

  async loadProfile() {
    try {
      // First check if admin has modified data in localStorage
      const adminProfile = localStorage.getItem('portfolio_profile');
      
      if (adminProfile) {
        try {
          this.profile = JSON.parse(adminProfile);
          console.log('Loaded profile from admin modifications');
          return this.profile;
        } catch (e) {
          console.warn('Failed to parse admin profile, falling back to original');
        }
      }
      
      // Fallback to original JSON file
      const response = await fetch('assets/data/profile.json');
      if (response.ok) {
        this.profile = await response.json();
        console.log('Loaded profile from original JSON file');
      } else {
        throw new Error('Failed to load profile.json');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      this.profile = {};
    }
    
    return this.profile;
  }

  getProjects() {
    return this.projects;
  }

  getSkills() {
    return this.skills;
  }

  getProfile() {
    return this.profile;
  }

  getProject(id) {
    return this.projects.find(project => project.id === id);
  }

  // Get image source - uses base64 image manager for dynamic images
  getImageSrc(imagePath) {
    if (!imagePath) return 'assets/images/profile.png';
    
    // If base64ImageManager is available, use it
    if (window.base64ImageManager && window.base64ImageManager.initialized) {
      return window.base64ImageManager.getImageSrc(imagePath);
    }
    
    // Fallback: check old imageManager for compatibility
    if (window.imageManager) {
      const imageData = window.imageManager.getImageData(imagePath);
      if (imageData) {
        return imageData; // Returns base64 data URL
      }
    }
    
    // Check if it's already a base64 string
    if (imagePath.startsWith('data:image/')) {
      return imagePath;
    }
    
    // Check localStorage for base64 images
    const storedImages = localStorage.getItem('portfolio_images');
    if (storedImages) {
      try {
        const images = JSON.parse(storedImages);
        if (imagePath === 'profile' && images.images?.profile) {
          return images.images.profile;
        }
        if (images.images?.projects?.[imagePath]) {
          return images.images.projects[imagePath];
        }
      } catch (e) {
        console.warn('Failed to parse stored images');
      }
    }
    
    // Fallback to actual file path
    return imagePath;
  }

  // Listen for changes from admin panel
  onDataChange(callback) {
    window.addEventListener('storage', (e) => {
      if (e.key === 'portfolioProjects' || e.key === 'portfolioSkills' || e.key === 'portfolioProfile') {
        this.init().then(() => {
          callback();
        });
      }
    });
  }

  // Force refresh data (useful for admin panel)
  async refresh() {
    this.initialized = false;
    await this.init();
  }
}

// Global instance
window.dataManager = new DataManager();

// Auto-initialize when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.dataManager.init();
  });
} else {
  window.dataManager.init();
}
