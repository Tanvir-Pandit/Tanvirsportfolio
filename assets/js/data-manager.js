// Static Portfolio Data Manager (No Server Required)
// Perfect for static hosting like Netlify, GitHub Pages, etc.
class DataManager {
  constructor() {
    this.projects = [];
    this.skills = [];
    this.profile = {};
    this.isInitialized = false;
    
    // Detect if we're in admin folder or root folder
    this.basePath = window.location.pathname.includes('/admin/') ? '../' : './';
    console.log('🏠 DataManager basePath set to:', this.basePath);
    console.log('🌐 Current pathname:', window.location.pathname);
  }

  async init() {
    if (this.isInitialized) return;

    try {
      await Promise.all([
        this.loadProjects(),
        this.loadSkills(),
        this.loadProfile()
      ]);
      
      this.setupStorageListeners();
      this.isInitialized = true;
      console.log('✅ Static DataManager initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing DataManager:', error);
      throw error;
    }
  }

  async loadProjects() {
    try {
      // First check localStorage for admin modifications
      const adminProjects = localStorage.getItem('portfolioProjects');
      console.log('🔍 Checking localStorage for portfolioProjects:', !!adminProjects);
      
      if (adminProjects) {
        try {
          this.projects = JSON.parse(adminProjects);
          console.log('📁 Loaded projects from localStorage:', this.projects.length, 'projects');
          return this.projects;
        } catch (e) {
          console.warn('⚠️ Failed to parse admin projects, falling back to original');
        }
      }
      
      // Fallback to original JSON file
      const projectsPath = `${this.basePath}assets/data/projects.json`;
      console.log('🔍 Attempting to load projects from:', projectsPath);
      
      const response = await fetch(projectsPath);
      console.log('📡 Projects fetch response status:', response.status, response.statusText);
      
      if (!response.ok) throw new Error(`Failed to load projects.json: ${response.status} ${response.statusText}`);
      
      this.projects = await response.json();
      console.log('📁 Loaded projects from JSON file:', this.projects.length, 'projects');
    } catch (error) {
      console.error('❌ Error loading projects:', error);
      this.projects = [];
    }
    
    return this.projects;
  }

  async loadSkills() {
    try {
      // First check localStorage for admin modifications
      const adminSkills = localStorage.getItem('portfolioSkills');
      
      if (adminSkills) {
        try {
          this.skills = JSON.parse(adminSkills);
          console.log('🎯 Loaded skills from localStorage');
          return this.skills;
        } catch (e) {
          console.warn('⚠️ Failed to parse admin skills, falling back to original');
        }
      }
      
      // Fallback to original JSON file
      const response = await fetch(`${this.basePath}assets/data/skills.json`);
      if (!response.ok) throw new Error('Failed to load skills.json');
      
      this.skills = await response.json();
      console.log('🎯 Loaded skills from JSON file');
    } catch (error) {
      console.error('❌ Error loading skills:', error);
      this.skills = [];
    }
    
    return this.skills;
  }

  async loadProfile() {
    try {
      // First check localStorage for admin modifications
      const adminProfile = localStorage.getItem('portfolio_profile');
      
      if (adminProfile) {
        try {
          this.profile = JSON.parse(adminProfile);
          console.log('👤 Loaded profile from localStorage');
          return this.profile;
        } catch (e) {
          console.warn('⚠️ Failed to parse admin profile, falling back to original');
        }
      }
      
      // Fallback to original JSON file
      const response = await fetch(`${this.basePath}assets/data/profile.json`);
      if (!response.ok) throw new Error('Failed to load profile.json');
      
      this.profile = await response.json();
      console.log('👤 Loaded profile from JSON file');
    } catch (error) {
      console.error('❌ Error loading profile:', error);
      this.profile = {};
    }
    
    return this.profile;
  }

  // Getters
  getProjects() { return this.projects; }
  getSkills() { return this.skills; }
  getProfile() { return this.profile; }

  // Update methods with automatic JSON file downloads
  updateProjects(newProjects) {
    this.projects = newProjects;
    this.saveToLocalStorage('portfolioProjects', newProjects);
    this.downloadJsonFile('projects.json', newProjects);
    console.log('💾 Projects saved to localStorage and JSON downloaded');
  }

  updateSkills(newSkills) {
    this.skills = newSkills;
    this.saveToLocalStorage('portfolioSkills', newSkills);
    this.downloadJsonFile('skills.json', newSkills);
    console.log('💾 Skills saved to localStorage and JSON downloaded');
  }

  updateProfile(newProfile) {
    this.profile = newProfile;
    this.saveToLocalStorage('portfolio_profile', newProfile);
    this.downloadJsonFile('profile.json', newProfile);
    console.log('💾 Profile saved to localStorage and JSON downloaded');
  }

