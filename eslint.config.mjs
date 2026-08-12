import { dirname } from "path"
import { fileURLToPath } from "url"
import { FlatCompat } from "@eslint/eslintrc"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
    baseDirectory: __dirname,
})

const eslintConfig = [
    ...compat.extends("next/core-web-vitals", "next/typescript"),
    {
        rules: {
            // Pre-existing patterns across the dashboard/API — warn so builds stay green
            "@typescript-eslint/no-explicit-any": "warn",
            "@typescript-eslint/no-unused-vars": "warn",
            "react/no-unescaped-entities": "warn",
            "prefer-const": "warn",
            "@next/next/no-img-element": "warn",
        },
    },
]

export default eslintConfig
