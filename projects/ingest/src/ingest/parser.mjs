import path from "node:path";
import { GENERATED_FOLDER, ASSETS_FOLDER_NAME, SLASH} from "./constants.mjs";


export function parseFrontmatter(markdown) {
  if (!markdown.startsWith("---\n") && !markdown.startsWith("---\r\n")) {
    return { frontmatter: {}, body: markdown };
  }

  const lines = markdown.split(/\r?\n/);
  if (lines[0].trim() !== "---") {
    return { frontmatter: {}, body: markdown };
  }

  let endIndex = -1;
  for (let i = 1; i < lines.length; i += 1) {
    if (lines[i].trim() === "---") {
      endIndex = i;
      break;
    }
  }

  if (endIndex === -1) {
    return { frontmatter: {}, body: markdown };
  }

  const frontmatter = {};
  const fmLines = lines.slice(1, endIndex);

  for (let i = 0; i < fmLines.length; i += 1) {
    const line = fmLines[i];
    const keyMatch = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!keyMatch) {
      continue;
    }

    const key = keyMatch[1];
    const inlineValue = keyMatch[2]?.trim() || "";

    if (inlineValue) {
      frontmatter[key] = inlineValue.replace(/^['"]|['"]$/g, "");
      continue;
    }

    const listValues = [];
    let j = i + 1;
    while (j < fmLines.length) {
      const listMatch = fmLines[j].match(/^\s*-\s+(.+)$/);
      if (!listMatch) {
        break;
      }
      listValues.push(listMatch[1].trim().replace(/^['"]|['"]$/g, ""));
      j += 1;
    }

    if (listValues.length > 0) {
      frontmatter[key] = listValues;
      i = j - 1;
    } else {
      frontmatter[key] = "";
    }
  }

  const body = lines.slice(endIndex + 1).join("\n").trimStart();
  return { frontmatter, body };
}

export function parseCoverProperty(coverPropertyValue, segments) {
  if (typeof coverPropertyValue !== "string" || coverPropertyValue.trim() === "") {
    return undefined; 
  }

  const coverFileName = removeSquareBrackets(coverPropertyValue);

  const relativeDirectory = segments
    .slice(0, -1) // Remove file name 
    .join(SLASH); // join the notebookes / category segments

  return path.join(
    GENERATED_FOLDER,
    relativeDirectory,
    ASSETS_FOLDER_NAME,
    coverFileName,
  );
}

export function removeSquareBrackets(str) {
  return str
    .replace('[[', '')
    .replace(']]', '');
}