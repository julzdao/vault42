import { DEBUG } from "./config.mjs";

export function log(message) {
  if (DEBUG) {
    console.log(message);
  }
}