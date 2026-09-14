// Content validation linter
// Validates markdown frontmatter against Zod schemas and checks file references
//
// Usage:
//   npm run lint:content   - Check src/vault-content (synced content)
//   npm run lint:vault     - Check Obsidian vault directly (requires OBSIDIAN_VAULT_PATH env var)
//   Add --check-links to also verify external URLs in FILE_REFERENCE_FIELDS
//   (e.g. book_cover, link_to_source) are actually reachable. Off by default:
//   it's a live network check across every published note, so it's slow and
//   can be flaky offline or under rate limiting.

import { readdir, readFile, stat } from "fs/promises";
import { existsSync } from "fs";
import { join, dirname, relative, resolve, extname } from "path";
import { fileURLToPath } from "url";
import matter from "gray-matter";
import { z } from "zod";
import { isHidden, isMd, FILE_REFERENCE_FIELDS } from "./shared/file-helpers.js";

import {
  artworkSchema,
  atwSchema,
  gratitudeSchema,
  mediaSchema,
  notebookSchema,
  quoteSchema,
  researchSchema,
} from "../lib/schemas.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Parse CLI args
const args = process.argv.slice(2);
const isVaultMode = args.includes("--vault");
const isQuiet = args.includes("--quiet");
const isVerbose = args.includes("--verbose");
const isCheckLinks = args.includes("--check-links");

// Determine source directory
let SOURCE_ROOT;
if (isVaultMode) {
  const vaultPath = process.env.OBSIDIAN_VAULT_PATH;
  if (!vaultPath) {
    console.error(
      "ERROR: OBSIDIAN_VAULT_PATH environment variable is not set.",
    );
    console.error(
      "Set it in your .env file or shell profile to use --vault mode.",
    );
    process.exit(1);
  }
  // Expand ~ to home directory
  SOURCE_ROOT = vaultPath.replace(/^~/, process.env.HOME);
  if (!existsSync(SOURCE_ROOT)) {
    console.error(`ERROR: Vault path does not exist: ${SOURCE_ROOT}`);
    process.exit(1);
  }
} else {
  SOURCE_ROOT = join(__dirname, "../vault-content");
}

const COLLECTIONS_ROOT = join(SOURCE_ROOT, "300-collections");

// Collection path patterns mapped to schemas
// Order matters - more specific paths should come first
const COLLECTION_MAPPINGS = [
  {
    pattern: "portfolio/artwork",
    schema: artworkSchema,
    name: "artwork",
    depth: "flat",
  },
  {
    pattern: "portfolio/design",
    schema: artworkSchema,
    name: "design",
    depth: "flat",
  },
  {
    pattern: "portfolio/research",
    schema: researchSchema,
    name: "research",
    depth: "flat",
  },
  {
    pattern: "media/around-the-world",
    schema: atwSchema,
    name: "atw",
    depth: "flat",
  },
  { pattern: "media", schema: mediaSchema, name: "media", depth: "flat" },
  { pattern: "journal", schema: notebookSchema, name: "notebook", depth: "flat" },
  {
    pattern: "gratitudes",
    schema: gratitudeSchema,
    name: "gratitudes",
    depth: "recursive",
  },
  { pattern: "quotes", schema: quoteSchema, name: "quotes", depth: "recursive" },
];

// Track results
const results = {
  total: 0,
  validated: 0,
  skipped: 0,
  errors: [],
  warnings: [],
};

// Helpers
const isUrl = (str) => /^https?:\/\//i.test(str);

// --check-links: cache results per URL since the same cover/source link can
// appear on more than one note.
const urlCheckCache = new Map();
const BROWSER_USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";

async function checkUrl(url) {
  if (urlCheckCache.has(url)) return urlCheckCache.get(url);

  const attempt = async (method) =>
    fetch(url, {
      method,
      redirect: "follow",
      headers: { "User-Agent": BROWSER_USER_AGENT },
      signal: AbortSignal.timeout(8000),
    });

  // { message, type } or null if reachable
  let result = null;
  try {
    // Some hosts (e.g. hotlink-protected CDNs) reject HEAD but allow GET.
    let res = await attempt("HEAD");
    if (!res.ok) res = await attempt("GET");
    if (res.status === 403) {
      // Ambiguous: could be a genuinely dead/hotlink-protected resource
      // (confirmed by a real browser also getting 403), or a site that
      // blocks datacenter IPs / bots regardless of UA (e.g. nytimes.com) —
      // that class isn't actually broken for a real visitor. Flag, don't fail.
      result = {
        message: `got HTTP 403 — could be bot-blocking (e.g. news sites) rather than a dead link; check manually`,
        type: "warning",
      };
    } else if (!res.ok) {
      result = { message: `HTTP ${res.status}`, type: "error" };
    }
  } catch (e) {
    result = { message: `request failed (${e.message})`, type: "error" };
  }

  urlCheckCache.set(url, result);
  return result;
}

async function walk(dir, base, depth = "recursive", out = []) {
  if (!existsSync(dir)) return out;

  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (isHidden(entry.name)) continue;

    const abs = join(dir, entry.name);
    const rel = relative(base, abs);

    if (entry.isDirectory()) {
      if (depth === "recursive") {
        await walk(abs, base, depth, out);
      }
    } else if (isMd(entry.name)) {
      out.push({ abs, rel });
    }
  }

  return out;
}

function getCollectionForPath(relPath) {
  for (const mapping of COLLECTION_MAPPINGS) {
    if (relPath.startsWith(mapping.pattern + "/")) {
      // For "flat" collections, only match files directly in that directory
      if (mapping.depth === "flat") {
        const subPath = relPath.slice(mapping.pattern.length + 1);
        // Should not contain another slash (i.e., file is directly in the directory)
        if (!subPath.includes("/")) {
          return mapping;
        }
      } else {
        return mapping;
      }
    }
  }
  return null;
}

