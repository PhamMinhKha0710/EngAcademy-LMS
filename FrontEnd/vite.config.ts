import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
    plugins: [react()],
    define: {
        global: 'window',
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    base: '/',
    build: {
        outDir: 'dist',
        sourcemap: false,
        rollupOptions: {
            output: {
                manualChunks: {
                    vendor: ['react', 'react-dom', 'react-router-dom'],
                    utils: ['axios', 'zustand', 'i18next'],
                },
            },
        },
    },
    server: {
        port: 3000,
        proxy: {
            '/api': {
                target: process.env.VITE_API_URL || 'http://localhost:8080',
                changeOrigin: true,
            },
            '/ws': {
                target: process.env.VITE_API_URL || 'http://localhost:8080',
                ws: true,
                changeOrigin: true,
            },
        },
    },
})
