import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

const certPath = path.resolve(__dirname, '.cert')
const https = fs.existsSync(path.join(certPath, 'cert.pem'))
  ? {
      key: fs.readFileSync(path.join(certPath, 'key.pem')),
      cert: fs.readFileSync(path.join(certPath, 'cert.pem')),
    }
  : undefined

export default defineConfig({
  plugins: [react()],
  base: '/qr-reverse-engineering-sandbox/',
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
  },
  server: {
    port: 5173,
    host: true,
    https,
  },
})
