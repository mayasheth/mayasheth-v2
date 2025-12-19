import fs from 'fs';
import path from 'path';
import { JSDOM } from 'jsdom';

const DIST = 'dist';
const OUTPUT = path.join(DIST, 'page-carbon.json');
const SIZE_GRANULARITY = 1000; // in bytes

function roundSize(bytes) {
  return Math.round(bytes / SIZE_GRANULARITY) * SIZE_GRANULARITY;
}

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
  if (!assetUrl || assetUrl.startsWith('http')) return null; // skip external or empty
  // Remove leading /
  let local = assetUrl.replace(/^\//, '');
  return path.join(DIST, local);
}

async function getCarbonGrams(bytes, green = 0) {
  try {
    const res = await fetch(`https://api.websitecarbon.com/data?bytes=${bytes}&green=${green}`);
    const json = await res.json();
    return json?.statistics?.co2?.grid?.grams ?? null;
  } catch (err) {
    console.error('Carbon API error for', bytes, err);
    return null;
  }
}

async function main() {
  const htmlFiles = walk(DIST);
  const routeCarbon = {};
  const sizeToRoutes = {}; // {roundedSize: [route1, route2, ...]}
  const routeSize = {};    // {route: roundedSize}
  
   // 1. Map pages to rounded sizes
  for (const file of htmlFiles) {
    let totalSize = fs.statSync(file).size;
    const html = fs.readFileSync(file, 'utf-8');
    const dom = new JSDOM(html);

    // Find asset URLs (CSS, JS, images)
    const assetUrls = [];
    dom.window.document.querySelectorAll('link[href]').forEach(link => {
      assetUrls.push(link.getAttribute('href'));
    });
    dom.window.document.querySelectorAll('script[src]').forEach(script => {
      assetUrls.push(script.getAttribute('src'));
    });
    dom.window.document.querySelectorAll('img[src]').forEach(img => {
      assetUrls.push(img.getAttribute('src'));
    });
    dom.window.document.querySelectorAll('source[srcset]').forEach(source => {
      const srcset = source.getAttribute('srcset');
      if (srcset) assetUrls.push(srcset.split(',')[0].trim().split(' ')[0]);
    });

    // Add sizes for each asset
    for (const url of assetUrls) {
      const assetFile = assetPath(url);
      if (assetFile && fs.existsSync(assetFile)) {
        totalSize += fs.statSync(assetFile).size;
      }
    }
    const roundedSize = roundSize(totalSize);
    const route = fileToRoute(file);

    routeSize[route] = roundedSize;
    if (!sizeToRoutes[roundedSize]) sizeToRoutes[roundedSize] = [];
    sizeToRoutes[roundedSize].push(route);

    // // Now: Fetch carbon grams for totalSize
    // const grams = await getCarbonGrams(totalSize);
    // routeCarbon[fileToRoute(file)] = grams !== null ? grams : '--';
    // console.log(`Route: ${fileToRoute(file)} | bytes: ${totalSize} | grams: ${grams}`);
  }

  // 2. Calculate carbon for *each unique rounded size*
  const sizeToGrams = {};
  for (const roundedSize of Object.keys(sizeToRoutes)) {
    const grams = await getCarbonGrams(Number(roundedSize));
    sizeToGrams[roundedSize] = grams;
    await new Promise(r => setTimeout(r, 1100)); // throttle if needed
    console.log(`Rounded size: ${roundedSize} | grams: ${grams}`);
  }

  // 3. Map results back to routes
  for (const route in routeSize) {
    const roundedSize = routeSize[route];
    routeCarbon[route] = sizeToGrams[roundedSize] ?? '--';
  }

  fs.writeFileSync(OUTPUT, JSON.stringify(routeCarbon, null, 2));
  console.log('Generated page-carbon.json:', routeCarbon);
}

main();