async function checkFileReferences(frontmatter, fileDir) {
  const issues = [];

  for (const field of FILE_REFERENCE_FIELDS) {
    const value = frontmatter[field];
    if (!value) continue;

    const paths = Array.isArray(value) ? value : [value];

    for (const p of paths) {
      if (typeof p !== "string") continue;

      if (isUrl(p)) {
        if (!isCheckLinks) continue; // Only hit the network when asked
        const result = await checkUrl(p);
        if (result) {
          issues.push({
            field,
            message: `Broken link (${result.message}): '${p}'`,
            type: result.type,
          });
        }
        continue;
      }

      if (p.startsWith("/")) continue; // Skip absolute paths (public assets)

      // Try resolving relative to vault root first (e.g., "300-collections/...")
      // Then fall back to relative to the file's directory
      let resolved = resolve(SOURCE_ROOT, p);
      if (!existsSync(resolved)) {
        resolved = resolve(fileDir, p);
      }

      if (!existsSync(resolved)) {
        issues.push({
          field,
          message: `Referenced file does not exist: '${p}'`,
          type: "error",
        });
      }
    }
  }

  return issues;
}

function formatZodError(error) {
  return error.errors.map((e) => {
    const path = e.path.join(".");
    let message = e.message;

    if (e.code === "invalid_enum_value") {
      message = `Invalid enum value. Expected ${e.options.map((o) => `'${o}'`).join(" | ")}, received '${e.received}'`;
    } else if (e.code === "invalid_type") {
      message = `Expected ${e.expected}, received ${e.received}`;
    }

    return { field: path || "(root)", message, type: "error" };
  });
}

async function validateFile(abs, rel, collection) {
  const raw = await readFile(abs, "utf8");
  let parsed;

  try {
    parsed = matter(raw);
  } catch (e) {
    return [{ field: "(frontmatter)", message: `Failed to parse: ${e.message}`, type: "error" }];
  }

  const frontmatter = parsed.data;

  // Only validate files with publish: true
  if (frontmatter.publish !== true) {
    results.skipped++;
    return null; // null means skipped, not published
  }

  const issues = [];

  // Validate against schema
  const result = collection.schema.safeParse(frontmatter);
  if (!result.success) {
    issues.push(...formatZodError(result.error));
  }

  // Check file references
  const fileIssues = await checkFileReferences(frontmatter, dirname(abs));
  issues.push(...fileIssues);

  return issues;
}

async function main() {
  console.log(`\nValidating content in: ${COLLECTIONS_ROOT}\n`);
  if (isCheckLinks) {
    console.log("Checking external links too (--check-links) — this hits the network and will take a while.\n");
  }

  if (!existsSync(COLLECTIONS_ROOT)) {
    console.error(`ERROR: Collections directory not found: ${COLLECTIONS_ROOT}`);
    process.exit(1);
  }

  // Walk each collection directory
  for (const mapping of COLLECTION_MAPPINGS) {
    const collectionDir = join(COLLECTIONS_ROOT, mapping.pattern);
    if (!existsSync(collectionDir)) {
      if (isVerbose) {
        console.log(`  Skipping ${mapping.name}: directory not found`);
      }
      continue;
    }

    const files = await walk(collectionDir, collectionDir, mapping.depth);

    for (const { abs, rel } of files) {
      results.total++;
      const relFromCollections = join(mapping.pattern, rel);

      const issues = await validateFile(abs, relFromCollections, mapping);

      if (issues === null) {
        // Skipped (unpublished)
        if (isVerbose) {
          console.log(`  SKIP: ${relFromCollections} (publish: false)`);
        }
        continue;
      }

      results.validated++;

      if (issues.length > 0) {
        const errors = issues.filter((i) => i.type === "error");
        const warnings = issues.filter((i) => i.type === "warning");

        if (errors.length > 0) {
          results.errors.push({ file: relFromCollections, issues: errors });
        }
        if (warnings.length > 0) {
          results.warnings.push({ file: relFromCollections, issues: warnings });
        }
      } else if (isVerbose) {
        console.log(`  ✓ ${relFromCollections}`);
      }
    }
  }

  // Output results
  console.log("");

  for (const { file, issues } of results.errors) {
    console.log(`ERROR: ${file}`);
    for (const issue of issues) {
      console.log(`  - Field '${issue.field}': ${issue.message}`);
    }
    console.log("");
  }

  for (const { file, issues } of results.warnings) {
    console.log(`WARNING: ${file}`);
    for (const issue of issues) {
      console.log(`  - Field '${issue.field}': ${issue.message}`);
    }
    console.log("");
  }

  // Summary
  const errorCount = results.errors.reduce((sum, e) => sum + e.issues.length, 0);
  const warningCount = results.warnings.reduce((sum, w) => sum + w.issues.length, 0);

  if (errorCount === 0 && warningCount === 0) {
    console.log(
      `✓ ${results.validated} files validated, ${results.skipped} skipped (unpublished)`,
    );
    process.exit(0);
  } else {
    console.log(
      `✗ ${errorCount} error${errorCount !== 1 ? "s" : ""}, ${warningCount} warning${warningCount !== 1 ? "s" : ""} in ${results.validated} files`,
    );
    process.exit(errorCount > 0 ? 1 : 0);
  }
}

main().catch((e) => {
  console.error("Unexpected error:", e);
  process.exit(1);
});
