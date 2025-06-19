import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      semi: `off`,
      [`prefer-const`]: `off`,
      [`no-extra-semi`]: `off`,
      [`@typescript-eslint/no-extra-semi`]: `off`,
      [`@typescript-eslint/no-unused-vars`]: `off`,
      [`@typescript-eslint/no-explicit-any`]: `off`,
      [`@typescript-eslint/no-empty-function`]: `off`,
      [`@typescript-eslint/no-inferrable-types`]: `off`,
      [`@typescript-eslint/no-unused-expressions`]: `off`,
      [`@typescript-eslint/no-duplicate-enum-values`]: `off`,
    },
  },
];

export default eslintConfig;