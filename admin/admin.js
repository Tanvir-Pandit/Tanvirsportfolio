// Admin Panel JavaScript - Static Hosting Compatible
let projects = [];
let skills = [];
let profile = {};
let currentEditingProject = null;
let currentEditingSkill = null;

// Initialize admin panel when page loads
$(document).ready(function() {
  console.log('🚀 Admin panel script loaded, DOM ready');
  console.log('jQuery available:', !!window.$);
  console.log('DataManager class available:', !!window.DataManager);
  console.log('ImageManager available:', !!window.ImageManager);
  
  // Check authentication first
  if (localStorage.getItem('adminLoggedIn') !== 'true') {
    console.log('❌ Not authenticated, redirecting to login');
    window.location.href = 'index.html';
    return;
  }
  
  console.log('✅ Authentication passed, initializing admin panel');
  
  // Initialize admin panel
  initializeAdminPanel();
});

// Initialize admin panel with static managers
async function initializeAdminPanel() {
  try {
    console.log('🚀 Starting admin panel initialization...');
    
    // Initialize managers
    window.dataManager = new DataManager();
    console.log('✅ DataManager instance created');
    
    // Initialize DataManager
    await window.dataManager.init();
    console.log('✅ DataManager initialized');
    
    // Check ImageManager
    if (window.imageManager) {
      console.log('✅ ImageManager available');
    } else {
      console.warn('⚠️ ImageManager not available');
    }
    
    // Load all data
    await loadAllData();
    
    // Display admin email
    $('#adminEmail').text(localStorage.getItem('adminEmail') || 'Admin');
    
    // Setup navigation
    setupNavigation();
    
    // Setup event listeners
    setupEventListeners();
    
    // Update dashboard stats
    updateStats();
    
    // Initialize default section (dashboard should be active)
    showSection('dashboard');
    
    console.log('✅ Admin panel initialized successfully');
    showAlert('Admin panel loaded successfully!', 'success');
    
  } catch (error) {
    console.error('❌ Error initializing admin panel:', error);
    console.error('Error stack:', error.stack);
    showAlert('Error loading admin panel: ' + error.message, 'error');
    
    // Still try to show basic UI
    try {
      setupNavigation();
      setupEventListeners();
      showSection('dashboard');
    } catch (fallbackError) {
      console.error('❌ Fallback initialization also failed:', fallbackError);
    }
  }
}

// Debug functions for troubleshooting
function debugProjects() {
  console.log('🐛 DEBUG: Projects troubleshooting');
  console.log('DataManager exists:', !!window.dataManager);
  console.log('DataManager initialized:', window.dataManager ? window.dataManager.isInitialized : 'N/A');
  console.log('Current projects array:', projects);
  console.log('Projects count:', projects.length);
  console.log('LocalStorage portfolioProjects:', localStorage.getItem('portfolioProjects'));
  
  // Test direct file access
  fetch('../assets/data/projects.json')
    .then(response => {
      console.log('📡 Direct fetch response status:', response.status);
      return response.json();
    })
    .then(data => {
      console.log('📄 Direct fetch data:', data);
      console.log('📄 Direct fetch count:', data.length);
    })
    .catch(error => {
      console.error('❌ Direct fetch error:', error);
    });
  
  // Test loading from DataManager
  if (window.dataManager) {
    window.dataManager.getProjects().then(loadedProjects => {
      console.log('Projects from DataManager:', loadedProjects);
      console.log('DataManager projects count:', loadedProjects.length);
    }).catch(error => {
      console.error('Error loading from DataManager:', error);
    });
  }
  
  showAlert('Debug info logged to console. Press F12 to view.', 'info');
}

async function reloadProjects() {
  try {
    console.log('🔄 Reloading projects...');
    showAlert('Reloading projects...', 'info');
    
    if (!window.dataManager) {
      throw new Error('DataManager not initialized');
    }
    
    // Reinitialize DataManager
    await window.dataManager.init();
    
    // Reload projects
    await loadProjects();
    
    showAlert('Projects reloaded successfully!', 'success');
  } catch (error) {
    console.error('❌ Error reloading projects:', error);
    showAlert('Error reloading projects: ' + error.message, 'error');
  }
}

// Load all data from DataManager
async function loadAllData() {
  try {
    console.log('🔄 Loading all data from DataManager...');
    console.log('DataManager available:', !!window.dataManager);
    console.log('DataManager initialized:', window.dataManager?.isInitialized);
    
    // Load projects from DataManager
    projects = await window.dataManager.getProjects();
    console.log(`📁 Loaded ${projects.length} projects:`, projects);
    
    // Load skills from DataManager
    skills = await window.dataManager.getSkills();
    console.log(`🛠️ Loaded ${skills.length} skills:`, skills);
    
    // Load profile from DataManager
    profile = await window.dataManager.getProfile();
    console.log('👤 Profile loaded:', profile);
    
    // Render UI
    console.log('🎨 Starting to render UI...');
    renderProjects();
    renderSkills();
    console.log('🎨 UI rendering complete');
    
    console.log('✅ All data loaded successfully');
  } catch (error) {
    console.error('❌ Error loading data:', error);
    console.error('Error stack:', error.stack);
    showAlert('Error loading data: ' + error.message, 'error');
    throw error;
  }
}

