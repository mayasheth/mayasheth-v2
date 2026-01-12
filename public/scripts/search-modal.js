// public/scripts/search-modal.js

let pagefindLoaded = false;
let triggerElement = null; // Track which element opened the modal

async function loadPagefindUi() {
  if (window.PagefindUI) return window.PagefindUI;
  const script = document.createElement('script');
  script.src = '/pagefind/pagefind-ui.js';
  document.head.appendChild(script);
  return new Promise((resolve) => {
    script.onload = () => resolve(window.PagefindUI);
  });
}

async function initializePagefind() {
  if (pagefindLoaded) return;
  try {
    const PagefindUI = await loadPagefindUi();
    const searchContainer = document.getElementById("modal-search-field");
    if (!searchContainer) {
      console.error("Search container not found");
      return;
    }
    searchContainer.innerHTML = '';
    new PagefindUI({ 
      element: searchContainer,
      bundlePath: "/pagefind/",
      autofocus: true,
      showImages: false,
      showSubResults: true,
      excerptLength: 15,
      resetStyles: false,
      ranking: {
        termFrequency: 0.75,
        termSimilarity: 10,
        pageLength: 0.5,
        termSaturation: 1.6
      },
      translations: {
        placeholder: "search!",
        clear_search: "clear",
        load_more: "load more results",
        search_label: "search",
        filters_label: "filters",
        zero_results: "no results for [SEARCH_TERM]!",
        many_results: '[COUNT] results for "[SEARCH_TERM]"',
        one_result: '[COUNT] result for "[SEARCH_TERM]"',
        alt_search: 'no results for "[SEARCH_TERM]". showing results for "[DIFFERENT_TERM]" instead...',
        search_suggestion: 'no results for "[SEARCH_TERM]". try one of the following:',
        searching: 'searching for "[SEARCH_TERM]"...'
      }
    });
    pagefindLoaded = true;
    console.log("Pagefind initialized successfully");
  } catch (error) {
    console.error("Failed to initialize Pagefind:", error);
  }
}

function openSearchModal() {
  const modal = document.getElementById("search-modal");
  if (modal) {
    // Store the element that triggered the modal for focus return
    triggerElement = document.activeElement;
    modal.classList.remove("hidden");
    document.body.style.overflow = "hidden";
    initializePagefind();
    // Focus will be set by Pagefind's autofocus option
  }
}

function closeSearchModal() {
  const modal = document.getElementById("search-modal");
  if (modal) {
    modal.classList.add("hidden");
    document.body.style.overflow = "";
    // Return focus to the element that triggered the modal
    if (triggerElement) {
      triggerElement.focus();
      triggerElement = null;
    }
  }
}

// Focus trap: keeps Tab key cycling within the modal
function handleFocusTrap(e) {
  const modal = document.getElementById("search-modal");
  if (!modal || modal.classList.contains("hidden")) return;

  if (e.key !== "Tab") return;

  const modalContent = document.getElementById("search-modal-content");
  if (!modalContent) return;

  // Get all focusable elements within the modal
  const focusableSelectors = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
  const focusableElements = modalContent.querySelectorAll(focusableSelectors);
  const firstFocusable = focusableElements[0];
  const lastFocusable = focusableElements[focusableElements.length - 1];

  if (e.shiftKey) {
    // Shift+Tab: if on first element, wrap to last
    if (document.activeElement === firstFocusable) {
      e.preventDefault();
      lastFocusable?.focus();
    }
  } else {
    // Tab: if on last element, wrap to first
    if (document.activeElement === lastFocusable) {
      e.preventDefault();
      firstFocusable?.focus();
    }
  }
}

// Setup event listeners
function setupSearchModalListeners() {
  document.getElementById("search-trigger")?.addEventListener("click", openSearchModal);
  document.getElementById("search-trigger-mobile")?.addEventListener("click", openSearchModal);
  document.getElementById("close-search-modal")?.addEventListener("click", closeSearchModal);

  // Close on backdrop click
  document.getElementById("search-modal")?.addEventListener("click", function(e) {
    if (e.target === this || e.target.classList.contains('opacity-')) {
      closeSearchModal();
    }
  });

  // Keyboard shortcuts and focus trap
  document.addEventListener("keydown", function(e) {
    if (e.key === "Escape") {
      closeSearchModal();
    }
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      openSearchModal();
    }
    // Handle focus trap within modal
    handleFocusTrap(e);
  });
}

document.addEventListener("DOMContentLoaded", setupSearchModalListeners);