// Physical grid stays left-to-right in every language: A B C / D E F.
// Directions run clockwise: north, east, south, west.
export const CHANNEL_TYPES=['straight','straight','corner','corner','straight','corner'];
export const CHANNEL_START=[0,1,0,3,0,2];
export const CHANNEL_SOLUTION=[1,1,2,1,1,3];
export function validChannels(rotations){return Array.isArray(rotations)&&rotations.length===6&&rotations.every(value=>Number.isInteger(value)&&value>=0&&value<4);}
export function channelOpenings(index,rotations){
 const base=CHANNEL_TYPES[index]==='straight'?[0,2]:[0,1];
 return base.map(direction=>(direction+rotations[index])%4);
}
export function traceChannels(rotations){
 if(!validChannels(rotations))throw Error('Ungültige Kanalstellungen.');
 const path=[];
 let tile=0,entry=3;
 while(!path.includes(tile)){
  const openings=channelOpenings(tile,rotations);
  if(!openings.includes(entry))return {path,solved:false,stop:{tile,side:entry}};
  path.push(tile);
  const exit=openings.find(direction=>direction!==entry);
  if(tile===3&&exit===2)return {path,solved:path.length===6,stop:path.length===6?null:{tile,side:exit}};
  const row=Math.floor(tile/3),column=tile%3;
  const nextRow=row+[-1,0,1,0][exit],nextColumn=column+[0,1,0,-1][exit];
  if(nextRow<0||nextRow>1||nextColumn<0||nextColumn>2)return {path,solved:false,stop:{tile,side:exit}};
  const next=nextRow*3+nextColumn,nextEntry=(exit+2)%4;
  if(!channelOpenings(next,rotations).includes(nextEntry))return {path,solved:false,stop:{tile:next,side:nextEntry}};
  tile=next;entry=nextEntry;
 }
 return {path,solved:false,stop:{tile,side:entry}};
}