// Load profile data
async function loadProfile() {
  try {
    await window.dataManager.init();
    profile = window.dataManager.getProfile();
    populateProfileForms();
  } catch (error) {
    console.error('Error loading profile:', error);
    showAlert('Error loading profile data', 'error');
  }
}

// Populate profile forms with current data
function populateProfileForms() {
  // Update status indicators
  const hasLocalData = localStorage.getItem('portfolio_profile');
  $('#profileStatus').text(Object.keys(profile).length > 0 ? 'Loaded Successfully' : 'Load Failed');
  $('#profileSource').text(hasLocalData ? 'Custom Data (LocalStorage)' : 'Default JSON File');
  
  // Update image storage info
  if (window.imageManager) {
    const storageStats = window.imageManager.getStorageStats();
    $('#imageStorage').text(`${storageStats.totalImages} images (${storageStats.formattedSize})`);
  } else {
    $('#imageStorage').text('Image Manager Loading...');
  }
  
  // Personal Information
  if (profile.personalInfo) {
    $('#fullName').val(profile.personalInfo.fullName || '');
    $('#title').val(profile.personalInfo.title || '');
    $('#location').val(profile.personalInfo.location || '');
    $('#bio').val(profile.personalInfo.bio || '');
    $('#bioParagraph2').val(profile.personalInfo.bioParagraph2 || '');
    const imagePath = profile.personalInfo.profileImage || 'assets/images/profile.png';
    $('#profileImagePath').val(imagePath);
    
    // Show current image status
    if (imagePath !== 'assets/images/profile.png') {
      const fileName = imagePath.split('/').pop();
      $('.custom-file-label[for="profileImageUpload"]').text('Current: ' + fileName);
    }
  }
  
  // Contact Information
  if (profile.contactInfo) {
    $('#email').val(profile.contactInfo.email || '');
    $('#phone').val(profile.contactInfo.phone || '');
    $('#website').val(profile.contactInfo.website || '');
    $('#cv').val(profile.contactInfo.cv || '');
  }
  
  // Social Links
  if (profile.socialLinks) {
    $('#github').val(profile.socialLinks.github || '');
    $('#linkedin').val(profile.socialLinks.linkedin || '');
    $('#twitter').val(profile.socialLinks.twitter || '');
    $('#behance').val(profile.socialLinks.behance || '');
    $('#dribbble').val(profile.socialLinks.dribbble || '');
    $('#instagram').val(profile.socialLinks.instagram || '');
    $('#facebook').val(profile.socialLinks.facebook || '');
  }
  
  // Site Settings
  if (profile.siteInfo) {
    $('#siteTitle').val(profile.siteInfo.title || '');
    $('#siteDescription').val(profile.siteInfo.description || '');
    $('#siteKeywords').val(profile.siteInfo.keywords || '');
    $('#copyrightText').val(profile.siteInfo.copyright || '');
    $('#welcomeMessage').val(profile.siteInfo.welcomeMessage || '');
  }
}

// Save Personal Information
function savePersonalInfo() {
  profile.personalInfo = {
    fullName: $('#fullName').val() || '',
    title: $('#title').val() || '',
    location: $('#location').val() || '',
    bio: $('#bio').val() || '',
    bioParagraph2: $('#bioParagraph2').val() || '',
    profileImage: $('#profileImagePath').val() || 'assets/images/profile.png'
  };
  
  saveProfileData();
  showAlert('Personal information saved successfully!', 'success');
}

// Save Contact Information
function saveContactInfo() {
  profile.contactInfo = {
    email: $('#email').val() || '',
    phone: $('#phone').val() || '',
    website: $('#website').val() || '',
    cv: $('#cv').val() || ''
  };
  
  saveProfileData();
  showAlert('Contact information saved successfully!', 'success');
}

// Save Social Links
function saveSocialLinks() {
  profile.socialLinks = {
    github: $('#github').val() || '',
    linkedin: $('#linkedin').val() || '',
    twitter: $('#twitter').val() || '',
    behance: $('#behance').val() || '',
    dribbble: $('#dribbble').val() || '',
    instagram: $('#instagram').val() || '',
    facebook: $('#facebook').val() || ''
  };
  
  saveProfileData();
  showAlert('Social links saved successfully!', 'success');
}

