import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // R3F / three.js mutate scene objects imperatively inside useFrame — that is the
    // intended pattern and must not trigger re-renders.
    files: ["components/three/**", "components/hero/**", "components/products/ViewerCanvas.tsx"],
    rules: { "react-hooks/immutability": "off" },
  },
  {
    // Reading browser-only values (URL params, device capabilities) after hydration
    // requires a post-mount setState to keep server and client markup identical.
    rules: { "react-hooks/set-state-in-effect": "off" },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "public/**",
  ]),
]);

export default eslintConfig;
