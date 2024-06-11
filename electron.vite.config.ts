import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin, swcPlugin } from 'electron-vite'
import vue from '@vitejs/plugin-vue'

import tailwind from 'tailwindcss'
import autoprefixer from 'autoprefixer'

import svgLoader from 'vite-svg-loader'

export default defineConfig({
  main: {
    plugins: [swcPlugin(), externalizeDepsPlugin()] // swc is required because of the typeorm package
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    css: {
      postcss: {
        plugins: [tailwind(), autoprefixer()]
      }
    },
    plugins: [vue(), svgLoader()],
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src'),
        '@': resolve('src/renderer/src'),
        '@ui': resolve('src/renderer/src/components/ui'),
        '@composables': resolve('src/renderer/src/composables'),
        '@lib': resolve('src/renderer/src/lib')
      }
    }
  }
})