// Save Site Settings
function saveSiteSettings() {
  profile.siteInfo = {
    title: $('#siteTitle').val() || '',
    description: $('#siteDescription').val() || '',
    keywords: $('#siteKeywords').val() || '',
    copyright: $('#copyrightText').val() || '',
    welcomeMessage: $('#welcomeMessage').val() || ''
  };
  
  saveProfileData();
  showAlert('Site settings saved successfully!', 'success');
}

// Save profile data to localStorage and update DataManager
async function saveProfileData() {
  try {
    localStorage.setItem('portfolio_profile', JSON.stringify(profile));
    
    // Update the dataManager's profile data
    if (window.dataManager) {
      window.dataManager.updateProfile(profile);
    }
    
    // Trigger profile change event for real-time updates
    $(document).trigger('profileChanged', [profile]);
    
    // For development: log the saved data
    console.log('Profile saved:', profile);
    
    return true;
  } catch (error) {
    console.error('Error saving profile data:', error);
    return false;
  }
}

// Export for static hosting deployment
function exportForNetlify() {
  if (window.dataManager && typeof window.dataManager.exportForDeployment === 'function') {
    try {
      window.dataManager.exportForDeployment();
      showAlert('Portfolio data exported for static hosting deployment! Check your downloads folder.', 'success');
    } catch (error) {
      console.error('Export error:', error);
      showAlert('Error exporting data: ' + error.message, 'error');
    }
  } else {
    showAlert('Export function not available. Make sure data-manager.js is loaded.', 'error');
  }
}

