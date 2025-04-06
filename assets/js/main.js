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
      const html = `
        <div class="item row">
          <a class="col-md-4 col-sm-4 col-xs-12" href="project.html?id=${project.id}">
            <img class="img-responsive project-image" src="${project.image}" alt="${project.title}" />
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

  $.getJSON('assets/data/projects.json', function (data) {
    allProjects = data.sort((a, b) => new Date(b.date) - new Date(a.date));
    renderProjects(allProjects.slice(0, initialVisible));

    // Toggle Show More / Less
    $('#show-more-btn').on('click', function () {
      if (showingAll) {
        renderProjects(allProjects.slice(0, initialVisible));
        $(this).text('Show More');
        showingAll = false;
      } else {
        renderProjects(allProjects);
        $(this).text('Show Less');
        showingAll = true;
      }
    });

    if (allProjects.length <= initialVisible) {
      $('#show-more-btn').hide();
    }
  }).fail(function () {
    $('#projects-container').html('<p><strong>Error loading projects.json</strong></p>');
  });

  // Load Skills Dynamically
  $.getJSON('assets/data/skills.json', function (skills) {
    const skillsContainer = $('#skills-container');

    skills.forEach(skill => {
      const subSkills = skill.subSkills.map(s => `<li>${s}</li>`).join('');
      const skillHtml = `
        <div class="item">
          <h3 class="level-title">${skill.title}
            <span class="level-label" data-toggle="tooltip" data-placement="left" title="${skill.level}">${skill.level}</span>
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
  }).fail(function () {
    $('#skills-container').html('<p><strong>Error loading skills.json</strong></p>');
  });
});
