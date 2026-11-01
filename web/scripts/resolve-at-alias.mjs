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
    // A directory import ("@/strings") resolves to its index module, as the bundler does.
    if (fs.existsSync(p) && fs.statSync(p).isDirectory()) {
      for (const index of ["index.ts", "index.tsx"]) {
        if (fs.existsSync(path.join(p, index))) {
          p = path.join(p, index);
          break;
        }
      }
    }
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