// Show static hosting deployment instructions
function showNetlifyInstructions() {
  const instructions = `
    <div class="modal fade" id="deploymentModal" tabindex="-1" role="dialog">
      <div class="modal-dialog modal-lg" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="fa fa-cloud-upload"></i> Deploy to Static Hosting
            </h5>
            <button type="button" class="close" data-dismiss="modal">
              <span>&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <div class="alert alert-success">
              <h6><i class="fa fa-check-circle"></i> Your Portfolio is Static-Hosting-Ready!</h6>
              <p>This portfolio uses localStorage and base64 images, making it perfect for any static hosting service.</p>
            </div>
            
            <h6>🚀 Quick Deployment Steps:</h6>
            <ol>
              <li><strong>Export Your Data:</strong> Click "Export for Static Hosting" to download your portfolio data</li>
              <li><strong>Update JSON Files:</strong> Replace content in assets/data/ with exported data</li>
              <li><strong>Deploy to Your Chosen Service:</strong>
                <ul>
                  <li><strong>Netlify:</strong> Drag & drop your portfolio folder to netlify.com</li>
                  <li><strong>Vercel:</strong> Connect GitHub repo to vercel.com</li>
                  <li><strong>GitHub Pages:</strong> Enable Pages in repository settings</li>
                  <li><strong>Surge.sh:</strong> Use command line: surge dist/</li>
                </ul>
              </li>
              <li><strong>Live Portfolio:</strong> Your site will be live instantly!</li>
            </ol>
            
            <h6>✅ What Works on Static Hosting:</h6>
            <ul>
              <li><i class="fa fa-check text-success"></i> Complete admin panel functionality</li>
              <li><i class="fa fa-check text-success"></i> Image uploads (base64 storage)</li>
              <li><i class="fa fa-check text-success"></i> Data persistence in browser</li>
              <li><i class="fa fa-check text-success"></i> Export/import for portability</li>
              <li><i class="fa fa-check text-success"></i> Real-time portfolio updates</li>
            </ul>
            
            <div class="alert alert-info">
              <h6><i class="fa fa-info-circle"></i> Static Hosting Benefits:</h6>
              <ul class="mb-0">
                <li>🆓 Free hosting available on many platforms</li>
                <li>⚡ Lightning-fast global CDN</li>
                <li>🔒 Automatic HTTPS on most platforms</li>
                <li>🌐 Custom domain support</li>
                <li>🔄 Auto-deploy from Git</li>
                <li>🛡️ No server maintenance required</li>
              </ul>
            </div>
            
            <div class="text-center">
              <button class="btn btn-success" onclick="exportForNetlify(); $('#deploymentModal').modal('hide');">
                <i class="fa fa-download"></i> Export for Static Hosting
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Remove existing modal if present
  $('#deploymentModal').remove();
  
  // Add modal to page and show
  $('body').append(instructions);
  $('#deploymentModal').modal('show');
}

// Save project data to localStorage and update DataManager
async function saveProjectData() {
  try {
    localStorage.setItem('portfolioProjects', JSON.stringify(projects));
    
    // Update the dataManager's project data
    if (window.dataManager) {
      window.dataManager.updateProjects(projects);
    }
    
    return true;
  } catch (error) {
    console.error('Error saving project data:', error);
    return false;
  }
}

// Save skills data to localStorage and update DataManager
async function saveSkillsData() {
  try {
    localStorage.setItem('portfolioSkills', JSON.stringify(skills));
    
    // Update the dataManager's skills data
    if (window.dataManager) {
      window.dataManager.updateSkills(skills);
    }
    
    return true;
  } catch (error) {
    console.error('Error saving skills data:', error);
    return false;
  }
}

// View current profile data
function viewCurrentProfile() {
  const currentData = {
    'From localStorage': JSON.parse(localStorage.getItem('portfolio_profile') || '{}'),
    'Current form data': profile
  };
  
  console.log('Current Profile Data:', currentData);
  
  const message = `
    <h5>Current Profile Data Status:</h5>
    <p><strong>LocalStorage:</strong> ${localStorage.getItem('portfolio_profile') ? 'Has custom data' : 'Using default JSON'}</p>
    <p><strong>Loaded Profile:</strong> ${Object.keys(profile).length > 0 ? 'Successfully loaded' : 'Empty/Error'}</p>
    <p>Check browser console for detailed data view.</p>
  `;
  
  showAlert(message, 'info', 8000);
}

// Reset profile to default JSON
function resetProfileToDefault() {
  if (confirm('Are you sure you want to reset all profile data to default? This will remove all your customizations.')) {
    localStorage.removeItem('portfolio_profile');
    
    // Reload profile from original JSON
    loadProfile().then(() => {
      showAlert('Profile reset to default successfully!', 'success');
    });
  }
}

// Export all data including images
function exportAllData() {
  try {
    const allData = {
      projects: projects,
      skills: skills,
      profile: profile,
      imageMetadata: window.imageManager ? window.imageManager.getUploadedImages() : {},
      exportDate: new Date().toISOString(),
      version: '2.0'
    };
    
    const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'portfolio-complete-backup.json';
    a.click();
    URL.revokeObjectURL(url);
    showAlert('Complete portfolio data exported successfully!', 'success');
  } catch (error) {
    console.error('Export error:', error);
    showAlert('Failed to export data', 'error');
  }
}

// Import all data including images
function importAllData() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = function(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(e) {
        try {
          const importedData = JSON.parse(e.target.result);
          
          let importCount = 0;
          
          if (importedData.projects) {
            projects = importedData.projects;
            saveProjectData();
            importCount++;
          }
          
          if (importedData.skills) {
            skills = importedData.skills;
            saveSkillsData();
            importCount++;
          }
          
          if (importedData.profile) {
            profile = importedData.profile;
            saveProfileData();
            importCount++;
          }
          
          if (importedData.imageMetadata) {
            localStorage.setItem('uploaded_images', JSON.stringify(importedData.imageMetadata));
            importCount++;
          }
          
          showAlert(`Successfully imported ${importCount} data types! Refreshing...`, 'success');
          setTimeout(() => location.reload(), 2000);
          
        } catch (error) {
          console.error('Import error:', error);
          showAlert('Invalid JSON file or import failed', 'error');
        }
      };
      reader.readAsText(file);
    }
  };
  input.click();
}

// Export images metadata
function exportImages() {
  if (window.imageManager) {
    const imageData = window.imageManager.exportImageData();
    const blob = new Blob([imageData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'portfolio-images-metadata.json';
    a.click();
    URL.revokeObjectURL(url);
    showAlert('Image metadata exported successfully!', 'success');
  } else {
    showAlert('File image manager not available', 'error');
  }
}

// Import images metadata
function importImages() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = function(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(e) {
        try {
          const imageMetadata = JSON.parse(e.target.result);
          localStorage.setItem('uploaded_images', JSON.stringify(imageMetadata));
          showAlert('Image metadata imported successfully!', 'success');
          setTimeout(() => location.reload(), 1500);
        } catch (error) {
          console.error('Import error:', error);
          showAlert('Invalid JSON file', 'error');
        }
      };
      reader.readAsText(file);
    }
  };
  input.click();
}

// Authentication check
function checkAuthentication() {
  if (localStorage.getItem('adminLoggedIn') !== 'true') {
    window.location.href = 'index.html';
    return false;
  }
  return true;
}

// Setup navigation
function setupNavigation() {
  // Navigation handling is already implemented in the dashboard HTML
  // This function can be expanded for additional navigation setup
  console.log('✅ Navigation setup complete');
}

// Setup event listeners
function setupEventListeners() {
  // Profile image upload handler
  $(document).on('change', '#profileImageUpload', function() {
    const file = this.files[0];
    if (file) {
      $('.custom-file-label[for="profileImageUpload"]').text(file.name);
      handleImageUpload(file, function(imagePath) {
        if (imagePath) {
          $('#profileImagePath').val(imagePath);
          showNotification('Profile image uploaded successfully!', 'success');
        }
      }, 'profile');
    }
  });
  
  // Project image upload handler
  $(document).on('change', '#projectImageFile', function() {
    const file = this.files[0];
    if (file) {
      $('.custom-file-label[for="projectImageFile"]').text(file.name);
      handleImageUpload(file, function(imagePath) {
        if (imagePath) {
          $('#projectImage').val(imagePath);
          showNotification('Project image uploaded successfully!', 'success');
        }
      }, 'projects');
    }
  });
  
  // Update skill percent display
  $(document).on('input', '#skillPercent', function() {
    $('#percentValue').text($(this).val() + '%');
  });
  
  // Profile form save handlers
  $('#savePersonalInfo').on('click', function(e) {
    e.preventDefault();
    savePersonalInfo();
  });
  
  $('#saveContactInfo').on('click', function(e) {
    e.preventDefault();
    saveContactInfo();
  });
  
  $('#saveSocialLinks').on('click', function(e) {
    e.preventDefault();
    saveSocialLinks();
  });
  
  $('#saveSiteSettings').on('click', function(e) {
    e.preventDefault();
    saveSiteSettings();
  });
}

// Authentication
function logout() {
  localStorage.removeItem('adminLoggedIn');
  localStorage.removeItem('adminEmail');
  window.location.href = 'index.html';
}

// UI Helper Functions
function showAlert(message, type = 'info', duration = 5000) {
  // Remove existing alerts
  $('.admin-alert').remove();
  
  const alertClass = {
    'success': 'alert-success',
    'error': 'alert-danger',
    'warning': 'alert-warning',
    'info': 'alert-info'
  }[type] || 'alert-info';
  
  const alertHtml = `
    <div class="alert ${alertClass} admin-alert" style="position: fixed; top: 20px; right: 20px; z-index: 9999; min-width: 300px;">
      <button type="button" class="close" onclick="$(this).parent().remove()">
        <span>&times;</span>
      </button>
      ${message}
    </div>
  `;
  
  $('body').append(alertHtml);
  
  // Auto-remove after duration
  setTimeout(() => {
    $('.admin-alert').fadeOut(500, function() { $(this).remove(); });
  }, duration);
}

function showSection(sectionId) {
  // Hide all sections
  $('.content-section').removeClass('active');
  $('.nav-link').removeClass('active');
  
  // Show selected section
  $(`#${sectionId}`).addClass('active');
  $(`.nav-link[onclick*="${sectionId}"]`).addClass('active');
  
  // Re-render content when section is shown
  if (sectionId === 'projects') {
    renderProjects();
    console.log(`📁 Projects section shown - rendered ${projects.length} projects`);
  } else if (sectionId === 'skills') {
    renderSkills();
    console.log(`🛠️ Skills section shown - rendered ${skills.length} skills`);
  }
  
  console.log(`📄 Switched to section: ${sectionId}`);
}

