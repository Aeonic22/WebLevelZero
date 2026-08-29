import { defineConfig } from 'vite';

export default defineConfig({
  base: '/WebLevelZero/',
  build: {
    outDir: 'docs',
    emptyOutDir: true,
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
