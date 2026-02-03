import fs from "fs";
import path from "path";
import { JSDOM } from "jsdom";

const DIST = "dist";
const OUTPUT = path.join(DIST, "page-carbon.json");

/**
 * Calculate CO2 emissions in grams based on page size.
 * Formula based on websitecarbon.com methodology:
 * https://www.websitecarbon.com/how-does-it-work/
 *
 * @param {number} bytes - Page size in bytes
 * @param {boolean} green - Whether hosted on green energy (reduces by ~67%)
 * @returns {number} CO2 in grams
 */
function calculateCarbonGrams(bytes, green = false) {
  const KWH_PER_GB = 0.81;
  const CARBON_PER_KWH = 442; // grams CO2 (grid average)
  const GREEN_FACTOR = green ? 0.33 : 1;
  const BYTES_PER_GB = 1e9;

  return (bytes / BYTES_PER_GB) * KWH_PER_GB * CARBON_PER_KWH * GREEN_FACTOR;
}

function walk(dir, filelist = []) {
  fs.readdirSync(dir).forEach((file) => {
    const full = path.join(dir, file);
    if (fs.statSync(full).isDirectory()) {
      walk(full, filelist);
    } else if (full.endsWith(".html")) {
      filelist.push(full);
    }
  });
  return filelist;
}

function fileToRoute(file) {
  let rel = path.relative(DIST, file);
  if (rel === "index.html") return "/";
  if (rel.endsWith("index.html")) rel = rel.replace(/index\.html$/, "");
  if (!rel.startsWith("/")) rel = "/" + rel;
  return rel;
}

function assetPath(assetUrl) {
  if (!assetUrl || assetUrl.startsWith("http")) return null;
  let local = assetUrl.replace(/^\//, "");
  return path.join(DIST, local);
}

function main() {
  const htmlFiles = walk(DIST);
  const routeCarbon = {};

  for (const file of htmlFiles) {
    let totalSize = fs.statSync(file).size;
    const html = fs.readFileSync(file, "utf-8");
    const dom = new JSDOM(html);

    // Find asset URLs (CSS, JS, images)
    const assetUrls = [];
    dom.window.document.querySelectorAll("link[href]").forEach((link) => {
      assetUrls.push(link.getAttribute("href"));
    });
    dom.window.document.querySelectorAll("script[src]").forEach((script) => {
      assetUrls.push(script.getAttribute("src"));
    });
    dom.window.document.querySelectorAll("img[src]").forEach((img) => {
      assetUrls.push(img.getAttribute("src"));
    });
    dom.window.document.querySelectorAll("source[srcset]").forEach((source) => {
      const srcset = source.getAttribute("srcset");
      if (srcset) assetUrls.push(srcset.split(",")[0].trim().split(" ")[0]);
    });

    // Add sizes for each asset
    for (const url of assetUrls) {
      const assetFile = assetPath(url);
      if (assetFile && fs.existsSync(assetFile)) {
        totalSize += fs.statSync(assetFile).size;
      }
    }

    const route = fileToRoute(file);
    const grams = calculateCarbonGrams(totalSize);
    routeCarbon[route] = grams;
  }

  fs.writeFileSync(OUTPUT, JSON.stringify(routeCarbon, null, 2));
  console.log(`Generated page-carbon.json for ${Object.keys(routeCarbon).length} pages`);
}

main();