// Navigation
function showSection(section) {
  // Hide all sections
  $('.content-section').removeClass('active');
  $('.nav-link').removeClass('active');
  
  // Show selected section
  $('#' + section).addClass('active');
  $('a[onclick="showSection(\'' + section + '\')"]').addClass('active');
}

// Load Projects - uses DataManager
async function loadProjects() {
  try {
    projects = await window.dataManager.getProjects();
    renderProjects();
    updateStats();
    console.log(`📁 Loaded ${projects.length} projects from DataManager`);
  } catch (error) {
    console.error('❌ Error loading projects:', error);
    projects = [];
    renderProjects();
    updateStats();
  }
}

// Load Skills - uses DataManager
async function loadSkills() {
  try {
    skills = await window.dataManager.getSkills();
    renderSkills();
    updateStats();
    console.log(`🛠️ Loaded ${skills.length} skills from DataManager`);
  } catch (error) {
    console.error('❌ Error loading skills:', error);
    skills = [];
    renderSkills();
    updateStats();
  }
}

// Update Statistics
function updateStats() {
  $('#projectCount').text(projects.length);
  $('#skillCount').text(skills.length);
  updateDataStatus();
}

// Update data status indicator
function updateDataStatus() {
  const hasLocalProjects = localStorage.getItem('portfolioProjects') !== null;
  const hasLocalSkills = localStorage.getItem('portfolioSkills') !== null;
  
  let status = '';
  if (hasLocalProjects || hasLocalSkills) {
    status = '<span class="text-success">Using admin-modified data</span>';
    if (hasLocalProjects && hasLocalSkills) {
      status += ' (Projects & Skills modified)';
    } else if (hasLocalProjects) {
      status += ' (Projects modified)';
    } else {
      status += ' (Skills modified)';
    }
  } else {
    status = '<span class="text-info">Using original JSON files</span>';
  }
  
  $('#dataStatus').html(status);
  
  // Update image status
  if (window.imageManager) {
    const imageStats = window.imageManager.getStorageStats();
    const imageStatus = `<span class="text-primary">${imageStats.totalImages} images (${imageStats.formattedSize})</span>`;
    $('#imageStatus').html(imageStatus);
  }
}

