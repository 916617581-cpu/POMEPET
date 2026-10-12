import {build} from 'esbuild';
import {mkdir,copyFile,writeFile} from 'node:fs/promises';
await mkdir('dist/vendor',{recursive:true});
await build({stdin:{contents:"export {removeBackground} from '@imgly/background-removal';",resolveDir:process.cwd(),sourcefile:'cutout-entry.js'},bundle:true,format:'esm',platform:'browser',outfile:'dist/vendor/cutout.js',minify:true,legalComments:'linked'});
await copyFile('node_modules/@imgly/background-removal/LICENSE.md','dist/vendor/background-removal-LICENSE.md');
await copyFile('node_modules/@imgly/background-removal/dist/index.mjs','dist/vendor/background-removal-source.mjs');
await copyFile('node_modules/@imgly/background-removal/ThirdPartyLicenses.json','dist/vendor/ThirdPartyLicenses.json');
await writeFile('dist/vendor/README.md','Browser background removal: @imgly/background-removal 1.7.0, IMG.LY, AGPL-3.0. Upstream source: https://github.com/imgly/background-removal-js . Unminified package source: background-removal-source.mjs. Integration source: ../cutout-worker.js and ../cutout-engine.js. Model/runtime resources are downloaded from the library default staticimgly.com endpoint. Photos are processed locally. Rebuild with pnpm install and pnpm build:cutout.\n');
