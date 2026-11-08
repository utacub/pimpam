// El taller de vehicles (0.53): makes dist/vendor/three-taller.js, the part of three.js that the activity uses, as one plain script that
// sets globalThis.PP3 (tools/vendor-three-entry.js lists the classes). Needs three and esbuild in a node_modules next to this repository or
// in the folder given; the versions are pinned here so the bundle is the same on every machine.
// Usage: node tools/vendor-three.mjs [node_modules dir]
import {execFileSync} from 'node:child_process';
import {existsSync,readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('..',import.meta.url)),nm=process.argv[2]||root+'node_modules';
const THREE='0.187.0',ESBUILD='0.25.10';
for(const [name,version] of [['three',THREE],['esbuild',ESBUILD]]){const pkg=`${nm}/${name}/package.json`;if(!existsSync(pkg)){console.error(`Falta ${name}@${version} a ${nm} (npm i --no-save ${name}@${version} esbuild@${ESBUILD})`);process.exit(1);}
 const v=JSON.parse(readFileSync(pkg,'utf8')).version;if(v!==version){console.error(`${name} ${v}, es demana ${version}`);process.exit(1);}}
const banner=`// three.js r187 (https://threejs.org), MIT License, Copyright 2010-2026 three.js authors. The classes Pim Pam's El taller de vehicles uses, bundled by esbuild as globalThis.PP3 (see tools/vendor-three.mjs).`;
execFileSync(`${nm}/.bin/esbuild`,[root+'tools/vendor-three-entry.js','--bundle','--format=iife','--minify','--target=es2020','--legal-comments=none',`--banner:js=${banner}`,`--outfile=${root}dist/vendor/three-taller.js`],{stdio:'inherit',env:{...process.env,NODE_PATH:nm}});