// Auto-save functions - updates data in memory automatically
function saveProjects() {
  // Use the new data update method
  const success = saveProjectData();
  
  if (success) {
    // Show success message
    showNotification('Projects updated successfully! Changes are live immediately.', 'success');
    
    // Update the data source that the admin panel uses
    updateDataSource('projects', projects);
  } else {
    showNotification('Failed to save projects. Please try again.', 'error');
  }
}

function saveSkills() {
  // Use the new data update method
  const success = saveSkillsData();
  
  if (success) {
    // Show success message
    showNotification('Skills updated successfully! Changes are live immediately.', 'success');
    
    // Update the data source that the admin panel uses
    updateDataSource('skills', skills);
  } else {
    showNotification('Failed to save skills. Please try again.', 'error');
  }
}

// Function to update the data source the admin panel reads from
function updateDataSource(type, data) {
  // Create a virtual JSON endpoint that the admin panel can read from
  const dataStr = JSON.stringify(data, null, 2);
  
  if (type === 'projects') {
    // Store the updated projects data globally so it can be accessed
    window.updatedProjectsData = data;
    localStorage.setItem('adminProjectsData', dataStr);
  } else if (type === 'skills') {
    // Store the updated skills data globally so it can be accessed  
    window.updatedSkillsData = data;
    localStorage.setItem('adminSkillsData', dataStr);
  }
}

// Export functions for manual backup (optional)
function exportProjects() {
  const dataStr = JSON.stringify(projects, null, 2);
  downloadFile('projects.json', dataStr);
  showNotification('Projects exported! Save this file to assets/data/projects.json for permanent storage.', 'info');
}

function exportSkills() {
  const dataStr = JSON.stringify(skills, null, 2);
  downloadFile('skills.json', dataStr);
  showNotification('Skills exported! Save this file to assets/data/skills.json for permanent storage.', 'info');
}

function downloadFile(filename, content) {
  const element = document.createElement('a');
  element.setAttribute('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(content));
  element.setAttribute('download', filename);
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

// Reset data to original JSON files
function resetToOriginal() {
  if (confirm('This will reset all your changes back to the original JSON files. Are you sure?')) {
    localStorage.removeItem('portfolioProjects');
    localStorage.removeItem('portfolioSkills');
    localStorage.removeItem('adminProjectsData');
    localStorage.removeItem('adminSkillsData');
    
    // Trigger storage events to notify other tabs
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'portfolioProjects',
      newValue: null
    }));
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'portfolioSkills',
      newValue: null
    }));
    
    // Reload data from original files
    loadProjects();
    loadSkills();
    
    showNotification('Data reset to original files successfully! Portfolio is now using original data.', 'info');
  }
}

// Notification system
function showNotification(message, type = 'info') {
  const alertClass = type === 'success' ? 'alert-success' : type === 'error' ? 'alert-danger' : 'alert-info';
  const notification = `
    <div class="alert ${alertClass} alert-dismissible fade show" role="alert" style="position: fixed; top: 20px; right: 20px; z-index: 9999; min-width: 300px;">
      ${message}
      <button type="button" class="close" data-dismiss="alert" aria-label="Close">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
  `;
  $('body').append(notification);
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    $('.alert').fadeOut();
  }, 5000);
}

// Image Upload Handler - File-based with directory copying simulation
async function handleImageUpload(file, callback, category = 'projects') {
  if (!file) {
    callback(null);
    return;
  }
  
  try {
    // Show upload progress
    showNotification('Processing image upload...', 'info');
    
    // Use the file image manager
    if (window.imageManager) {
      const result = await window.imageManager.processImageUpload(file, category);
      
      if (result.success) {
        callback(result.relativePath);
        showNotification(`Image uploaded successfully! Saved as: ${result.fileName}`, 'success');
      } else {
        callback(null);
        showNotification(`Failed to upload image: ${result.error}`, 'error');
      }
    } else {
      // Fallback method
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
      
      // Simulate file storage
      const imageMetadata = {
        fileName: fileName,
        relativePath: relativePath,
        size: file.size,
        mimeType: file.type,
        uploadDate: new Date().toISOString()
      };
      
      // Save metadata
      const existingImages = JSON.parse(localStorage.getItem('uploaded_images') || '{}');
      existingImages[fileName] = imageMetadata;
      localStorage.setItem('uploaded_images', JSON.stringify(existingImages));
      
      callback(relativePath);
      showNotification(`Image uploaded successfully! Path: ${relativePath}`, 'success');
    }
  } catch (error) {
    console.error('Image upload error:', error);
    callback(null);
    showNotification(`Failed to upload image: ${error.message}`, 'error');
  }
}

