import { defineConfig } from 'vite';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { transform } from 'esbuild';

const __dirname = dirname(fileURLToPath(import.meta.url));
const buildIdFile = resolve(__dirname, '.build-id');
const outDir = resolve(__dirname, 'docs');

function buildIdPlugin() {
  let buildId = '0';
  let isBuild = false;

  return {
    name: 'build-id',
    configResolved(config) {
      isBuild = config.command === 'build';
    },
    buildStart() {
      const current = existsSync(buildIdFile) ? parseInt(readFileSync(buildIdFile, 'utf-8'), 10) || 0 : 0;
      // Only advance the persisted counter on a real `vite build` — `vite dev`
      // also triggers buildStart, and bumping it there desyncs the counter
      // from what's actually committed in docs/.
      if (isBuild) {
        buildId = String(current + 1);
        writeFileSync(buildIdFile, buildId);
      } else {
        buildId = String(current);
      }
    },
    closeBundle() {
      // Written straight into outDir instead of via transformIndexHtml, so
      // index.html itself never changes between builds — only this file does.
      if (isBuild) {
        writeFileSync(resolve(outDir, 'build-id.txt'), buildId);
      }
    }
  };
}

function minifyVendorPlugin() {
  return {
    name: 'minify-vendor',
    async renderChunk(code, chunk) {
      if (chunk.name !== 'vendor') return null;
      const result = await transform(code, { minify: true });
      return { code: result.code, map: result.map || null };
    }
  };
}

export default defineConfig({
  base: '/WebLevelZero/',
  plugins: [buildIdPlugin(), minifyVendorPlugin()],
  build: {
    outDir: 'docs',
    emptyOutDir: true,
    minify: false,
    rollupOptions: {
      input: {
        main: 'index.html',
        '00_miniApps/index': '00_miniApps/index.html',
        '00_miniApps/pages/hello-world/index': '00_miniApps/pages/hello-world/index.html',
        '00_miniApps/pages/list/index': '00_miniApps/pages/list/index.html',
        '00_miniApps/pages/todo/index': '00_miniApps/pages/todo/index.html',
        '00_miniApps/pages/tic-tac-toe/index': '00_miniApps/pages/tic-tac-toe/index.html',
        '01_cssPlayground/index': '01_cssPlayground/index.html',
        '02_neda_v01/index': '02_neda_v01/index.html'
      },
      output: {
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name][extname]',
        manualChunks(id) {
          if (id.includes('node_modules')) return 'vendor';
        }
      }
    }
  }
});
