// Admin Panel JavaScript
let projects = [];
let skills = [];
let profile = {};
let currentEditingProject = null;
let currentEditingSkill = null;

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
  if (window.base64ImageManager && window.base64ImageManager.initialized) {
    const storageInfo = window.base64ImageManager.getStorageInfo();
    $('#imageStorage').text(`${storageInfo.totalImages} images (${storageInfo.storageUsed})`);
  } else {
    $('#imageStorage').text('Base64 Manager Loading...');
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
      if (imagePath.startsWith('data:image/')) {
        $('.custom-file-label[for="profileImageUpload"]').text('Current: Base64 Image');
      } else {
        $('.custom-file-label[for="profileImageUpload"]').text('Current: ' + imagePath.split('/').pop());
      }
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

// Save profile data to localStorage
function saveProfileData() {
  localStorage.setItem('portfolio_profile', JSON.stringify(profile));
  
  // Update the dataManager's profile data as well
  if (window.dataManager) {
    window.dataManager.profile = profile;
  }
  
  // Trigger profile change event for real-time updates
  $(document).trigger('profileChanged', [profile]);
  
  // For development: log the saved data
  console.log('Profile saved:', profile);
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

// Export images data
function exportImages() {
  if (window.base64ImageManager) {
    const imageData = window.base64ImageManager.exportImages();
    const blob = new Blob([imageData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'portfolio-images-backup.json';
    a.click();
    URL.revokeObjectURL(url);
    showAlert('Images exported successfully!', 'success');
  } else {
    showAlert('Image manager not available', 'error');
  }
}

// Import images data
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
          if (window.base64ImageManager) {
            const result = window.base64ImageManager.importImages(e.target.result);
            if (result.success) {
              showAlert('Images imported successfully!', 'success');
              // Refresh the page to reload with new images
              setTimeout(() => location.reload(), 1500);
            } else {
              showAlert('Failed to import images: ' + result.error, 'error');
            }
          } else {
            showAlert('Image manager not available', 'error');
          }
        } catch (error) {
          showAlert('Invalid JSON file', 'error');
        }
      };
      reader.readAsText(file);
    }
  };
  input.click();
}

