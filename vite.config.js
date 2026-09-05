import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // Project site served from https://synapsecreates.github.io/skillsynapse/
  // so built asset URLs must be prefixed with the repo name. Local
  // `npm run dev` is unaffected (dev server ignores base for routing).
  base: '/skillsynapse/',
  plugins: [react()],
})
