import fs from 'fs';
import path from 'path';
import { JSDOM } from 'jsdom';

const DIST = 'dist';
const OUTPUT = path.join(DIST, 'page-carbon.json');
const SIZE_GRANULARITY_BYTES = 25000; 
const DELAY_MS = 10000;
const CACHE_FILE = path.join(DIST, 'carbon-cache.json');

// Load cache if exists
function loadCache() {
  if (fs.existsSync(CACHE_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
    } catch (err) { /* corrupted cache, ignore */ }
  }
  return {};
}

// Save cache
function saveCache(cache) {
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
}


function roundSize(bytes) {
  return Math.round(bytes / SIZE_GRANULARITY_BYTES) * SIZE_GRANULARITY_BYTES;
}

// Throttle requests with a delay (ms)
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function interpolateMissing(sizeToGrams) {
  // Get sizes and sort numerically
  const sizes = Object.keys(sizeToGrams).map(Number).sort((a, b) => a - b);

  // For each size with null, fill in by interpolation
  for (let i = 0; i < sizes.length; i++) {
    if (sizeToGrams[sizes[i]] === null) {
      // Find previous known
      let prevIdx = i - 1;
      while (prevIdx >= 0 && sizeToGrams[sizes[prevIdx]] === null) prevIdx--;
      // Find next known
      let nextIdx = i + 1;
      while (nextIdx < sizes.length && sizeToGrams[sizes[nextIdx]] === null) nextIdx++;
      // If both bounds exist, interpolate
      if (prevIdx >= 0 && nextIdx < sizes.length) {
        const sizeA = sizes[prevIdx], gramsA = sizeToGrams[sizeA];
        const sizeB = sizes[nextIdx], gramsB = sizeToGrams[sizeB];
        const ratio = (sizes[i] - sizeA) / (sizeB - sizeA);
        sizeToGrams[sizes[i]] = gramsA + ratio * (gramsB - gramsA);
      }
      // If only one bound exists, extrapolate
      else if (prevIdx >= 0 && nextIdx >= sizes.length) {
        sizeToGrams[sizes[i]] = sizeToGrams[sizes[prevIdx]];
      }
      else if (prevIdx < 0 && nextIdx < sizes.length) {
        sizeToGrams[sizes[i]] = sizeToGrams[sizes[nextIdx]];
      }
      // Else, leave as null (unfillable)
    }
  }
  return sizeToGrams;
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

// API call with enhanced error handling
async function getCarbonGrams(bytes, green = 0, retryCount = 0) {
  try {
    const url = `https://api.websitecarbon.com/data?bytes=${bytes}&green=${green}`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/115.0.0.0 Safari/537.36'
      }
    });

    // If the response is not OK, or not application/json, get text and log
    const contentType = res.headers.get("content-type") || "";
    if (!res.ok || !contentType.includes("application/json")) {
      const text = await res.text();
      console.error(`Carbon API HTTP error [size ${bytes}]: ${res.status}\nContent-Type: ${contentType}\nMessage: ${text.slice(0, 120)}...`);
      // Optionally retry on 429 (rate limit)
      if (res.status === 429 && retryCount < 3) {
        await delay(2000);
        return await getCarbonGrams(bytes, green, retryCount + 1);
      }
      return null;
    }

    // Now it's safe to parse JSON
    let json;
    try {
      json = await res.json();
    } catch (e) {
      const text = await res.text();
      console.error(`Carbon API response for size ${bytes} failed JSON parse. Content-Type: ${contentType}\nSample: ${text.slice(0, 100)}...`);
      return null;
    }

    return json?.statistics?.co2?.grid?.grams ?? null;
  } catch (err) {
    console.error('Carbon API error for', bytes, err);
    if (retryCount < 3) {
      await delay(1000);
      return await getCarbonGrams(bytes, green, retryCount + 1);
    }
    return null;
  }
}

async function main() {
  const htmlFiles = walk(DIST);
  const routeCarbon = {};
  const sizeToRoutes = {}; // {roundedSize: [route1, route2, ...]}
  const routeSize = {};    // {route: roundedSize}

  // Load previous cache
  const sizeToGramsCache = loadCache();

  // Find all rounded sizes needed
  const allSizes = new Set();
  
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
    allSizes.add(roundedSize);
  }

  // 2. Query API for EACH unique rounded size, with error checks
  // Query API only for sizes not in cache
  for (const size of allSizes) {
    if (!(size in sizeToGramsCache)) {
      const grams = await getCarbonGrams(Number(size));
      sizeToGramsCache[size] = grams;
      await delay(DELAY_MS);
      console.log(`Rounded size: ${size} | grams: ${grams}`);
    }
  }

  interpolateMissing(sizeToGramsCache);

  // Save updated cache for next run
  saveCache(sizeToGramsCache);

  // 3. Map results back to routes (use cache!)
  for (const route in routeSize) {
    const roundedSize = routeSize[route];
    routeCarbon[route] = sizeToGramsCache[roundedSize] ?? '--';
  }

  fs.writeFileSync(OUTPUT, JSON.stringify(routeCarbon, null, 2));
  console.log('Generated page-carbon.json:', routeCarbon);
}

main();