$(document).ready(function() {
  // Initialize managers
  window.dataManager = new DataManager();
  
  // Initialize base64 image manager
  if (window.base64ImageManager) {
    window.base64ImageManager.init().then(() => {
      console.log('Base64 Image Manager initialized');
    });
  }
  
  // Check authentication
  if (localStorage.getItem('adminLoggedIn') !== 'true') {
    window.location.href = 'index.html';
    return;
  }
  
  // Display admin email
  $('#adminEmail').text(localStorage.getItem('adminEmail'));
  
  // Load data
  loadProjects();
  loadSkills();
  loadProfile();
  updateStats();
  
  // Profile image upload handler
  $(document).on('change', '#profileImageUpload', function() {
    const file = this.files[0];
    if (file) {
      $('.custom-file-label[for="profileImageUpload"]').text(file.name);
      handleImageUpload(file, function(imageId) {
        if (imageId) {
          $('#profileImagePath').val(imageId);
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
      handleImageUpload(file, function(imageId) {
        if (imageId) {
          $('#projectImage').val(imageId);
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
});

// Authentication
function logout() {
  localStorage.removeItem('adminLoggedIn');
  localStorage.removeItem('adminEmail');
  window.location.href = 'index.html';
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

// Load Projects - checks localStorage first for any admin updates
function loadProjects() {
  // First check if we have updated data in localStorage
  const localProjects = localStorage.getItem('portfolioProjects');
  
  if (localProjects) {
    try {
      projects = JSON.parse(localProjects);
      renderProjects();
      updateStats();
      return;
    } catch (e) {
      console.error('Failed to parse local projects data');
    }
  }
  
  // Fallback to loading from original JSON file
  $.getJSON('../assets/data/projects.json', function(data) {
    projects = data;
    renderProjects();
    updateStats();
  }).fail(function() {
    console.error('Failed to load projects from file');
    projects = [];
    renderProjects();
    updateStats();
  });
}

// Load Skills - checks localStorage first for any admin updates  
function loadSkills() {
  // First check if we have updated data in localStorage
  const localSkills = localStorage.getItem('portfolioSkills');
  
  if (localSkills) {
    try {
      skills = JSON.parse(localSkills);
      renderSkills();
      updateStats();
      return;
    } catch (e) {
      console.error('Failed to parse local skills data');
    }
  }
  
  // Fallback to loading from original JSON file
  $.getJSON('../assets/data/skills.json', function(data) {
    skills = data;
    renderSkills();
    updateStats();
  }).fail(function() {
    console.error('Failed to load skills from file');
    skills = [];
    renderSkills();
    updateStats();
  });
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
    const imageInfo = window.imageManager.getStorageInfo();
    const imageStatus = `<span class="text-primary">${imageInfo.count} images (${imageInfo.totalSizeFormatted})</span>`;
    $('#imageStatus').html(imageStatus);
  }
}

// Auto-save functions - updates data in memory automatically
function saveProjects() {
  // Save to localStorage for persistence
  localStorage.setItem('portfolioProjects', JSON.stringify(projects));
  
  // Trigger storage event for other tabs/windows
  window.dispatchEvent(new StorageEvent('storage', {
    key: 'portfolioProjects',
    newValue: JSON.stringify(projects)
  }));
  
  // Show success message
  showNotification('Projects updated successfully! Changes are live immediately.', 'success');
  
  // Update the data source that the admin panel uses
  updateDataSource('projects', projects);
}

function saveSkills() {
  // Save to localStorage for persistence  
  localStorage.setItem('portfolioSkills', JSON.stringify(skills));
  
  // Trigger storage event for other tabs/windows
  window.dispatchEvent(new StorageEvent('storage', {
    key: 'portfolioSkills',
    newValue: JSON.stringify(skills)
  }));
  
  // Show success message
  showNotification('Skills updated successfully! Changes are live immediately.', 'success');
  
  // Update the data source that the admin panel uses
  updateDataSource('skills', skills);
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

// Image Upload Handler - Now uses base64 storage
async function handleImageUpload(file, callback, category = 'projects') {
  if (!file) {
    callback(null);
    return;
  }
  
  try {
    // Show upload progress
    showNotification('Uploading image...', 'info');
    
    // Use the new base64 image manager
    if (window.base64ImageManager) {
      const result = await window.base64ImageManager.storeImage(file, category);
      
      if (result.success) {
        callback(result.imageId);
        showNotification(`Image uploaded successfully! ID: ${result.imageId}`, 'success');
      } else {
        callback(null);
        showNotification(`Failed to upload image: ${result.error}`, 'error');
      }
    } else {
      // Fallback to direct base64 conversion
      const reader = new FileReader();
      reader.onload = function(e) {
        const base64 = e.target.result;
        const imageId = 'img_' + Date.now();
        
        // Store in localStorage
        const storedImages = JSON.parse(localStorage.getItem('portfolio_images') || '{"images":{"projects":{}}}');
        if (!storedImages.images) storedImages.images = {};
        if (!storedImages.images.projects) storedImages.images.projects = {};
        
        if (category === 'profile') {
          storedImages.images.profile = base64;
          callback('profile');
        } else {
          storedImages.images.projects[imageId] = base64;
          callback(imageId);
        }
        
        localStorage.setItem('portfolio_images', JSON.stringify(storedImages));
        showNotification('Image uploaded successfully!', 'success');
      };
      reader.onerror = function() {
        callback(null);
        showNotification('Failed to upload image. Please try again.', 'error');
      };
      reader.readAsDataURL(file);
    }
  } catch (error) {
    console.error('Image upload error:', error);
    callback(null);
    showNotification('Failed to upload image. Please try again.', 'error');
  }
}

// Render Projects
function renderProjects() {
  const projectsList = $('#projectsList');
  projectsList.empty();
  
  if (projects.length === 0) {
    projectsList.html('<p class="text-muted">No projects found.</p>');
    return;
  }
  
  projects.forEach((project, index) => {
    // Get image source (base64 from localStorage or file path)
    const imageSrc = window.imageManager ? window.imageManager.getImageData(project.image) || project.image : project.image;
    
    const projectCard = `
      <div class="project-card">
        <div class="row">
          <div class="col-md-2">
            <img src="${imageSrc}" class="img-thumbnail" style="max-width: 80px;" 
                 onerror="this.src='../assets/images/projects/project-1.png'">
          </div>
          <div class="col-md-7">
            <h5>${project.title}</h5>
            <p class="text-muted">${project.summary}</p>
            <small class="text-info">
              <i class="fa fa-calendar"></i> ${project.date} | 
              <i class="fa fa-tag"></i> ${project.type}
            </small>
          </div>
          <div class="col-md-3 text-right">
            <button class="btn btn-sm btn-primary" onclick="editProject(${index})">
              <i class="fa fa-edit"></i> Edit
            </button>
            <button class="btn btn-sm btn-danger" onclick="deleteProject(${index})">
              <i class="fa fa-trash"></i> Delete
            </button>
          </div>
        </div>
      </div>
    `;
    projectsList.append(projectCard);
  });
}

// Render Skills
function renderSkills() {
  const skillsList = $('#skillsList');
  skillsList.empty();
  
  if (skills.length === 0) {
    skillsList.html('<p class="text-muted">No skills found.</p>');
    return;
  }
  
  skills.forEach((skill, index) => {
    const skillCard = `
      <div class="skill-card">
        <div class="row">
          <div class="col-md-8">
            <h5>${skill.title}</h5>
            <div class="progress" style="height: 8px;">
              <div class="progress-bar" role="progressbar" 
                   style="width: ${skill.percent}" 
                   aria-valuenow="${skill.percent.replace('%', '')}" 
                   aria-valuemin="0" aria-valuemax="100">
              </div>
            </div>
            <small class="text-muted">
              <strong>Sub-skills:</strong> ${skill.subSkills.join(', ')}
            </small>
          </div>
          <div class="col-md-4 text-right">
            <span class="badge badge-primary">${skill.percent}</span>
            <br><br>
            <button class="btn btn-sm btn-primary" onclick="editSkill(${index})">
              <i class="fa fa-edit"></i> Edit
            </button>
            <button class="btn btn-sm btn-danger" onclick="deleteSkill(${index})">
              <i class="fa fa-trash"></i> Delete
            </button>
          </div>
        </div>
      </div>
    `;
    skillsList.append(skillCard);
  });
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
