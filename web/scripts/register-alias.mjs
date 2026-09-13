// Registers the "@/" alias hook so Node can run src/lib and src/data TypeScript
// directly under its built-in type stripping, the way the export scripts do.
// Used by `npm test` (see package.json), which passes the test glob after it.
import { register } from "node:module";

register("./resolve-at-alias.mjs", import.meta.url);
