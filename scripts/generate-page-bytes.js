// For Astro's output dir
const DIST = 'dist';
const fs = require('fs');
const path = require('path');
const OUTPUT = path.join('src', 'data', 'page-bytes.json');

// Walk dist to find all HTML files
function walk(dir, filelist = []) {
  fs.readdirSync(dir).forEach(file => {
    const full = path.join(dir, file);
    if (fs.statSync(full).isDirectory()) {
      walk(full, filelist);
    } else if (full.endsWith('.html')) {
      filelist.push(full);
    }
  });
  return filelist;
}

const htmlFiles = walk(DIST);

// Map HTML files to web routes
function fileToRoute(file) {
  let rel = path.relative(DIST, file);
  if (rel === 'index.html') return '/';
  if (rel.endsWith('index.html')) rel = rel.replace(/index\.html$/, '');
  if (!rel.startsWith('/')) rel = '/' + rel;
  return rel;
}

// Build mapping: route → bytes
const routeBytes = {};
for (const file of htmlFiles) {
  const stats = fs.statSync(file);
  routeBytes[fileToRoute(file)] = stats.size; // .size is bytes
}

// Write to JSON for importing in Astro component/layout
fs.writeFileSync(
  OUTPUT,
  JSON.stringify(routeBytes, null, 2)
);
console.log('Generated page-bytes.json:', routeBytes);