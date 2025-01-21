import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import pluginReactHooks from "eslint-plugin-react-hooks";
import pluginNextJs from "@next/eslint-plugin-next";
import pluginTailwind from "eslint-plugin-tailwindcss";

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true
        }
      }
    },
    plugins: {
      "@typescript-eslint": tseslint.plugin,
      "react": pluginReact,
      "react-hooks": pluginReactHooks,
      "@next/next": pluginNextJs,
      "tailwindcss": pluginTailwind
    },
    rules: {
      // TypeScript strict rules
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/explicit-function-return-type": ["error", { allowExpressions: true }],
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      
      // React best practices
      "react/prop-types": "off", // We use TypeScript for props validation
      "react/react-in-jsx-scope": "off", // Not needed in Next.js
      "react/jsx-filename-extension": ["error", { extensions: [".tsx"] }],
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      
      // Next.js rules
      "@next/next/no-html-link-for-pages": "error",
      "@next/next/no-img-element": "error",
      
      // General code style
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "prefer-const": "error",
      "no-var": "error",
      "eqeqeq": ["error", "always"],
      
      // Tailwind
      "tailwindcss/no-custom-classname": "warn",
      "tailwindcss/enforces-shorthand": "warn"
    }
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  pluginReact.configs.recommended
];