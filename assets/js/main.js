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

  // Load Projects Dynamically
  let allProjects = [];
  let shownProjects = 3;

  function renderProjects(projects) {
    const container = $('#projects-container');
    container.empty();

    projects.forEach(project => {
      const html = `
        <div class="item row">
          <a class="col-md-4 col-sm-4 col-xs-12" href="${project.link}" target="_blank">
            <img class="img-responsive project-image" src="${project.image}" alt="${project.title}" />
          </a>
          <div class="desc col-md-8 col-sm-8 col-xs-12">
            <h3 class="title"><a href="${project.link}" target="_blank">${project.title}</a></h3>
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
    renderProjects(allProjects.slice(0, shownProjects));

    if (allProjects.length <= shownProjects) {
      $('#show-more-btn').hide();
    }

    $('#show-more-btn').on('click', function () {
      renderProjects(allProjects);
      $(this).hide();
    });
  }).fail(function () {
    $('#projects-container').html('<p><strong>Error loading projects.json</strong></p>');
  });
});
