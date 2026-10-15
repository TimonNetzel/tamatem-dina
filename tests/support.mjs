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
export function finishEco(s,reflection='error',approach='warning',observe=()=>{}){
 const act=a=>{s=reduce(s,typeof a==='string'?{type:a}:a);observe(s);};
 const at=stage=>s.stage==='eco-'+stage,pick=(id,value)=>act({type:'ECO_PICK',id,value});
 if(s.stage==='case-complete')act('ECO_START');
 if(at('opening')){act('ECO_BRIEF');act('ECO_BEGIN');}
 if(at('spark')){act('ECO_SAMPLE');act('ECO_ACCUSE');}
 if(at('keeper')){act({type:'ECO_REFLECT',id:reflection});act('ECO_COMPARE_START');}
 if(at('samples')){for(const id of ['a6','b6','c6','a8','b8','c8'])act({type:'ECO_READ',id});pick('rise','b');pick('window','morning');act('ECO_COMPARE');act('ECO_INTERVIEWS');}
 if(at('interviews')){for(const id of ['dyer','gate','valve'])act({type:'ECO_READ',id});pick('contradiction','valve');act('ECO_CHECK_INTERVIEW');act('ECO_MEET');}
 if(at('model')){for(const [id,value] of Object.entries({load:'depot',mist:'source',blue:'unproven'}))pick(id,value);act('ECO_LINK');act('ECO_CORRECTION');}
 if(at('correction')){pick('replacement','evidence');act('ECO_REPOST');act('ECO_APOLOGIZE');act('ECO_RESPONSE');}
 if(at('response')){for(const id of ['depot','salma'])act({type:'ECO_READ',id});pick('approach',approach);act('ECO_STOP_START');}
 if(at('stop')){for(const [index,id] of ['close','hold','test'].entries())act({type:'ECO_ORDER',index,id});act('ECO_STOP');act('ECO_SOURCE');}
 if(at('source')){act('ECO_INSPECT');act('ECO_CLEAR');pick('inlet','clean');act('ECO_RESTORE');act('ECO_VERIFY');}
 if(at('verify')){for(const id of ['water','roots'])act({type:'ECO_READ',id});act('ECO_PUBLISH');act('ECO_FINISH');}
 return s;
}
export function finishMorning(s,pressure='open',naming='anonymous',observe=()=>{}){
 const act=a=>{s=reduce(s,typeof a==='string'?{type:a}:a);observe(s);};
 const at=phase=>s.stage==='morning-'+phase,pick=(id,value)=>act({type:'MORNING_PICK',id,value}),read=id=>act({type:'MORNING_READ',id}),next=()=>act('MORNING_NEXT'),check=()=>act('MORNING_CHECK');
 if(s.stage==='eco-complete')act('MORNING_START');
 if(at('opening')){read('allegation');next();}
 if(at('pressure')){pick('pressure',pressure);act('MORNING_DISSENT');next();}
 if(at('method')){read('ruth');pick('method','original');check();next();}
 if(at('sources')){for(const id of ['camera','stockSource','receiptSource','collage']){read(id);pick(id,id==='collage'?'derived':'independent');}check();next();}
 if(at('preserve')){read('custody');for(const [index,id] of ['copy','compare','log'].entries())act({type:'MORNING_ORDER',index,id});check();next();}
 if(at('clock')){read('calibration');pick('time','1810');pick('scope','interval');check();next();}
 if(at('timeline')){for(const id of ['inventory','transport','receipt'])read(id);for(const [index,id] of ['clip','stock','move','safe'].entries())act({type:'MORNING_ORDER',index,id});check();next();}
 if(at('model')){read('inspection');for(const [id,value] of Object.entries({clip:'box',stock:'later',safe:'found'}))pick(id,value);check();next();}
 if(at('responses')){for(const id of ['manager','editor','mara'])read(id);next();}
 if(at('privacy')){read('consent');for(const [id,value] of Object.entries({times:'publish',seal:'publish',neighbours:'mask',message:'omit',address:'omit'}))pick(id,value);pick('naming',naming);check();next();}
 if(at('publish')){act('MORNING_REVISE');act('MORNING_GROUP');act('MORNING_PUBLISH');next();}
 return s;
}
