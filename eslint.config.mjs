import eslint from "@eslint/js";
import prettier from "eslint-config-prettier";
import typescript from "typescript-eslint";

export default typescript.config(
  {
    ignores: [
      "**/dist/**",
      "**/node_modules/**",
      ".turbo/**",
      "**/.next/**",
      "**/.agents/**",
      "**/next-env.d.ts",
    ],
  },
  eslint.configs.recommended,
  ...typescript.configs.recommended,
  prettier,
);
