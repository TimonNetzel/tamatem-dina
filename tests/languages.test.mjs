import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {MESSAGES} from '../dist/messages.js';
import {LANGUAGES,t,localize,setLanguage,getLanguage} from '../dist/i18n.js';
import * as content from '../dist/data.js';

test('Alle Spieltexte und Fehlermeldungen haben englische und ägyptisch-arabische Übersetzungen',async()=>{
 const required=new Set();
 function collect(value){if(typeof value==='string'&&(/\s|[äöüßÄÖÜ]/.test(value)||['Dina','Tamatem','Oris'].includes(value)))required.add(value.trim());else if(Array.isArray(value))value.forEach(collect);else if(value&&typeof value==='object')Object.values(value).forEach(collect);}
 collect(content);
 const app=await readFile(new URL('../dist/app.js',import.meta.url),'utf8');
 for(const match of app.matchAll(/\bt\(\s*("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')/g))required.add((match[1][0]==='"'?JSON.parse(match[1]):match[1].slice(1,-1)).trim());
 const state=await readFile(new URL('../dist/state.js',import.meta.url),'utf8');
 for(const match of state.matchAll(/throw Error\('([^']+)'\)/g))required.add(match[1]);
 for(const key of required){assert.ok(Object.hasOwn(MESSAGES,key),'Übersetzung fehlt: '+key);for(const locale of ['en','ar-EG']){assert.ok(MESSAGES[key][locale].trim(),locale+': '+key);assert.deepEqual([...MESSAGES[key][locale].matchAll(/\{\w+\}/g)].map(m=>m[0]).sort(),[...key.matchAll(/\{\w+\}/g)].map(m=>m[0]).sort());}}
 assert.ok(required.size>250);
});
test('Sprachwechsel erhält stabile Objektkennungen und übersetzt Inhalte ohne Mutation',()=>{
 const original=structuredClone(content.sources);
 const english=localize(content.sources,'en'),arabic=localize(content.sources,'ar-EG');
 assert.deepEqual(Object.keys(english),Object.keys(original));assert.equal(english.field.title,'Field report');
 assert.match(arabic.field.text[0],/[\u0600-\u06ff]/);assert.deepEqual(content.sources,original);
 setLanguage('ar-EG');assert.equal(getLanguage(),'ar-EG');assert.equal(LANGUAGES[getLanguage()].dir,'rtl');
 assert.equal(t('Abschnitt {number} von 6',{number:'06'}),'الجزء 06 من 6');
 assert.equal(setLanguage('fr'),false);assert.equal(getLanguage(),'ar-EG');setLanguage('de');
});
