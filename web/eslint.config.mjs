import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  // Metadata image routes render through Satori's ImageResponse, where next/image cannot be used.
  // The plugin's own exemption for these routes only matches POSIX paths, so disable it here uniformly.
  {
    files: ["src/app/**/opengraph-image.tsx", "src/app/**/twitter-image.tsx"],
    rules: {
      "@next/next/no-img-element": "off",
    },
  },
]);

export default eslintConfig;
