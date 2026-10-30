// horizontal
window.addEventListener('scroll', () => {
  window.requestAnimationFrame(() => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;

    // calculates scroll percentage (0 to 1)
    const scrollPercent = docHeight > 0 ? Math.min(Math.max(scrollTop / docHeight, 0), 1) : 0;

    const marker = document.getElementById('ladybugMarker');
    const line = document.querySelector('.h-crawl-line');

    // moves the ladybug marker smoothly along the line
    if (marker && line) {
      const lineWidth = line.clientWidth;
      const markerWidth = marker.clientWidth;
      const maxTravel = Math.max(0, lineWidth - markerWidth);

      marker.style.transform = `translateY(-50%) translateX(${scrollPercent * maxTravel}px)`;
    }

    // determines the current active section on screen
    const sections = document.querySelectorAll('main section');
    const stops = document.querySelectorAll('.h-crawl-stop');
    const navLinks = document.querySelectorAll('.nav-links a');

    let currentSectionId = '';

    sections.forEach((section) => {
      const sectionTop = section.offsetTop - 200; // offset threshold
      if (scrollTop >= sectionTop) {
        currentSectionId = section.getAttribute('id');
      }
    });

    // updates the active state on crawl track dots
    stops.forEach((stop) => {
      stop.classList.toggle('active', stop.dataset.target === currentSectionId);
    });

    // updates the active state on explore sidebar links
    navLinks.forEach((link) => {
      const linkTarget = link.getAttribute('href').replace('#', '');
      link.classList.toggle('is-active', linkTarget === currentSectionId);
    });
  });
});

document.querySelectorAll('.h-crawl-stop').forEach((stop) => {
  stop.addEventListener('click', () => {
    const targetId = stop.getAttribute('data-target');
    const targetSection = document.getElementById(targetId);
    
    if (targetSection) {
      targetSection.scrollIntoView({
        behavior: 'smooth'
      });
    }
  });
});

// vertical
document.addEventListener("DOMContentLoaded", () => {
      const steps = document.querySelectorAll(".timeline-item");
  const sections = document.querySelectorAll(".case-study-section");
  const marker = document.getElementById("vLadybugMarker");

      function updateWheelNav() {
        let currentSectionId = "context";
        const scrollPosition = window.scrollY + 180;

        sections.forEach(section => {
          const sectionTop = section.offsetTop;
          const sectionHeight = section.offsetHeight;
          if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            currentSectionId = section.getAttribute("id");
          }
        });

        steps.forEach(step => {
          const targetSection = step.getAttribute("href").substring(1);
          if (targetSection === currentSectionId) {
        step.classList.add("active");
            if (marker) {
          marker.style.top = `${step.offsetTop}px`;
            }
          } else {
        step.classList.remove("active");
      }
    });
  }
  window.addEventListener("scroll", updateWheelNav);
  updateWheelNav();

  steps.forEach(step => {
    step.addEventListener("click", function() {
      steps.forEach(s => s.classList.remove("active"));
      this.classList.add("active");
      if (marker) {
        marker.style.top = `${this.offsetTop}px`;
      }
    });
  });

      // click handler for about page
        const card = document.querySelector('.doily-card');
  const photo = document.querySelector('.polaroid-photo');

  card.addEventListener('click', () => card.classList.toggle('on-top'));
  photo.addEventListener('click', () => card.classList.remove('on-top'));


   // image lightbox
const lightbox = document.getElementById("image-lightbox");
const lightboxImg = document.getElementById("lightbox-img");
const closeBtn = document.querySelector(".lightbox-close");

if (lightbox && lightboxImg && closeBtn) {
  document.querySelectorAll(".clickable").forEach((element) => {
    element.addEventListener("click", () => {
      const img = element.tagName === "IMG"
        ? element
        : element.querySelector("img");

      if (img) {
        lightbox.style.display = "flex";
        lightboxImg.src = img.src;
      }
    });
  });

  closeBtn.addEventListener("click", () => {
    lightbox.style.display = "none";
  });

  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) {
      lightbox.style.display = "none";
    }
  });
}
});

