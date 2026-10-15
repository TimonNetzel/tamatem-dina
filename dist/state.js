export const VERSION=1;
export const SOURCE_IDS=['field','travel','drawing','advert'];
export const ITEM_IDS=['lens','lantern','sling','glass'];
export const ANSWERS={property:'field',place:'travel',identity:'drawing'};
export const STAGES=['intro','research','illness','resolve','pack','threshold','complete'];
export function initialState(){return {version:VERSION,stage:'intro',read:[],assign:{property:null,place:null,identity:null},committed:false,talked:[],choice:null,noteTaken:false,packed:[],owlChoice:null,hints:{}}}
export const correctResearch=s=>Object.entries(ANSWERS).every(([k,v])=>s.assign[k]===v);
export const readyToLeave=s=>s.noteTaken&&ITEM_IDS.every(k=>s.packed.includes(k));
export const heardEssentials=s=>['dina','doctor'].every(k=>s.talked.includes(k));
export function reduce(s,a){
 const n=structuredClone(s);
 switch(a.type){
 case 'START':if(s.stage==='intro')n.stage='research';break;
 case 'READ':if(s.stage==='research'&&SOURCE_IDS.includes(a.id)&&!s.read.includes(a.id))n.read.push(a.id);break;
 case 'ASSIGN':if(s.stage==='research'&&!s.committed&&a.slot in ANSWERS&&s.read.includes(a.id)){for(const k of Object.keys(ANSWERS))if(n.assign[k]===a.id)n.assign[k]=null;n.assign[a.slot]=a.id;}break;
 case 'CLEAR':if(s.stage==='research'&&!s.committed&&a.slot in ANSWERS)n.assign[a.slot]=null;break;
 case 'VERIFY':if(s.stage==='research'&&correctResearch(s))n.committed=true;break;
 case 'RESEARCH_NEXT':if(s.stage==='research'&&s.committed)n.stage='illness';break;
 case 'TALK':if(s.stage==='illness'&&['dina','doctor','hand'].includes(a.id)&&!s.talked.includes(a.id))n.talked.push(a.id);break;
 case 'ILLNESS_NEXT':if(s.stage==='illness'&&heardEssentials(s))n.stage='resolve';break;
 case 'CHOOSE':if(s.stage==='resolve'&&['fear','research'].includes(a.id))n.choice=a.id;break;
 case 'RESOLVE_NEXT':if(s.stage==='resolve'&&s.choice)n.stage='pack';break;
 case 'TAKE_NOTE':if(s.stage==='pack')n.noteTaken=true;break;
 case 'PACK':if(s.stage==='pack'&&ITEM_IDS.includes(a.id)&&!s.packed.includes(a.id))n.packed.push(a.id);break;
 case 'DEPART':if(s.stage==='pack'&&readyToLeave(s))n.stage='threshold';break;
 case 'OWL_CHOICE':if(s.stage==='threshold'&&['ask','directions'].includes(a.id)){n.owlChoice=a.id;n.stage='complete';}break;
 case 'HINT':n.hints[s.stage]=Math.min(3,(s.hints[s.stage]||0)+1);break;
 }
 return n;
}
export function validateState(x){
 if(!x||x.version!==VERSION||!STAGES.includes(x.stage))throw Error('Dieser Spielstand gehört nicht zu dieser Prolog-Version.');
 const s=initialState();s.stage=x.stage;
 for(const [key,allowed] of [['read',SOURCE_IDS],['packed',ITEM_IDS],['talked',['dina','doctor','hand']]]){if(!Array.isArray(x[key])||x[key].some(v=>!allowed.includes(v)))throw Error('Der Spielstand enthält ungültige Einträge.');s[key]=[...new Set(x[key])];}
 if(!x.assign||typeof x.assign!=='object')throw Error('Die Recherchekarte fehlt.');
 for(const k of Object.keys(ANSWERS)){const v=x.assign[k];if(v!==null&&(!SOURCE_IDS.includes(v)||!s.read.includes(v)))throw Error('Die Recherchekarte ist beschädigt.');s.assign[k]=v;}
 s.committed=x.committed===true;s.noteTaken=x.noteTaken===true;
 if(x.choice!==null&&!['fear','research'].includes(x.choice))throw Error('Ungültige Gesprächsentscheidung.');s.choice=x.choice;
 if(x.owlChoice!==null&&!['ask','directions'].includes(x.owlChoice))throw Error('Ungültige Wegentscheidung.');s.owlChoice=x.owlChoice;
 for(const k of STAGES){const v=x.hints?.[k];if(Number.isInteger(v)&&v>=0&&v<=3)s.hints[k]=v;}
 if(s.committed&&!correctResearch(s))throw Error('Die bestätigte Recherchekarte ist unvollständig.');
 if(STAGES.indexOf(s.stage)>1&&!s.committed)throw Error('Der Spielstand überspringt die Recherche.');
 if(STAGES.indexOf(s.stage)>2&&!heardEssentials(s))throw Error('Wichtige Gespräche fehlen.');
 if(STAGES.indexOf(s.stage)>3&&!s.choice)throw Error('Eine Gesprächsentscheidung fehlt.');
 if(STAGES.indexOf(s.stage)>4&&!readyToLeave(s))throw Error('Die Reiseausrüstung ist unvollständig.');
 if(s.stage==='complete'&&!s.owlChoice)throw Error('Die Begegnung mit Oris fehlt.');
 return s;
}
