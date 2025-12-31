import js from "@eslint/js"
import vue from "eslint-plugin-vue"
import typescript from "@typescript-eslint/eslint-plugin"
import typescriptParser from "@typescript-eslint/parser"
import vueParser from "vue-eslint-parser"
import prettier from "eslint-config-prettier"

export default [
    js.configs.recommended,
    ...vue.configs["flat/recommended"],
    {
        files: ["**/*.{js,ts}"],
        languageOptions: {
            parser: typescriptParser,
            parserOptions: {
                ecmaVersion: "latest",
                sourceType: "module",
            },
            globals: {
                process: "readonly",
                console: "readonly",
                setTimeout: "readonly",
                clearTimeout: "readonly",
                __dirname: "readonly",
                global: "readonly",
                Buffer: "readonly",
            },
        },
        plugins: {
            "@typescript-eslint": typescript,
        },
        rules: {
            "no-console": "off",
            "no-debugger": "off",
            "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
            "no-undef": "off",
        },
    },
    {
        files: ["**/*.vue"],
        languageOptions: {
            parser: vueParser,
            parserOptions: {
                parser: typescriptParser,
                ecmaVersion: "latest",
                sourceType: "module",
            },
            globals: {
                process: "readonly",
                console: "readonly",
                setTimeout: "readonly",
                clearTimeout: "readonly",
                __dirname: "readonly",
                global: "readonly",
                Buffer: "readonly",
            },
        },
        plugins: {
            "@typescript-eslint": typescript,
            vue,
        },
        rules: {
            "no-console": "off",
            "no-debugger": "off",
            "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
            "vue/multi-word-component-names": "off",
            "vue/no-unused-vars": "error",
            "no-undef": "off",
        },
    },
    {
        ignores: ["dist/", "dist-electron/", "node_modules/", "*.d.ts", "src/vite-env.d.ts"],
    },
    prettier,
]
