/**
 * Node module-resolution hook mapping the tsconfig "@/*" alias to web/src,
 * so the export scripts can run the TS data modules directly under Node's
 * type stripping. Registered via module.register() by the export scripts.
 */
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";
import fs from "node:fs";

const SRC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../src");

export function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith("@/")) {
    let p = path.join(SRC, specifier.slice(2));
    if (!fs.existsSync(p)) {
      for (const ext of [".ts", ".tsx"]) {
        if (fs.existsSync(p + ext)) {
          p += ext;
          break;
        }
      }
    }
    return nextResolve(pathToFileURL(p).href, context);
  }
  return nextResolve(specifier, context);
}
