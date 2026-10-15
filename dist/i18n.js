import {MESSAGES} from './messages.js';
export const LANGUAGES={de:{label:'Deutsch',dir:'ltr'},en:{label:'English',dir:'ltr'},'ar-EG':{label:'مصري',dir:'rtl'}};
export const LANGUAGE_KEY='tamatem-dina-language';
let language='de';
try{const saved=globalThis.localStorage?.getItem(LANGUAGE_KEY);if(Object.hasOwn(LANGUAGES,saved))language=saved;}catch{/* Language switching remains usable without storage. */}
export function getLanguage(){return language;}
export function setLanguage(value){
 if(!Object.hasOwn(LANGUAGES,value))return false;
 language=value;
 try{globalThis.localStorage?.setItem(LANGUAGE_KEY,value);}catch{/* Never overwrite or reset game progress for a preference. */}
 return true;
}
export function t(message,values={},locale=language){
 const key=String(message).trim();
 const translated=locale==='de'?key:(MESSAGES[key]?.[locale]??key);
 const padded=String(message).match(/^\s*/)[0]+translated+String(message).match(/\s*$/)[0];
 return padded.replace(/\{(\w+)\}/g,(match,name)=>Object.hasOwn(values,name)?String(values[name]):match);
}
export function localize(value,locale=language){
 if(typeof value==='string')return ['Dina','Tamatem','Oris'].includes(value)?value:t(value,{},locale);
 if(Array.isArray(value))return value.map(item=>localize(item,locale));
 if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([key,item])=>[key,localize(item,locale)]));
 return value;
}
