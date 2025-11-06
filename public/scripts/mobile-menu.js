// public/scripts/mobile-menu.js

function setupMobileMenu() {
  const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileMenuIcon = document.getElementById('mobile-menu-icon');

  mobileMenuToggle?.addEventListener('click', () => {
    mobileMenu?.classList.toggle('max-h-0');
    mobileMenu?.classList.toggle('max-h-[1000px]');
    mobileMenu?.classList.toggle('opacity-0');
    mobileMenu?.classList.toggle('opacity-100');
    const isOpen = mobileMenu?.classList.contains('max-h-[1000px]');
    if (mobileMenuIcon) {
      mobileMenuIcon.setAttribute('name', isOpen ? 'mdi--close' : 'mdi--menu');
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth >= 768) {
      mobileMenu?.classList.add('max-h-0', 'opacity-0');
      mobileMenu?.classList.remove('max-h-[1000px]', 'opacity-100');
      if (mobileMenuIcon) {
        mobileMenuIcon.setAttribute('name', 'mdi--menu');
      }
    }
  });
}

document.addEventListener("DOMContentLoaded", setupMobileMenu);