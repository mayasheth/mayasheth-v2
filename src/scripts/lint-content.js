// Content validation linter
// Validates markdown frontmatter against Zod schemas and checks file references
//
// Usage:
//   npm run lint:content   - Check src/vault-content (synced content)
//   npm run lint:vault     - Check Obsidian vault directly (requires OBSIDIAN_VAULT_PATH env var)

import { readdir, readFile, stat } from "fs/promises";
import { existsSync } from "fs";
import { join, dirname, relative, resolve, extname } from "path";
import { fileURLToPath } from "url";
import matter from "gray-matter";
import { z } from "zod";

// Import schemas from your existing definitions
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

// Frontmatter fields that reference files
const FILE_REFERENCE_FIELDS = [
  "image",
  "images",
  "banner",
  "cover",
  "thumbnail",
  "hero",
  "gallery",
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
const isHidden = (name) => name.startsWith(".");
const isMd = (path) => /\.md$/i.test(path);
const isUrl = (str) => /^https?:\/\//i.test(str);

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

function checkFileReferences(frontmatter, fileDir) {
  const issues = [];

  for (const field of FILE_REFERENCE_FIELDS) {
    const value = frontmatter[field];
    if (!value) continue;

    const paths = Array.isArray(value) ? value : [value];

    for (const p of paths) {
      if (typeof p !== "string") continue;
      if (isUrl(p)) continue; // Skip URLs
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
  const fileIssues = checkFileReferences(frontmatter, dirname(abs));
  issues.push(...fileIssues);

  return issues;
}

async function main() {
  console.log(`\nValidating content in: ${COLLECTIONS_ROOT}\n`);

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
