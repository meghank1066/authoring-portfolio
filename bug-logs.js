// BUG LOG DRAWER TOGGLE

document.addEventListener('DOMContentLoaded', () => {
  const logToggleBtn = document.getElementById('logToggleBtn');
  const allLogsDrawer = document.getElementById('allLogsDrawer');
  const allLogsLink = document.getElementById('allLogsLink');

  if (!logToggleBtn || !allLogsDrawer) {
    console.error('Bug log toggle: button or drawer not found.');
    return;
  }

  function toggleDrawer() {
    const isOpen = allLogsDrawer.classList.toggle('is-active');

    logToggleBtn.classList.toggle('is-open', isOpen);
    logToggleBtn.setAttribute('aria-expanded', String(isOpen));
  }

  logToggleBtn.addEventListener('click', toggleDrawer);

  if (allLogsLink) {
    allLogsLink.addEventListener('click', toggleDrawer);
  }
});