import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const manifest=JSON.parse(await readFile(path.join(root,'HANDOFF_MANIFEST.json'),'utf8'));
const failures=[];
for(const entry of manifest.files){const full=path.resolve(root,entry.path);if(!full.startsWith(root))throw Error('Ungültiger Manifestpfad.');try{const bytes=await readFile(full);const sha256=createHash('sha256').update(bytes).digest('hex');if(sha256!==entry.sha256)failures.push(entry.path+' wurde verändert.');}catch{failures.push(entry.path+' fehlt.');}}
if(failures.length){console.error('Die Übergabe-Momentaufnahme weicht ab:\n'+failures.join('\n'));console.error('Nach absichtlicher Weiterentwicklung sind Abweichungen erwartbar.');process.exitCode=1;}else{console.log('Vollständige Übergabe bestätigt: '+manifest.files.length+' Dateien unverändert.');}
