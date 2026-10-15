import {CHANNEL_START,CHANNEL_SOLUTION,validChannels,traceChannels} from './channels.js';
export const VERSION=3;
export const SOURCE_IDS=['field','travel','drawing','advert'];
export const ITEM_IDS=['lens','lantern','sling','glass'];
export const ANSWERS={property:'field',place:'travel',identity:'drawing'};
export const STAGES=['intro','research','illness','resolve','pack','threshold','river','river-crossing','river-complete','garden','garden-complete'];
const riverState=()=>({inspected:false,farBankChecked:false,slingSelected:false,loopAttached:false,secured:false,crossingPanel:0});
const gardenState=()=>({metGuardian:false,inspected:false,rotations:[...CHANNEL_START],tested:false,solutionPreview:false,watered:false});
export function initialState(){return {version:VERSION,stage:'intro',read:[],assign:{property:null,place:null,identity:null},committed:false,talked:[],choice:null,noteTaken:false,packed:[],owlChoice:null,hints:{},river:riverState(),garden:gardenState()}}
export const correctResearch=s=>Object.entries(ANSWERS).every(([k,v])=>s.assign[k]===v);
export const readyToLeave=s=>s.noteTaken&&ITEM_IDS.every(k=>s.packed.includes(k));
export const heardEssentials=s=>['dina','doctor'].every(k=>s.talked.includes(k));
export function reduce(s,a){
 const n=structuredClone(s);
 switch(a.type){
 case 'START':if(s.stage==='intro')n.stage='research';break;
 case 'READ':if(s.stage==='research'&&SOURCE_IDS.includes(a.id)&&!s.read.includes(a.id))n.read.push(a.id);break;
 case 'ASSIGN':if(s.stage==='research'&&!s.committed&&Object.hasOwn(ANSWERS,a.slot)&&s.read.includes(a.id)){for(const k of Object.keys(ANSWERS))if(n.assign[k]===a.id)n.assign[k]=null;n.assign[a.slot]=a.id;}break;
 case 'CLEAR':if(s.stage==='research'&&!s.committed&&Object.hasOwn(ANSWERS,a.slot))n.assign[a.slot]=null;break;
 case 'VERIFY':if(s.stage==='research'&&correctResearch(s))n.committed=true;break;
 case 'RESEARCH_NEXT':if(s.stage==='research'&&s.committed)n.stage='illness';break;
 case 'TALK':if(s.stage==='illness'&&['dina','doctor','hand'].includes(a.id)&&!s.talked.includes(a.id))n.talked.push(a.id);break;
 case 'ILLNESS_NEXT':if(s.stage==='illness'&&heardEssentials(s))n.stage='resolve';break;
 case 'CHOOSE':if(s.stage==='resolve'&&['fear','research'].includes(a.id))n.choice=a.id;break;
 case 'RESOLVE_NEXT':if(s.stage==='resolve'&&s.choice)n.stage='pack';break;
 case 'TAKE_NOTE':if(s.stage==='pack')n.noteTaken=true;break;
 case 'PACK':if(s.stage==='pack'&&ITEM_IDS.includes(a.id)&&!s.packed.includes(a.id))n.packed.push(a.id);break;
 case 'DEPART':if(s.stage==='pack'&&readyToLeave(s))n.stage='threshold';break;
 case 'OWL_CHOICE':if(s.stage==='threshold'&&['ask','directions'].includes(a.id)){n.owlChoice=a.id;n.stage='river';}break;
 case 'RIVER_INSPECT':if(s.stage==='river')n.river.inspected=true;break;
 case 'RIVER_SCOUT':if(s.stage==='river')n.river.farBankChecked=true;break;
 case 'RIVER_SLING':if(s.stage==='river'&&!s.river.loopAttached)n.river.slingSelected=!s.river.slingSelected;break;
 case 'RIVER_LOOP':if(s.stage==='river'&&s.river.inspected&&s.river.farBankChecked&&s.river.slingSelected)n.river.loopAttached=true;break;
 case 'RIVER_ANCHOR':if(s.stage==='river'&&s.river.loopAttached){n.river.secured=true;n.river.slingSelected=false;}break;
 case 'RIVER_CROSS':if(s.stage==='river'&&s.river.secured)n.stage='river-crossing';break;
 case 'RIVER_PANEL':if(s.stage==='river-crossing'){if(s.river.crossingPanel===0)n.river.crossingPanel=1;else n.stage='river-complete';}break;
 case 'GARDEN_START':if(s.stage==='river-complete')n.stage='garden';break;
 case 'GARDEN_TALK':if(s.stage==='garden')n.garden.metGuardian=true;break;
 case 'GARDEN_INSPECT':if(s.stage==='garden')n.garden.inspected=true;break;
 case 'GARDEN_ROTATE':if(s.stage==='garden'&&s.garden.metGuardian&&s.garden.inspected&&Number.isInteger(a.index)&&a.index>=0&&a.index<6){n.garden.rotations[a.index]=(s.garden.rotations[a.index]+1)%4;n.garden.tested=false;}break;
 case 'GARDEN_TEST':if(s.stage==='garden'&&s.garden.metGuardian&&s.garden.inspected){n.garden.tested=true;if(traceChannels(s.garden.rotations).solved){n.garden.watered=true;n.garden.solutionPreview=false;n.stage='garden-complete';}}break;
 case 'GARDEN_PREVIEW':if(s.stage==='garden'&&(s.hints.garden||0)>=3)n.garden.solutionPreview=true;break;
 case 'GARDEN_HIDE_PREVIEW':if(s.stage==='garden')n.garden.solutionPreview=false;break;
 case 'GARDEN_APPLY_PREVIEW':if(s.stage==='garden'&&s.garden.solutionPreview&&s.garden.metGuardian&&s.garden.inspected){n.garden.rotations=[...CHANNEL_SOLUTION];n.garden.solutionPreview=false;n.garden.tested=false;}break;
 case 'HINT':if(['research','illness','resolve','pack','threshold','river','garden'].includes(s.stage))n.hints[s.stage]=Math.min(3,(s.hints[s.stage]||0)+1);break;
 }
 return n;
}
export function validateState(input){
 if(!input||![1,2,VERSION].includes(input.version)||(input.version===1&&!['intro','research','illness','resolve','pack','threshold','complete'].includes(input.stage)))throw Error('Dieser Spielstand gehört nicht zu dieser Spielversion.');
 // Version 1 ended at Oris. Continue at the river without losing decisions or equipment.
 const legacy=input.version===1?{...input,stage:input.stage==='complete'?'river':input.stage,river:riverState()}:input;
 if(input.version===2&&!STAGES.slice(0,9).includes(input.stage))throw Error('Dieser Spielstand gehört nicht zu dieser Spielversion.');
 const x=input.version<3?{...legacy,version:VERSION,garden:gardenState()}:input;
 if(!STAGES.includes(x.stage))throw Error('Dieser Spielstand gehört nicht zu dieser Spielversion.');
 const s=initialState();s.stage=x.stage;
 for(const [key,allowed] of [['read',SOURCE_IDS],['packed',ITEM_IDS],['talked',['dina','doctor','hand']]]){if(!Array.isArray(x[key])||x[key].some(v=>!allowed.includes(v)))throw Error('Der Spielstand enthält ungültige Einträge.');s[key]=[...new Set(x[key])];}
 if(!x.assign||typeof x.assign!=='object')throw Error('Die Recherchekarte fehlt.');
 for(const k of Object.keys(ANSWERS)){const v=x.assign[k];if(v!==null&&(!SOURCE_IDS.includes(v)||!s.read.includes(v)))throw Error('Die Recherchekarte ist beschädigt.');s.assign[k]=v;}
 s.committed=x.committed===true;s.noteTaken=x.noteTaken===true;
 if(x.choice!==null&&!['fear','research'].includes(x.choice))throw Error('Ungültige Gesprächsentscheidung.');s.choice=x.choice;
 if(x.owlChoice!==null&&!['ask','directions'].includes(x.owlChoice))throw Error('Ungültige Wegentscheidung.');s.owlChoice=x.owlChoice;
 for(const k of STAGES){const v=x.hints?.[k];if(Number.isInteger(v)&&v>=0&&v<=3)s.hints[k]=v;}
 if(s.committed&&!correctResearch(s))throw Error('Die bestätigte Recherchekarte ist unvollständig.');
 const stageIndex=STAGES.indexOf(s.stage);
 if(stageIndex>1&&!s.committed)throw Error('Der Spielstand überspringt die Recherche.');
 if(stageIndex>2&&!heardEssentials(s))throw Error('Wichtige Gespräche fehlen.');
 if(stageIndex>3&&!s.choice)throw Error('Eine Gesprächsentscheidung fehlt.');
 if(stageIndex>4&&!readyToLeave(s))throw Error('Die Reiseausrüstung ist unvollständig.');
 if(stageIndex>=6&&!s.owlChoice)throw Error('Die Begegnung mit Oris fehlt.');
 if(!x.river||typeof x.river!=='object')throw Error('Der Flusszustand fehlt.');
 for(const key of ['inspected','farBankChecked','slingSelected','loopAttached','secured']){if(typeof x.river[key]!=='boolean')throw Error('Ungültiger Flusszustand.');s.river[key]=x.river[key];}
 if(![0,1].includes(x.river.crossingPanel))throw Error('Ungültiger Flusszustand.');s.river.crossingPanel=x.river.crossingPanel;
 const r=s.river;
 if((r.loopAttached&&(!r.inspected||!r.farBankChecked))||(r.secured&&(!r.loopAttached||r.slingSelected))||(r.loopAttached&&!r.secured&&!r.slingSelected)||(stageIndex>=7&&!r.secured)||(stageIndex<6&&Object.values(r).some(Boolean))||(s.stage==='river'&&r.crossingPanel!==0)||(stageIndex>=8&&r.crossingPanel!==1))throw Error('Der Flusszustand überspringt eine notwendige Handlung.');
 if(!x.garden||typeof x.garden!=='object')throw Error('Der Gartenzustand fehlt.');
 for(const key of ['metGuardian','inspected','tested','solutionPreview','watered']){if(typeof x.garden[key]!=='boolean')throw Error('Ungültiger Gartenzustand.');s.garden[key]=x.garden[key];}
 if(!validChannels(x.garden.rotations))throw Error('Ungültige Kanalstellungen.');s.garden.rotations=[...x.garden.rotations];
 const g=s.garden,changed=g.rotations.some((value,index)=>value!==CHANNEL_START[index]);
 if((stageIndex<9&&(changed||g.metGuardian||g.inspected||g.tested||g.solutionPreview||g.watered))||((changed||g.tested)&&(!g.metGuardian||!g.inspected))||(g.solutionPreview&&(s.hints.garden||0)<3)||(g.watered&&(!g.tested||!traceChannels(g.rotations).solved))||(g.tested&&traceChannels(g.rotations).solved&&!g.watered)||(g.watered&&s.stage!=='garden-complete')||(s.stage==='garden-complete'&&(!g.watered||g.solutionPreview)))throw Error('Der Gartenzustand überspringt eine notwendige Handlung.');
 return s;
}
