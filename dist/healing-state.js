// Realistic evidence chains. No medical intervention is performed by the player.
export const HEALING_PHASES=['opening','call','study','contact','supply','contract','protect','chain','responses','revise','publish','followup'];
export const HEALING_STAGES=[...HEALING_PHASES.map(p=>'healing-'+p),'healing-complete'];
export const HEALING_DOCS={opening:['clinic','request'],call:['draft','patient'],study:['protocol','results'],contact:['permission','origin'],supply:['arrival','quality','reserved'],contract:['c24','n2','payment'],protect:['withdrawal','risk'],chain:['register','audit'],responses:['vela','office','hospital'],revise:['review'],publish:['approval'],followup:['delivery','outcome']};
// Fields belong to exactly one phase. Values are stable, language-independent IDs.
export const HEALING_OPTIONS={
 call:{approach:['doubt','together']},
 study:{benefit:['ten','fifty','cure'],scope:['adults','everyone'],safety:['uncertain','safe']},
 contact:{access:['limited','upload'],provenance:['compare','trust']},
 supply:{batch:['b41','b14'],available:['forty','hundred','twenty'],hold:['retain','release']},
 contract:{cash:['twohundred','onetwenty'],gap:['3200','8000','zero'],cost:['security','profit']},
 protect:{private:['omit','publish'],fingerprint:['omit','nameonly'],public:['keep','hide']},
 responses:{barrier:['documented','rumour'],intent:['open','corrupt'],responseMode:['written','meeting']},
 revise:{wording:['limited','cure']},followup:{accessResult:['arrived','promised'],healthResult:['unknown','cured']}
};
export const HEALING_SOLUTIONS={call:{approach:['doubt','together']},study:{benefit:'ten',scope:'adults',safety:'uncertain'},contact:{access:'limited',provenance:'compare'},supply:{batch:'b41',available:'forty',hold:'retain'},contract:{cash:'twohundred',gap:'3200',cost:'security'},protect:{private:'omit',fingerprint:'omit',public:'keep'},responses:{barrier:'documented',intent:'open',responseMode:['written','meeting']},revise:{wording:'limited'},followup:{accessResult:'arrived',healthResult:'unknown'}};
export const HEALING_ORDER=['effective','ordered','shortfall','waiting'];
export function initialHealing(){return {read:[],picks:{},checked:[],order:[null,null,null,null],protected:false,met:false,revised:false,approved:false,published:false};}
export function healingCheck(c,p){return (HEALING_DOCS[p]||[]).every(id=>c.read.includes(id))&&Object.entries(HEALING_SOLUTIONS[p]||{}).every(([id,value])=>Array.isArray(value)?value.includes(c.picks[id]):c.picks[id]===value)&&(p!=='chain'||HEALING_ORDER.every((id,i)=>c.order[i]===id))&&HEALING_PHASES.includes(p);}
export function healingReady(c,p){return c.checked.includes(p)&&({protect:c.protected,chain:c.met,revise:c.revised,publish:c.published}[p]??true);}
export function reduceHealing(s,a){
 const n=structuredClone(s),c=n.healing,o=s.healing,i=HEALING_STAGES.indexOf(s.stage),p=s.stage.slice(8);
 if(a.type==='HEALING_START'){if(s.stage==='mask-complete')n.stage=HEALING_STAGES[0];return n;}
 if(i<0)return n;
 switch(a.type){
 case 'HEALING_READ':if((HEALING_DOCS[p]||[]).includes(a.id)&&!o.read.includes(a.id))c.read.push(a.id);break;
 case 'HEALING_PICK':if(!o.checked.includes(p)&&HEALING_OPTIONS[p]?.[a.id]?.includes(a.value))c.picks[a.id]=a.value;break;
 case 'HEALING_ORDER':if(p==='chain'&&!o.checked.includes(p)&&Number.isInteger(a.index)&&a.index>=0&&a.index<4&&HEALING_ORDER.includes(a.id)){c.order=c.order.map(id=>id===a.id?null:id);c.order[a.index]=a.id;}break;
 case 'HEALING_CHECK':if(healingCheck(o,p)&&!o.checked.includes(p))c.checked.push(p);break;
 case 'HEALING_PROTECT':if(p==='protect'&&o.checked.includes(p))c.protected=true;break;
 case 'HEALING_MEET':if(p==='chain'&&o.checked.includes(p))c.met=true;break;
 case 'HEALING_REVISE':if(p==='revise'&&o.checked.includes(p))c.revised=true;break;
 case 'HEALING_APPROVE':if(p==='publish'&&o.checked.includes(p))c.approved=true;break;
 case 'HEALING_PUBLISH':if(p==='publish'&&o.approved)c.published=true;break;
 case 'HEALING_NEXT':if(i<12&&healingReady(o,p))n.stage=HEALING_STAGES[i+1];break;
 case 'HINT':n.hints[s.stage]=Math.min(3,(s.hints[s.stage]||0)+1);break;
 }
 return n;
}
export function validateHealing(input,stage){
 const c=initialHealing(),bad=()=>{throw Error('Die Heilungsrecherche überspringt eine notwendige Handlung.');};
 if(!input||typeof input!=='object')bad();
 for(const key of ['protected','met','revised','approved','published']){if(typeof input[key]!=='boolean')bad();c[key]=input[key];}
 const all=Object.values(HEALING_DOCS).flat();
 for(const [key,allowed] of [['read',all],['checked',HEALING_PHASES]]){if(!Array.isArray(input[key])||input[key].some(id=>!allowed.includes(id))||new Set(input[key]).size!==input[key].length)bad();c[key]=[...input[key]];}
 if(!input.picks||typeof input.picks!=='object'||Array.isArray(input.picks))bad();
 const options=Object.assign({},...Object.values(HEALING_OPTIONS));
 for(const [id,value] of Object.entries(input.picks)){if(!options[id]?.includes(value))bad();c.picks[id]=value;}
 if(!Array.isArray(input.order)||input.order.length!==4||input.order.some(id=>id!==null&&!HEALING_ORDER.includes(id))||new Set(input.order.filter(Boolean)).size!==input.order.filter(Boolean).length)bad();c.order=[...input.order];
 const i=HEALING_STAGES.indexOf(stage);
 if(i<0){if(JSON.stringify(c)!==JSON.stringify(initialHealing()))bad();return c;}
 for(const [p,ids] of Object.entries(HEALING_DOCS))if(HEALING_PHASES.indexOf(p)>i&&ids.some(id=>c.read.includes(id)))bad();
 for(const [p,fields] of Object.entries(HEALING_OPTIONS))if(HEALING_PHASES.indexOf(p)>i&&Object.keys(fields).some(id=>Object.hasOwn(c.picks,id)))bad();
 if(i<7&&c.order.some(Boolean))bad();
 for(const p of c.checked)if(HEALING_PHASES.indexOf(p)>i||!healingCheck(c,p))bad();
 for(const [flag,p] of [['protected','protect'],['met','chain'],['revised','revise'],['approved','publish'],['published','publish']])if(c[flag]&&(HEALING_PHASES.indexOf(p)>i||!c.checked.includes(p)))bad();
 if(c.published&&!c.approved)bad();
 for(let j=0;j<i;j++)if(!healingReady(c,HEALING_PHASES[j]))bad();
 return c;
}
