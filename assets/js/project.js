$(document).ready(function () {
  // Get URL param ?id=1
  const urlParams = new URLSearchParams(window.location.search);
  const projectId = urlParams.get('id');

  if (!projectId) {
    $('#project-detail').html('<p><strong>Project not found.</strong></p>');
    return;
  }

  $.getJSON('assets/data/projects.json', function (projects) {
    const project = projects.find(p => p.id === projectId);

    if (!project) {
      $('#project-detail').html('<p><strong>Project not found.</strong></p>');
      return;
    }

    const html = `
      <div class="project-header text-center">
        <h1>${project.title}</h1>
        <p class="text-muted"><i class="fa fa-calendar"></i> ${project.date}</p>
      </div>
      <div class="text-center">
        <img src="${project.image}" class="img-responsive center-block" alt="${project.title}" style="max-width:400px;"/>
      </div>
      <div class="mt-4">
        <h3>Summary</h3>
        <p>${project.summary}</p>

        <h3>Details</h3>
        <p>${project.description || 'No additional details available.'}</p>

        <p><a href="${project.link}" class="btn btn-primary" target="_blank"><i class="fa fa-external-link"></i> Visit Project</a></p>
      </div>
    `;

    $('#project-detail').html(html);
  });
});
