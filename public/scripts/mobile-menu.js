// public/scripts/mobile-menu.js

function setupMobileMenu() {
  const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileMenuIcon = document.getElementById('mobile-menu-icon');
  const mobileMenuLinks = document.querySelectorAll('.mobile-menu-link');

  function openMenu() {
    mobileMenu?.classList.remove('max-h-0', 'opacity-0');
    mobileMenu?.classList.add('max-h-[1000px]', 'opacity-100');
    mobileMenuToggle?.setAttribute('aria-expanded', 'true');
    mobileMenuToggle?.setAttribute('aria-label', 'Close menu');
    if (mobileMenuIcon) {
      mobileMenuIcon.setAttribute('name', 'mdi--close');
    }
  }

  function closeMenu() {
    mobileMenu?.classList.remove('max-h-[1000px]', 'opacity-100');
    mobileMenu?.classList.add('max-h-0', 'opacity-0');
    mobileMenuToggle?.setAttribute('aria-expanded', 'false');
    mobileMenuToggle?.setAttribute('aria-label', 'Open menu');
    if (mobileMenuIcon) {
      mobileMenuIcon.setAttribute('name', 'mdi--menu');
    }
  }

  function toggleMenu() {
    const isOpen = mobileMenu?.classList.contains('max-h-[1000px]');
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  }

  mobileMenuToggle?.addEventListener('click', toggleMenu);

  // Close menu when clicking a nav link
  mobileMenuLinks.forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Close menu on resize to desktop
  window.addEventListener('resize', () => {
    if (window.innerWidth >= 768) {
      closeMenu();
    }
  });
}

document.addEventListener("DOMContentLoaded", setupMobileMenu);