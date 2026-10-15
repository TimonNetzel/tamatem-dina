import {initialState,reduce,ITEM_IDS} from '../dist/state.js';
import {CHANNEL_SOLUTION} from '../dist/channels.js';
export function levelOne(choice='fear',owlChoice='ask',observe=()=>{}){
 let s=initialState();const act=a=>{s=reduce(s,typeof a==='string'?{type:a}:a);observe(s);};
 act('START');for(const [slot,id] of Object.entries({property:'field',place:'travel',identity:'drawing'})){act({type:'READ',id});act({type:'ASSIGN',slot,id});}
 for(const a of ['VERIFY','RESEARCH_NEXT',{type:'TALK',id:'dina'},{type:'TALK',id:'doctor'},'ILLNESS_NEXT',{type:'CHOOSE',id:choice},'RESOLVE_NEXT','TAKE_NOTE',...ITEM_IDS.map(id=>({type:'PACK',id})),'DEPART',{type:'OWL_CHOICE',id:owlChoice},'RIVER_INSPECT','RIVER_SCOUT','RIVER_SLING','RIVER_LOOP','RIVER_ANCHOR','RIVER_CROSS','RIVER_PANEL','RIVER_PANEL','GARDEN_START','GARDEN_TALK','GARDEN_INSPECT'])act(a);
 for(let index=0;index<6;index++)while(s.garden.rotations[index]!==CHANNEL_SOLUTION[index])act({type:'GARDEN_ROTATE',index});
 for(const a of ['GARDEN_TEST','CHAMBER_START','BLOOM_IDENTIFY','BLOOM_COLLECT','RETURN_START','RETURN_PROTECT','RETURN_HOME','APP_INSERT','APP_COLLECT','APP_BIND','APP_LANTERN','APP_CALM','DINA_OBSERVE','DINA_REPORT','HEAL','MORNING'])act(a);
 return s;
}
export function finishCase(s,consent='anonymous',withdrawal='omit',observe=()=>{}){
 const act=a=>{s=reduce(s,typeof a==='string'?{type:a}:a);observe(s);};
 const has=stage=>s.stage===stage;
 if(has('level-complete'))act('CASE_START');if(has('case-opening'))act('CASE_BEGIN');
 if(has('case-records')){
  for(const id of ['letter','address','sale']){act({type:'CASE_READ',id});if(!s.case.selected.includes(id))act({type:'CASE_SELECT',id});}
  if(s.case.selected.includes('missing'))act({type:'CASE_SELECT',id:'missing'});
  act('CASE_ADDRESS');act('CASE_INTERVIEWS');
 }
 if(has('case-interviews')){act({type:'CASE_CONSENT',id:consent});act('CASE_NORA');act('CASE_EMIL');act({type:'CASE_WITHDRAW',id:withdrawal});act('CASE_MEET');}
 if(has('case-timeline')){for(const [index,id] of ['sale','rent','complaint'].entries())act({type:'CASE_ORDER',index,id});act('CASE_LINK');act('CASE_RESPONSE_START');}
 if(has('case-response')){act({type:'CASE_RESPONSE',id:'owner'});act({type:'CASE_RESPONSE',id:'office'});act('CASE_EDITOR');}
 if(has('case-editor')){for(const [id,value] of Object.entries({abduction:'false',complaints:'verified',motive:'open'}))act({type:'CASE_CLAIM',id,value});act('CASE_CHECK');act('CASE_CORRECT');act('CASE_PRINT');}
 if(has('case-print'))act('CASE_FINISH');return s;
}
