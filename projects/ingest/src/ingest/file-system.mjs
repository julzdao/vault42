import fs from "node:fs";
import path from "node:path";
import { SKIP_DIRS } from "./constants.mjs";


export function findMarkdownFiles(dir, relBase = "") {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.name.startsWith(".")) {
      if (!SKIP_DIRS.has(entry.name)) {
        continue;
      }
      if (SKIP_DIRS.has(entry.name)) {
        continue;
      }
    }

    if (SKIP_DIRS.has(entry.name)) {
      continue;
    }

    const fullPath = path.join(dir, entry.name);
    const relative = relBase ? path.join(relBase, entry.name) : entry.name;

    if (entry.isDirectory()) {
      files.push(...findMarkdownFiles(fullPath, relative));
      continue;
    }

    if (entry.isFile() && entry.name.toLowerCase().endsWith(".md")) {
      files.push({ fullPath, relative });
    }
  }

  return files;
}

export function skipEntry(entry) {
  if (entry.name.startsWith(".")) {
      if (!SKIP_DIRS.has(entry.name)) {
        return true;
      }
      if (SKIP_DIRS.has(entry.name)) {
        return true;
      }
  }

  if (SKIP_DIRS.has(entry.name)) {
    return true;
  }

  return false;
}