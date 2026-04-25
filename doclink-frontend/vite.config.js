import api from "./src/api/api"
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  logLevel: 'error', // Suppress warnings, only show errors
  plugins: [
    api({
      // Support for legacy code that imports the api SDK with @/integrations, @/entities, etc.
      // can be removed if the code has been updated to use the new SDK imports from @api/sdk
      legacySDKImports: process.env.api_LEGACY_SDK_IMPORTS === 'true',
      hmrNotifier: true,
      navigationNotifier: true,
      visualEditAgent: true
    }),
    react(),
  ]
});