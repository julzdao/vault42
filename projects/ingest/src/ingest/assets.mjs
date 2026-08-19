import fs from "node:fs";
import path from "node:path";
import { ASSETS_FOLDER_NAME, PUBLIC_GENERATED_FOLDER } from "./constants.mjs";
import { log } from "./logger.mjs";
import { skipEntry } from "./file-system.mjs";

const AUDIO_EXT = new Set(['.mp3', '.wav', '.ogg', '.m4a', '.flac', '.aac']);
const IMAGE_EXT = new Set(['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp']);


export function mirrorVaultAssets(dir, relBase = "") {
  log("STEP 1 :: mirrorVaultAssets - LOOKING FOR ASSETS");
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for(const entry of entries) {
    log("Iterating through entries for assets of entry = " + entry.name);
    if(skipEntry(entry)) {
      log("---Skipping entry!---")
      continue;
    }

    const absolutePath = path.join(dir, entry.name);
    const relativePath = relBase ? path.join(relBase, entry.name) : entry.name;

    if (entry.isDirectory()) {
      if(entry.name.toLowerCase() === ASSETS_FOLDER_NAME) {
        log("FOUND ONE ASSETS DIRECTORY");

        copyAssetsDirectory(absolutePath, relativePath);
        continue;
      } 

      mirrorVaultAssets(absolutePath, relativePath);
      continue;
    }
  }
}

function copyAssetsDirectory(absolutePath, relativePath) {
  const assets = fs.readdirSync(absolutePath, { withFileTypes: true });

  const destinationDir = path.join(PUBLIC_GENERATED_FOLDER, relativePath);
  // Mirror assets folder structure inside public/generated before copying
  fs.mkdirSync(destinationDir, {recursive: true});

  // copy all assets inside assets dir
  fs.cpSync(absolutePath, destinationDir, {
      recursive: true
  });
}

/* 
 * Gets the type of an asset file, based on the extension format.
 * Currently only checking for AUDIO or IMAGE extensions.
*/
export function getAssetType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (AUDIO_EXT.has(ext)) return 'audio';
  if (IMAGE_EXT.has(ext)) return 'image';
  return 'unknown';
}