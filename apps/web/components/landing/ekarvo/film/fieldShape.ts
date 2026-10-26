/** Pulse opens a local information section. Its endpoints remain physically attached. */
export function layerLift(t:number,lane:number,strength:number){
 if(t<=.1||t>=.44||strength===0)return 0;
 const envelope=Math.sin((t-.1)/.34*Math.PI)**2;
 return (lane-1.5)*2.4*envelope*strength;
}
