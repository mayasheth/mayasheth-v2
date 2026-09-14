// public/scripts/toc-highlight.js
//
// Highlights the table-of-contents link for the heading closest to the top
// of the viewport. Shared by notebook/[id].astro and media/[id].astro (both
// render a `.markdown-content` article with h2/h3/h4 headings and a TOC nav
// whose links have id="toc-link-<headingId>").

const headingIds = [
  ...document.querySelectorAll(
    ".markdown-content h2, .markdown-content h3, .markdown-content h4",
  ),
].map((e) => e.id);

function highlightClosestHeading() {
  // Find the heading closest to the top of the viewport:
  // - Among headings at or below the fold: pick the one nearest the top (smallest positive rect.top)
  // - Among headings scrolled past: pick the most recently passed one (largest negative rect.top)
  // Prefer the at/below-fold group; fall back to the scrolled-past group.
  let aboveId;
  let belowId;
  let minAbove = Infinity;
  let maxBelow = -Infinity;

  headingIds.forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top;
    if (top >= 0 && top < minAbove) {
      minAbove = top;
      aboveId = id;
    } else if (top < 0 && top > maxBelow) {
      maxBelow = top;
      belowId = id;
    }
  });

  const closest = aboveId ?? belowId;
  document.querySelectorAll(".toc-active").forEach((el) => el.classList.remove("toc-active"));
  if (closest) {
    document.getElementById(`toc-link-${closest}`)?.classList.add("toc-active");
  }
}

window.addEventListener("scroll", highlightClosestHeading, { passive: true });
window.addEventListener("DOMContentLoaded", highlightClosestHeading);
