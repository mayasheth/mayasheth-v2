// public/scripts/search-modal.js

let pagefindLoaded = false;

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
    modal.classList.remove("hidden");
    document.body.style.overflow = "hidden";
    initializePagefind();
  }
}

function closeSearchModal() {
  const modal = document.getElementById("search-modal");
  if (modal) {
    modal.classList.add("hidden");
    document.body.style.overflow = "";
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

  // Keyboard shortcuts
  document.addEventListener("keydown", function(e) {
    if (e.key === "Escape") {
      closeSearchModal();
    }
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      openSearchModal();
    }
  });
}

document.addEventListener("DOMContentLoaded", setupSearchModalListeners);