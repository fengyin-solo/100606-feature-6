import { build } from 'esbuild'
await build({
  entryPoints: {
    'local-service': 'src/api/local-service.ts',
    occupancy: 'src/data/occupancy.ts',
  },
  bundle: true,
  format: 'esm',
  platform: 'node',
  outdir: 'scripts/dist-test',
  outExtension: { '.js': '.mjs' },
  alias: { '@': new URL('../src/', import.meta.url).pathname },
})
console.log('test bundle built')
