import { defineConfig, globalIgnores } from "eslint/config";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier/flat";

export default defineConfig([
  ...nextCoreWebVitals,
  ...nextTypeScript,
  prettier,
  globalIgnores([
    ".next/**",
    "coverage/**",
    "next-env.d.ts",
    "src/types/database.generated.ts",
    // My Room is retained as paused legacy code and is not part of the launch UI.
    "src/features/profiles/profile-room.tsx",
  ]),
]);
