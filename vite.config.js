import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const ROOT = path.dirname(fileURLToPath(import.meta.url))

function offlineShell() {
  return {
    name: 'kone-offline-shell',
    apply: 'build',
    closeBundle() {
      const assetsDir = path.join(ROOT, 'dist', 'assets')
      const assets = fs
        .readdirSync(assetsDir)
        .filter((file) => /\.(js|css)$/.test(file))
        .map((file) => `/assets/${file}`)

      const precache = [
        '/',
        '/index.html',
        '/manifest.webmanifest',
        '/icons/icon-192.png',
        '/icons/icon-512.png',
        '/icons/apple-touch-icon.png',
        ...assets,
      ]

      const template = fs.readFileSync(path.join(ROOT, 'pwa', 'sw.js'), 'utf8')
      const buildId = `kone-${Date.now().toString(36)}`
      const output = template
        .replace('__BUILD_ID__', buildId)
        .replace('__PRECACHE__', JSON.stringify(precache, null, 2))

      fs.writeFileSync(path.join(ROOT, 'dist', 'sw.js'), output)
    },
  }
}

export default defineConfig({
  plugins: [react(), offlineShell()],
})
