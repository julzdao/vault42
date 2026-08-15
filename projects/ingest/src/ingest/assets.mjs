import fs from "node:fs";
import path from "node:path";
import { ASSETS_FOLDER_NAME, PUBLIC_GENERATED_FOLDER } from "./constants.mjs";
import { log } from "./logger.mjs";
import { skipEntry } from "./file-system.mjs";


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