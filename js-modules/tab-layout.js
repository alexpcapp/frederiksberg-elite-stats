export function setupTabs() {
    const tabs = document.querySelectorAll('.tab');
    const contents = document.querySelectorAll('.tab-content');
  
    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => {
        // Reset active states
        tabs.forEach((t) => t.classList.remove('active'));
        contents.forEach((c) => c.classList.remove('active'));
  
        // Set active state for selected tab
        tab.classList.add('active');
        contents[index].classList.add('active');
      });
    });
  }
  
  setupTabs();
  