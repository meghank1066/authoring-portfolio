async function loadProjects() {
  try {
    const response = await fetch('json/projects.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    const grid = document.getElementById('projects-grid');
    
    if (!grid) {
      console.error("Could not find element with id 'projects-grid'");
      return;
    }

    grid.innerHTML = ''; // Clear existing content

    data.projects.forEach(project => {
      // Build metrics HTML dynamically from the array
      const metricsHTML = project.metrics ? project.metrics.map(m => `
        <div class="metric-item">
          <span class="metric-value">${m.value}</span>
          <span class="metric-label">${m.label}</span>
        </div>
      `).join('') : '';
      
      const card = document.createElement('a');
      card.href = project.href || '#';
      card.className = 'project-item';

      card.innerHTML = `
        <div class="item-image-wrapper">
          <img src="${project.image}" alt="${project.title} Preview" />
        </div>

        <div class="card-header">
          <h3 class="card-title">${project.title}</h3>
          <span class="badge">${project.badge || 'Project'}</span>
        </div>

        <p class="company">${project.description}</p>

        <div class="card-metrics">
          ${metricsHTML}
        </div>
      `;

      grid.appendChild(card);
    });

  } catch (error) {
    console.error('Error loading projects:', error);
  }
}

document.addEventListener('DOMContentLoaded', loadProjects);