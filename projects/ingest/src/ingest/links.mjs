import fs from "node:fs";
import path from "node:path";

import { titleToSlug, pathToSlug } from "../ingest-vault.mjs";

export function slugify(input) {
  return input
    .toLowerCase()
    .replace(/\\/g, "/")
    .replace(/\.md$/i, "")
    .replace(/[^a-z0-9/\-\s_]/g, "")
    .replace(/\s+/g, "-")
    .replace(/\/+/g, "/");
}

export function makeNoteHref(slug) {
  return `/?note=${encodeURIComponent(slug)}`;
}

export function isExternalHref(value) {
  return /^(?:[a-z]+:)?\/\//i.test(value) || value.startsWith("mailto:");
}


export function normalizeLinkValue(value) {
  return value
    .trim()
    .replace(/\\/g, "/")
    .replace(/\.md$/i, "")
    .split("#")[0]
    .replace(/^\/+/, "");
}

export function resolveNoteSlug(value, fromRelativePath = "") {
  const normalized = normalizeLinkValue(value);
  if (!normalized) {
    return undefined;
  }

  const fromDir = path.posix.dirname(fromRelativePath.toLowerCase());
  const resolvedRelative = normalized.startsWith(".")
    ? path.posix.normalize(path.posix.join(fromDir, normalized))
    : normalized.toLowerCase();

  const basename = path.posix.basename(normalized.toLowerCase());

  return (
    pathToSlug.get(normalized.toLowerCase()) ||
    pathToSlug.get(resolvedRelative) ||
    titleToSlug.get(normalized.toLowerCase()) ||
    titleToSlug.get(basename)
  );
}

export function extractLinks(markdown) {
  const links = [];

  const wikiRegex = /\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g;
  for (const match of markdown.matchAll(wikiRegex)) {
    const value = match[1]?.trim();
    if (value) {
      links.push({ value, index: match.index ?? 0, source: "wiki" });
    }
  }

  const mdRegex = /\[[^\]]+\]\(([^)]+)\)/g;
  for (const match of markdown.matchAll(mdRegex)) {
    const value = match[1]?.trim();
    if (!value || value.startsWith("http://") || value.startsWith("https://") || value.startsWith("#")) {
      continue;
    }
    links.push({ value, index: match.index ?? 0, source: "md" });
  }

  return links;
}