// Render Projects
function renderProjects() {
  console.log('🎨 Rendering projects...', projects.length, 'projects');
  const projectsList = $('#projectsList');
  projectsList.empty();
  
  if (projects.length === 0) {
    const noProjectsHtml = `
      <div class="alert alert-info">
        <h5><i class="fa fa-info-circle"></i> No Projects Found</h5>
        <p>No projects are currently loaded. This could be because:</p>
        <ul>
          <li>This is a fresh installation with no projects added yet</li>
          <li>There was an error loading the projects data</li>
          <li>The projects JSON file is empty or corrupted</li>
        </ul>
        <button class="btn btn-primary" onclick="openProjectModal()">
          <i class="fa fa-plus"></i> Add Your First Project
        </button>
        <button class="btn btn-info ml-2" onclick="debugProjects()">
          <i class="fa fa-bug"></i> Debug Loading Issues
        </button>
      </div>
    `;
    projectsList.html(noProjectsHtml);
    return;
  }
  
  projects.forEach((project, index) => {
    // Get image source (base64 from localStorage or file path)
    let imageSrc = project.image || '../assets/images/projects/project-1.png';
    
    // Try to get base64 image if available
    if (window.imageManager && window.imageManager.getImageSrc) {
      const base64Image = window.imageManager.getImageSrc(project.image);
      if (base64Image && base64Image !== project.image) {
        imageSrc = base64Image;
      }
    }
    
    const projectCard = `
      <div class="project-card" style="border: 1px solid #ddd; padding: 15px; margin-bottom: 15px; border-radius: 5px;">
        <div class="row">
          <div class="col-md-2">
            <img src="${imageSrc}" class="img-thumbnail" style="max-width: 80px; height: 60px; object-fit: cover;" 
                 onerror="this.src='../assets/images/projects/project-1.png'">
          </div>
          <div class="col-md-7">
            <h5>${project.title || 'Untitled Project'}</h5>
            <p class="text-muted">${project.summary || 'No description available'}</p>
            <small class="text-info">
              <i class="fa fa-calendar"></i> ${project.date || 'No date'} | 
              <i class="fa fa-tag"></i> ${project.type || 'No category'}
            </small>
          </div>
          <div class="col-md-3 text-right">
            <button class="btn btn-sm btn-primary" onclick="editProject(${index})" title="Edit this project">
              <i class="fa fa-edit"></i> Edit
            </button>
            <button class="btn btn-sm btn-danger ml-1" onclick="deleteProject(${index})" title="Delete this project">
              <i class="fa fa-trash"></i> Delete
            </button>
          </div>
        </div>
      </div>
    `;
    projectsList.append(projectCard);
  });
  
  console.log('✅ Projects rendered successfully');
}

// Render Skills
function renderSkills() {
  console.log('🎨 Rendering skills...', skills.length, 'skills');
  const skillsList = $('#skillsList');
  skillsList.empty();
  
  if (skills.length === 0) {
    const noSkillsHtml = `
      <div class="alert alert-info">
        <h5><i class="fa fa-info-circle"></i> No Skills Found</h5>
        <p>No skills are currently loaded. This could be because:</p>
        <ul>
          <li>This is a fresh installation with no skills added yet</li>
          <li>There was an error loading the skills data</li>
          <li>The skills JSON file is empty or corrupted</li>
        </ul>
        <button class="btn btn-primary" onclick="openSkillModal()">
          <i class="fa fa-plus"></i> Add Your First Skill
        </button>
        <button class="btn btn-info ml-2" onclick="debugProjects()">
          <i class="fa fa-bug"></i> Debug Loading Issues
        </button>
      </div>
    `;
    skillsList.html(noSkillsHtml);
    return;
  }
  
  skills.forEach((skill, index) => {
    const skillCard = `
      <div class="skill-card" style="border: 1px solid #ddd; padding: 15px; margin-bottom: 15px; border-radius: 5px;">
        <div class="row">
          <div class="col-md-8">
            <h5>${skill.title || 'Untitled Skill'}</h5>
            <div class="progress" style="height: 8px;">
              <div class="progress-bar" role="progressbar" 
                   style="width: ${skill.percent || '0%'}" 
                   aria-valuenow="${(skill.percent || '0%').replace('%', '')}" 
                   aria-valuemin="0" aria-valuemax="100">
              </div>
            </div>
            <small class="text-muted">
              <strong>Sub-skills:</strong> ${(skill.subSkills || []).join(', ') || 'No sub-skills defined'}
            </small>
          </div>
          <div class="col-md-4 text-right">
            <span class="badge badge-primary">${skill.percent || '0%'}</span>
            <br><br>
            <button class="btn btn-sm btn-primary" onclick="editSkill(${index})" title="Edit this skill">
              <i class="fa fa-edit"></i> Edit
            </button>
            <button class="btn btn-sm btn-danger ml-1" onclick="deleteSkill(${index})" title="Delete this skill">
              <i class="fa fa-trash"></i> Delete
            </button>
          </div>
        </div>
      </div>
    `;
    skillsList.append(skillCard);
  });
  
  console.log('✅ Skills rendered successfully');
}

