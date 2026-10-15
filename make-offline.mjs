import {readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve('dist');
const output=process.argv[2];
if(!output||!path.isAbsolute(output))throw Error('Absoluten Ausgabepfad angeben.');
const read=async name=>readFile(path.join(root,name),'utf8');
const assets={};
for(const name of ['workroom.png','characters.png','illness.png','threshold.png','river.png','garden-dry.png','garden-wet.png','chamber.png','morning.png','case-library.png','case-courtyard.png','eco-river.png','eco-depot.png','morning-investigation.png','mask-city.png','healing-clinic.png','edition-newsroom.png'])assets[name]='data:image/png;base64,'+(await readFile(path.join(root,'assets',name))).toString('base64');
const icon='data:image/svg+xml;base64,'+(await readFile(path.join(root,'assets/icon.svg'))).toString('base64');
let css=await read('style.css');
for(const [name,data] of Object.entries(assets))css=css.replaceAll(`url('./assets/${name}')`,`url('${data}')`);
// Give each ES module its own scope, including import aliases. All modules are local;
// the generated file needs no network imports, fetches or extra runtime packages.
let script='const __TD_MODULES=Object.create(null);\n';
for(const name of ['channels.js','case-state.js','eco-state.js','morning-state.js','mask-state.js','healing-state.js','edition-state.js','state.js','data.js','messages.js','i18n.js','case-copy.js','eco-copy.js','morning-copy.js','mask-copy.js','healing-copy.js','edition-copy.js','edition-ui.js','healing-ui.js','mask-ui.js','morning-ui.js','eco-ui.js','case-ui.js','app.js']){
 let code=await read(name);
 const exported=[...code.matchAll(/^export (?:const|function) (\w+)/gm)].map(match=>match[1]);
 code=code.replace(/^import \{([^}]+)\} from '\.\/([\w-]+\.js)';\r?\n/gm,(_,bindings,dependency)=>`const {${bindings.replace(/\s+as\s+/g,':')}}=__TD_MODULES[${JSON.stringify(dependency)}];\n`).replace(/^export /gm,'');
 script+=`__TD_MODULES[${JSON.stringify(name)}]=(()=>{\n${code}\nreturn {${exported.join(',')}};\n})();\n`;
}
let html=await read('index.html');
html=html.replace('<link rel="icon" href="./assets/icon.svg" type="image/svg+xml"><link rel="manifest" href="./manifest.webmanifest">',`<link rel="icon" href="${icon}" type="image/svg+xml">`);
html=html.replace('<link rel="stylesheet" href="./style.css"><script type="module" src="./app.js"></script>',`<style>${css}</style>`);
html=html.replace('</body>',`<script type="module">globalThis.TD_STANDALONE=true;globalThis.TD_ASSETS=${JSON.stringify(assets)};\n${script.replace(/<\/script/gi,'<\\/script')}</script></body>`);
await writeFile(output,html,'utf8');
console.log('Offline-Datei erstellt: '+output);