  // Download JSON file for manual placement
  downloadJsonFile(filename, data) {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // Show instruction notification
    this.showUpdateInstructions(filename);
  }

  // Show instructions for file placement
  showUpdateInstructions(filename) {
    const instructions = {
      'projects.json': 'assets/data/projects.json',
      'skills.json': 'assets/data/skills.json', 
      'profile.json': 'assets/data/profile.json'
    };
    
    const message = `📥 ${filename} downloaded! Replace the file at: ${instructions[filename]}`;
    
    if (typeof showAlert === 'function') {
      showAlert(message, 'info', 8000);
    } else if (window.showAlert) {
      window.showAlert(message, 'info', 8000);
    } else {
      console.log('📥 ' + message);
      alert(message);
    }
  }

  // Enhanced image source handling for static hosting
  getImageSrc(imagePath, defaultPath = 'assets/images/profile.png') {
    if (!imagePath) return defaultPath;

    // Check if it's an uploaded image
    const fileName = imagePath.split('/').pop();
    const uploadedImages = this.getUploadedImages();
    
    if (uploadedImages[fileName] && uploadedImages[fileName].base64Data) {
      // Return base64 data URL for uploaded images
      return uploadedImages[fileName].base64Data;
    }

    // Return original path for default images
    return imagePath;
  }

  // Get uploaded images from localStorage
  getUploadedImages() {
    try {
      const stored = localStorage.getItem('uploaded_images');
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Error loading uploaded images:', error);
      return {};
    }
  }

  // Save to localStorage with cross-tab synchronization
  saveToLocalStorage(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      
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

  // Setup storage event listeners for cross-tab synchronization
  setupStorageListeners() {
    window.addEventListener('storage', (e) => {
      if (e.key === 'portfolioProjects') {
        try {
          this.projects = JSON.parse(e.newValue || '[]');
          $(document).trigger('projectsChanged', [this.projects]);
        } catch (error) {
          console.error('Error syncing projects:', error);
        }
      } else if (e.key === 'portfolioSkills') {
        try {
          this.skills = JSON.parse(e.newValue || '[]');
          $(document).trigger('skillsChanged', [this.skills]);
        } catch (error) {
          console.error('Error syncing skills:', error);
        }
      } else if (e.key === 'portfolio_profile') {
        try {
          this.profile = JSON.parse(e.newValue || '{}');
          $(document).trigger('profileChanged', [this.profile]);
        } catch (error) {
          console.error('Error syncing profile:', error);
        }
      }
    });
  }

  // Export all data for deployment
  exportForDeployment() {
    const exportData = {
      projects: this.projects,
      skills: this.skills,
      profile: this.profile,
      images: this.getUploadedImages(),
      exportDate: new Date().toISOString(),
      deploymentType: 'static',
      instructions: {
        message: "This export contains all your portfolio data for static hosting deployment",
        steps: [
          "1. Replace the content of assets/data/projects.json with the 'projects' array",
          "2. Replace the content of assets/data/skills.json with the 'skills' array", 
          "3. Replace the content of assets/data/profile.json with the 'profile' object",
          "4. For uploaded images, they are embedded as base64 (no file copying needed)",
          "5. Deploy to any static hosting service (Netlify, Vercel, GitHub Pages, etc.)"
        ]
      }
    };

    // Create downloadable JSON file
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `portfolio-static-export-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    console.log('📤 Portfolio data exported for static hosting deployment');
    return exportData;
  }

  // Import data from backup
  importAllData(data) {
    if (data && typeof data === 'object') {
      if (data.projects) {
        this.updateProjects(data.projects);
      }
      if (data.skills) {
        this.updateSkills(data.skills);
      }
      if (data.profile) {
        this.updateProfile(data.profile);
      }
      if (data.images) {
        localStorage.setItem('uploaded_images', JSON.stringify(data.images));
      }
      
      console.log('📥 Data imported successfully');
      
      // Reload the page to reflect changes
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
      return true;
    }
    return false;
  }

  // Get deployment instructions
  getDeploymentInstructions() {
    return {
      netlify: {
        title: "Deploy to Netlify",
        steps: [
          "1. Export your data using 'Export for Deployment' button",
          "2. Update your JSON files with the exported data",
          "3. Push changes to your Git repository",
          "4. Connect your repository to Netlify",
          "5. Deploy automatically via Git integration",
          "6. Your portfolio will be live at your-site.netlify.app"
        ],
        benefits: [
          "✅ Free hosting for static sites",
          "✅ Automatic deployments from Git",
          "✅ Custom domain support",
          "✅ HTTPS enabled by default",
          "✅ Global CDN for fast loading"
        ]
      }
    };
  }
}

// Initialize the static data manager
window.dataManager = new DataManager();
