#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { SKIP_DIRS, ASSETS_FOLDER_NAME, GENERATED_FOLDER, PUBLIC_GENERATED_FOLDER, SLASH } from "./ingest/constants.mjs";
import { mirrorVaultAssets } from "./ingest/assets.mjs";
import { log } from "./ingest/logger.mjs";
import { parseFrontmatter, parseCoverProperty, removeSquareBrackets } from "./ingest/parser.mjs";
import { findMarkdownFiles } from "./ingest/file-system.mjs";
import { slugify, makeNoteHref, isExternalHref, normalizeLinkValue, resolveNoteSlug, extractLinks } from "./ingest/links.mjs";
import { sanitizeSegment, markdownToHtml, extractFundamental } from "./ingest/markdown.mjs";
import { contextSnippet, expandedContext } from "./ingest/context-snippet.mjs";

const CONFIG_FLAG = "--config";

// Step 0 : Config Vault Path
const args = process.argv.slice(2);
const hasConfigFlag = args.includes(CONFIG_FLAG);

if(!hasConfigFlag) {
  console.error("[ERROR] --config flag is not set. Please consider adding it to your command line arguments before adding path to vault42.ingest.config.local json.");
  process.exit(1);
}

const configFlagIndex = args.indexOf(CONFIG_FLAG);

var ingestLocalJsonConfig = JSON.parse(fs.readFileSync(args[configFlagIndex + 1], 'utf8'));
const vaultPath = ingestLocalJsonConfig.vaultPath;

if (!vaultPath) {
  console.error("[ERROR] Vault path config missing. Usage: 1. Create a 'vault42.ingest.local.json' file and add 'vaultPath' property with the value for your obsidian vault path. 2. npm run ingest:vault");
  process.exit(1);
}

const resolvedVault = path.resolve(vaultPath);
if (!fs.existsSync(resolvedVault)) {
  console.error(`[ERROR] Vault path not found: ${resolvedVault}`);
  process.exit(1);
}

const projectRoot = path.resolve(process.cwd());
const notesOutDir = path.join(projectRoot, "content", "notes");
const indexOutPath = path.join(projectRoot, "content", "index.json");

fs.rmSync(notesOutDir, { recursive: true, force: true });
fs.mkdirSync(notesOutDir, { recursive: true });

/** Similar to NoteRecord Type */
const notes = [];

/** @type {Map<string, string>} */
export const titleToSlug = new Map();
/** @type {Map<string, string>} */
export const pathToSlug = new Map();

// Step 1 - mirror assets
mirrorVaultAssets(resolvedVault);

// Step 2 - find markdown files
const markdownFiles = findMarkdownFiles(resolvedVault);

for (const file of markdownFiles) {
  const sourceContent = fs.readFileSync(file.fullPath, "utf8");
  const { frontmatter, body } = parseFrontmatter(sourceContent);
  const posixRelative = file.relative.split(path.sep).join("/");
  const segments = posixRelative.split("/").map(sanitizeSegment).filter(Boolean);

  const notebook = segments[0] || "General";
  const titleFallback = path.basename(posixRelative, ".md");
  const title =
    typeof frontmatter.title === "string" && frontmatter.title.trim()
      ? frontmatter.title.trim()
      : titleFallback;
  const slug = slugify(posixRelative);

  const outPath = path.join(notesOutDir, ...segments);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, sourceContent, "utf8");

  const note = {
    id: slug,
    slug,
    title,
    description: typeof frontmatter.description === "string" ? frontmatter.description : undefined,
    type: typeof frontmatter.type === "string" ? frontmatter.type : undefined,
    createdAt: typeof frontmatter.timestamp === "string" ? frontmatter.timestamp : undefined,
    tags: Array.isArray(frontmatter.tags) ? frontmatter.tags : [],
    stage: Array.isArray(frontmatter.stage)
      ? frontmatter.stage
      : typeof frontmatter.stage === "string" && frontmatter.stage
        ? [frontmatter.stage]
        : [],
    notebook,
    relativePath: posixRelative,
    links: [],
    backlinks: [],
    rawContent: body,
    htmlContent: "",
    coverImage: parseCoverProperty(frontmatter.cover, segments),
    hasFundamental: frontmatter.hasFundamental,
    fundamental: ""
  };

  notes.push(note);
  titleToSlug.set(title.toLowerCase(), slug);
  titleToSlug.set(titleFallback.toLowerCase(), slug);
  pathToSlug.set(slug, slug);
  pathToSlug.set(posixRelative.toLowerCase().replace(/\.md$/i, ""), slug);
}

for (const note of notes) {
  const extracted = extractLinks(note.rawContent);
  const unique = new Set();

  for (const link of extracted) {
    const targetSlug = resolveNoteSlug(link.value, note.relativePath);

    if (!targetSlug || targetSlug === note.slug || unique.has(targetSlug)) {
      continue;
    }

    unique.add(targetSlug);
    note.links.push(targetSlug);

    const target = notes.find((n) => n.slug === targetSlug);
    if (!target) {
      continue;
    }

    target.backlinks.push({
      fromSlug: note.slug,
      fromTitle: note.title,
      context: contextSnippet(note.rawContent, link.index),
      hoverContext: expandedContext(note.rawContent, link.index),
    });
  }
}

// Step 3: parse markdown to html

for (const note of notes) {
  var remainingContent = note.rawContent;
  if (note.hasFundamental) {
    const [extractedFundamental, remainingMarkdown] = extractFundamental(note.rawContent, note.relativePath);

    if (extractedFundamental == null) {
      log.warn(`hasFundamental is set but no divider found in ${note.relativePath} — skipping extraction`);
    }

    note.fundamental = extractedFundamental ?? undefined;
    remainingContent = remainingMarkdown;
  }
  note.htmlContent = markdownToHtml(remainingContent, note.relativePath); 
}

const notebooks = Array.from(new Set(notes.map((n) => n.notebook))).sort((a, b) =>
  a.localeCompare(b),
);

const output = {
  generatedAt: new Date().toISOString(),
  notebooks,
  notes: notes.sort((a, b) => a.relativePath.localeCompare(b.relativePath)),
};

fs.writeFileSync(indexOutPath, JSON.stringify(output, null, 2), "utf8");

console.log(`Parsed ${notes.length} notes from ${resolvedVault}`);
console.log(`Wrote markdown files to ${notesOutDir}`);
console.log(`Wrote index to ${indexOutPath}`);
