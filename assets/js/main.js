jQuery(document).ready(function ($) {
  // Skill bar animation
  $('.level-bar-inner').css('width', '0');
  $(window).on('load', function () {
    $('.level-bar-inner').each(function () {
      var itemWidth = $(this).data('level');
      $(this).animate({ width: itemWidth }, 800);
    });
  });

  // Tooltip
  $('.level-label').tooltip();

  // Project loading and toggle
  let allProjects = [];
  const initialVisible = 3;
  let showingAll = false;

  function renderProjects(projects) {
    const container = $('#projects-container');
    container.empty();

    projects.forEach(project => {
      // Get image source (base64 from localStorage or file path)
      const imageSrc = window.dataManager.getImageSrc(project.image);
      
      const html = `
        <div class="item row">
          <a class="col-md-4 col-sm-4 col-xs-12" href="project.html?id=${project.id}">
            <img class="img-responsive project-image" src="${imageSrc}" alt="${project.title}" />
          </a>
          <div class="desc col-md-8 col-sm-8 col-xs-12">
            <h3 class="title"><a href="project.html?id=${project.id}">${project.title}</a></h3>
            <p>${project.summary}</p>
            <p><small><i class="fa fa-calendar"></i> ${project.date}</small></p>
          </div>
        </div>
        <hr class="divider"/>
      `;
      container.append(html);
    });
  }

  // Load profile data and update page content
  async function loadProfile() {
    try {
      await window.dataManager.init();
      const profile = window.dataManager.getProfile();
      
      console.log('Profile loaded:', profile); // Debug log
      
      if (profile && Object.keys(profile).length > 0) {
        // Update page title
        if (profile.siteInfo?.title) {
          document.title = profile.siteInfo.title;
        }
        
        // Update meta tags
        if (profile.siteInfo?.description) {
          $('meta[name="description"]').attr('content', profile.siteInfo.description);
        }
        if (profile.siteInfo?.keywords) {
          $('meta[name="keywords"]').attr('content', profile.siteInfo.keywords);
        }
        
        // Update header content
        if (profile.personalInfo?.fullName) {
          $('.name').text(profile.personalInfo.fullName);
        }
        if (profile.personalInfo?.title) {
          $('.desc').text(profile.personalInfo.title);
        }
        if (profile.personalInfo?.profileImage) {
          const profileImageSrc = window.dataManager.getImageSrc(profile.personalInfo.profileImage);
          $('.profile-image').attr('src', profileImageSrc);
        }
        
        // Update social links
        if (profile.socialLinks) {
          const socialContainer = $('.social');
          const socialLinks = [
            { icon: 'fa-github', url: profile.socialLinks.github },
            { icon: 'fa-linkedin', url: profile.socialLinks.linkedin },
            { icon: 'fa-twitter', url: profile.socialLinks.twitter },
            { icon: 'fa-behance', url: profile.socialLinks.behance },
            { icon: 'fa-dribbble', url: profile.socialLinks.dribbble },
            { icon: 'fa-instagram', url: profile.socialLinks.instagram },
            { icon: 'fa-facebook', url: profile.socialLinks.facebook }
          ];
          
          socialContainer.empty();
          socialLinks.forEach((link, index) => {
            if (link.url) {
              const isLast = index === socialLinks.filter(l => l.url).length - 1;
              const html = `<li${isLast ? ' class="last-item"' : ''}><a href="${link.url}" target="_blank"><i class="fa ${link.icon}"></i></a></li>`;
              socialContainer.append(html);
            }
          });
        }
        
        // Update CTA button
        if (profile.siteInfo?.welcomeMessage) {
          $('.btn-cta-primary').html(`<i class="fa fa-paper-plane"></i> ${profile.siteInfo.welcomeMessage}`);
        }
        
        // Update contact info
        if (profile.contactInfo) {
          const contactList = $('.info .content ul');
          contactList.empty();
          
          if (profile.personalInfo?.location) {
            contactList.append(`<li><i class="fa fa-map-marker"></i> ${profile.personalInfo.location}</li>`);
          }
          if (profile.contactInfo.email) {
            contactList.append(`<li><i class="fa fa-envelope-o"></i> <a href="mailto:${profile.contactInfo.email}">${profile.contactInfo.email}</a></li>`);
          }
          if (profile.contactInfo.website) {
            contactList.append(`<li><i class="fa fa-link"></i> <a href="${profile.contactInfo.website}" target="_blank">${profile.contactInfo.website}</a></li>`);
          }
          if (profile.contactInfo.phone) {
            contactList.append(`<li><i class="fa fa-phone"></i> <a href="tel:${profile.contactInfo.phone}">${profile.contactInfo.phone}</a></li>`);
          }
        }
        
        // Update about section
        if (profile.personalInfo?.bio) {
          const aboutContent = $('.about .content');
          aboutContent.empty();
          aboutContent.append(`<p>${profile.personalInfo.bio}</p>`);
          if (profile.personalInfo.bioParagraph2) {
            aboutContent.append(`<p>${profile.personalInfo.bioParagraph2}</p>`);
          }
        }
        
        // Update section titles
        if (profile.sections) {
          if (profile.sections.aboutTitle) {
            $('.about .heading').text(profile.sections.aboutTitle);
          }
          if (profile.sections.projectsTitle) {
            $('.latest .heading').text(profile.sections.projectsTitle);
          }
          if (profile.sections.githubTitle) {
            $('.github .heading').text(profile.sections.githubTitle);
          }
          if (profile.sections.skillsTitle) {
            $('.skills .heading').text(profile.sections.skillsTitle);
          }
          if (profile.sections.showMoreButtonText) {
            $('#show-more-btn').text(profile.sections.showMoreButtonText);
          }
        }
        
        // Update footer
        if (profile.siteInfo?.copyright) {
          $('.copyright').html(profile.siteInfo.copyright);
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  }

  // Load projects using data manager
  async function loadProjects() {
    try {
      await window.dataManager.init();
      const profile = window.dataManager.getProfile();
      allProjects = window.dataManager.getProjects().sort((a, b) => new Date(b.date) - new Date(a.date));
      renderProjects(allProjects.slice(0, initialVisible));

      // Toggle Show More / Less
      $('#show-more-btn').off('click').on('click', function () {
        if (showingAll) {
          renderProjects(allProjects.slice(0, initialVisible));
          $(this).text(profile.sections?.showMoreButtonText || 'Show More');
          showingAll = false;
        } else {
          renderProjects(allProjects);
          $(this).text(profile.sections?.showLessButtonText || 'Show Less');
          showingAll = true;
        }
      });

      if (allProjects.length <= initialVisible) {
        $('#show-more-btn').hide();
      }
    } catch (error) {
      console.error('Error loading projects:', error);
      $('#projects-container').html('<p><strong>Error loading projects data</strong></p>');
    }
  }

  // Helper to calculate level label from percent
  function getLevelLabel(percent) {
    const p = parseInt(percent);
    if (p >= 95) return 'Expert';
    if (p >= 85) return 'Pro';
    if (p >= 70) return 'Intermediate';
    if (p >= 50) return 'Beginner';
    return 'Learning';
  }

  // Load Skills using data manager
  async function loadSkills() {
    try {
      await window.dataManager.init();
      const skills = window.dataManager.getSkills();
      const skillsContainer = $('#skills-container');
      skillsContainer.empty();

      skills.forEach(skill => {
        const subSkills = skill.subSkills.map(s => `<li>${s}</li>`).join('');
        const levelLabel = getLevelLabel(skill.percent);

        const skillHtml = `
          <div class="item">
            <h3 class="level-title">${skill.title}
              <span class="level-label" data-toggle="tooltip" data-placement="left" title="${levelLabel}">${levelLabel}</span>
            </h3>
            <div class="level-bar">
              <div class="level-bar-inner" data-level="${skill.percent}"></div>
            </div>
            <ul class="sub-skills">${subSkills}</ul>
          </div>
        `;
        skillsContainer.append(skillHtml);
      });

      // Re-apply tooltip and bar animation
      $('.level-label').tooltip();
      $('.level-bar-inner').css('width', '0').each(function () {
        const level = $(this).data('level');
        $(this).animate({ width: level }, 800);
      });
    } catch (error) {
      console.error('Error loading skills:', error);
      $('#skills-container').html('<p><strong>Error loading skills data</strong></p>');
    }
  }

  // Initialize data loading
  window.dataManager = new DataManager();
  loadProfile();
  loadProjects();
  loadSkills();

  // Listen for data changes from admin panel
  if (window.dataManager) {
    window.dataManager.onDataChange(() => {
      loadProfile();
      loadProjects();
      loadSkills();
    });
  }
  
  // Listen for storage changes (when admin panel updates data)
  window.addEventListener('storage', function(e) {
    if (e.key === 'portfolio_profile' || e.key === 'portfolioProjects' || e.key === 'portfolioSkills') {
      console.log('Profile data changed, reloading...');
      loadProfile();
      loadProjects();
      loadSkills();
    }
  });
});