// Project Management
function openProjectModal(project = null, index = null) {
  currentEditingProject = index;
  $('#projectModal').modal('show');
  
  if (project) {
    // Edit mode
    $('#projectId').val(project.id);
    $('#projectTitle').val(project.title);
    $('#projectSummary').val(project.summary);
    $('#projectDescription').val(project.description);
    $('#projectDate').val(project.date);
    $('#projectType').val(project.type);
    $('#projectImage').val(project.image);
    $('#projectLink').val(project.link || '');
    $('#projectTeamSize').val(project.teamSize || '');
    $('#projectRole').val(project.role || '');
    $('#projectTechnologies').val(project.technologies ? project.technologies.join(', ') : '');
    $('#projectStatus').val(project.status || '');
    $('.modal-title').text('Edit Project');
    
    // Reset file input
    $('#projectImageFile').val('');
    $('.custom-file-label').text('Choose image file...');
  } else {
    // Add mode
    $('#projectForm')[0].reset();
    $('.modal-title').text('Add New Project');
    // Set next ID
    const maxId = Math.max(...projects.map(p => parseInt(p.id))) + 1;
    $('#projectId').val(maxId.toString());
    
    // Reset file input
    $('#projectImageFile').val('');
    $('.custom-file-label').text('Choose image file...');
    $('#projectImage').val('');
  }
}

function editProject(index) {
  openProjectModal(projects[index], index);
}

function deleteProject(index) {
  if (confirm('Are you sure you want to delete this project?')) {
    projects.splice(index, 1);
    
    // Cleanup unused images
    if (window.imageManager) {
      window.imageManager.cleanupUnusedImages(projects);
    }
    
    saveProjects();
    renderProjects();
    updateStats();
  }
}

function saveProject() {
  const form = $('#projectForm')[0];
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }
  
  // Validate image
  const imageInput = $('#projectImage').val();
  if (!imageInput) {
    alert('Please upload an image or provide an image path');
    return;
  }
  
  const projectData = {
    id: $('#projectId').val(),
    title: $('#projectTitle').val(),
    summary: $('#projectSummary').val(),
    description: $('#projectDescription').val(),
    date: $('#projectDate').val(),
    type: $('#projectType').val(),
    image: imageInput,
    link: $('#projectLink').val() || '#',
    technologies: $('#projectTechnologies').val().split(',').map(t => t.trim())
  };
  
  // Add optional fields if they have values
  const teamSize = $('#projectTeamSize').val();
  const role = $('#projectRole').val();
  const status = $('#projectStatus').val();
  
  if (teamSize) projectData.teamSize = parseInt(teamSize);
  if (role) projectData.role = role;
  if (status) projectData.status = status;
  
  if (currentEditingProject !== null) {
    // Edit existing project
    projects[currentEditingProject] = projectData;
  } else {
    // Add new project
    projects.unshift(projectData); // Add to beginning for chronological order
  }
  
  saveProjects();
  renderProjects();
  updateStats();
  $('#projectModal').modal('hide');
}

// Skill Management
function openSkillModal(skill = null, index = null) {
  currentEditingSkill = index;
  $('#skillModal').modal('show');
  
  if (skill) {
    // Edit mode
    $('#skillTitle').val(skill.title);
    $('#skillPercent').val(skill.percent.replace('%', ''));
    $('#percentValue').text(skill.percent);
    $('#skillSubSkills').val(skill.subSkills.join(', '));
    $('.modal-title').text('Edit Skill');
  } else {
    // Add mode
    $('#skillForm')[0].reset();
    $('#skillPercent').val(70);
    $('#percentValue').text('70%');
    $('.modal-title').text('Add New Skill');
  }
}

function editSkill(index) {
  openSkillModal(skills[index], index);
}

function deleteSkill(index) {
  if (confirm('Are you sure you want to delete this skill?')) {
    skills.splice(index, 1);
    saveSkills();
    renderSkills();
    updateStats();
  }
}

function saveSkill() {
  const form = $('#skillForm')[0];
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }
  
  const skillData = {
    title: $('#skillTitle').val(),
    percent: $('#skillPercent').val() + '%',
    subSkills: $('#skillSubSkills').val().split(',').map(s => s.trim())
  };
  
  if (currentEditingSkill !== null) {
    // Edit existing skill
    skills[currentEditingSkill] = skillData;
  } else {
    // Add new skill
    skills.push(skillData);
  }
  
  saveSkills();
  renderSkills();
  updateStats();
  $('#skillModal').modal('hide');
}
