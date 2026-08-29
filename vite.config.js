import { defineConfig } from 'vite';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const buildIdFile = resolve(__dirname, '.build-id');

function buildIdPlugin() {
  let buildId = '0';

  return {
    name: 'build-id',
    buildStart() {
      const current = existsSync(buildIdFile) ? parseInt(readFileSync(buildIdFile, 'utf-8'), 10) || 0 : 0;
      buildId = String(current + 1);
      writeFileSync(buildIdFile, buildId);
    },
    transformIndexHtml(html) {
      return html.replace(/(<p id="buildId">Build: )([^<]*)(<\/p>)/, `$1${buildId}$3`);
    }
  };
}

export default defineConfig({
  base: '/WebLevelZero/',
  plugins: [buildIdPlugin()],
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
      }
    }
  }
});
