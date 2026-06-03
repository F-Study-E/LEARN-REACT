import path from 'path'
import { fileURLToPath } from 'url'
import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // React Compiler는 Babel 전용이라, Rolldown 기반 plugin-react v6에서는
    // @rolldown/plugin-babel + reactCompilerPreset 조합으로 적용합니다.
    // target 미지정 = React 19 (react/compiler-runtime 사용)
    babel({ presets: [reactCompilerPreset()] }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
})
