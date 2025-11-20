import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'
import { defineConfig, globalIgnores } from 'eslint/config'

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // ------------------------------
    // Default Next.js ignores
    // ------------------------------
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',

    // ------------------------------
    // Build / Outputs
    // ------------------------------
    '.next/**',
    'dist/**',
    'out/**',
    'build/**',
    'server/**',
    'public/**',
    'coverage/**',

    // ------------------------------
    // Node / Bun
    // ------------------------------
    'node_modules/**',
    '.bun/**',

    // ------------------------------
    // Database / ORM (Drizzle)
    // ------------------------------
    'drizzle/*.sqlite',
    'drizzle/*-journal',
    'drizzle/.cache/**',
    'drizzle/meta/**',

    // ------------------------------
    // Env & Config
    // ------------------------------
    '.env',
    '.env.*',

    // ------------------------------
    // Editor / IDE metadata
    // ------------------------------
    '.vscode/**',
    '.idea/**',
    '.cursor/**',
    '.windsurf/**',

    // ------------------------------
    // Logs / Temp Files
    // ------------------------------
    '*.log',
    'tmp/**',
    'temp/**',
  ]),
])

export default eslintConfig
