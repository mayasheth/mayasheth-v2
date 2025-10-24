const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const DIST = 'dist';
const OUTPUT = path.join(DIST, 'page-bytes.json');

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

function fileToRoute(file) {
  let rel = path.relative(DIST, file);
  if (rel === 'index.html') return '/';
  if (rel.endsWith('index.html')) rel = rel.replace(/index\.html$/, '');
  if (!rel.startsWith('/')) rel = '/' + rel;
  return rel;
}

function assetPath(assetUrl) {
  if (assetUrl.startsWith('http')) return null; // skip external
  // Remove leading /
  let local = assetUrl.replace(/^\//, '');
  return path.join(DIST, local);
}

const htmlFiles = walk(DIST);

const routeBytes = {};
for (const file of htmlFiles) {
  const htmlSize = fs.statSync(file).size;
  let totalSize = htmlSize;
  const html = fs.readFileSync(file, 'utf-8');
  const dom = new JSDOM(html);

  // Find asset URLs (CSS, JS, images)
  const assetUrls = [];

  // CSS
  dom.window.document.querySelectorAll('link[href]').forEach(link => {
    assetUrls.push(link.getAttribute('href'));
  });

  // JS
  dom.window.document.querySelectorAll('script[src]').forEach(script => {
    assetUrls.push(script.getAttribute('src'));
  });

  // Images
  dom.window.document.querySelectorAll('img[src]').forEach(img => {
    assetUrls.push(img.getAttribute('src'));
  });

  // Sources in pictures
  dom.window.document.querySelectorAll('source[srcset]').forEach(source => {
    // Split on comma, take first src (basic case)
    const srcset = source.getAttribute('srcset');
    // Get first URL from srcset
    if (srcset) assetUrls.push(srcset.split(',')[0].trim().split(' ')[0]);
  });

  // Add sizes for each asset
  for (const url of assetUrls) {
    const assetFile = assetPath(url);
    if (assetFile && fs.existsSync(assetFile)) {
      totalSize += fs.statSync(assetFile).size;
    }
  }

  routeBytes[fileToRoute(file)] = totalSize;
}

fs.writeFileSync(OUTPUT, JSON.stringify(routeBytes, null, 2));
console.log('Generated page-bytes.json:', routeBytes);