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

  // Get image source - handles file-based images with proper fallbacks
  getImageSrc(imagePath) {
    if (!imagePath) return 'assets/images/profile.png';
    
    // If fileImageManager is available, use it
    if (window.fileImageManager) {
      return window.fileImageManager.getImageSrc(imagePath);
    }
    
    // Direct path handling
    if (imagePath.startsWith('assets/') || imagePath.startsWith('http')) {
      return imagePath;
    }
    
    // Default fallback paths
    if (imagePath.includes('profile')) {
      return `assets/images/${imagePath}`;
    } else {
      return `assets/images/projects/${imagePath}`;
    }
  }

  // Update projects data
  updateProjects(newProjects) {
    this.projects = newProjects;
    this.saveToLocalStorage('portfolioProjects', newProjects);
  }

  // Update skills data
  updateSkills(newSkills) {
    this.skills = newSkills;
    this.saveToLocalStorage('portfolioSkills', newSkills);
  }

  // Update profile data
  updateProfile(newProfile) {
    this.profile = newProfile;
    this.saveToLocalStorage('portfolio_profile', newProfile);
  }

  // Save data to localStorage
  saveToLocalStorage(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      console.log(`Data saved to localStorage: ${key}`);
      
      // Trigger storage event for cross-tab communication
      window.dispatchEvent(new StorageEvent('storage', {
        key: key,
        newValue: JSON.stringify(data),
        oldValue: localStorage.getItem(key),
        storageArea: localStorage
      }));
    } catch (error) {
      console.error(`Error saving to localStorage: ${key}`, error);
    }
  }

  // Export all data for backup
  exportAllData() {
    return {
      projects: this.projects,
      skills: this.skills,
      profile: this.profile,
      images: window.fileImageManager ? window.fileImageManager.getUploadedImages() : {},
      exportDate: new Date().toISOString()
    };
  }

  // Import data from backup
  importAllData(backupData) {
    try {
      if (backupData.projects) {
        this.updateProjects(backupData.projects);
      }
      if (backupData.skills) {
        this.updateSkills(backupData.skills);
      }
      if (backupData.profile) {
        this.updateProfile(backupData.profile);
      }
      if (backupData.images && window.fileImageManager) {
        localStorage.setItem('uploaded_images', JSON.stringify(backupData.images));
      }
      return { success: true };
    } catch (error) {
      console.error('Error importing data:', error);
      return { success: false, error: error.message };
    }
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
