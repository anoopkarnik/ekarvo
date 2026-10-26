import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { clamp, ease, filmStateAt } from './filmTimeline';
import {layerLift} from './fieldShape';
import {createMaterialStudio} from './materialStudio';
import {createProofObject} from './proofObject';
import {fitComposition} from './composition';

const LANES = 4;
const CUT = .47;
const path = new THREE.CatmullRomCurve3([
  new THREE.Vector3(-22, -1, 16), new THREE.Vector3(-10, 1, 15),
  new THREE.Vector3(3, 6, 11), new THREE.Vector3(7, 13, 1),
  new THREE.Vector3(1, 10, -8), new THREE.Vector3(-8, 4, -15),
  new THREE.Vector3(-4, 1, -24), new THREE.Vector3(12, 0, -30),
]);
const Y = new THREE.Vector3(0, 1, 0);
function frameAt(t:number){
  const tangent=path.getTangent(clamp(t));
  const side=new THREE.Vector3().crossVectors(tangent,Y).normalize();
  side.applyAxisAngle(tangent,Math.sin(t*Math.PI*2)*.55);
  const up=new THREE.Vector3().crossVectors(side,tangent).normalize();
  return {tangent,side,up};
}
function position(t: number, lane: number, lift = 0) {
  const p = path.getPoint(clamp(t)),{side,up}=frameAt(t);
  return p.addScaledVector(side, (lane - 1.5) * 1.65).addScaledVector(up, lift);
}

/** Closed bevelled strip. Wide top, narrow polished bevel, dark underside, real thickness. */
function ribbon(start: number, end: number, lane: number, width: number, height: number, lift = 0) {
  const segments = Math.ceil((end-start)*240), vertices: number[] = [], indices: number[] = [], uv: number[] = [];
  const w=width/2,h=height/2,b=Math.min(height*.3,.07);
  const section:[number,number][]=[[-w+b,h],[w-b,h],[w,h-b],[w,-h+b],[w-b,-h],[-w+b,-h],[-w,-h+b],[-w,h-b]];
  for(let i=0;i<=segments;i++){
    const t=start+(end-start)*i/segments,p=position(t,lane,lift),{side,up}=frameAt(t);
    for(let j=0;j<8;j++){
      const v=p.clone().addScaledVector(side,section[j]![0]).addScaledVector(up,section[j]![1]);
      vertices.push(v.x,v.y,v.z);uv.push(i/segments*32,j/8);
    }
    if(i<segments)for(let j=0;j<8;j++){
      const a=i*8+j,b=i*8+(j+1)%8,c=(i+1)*8+j,d=(i+1)*8+(j+1)%8;
      indices.push(a,b,c,b,d,c);
    }
  }
  for(let j=1;j<7;j++){indices.push(0,j+1,j);const b=segments*8;indices.push(b,b+j,b+j+1)}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));
  geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setIndex(indices);geo.computeVertexNormals();
  if(start<CUT){
    const opened=vertices.slice();
    for(let i=0;i<=segments;i++){const t=start+(end-start)*i/segments;for(let j=0;j<8;j++){const k=(i*8+j)*3+1;opened[k]=opened[k]!+layerLift(t,lane,1)}}
    geo.morphAttributes.position=[new THREE.Float32BufferAttribute(opened,3)];
    const normalGeo=new THREE.BufferGeometry();normalGeo.setAttribute('position',new THREE.Float32BufferAttribute(opened,3));normalGeo.setIndex(indices);normalGeo.computeVertexNormals();
    geo.morphAttributes.normal=[normalGeo.getAttribute('normal').clone()];normalGeo.dispose();
  }
  return geo;
}

// Camera and gaze are separate splines: the lens follows the work, not a rotation of the whole scene.
const eyes=[ [18,26,36], [24,20,8], [20,20,-3], [24,22,2], [23,25,18], [23,15,-20], [25,37,34] ];
const gazes=[ [-2,8,-5], [2,10,0], [3,6,11], [1,10,-5], [5,10,-3], [11,1,-28], [-1,6,-6] ];
const vector=(a:number[]|undefined)=>new THREE.Vector3(...a! as [number,number,number]);
function track(points:number[][], p:number){
  const i=Math.min(5,Math.floor(p)),t=p-i;
  // Cubic Hermite gives a continuous tangent through chapter boundaries.
  const a=vector(points[i]),b=vector(points[i+1]);
  const m0=vector(points[Math.min(6,i+1)]).sub(vector(points[Math.max(0,i-1)])).multiplyScalar(.35);
  const m1=vector(points[Math.min(6,i+2)]).sub(vector(points[i])).multiplyScalar(.35);
  return a.multiplyScalar(2*t*t*t-3*t*t+1).addScaledVector(m0,t*t*t-2*t*t+t)
    .addScaledVector(b,-2*t*t*t+3*t*t).addScaledVector(m1,t*t*t-t*t);
}

export function createKineticWorld(host: HTMLElement, labels: HTMLElement[], options: {composition?: 'study'; paper?: boolean} = {}) {
  const studio=createMaterialStudio(host),{renderer,scene,camera,key}=studio;
  const {titanium,edge,ceramic,blue}=studio.materials;
  const night=new THREE.Color('#0b0f14'),day=new THREE.Color('#e8e7e3'),background=night.clone(),groundDay=new THREE.Color('#c7c9c8');
  const metalNight=new THREE.Color('#a4aeb8'),metalDay=new THREE.Color('#61717d');
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(400,400),new THREE.MeshStandardMaterial({color:'#030507',roughness:1,metalness:0}));
  floor.rotation.x=-Math.PI/2;floor.position.y=-2.6;scene.add(floor);

  const far=new THREE.Group();scene.add(far);
  const nearLanes:THREE.Group[]=[],farLanes:THREE.Group[]=[],signals:THREE.Mesh[]=[];
  for(let lane=0;lane<LANES;lane++){
    const near=new THREE.Group(),downstream=new THREE.Group();scene.add(near);far.add(downstream);nearLanes.push(near);farLanes.push(downstream);
    for(const [start,end,group] of [[0,CUT,near],[CUT,1,downstream]] as const){
      group.add(new THREE.Mesh(ribbon(start,end,lane,1.3,.34),titanium));
      group.add(new THREE.Mesh(ribbon(start,end,lane,1.28,.16,-.27),ceramic));
      // Recessed rail on every lane makes the blue path part of the material.
      group.add(new THREE.Mesh(ribbon(start,end,lane,.25,.035,.192),ceramic));
      const geo=ribbon(start,end,lane,.19,.04,.22),signal=new THREE.Mesh(geo,blue);
      signal.userData={start,end,total:geo.index!.count};group.add(signal);signals.push(signal);
    }
    // Optical laminate rises with its own parent lane, rather than fading in as a separate illustration.
  }
  // Machined coupler faces and contact pins are permanent landmarks on both sides of the joint.
  const joint=new THREE.Group(),receiver=new THREE.Group();scene.add(joint);far.add(receiver);
  const cut=path.getPoint(CUT);
  joint.position.copy(cut);receiver.position.copy(cut);
  const basis=frameAt(CUT),matrix=new THREE.Matrix4().makeBasis(basis.side,basis.up,basis.tangent.clone().negate());
  joint.quaternion.setFromRotationMatrix(matrix);receiver.quaternion.copy(joint.quaternion);
  const housingGeo=new RoundedBoxGeometry(7.3,.9,1.15,3,.16);
  const housing=new THREE.Mesh(housingGeo,ceramic);housing.position.set(0,-.42,.6);joint.add(housing);
  const mate=new THREE.Mesh(housingGeo,ceramic);mate.position.set(0,-.42,-.6);receiver.add(mate);
  const pinGeo=new THREE.CylinderGeometry(.09,.09,.65,12);pinGeo.rotateX(Math.PI/2);
  for(let i=0;i<8;i++){
    const pin=new THREE.Mesh(pinGeo,edge);pin.position.set((i-3.5)*.78,0,-.16);joint.add(pin);
    const socket=new THREE.Mesh(new THREE.CylinderGeometry(.13,.13,.05,12),ceramic);socket.rotation.x=Math.PI/2;socket.position.set((i-3.5)*.78,0,.01);receiver.add(socket);
  }
  const shutter=new THREE.Mesh(new RoundedBoxGeometry(7.2,.5,.32,3,.1),edge);shutter.position.set(0,.48,-.18);receiver.add(shutter);
  const stop=new THREE.Mesh(new RoundedBoxGeometry(.7,.09,.09,2,.025),blue);stop.position.set(.825,.21,.1);joint.add(stop);
  // Two ceramic plinths anchor the continuous form; the joint remains its only mechanical interruption.
  for(const t of [.015,.985]){
    const group=t<CUT?scene:far,p=path.getPoint(t);
    const support=new THREE.Mesh(new RoundedBoxGeometry(7.1,2.5,2.8,3,.25),ceramic);
    support.position.copy(p);support.position.y-=1.55;support.rotation.y=Math.atan2(path.getTangent(t).x,path.getTangent(t).z);group.add(support);
  }
  const carrier=new THREE.Group();scene.add(carrier);
  const shell=new THREE.Mesh(new RoundedBoxGeometry(.72,.3,1.12,4,.12),ceramic);carrier.add(shell);
  const crown=new THREE.Mesh(new RoundedBoxGeometry(.57,.055,.62,3,.06),blue);crown.position.y=.17;carrier.add(crown);
  const carrierLight=new THREE.PointLight('#315cf5',1.2,4,2);carrierLight.position.y=.3;carrier.add(carrierLight);
  const endpoint=position(.985,2,.28),proofAssembly=createProofObject(studio.materials),proof=proofAssembly.group,result=proofAssembly.result;
  far.add(proof);proof.position.copy(endpoint);proof.rotation.y=Math.atan2(path.getTangent(.985).x,path.getTangent(.985).z);
  const proofLabels=Array.from(host.parentElement?.querySelectorAll<HTMLElement>('[data-ek-proof]')||[]);
  const proofTethers=Array.from(host.parentElement?.querySelectorAll<SVGLineElement>('[data-ek-proof-tether]')||[]);

  let width=1,height=1,dpr=1,slowFrames=0,lastCost=0,disposed=false;
  let cameraEyes=eyes.map(p=>[...p]),cameraGazes=gazes.map(p=>[...p]);
  let pulsePose:ReturnType<typeof fitComposition>,endingPose:ReturnType<typeof fitComposition>;
  const weak=(navigator.hardwareConcurrency||8)<=4;
  function resize(){
    width=host.clientWidth;height=host.clientHeight;dpr=Math.min(devicePixelRatio||1,weak||width<650?1:1.5);renderer.setPixelRatio(dpr);renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();
    const mobile=width<650,pulsePoints:THREE.Vector3[]=[],endingPoints:THREE.Vector3[]=[];
    for(let i=0;i<=24;i++)for(let lane=0;lane<4;lane++){
      const t=.14+i/24*.28,p=position(t,lane,.5);p.y+=layerLift(t,lane,1);pulsePoints.push(p);
      endingPoints.push(position(i/24,lane,.5));
    }
    for(const x of [-3,3])for(const z of [-2.5,2.5])endingPoints.push(new THREE.Vector3(x,2,z).applyQuaternion(proof.quaternion).add(proof.position));
    pulsePose=fitComposition(pulsePoints,new THREE.Vector3(17,14,-14),width,height,mobile?{left:.08,right:.92,top:.48,bottom:.73}:{left:.54,right:.96,top:.28,bottom:.78});
    endingPose=fitComposition(endingPoints,new THREE.Vector3(26,31,40),width,height,mobile?{left:.06,right:.94,top:.55,bottom:.88}:{left:.4,right:.96,top:.3,bottom:.88},mobile?-.4:0);
    cameraEyes=eyes.map(p=>[...p]);cameraGazes=gazes.map(p=>[...p]);
    const assignPose=(index:number,pose:ReturnType<typeof fitComposition>)=>{
      const gaze=pose.gaze.clone(),eye=pose.eye.clone();
      if(mobile){gaze.y-=6;eye.sub(gaze).multiplyScalar(1/1.7).add(gaze)}
      cameraEyes[index]=eye.toArray();cameraGazes[index]=gaze.toArray();
    };
    assignPose(2,pulsePose);if(mobile)assignPose(6,endingPose);
  }
  resize();
  function update(progress:number,pointerX=0,pointerY=0){
    if(disposed)return;
    const started=performance.now(),state=filmStateAt(progress),mobile=width<650;
    const daylight=options.composition==='study'?(options.paper?1:0):state.wide;
    background.copy(night).lerp(day,daylight);renderer.setClearColor(background);scene.fog!.color.copy(background);
    (floor.material as THREE.MeshStandardMaterial).color.set('#030507').lerp(groundDay,daylight);
    key.intensity=2.5+daylight*1.5;
    titanium.color.copy(metalNight).lerp(metalDay,daylight);
    far.position.set(state.gap*2.8,state.gap*1.6,-state.gap*4.6);
    far.rotation.z=state.gap*-.055;
    for(const group of nearLanes)for(const mesh of group.children)if(mesh instanceof THREE.Mesh&&mesh.morphTargetInfluences)mesh.morphTargetInfluences[0]=state.layers;
    shutter.position.y=.48-state.permission*1.25;shutter.rotation.x=-state.permission*Math.PI/2;
    stop.scale.x=1+ease(progress,.85,1.05)*.4;
    stop.position.y=.21-state.permission*.32;
    for(const mesh of signals){
      const {start,end,total}=mesh.userData;
      // Only the second strand carries the signal; its neighbors retain their neutral recessed rails.
      const active=mesh.parent===nearLanes[2]||mesh.parent===farLanes[2];
      mesh.geometry.setDrawRange(0,active?Math.floor(total*clamp((state.signal-start)/(end-start))/48)*48:0);
    }
    const t=state.signal,location=position(t,2,.48),orientation=frameAt(t);
    location.y-=ease(progress,4.95,5.2)*.9;
    carrier.position.copy(location);carrier.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(orientation.side,orientation.up,orientation.tangent.clone().negate()));
    proofAssembly.update(state.verified,ease(progress,4.88,5.1));
    const eye=track(cameraEyes,progress),gaze=track(cameraGazes,progress);
    const follow=ease(progress,3.9,4.12)*(1-ease(progress,4.7,4.95));
    gaze.lerp(location,follow);eye.lerp(location.clone().add(new THREE.Vector3(15,12,15)),follow);
    eye.x+=pointerX*.7;eye.y+=pointerY*.4;
    if(options.composition==='study'){
      eye.sub(gaze).multiplyScalar(mobile?1.65:1.15).add(gaze);
    }else if(mobile){eye.sub(gaze).multiplyScalar(1.7).add(gaze);gaze.y+=6;}
    camera.position.copy(eye);camera.lookAt(gaze);if(mobile&&options.composition!=='study')camera.rotateZ(-state.wide*.4);camera.updateMatrixWorld();
    // Compose the work in the right half on desktop; portrait reserves the upper half for text.
    const pulseFrame=ease(progress,1.4,1.85)*(1-ease(progress,2.35,2.9));
    const baseOffset=mobile?0:-width*(.21-state.wide*.05);
    camera.setViewOffset(width,height,options.composition==='study'?0:baseOffset+(pulsePose.offsetX-baseOffset)*pulseFrame,options.composition==='study'?0:pulsePose.offsetY*pulseFrame+(mobile?endingPose.offsetY*state.wide:0),width,height);
    renderer.render(scene,camera);
    labels.forEach((el,i)=>{
      const opacity=ease(progress,1.75,1.95)*(1-ease(progress,2.4,2.65));
      const lane=3-i,point=position(.25,lane,.55);point.y+=layerLift(.25,lane,state.layers);point.project(camera);
      const px=(point.x*.5+.5)*width,py=(-point.y*.5+.5)*height;
      const x=width*(mobile?.08:.46),y=height*(mobile?.81:.61)+(i-1.5)*(mobile?32:40);
      el.style.transform=`translate3d(${x}px,${y}px,0)`;el.style.opacity=String(opacity);
      const line=host.parentElement?.querySelector<SVGLineElement>(`[data-ek-tether="${i}"]`);
      if(line){line.setAttribute('x1',String(px));line.setAttribute('y1',String(py));line.setAttribute('x2',String(x));line.setAttribute('y2',String(y+16));line.style.opacity=String(opacity*.55)}
    });
    proofLabels.forEach((el,i)=>{
      const finish=ease(progress,5.82,6),opacity=Math.max(ease(progress,4.6,4.85)*(1-ease(progress,5.5,5.8)),i===1?finish:0);
      const point=proof.localToWorld(new THREE.Vector3(i===0?2.9:0,i===0?1.8:result.position.y+.2,0)).project(camera);
      const x=finish>.5?clamp((point.x*.5+.5)*width-60,24,width-170):mobile?24:clamp((point.x*.5+.5)*width+24,width*.59,width-200);
      const y=finish>.5?clamp((-point.y*.5+.5)*height+28,height*.6,height*.89):mobile?height*.76+i*42:height*.51+(i===0?-34:42);
      const text=i===1?(finish>.5?'Verified result':'Result'):'Success condition';if(el.textContent!==text)el.textContent=text;
      el.style.transform=`translate3d(${x}px,${y}px,0)`;el.style.opacity=String(opacity);
      const line=proofTethers[i];if(line){line.setAttribute('x1',String(x+(mobile?120:0)));line.setAttribute('y1',String(y+16));line.setAttribute('x2',String((point.x*.5+.5)*width));line.setAttribute('y2',String((-point.y*.5+.5)*height));line.style.opacity=String(opacity*.35)}
    });
    lastCost=performance.now()-started;
    if(lastCost>25&&++slowFrames>12&&dpr>1){dpr=1;renderer.setPixelRatio(dpr);renderer.setSize(width,height,false);}
    host.dataset.frame=JSON.stringify({progress:+progress.toFixed(3),signal:+state.signal.toFixed(3),gap:+state.gap.toFixed(3),permission:+state.permission.toFixed(3),verified:+state.verified.toFixed(3),calls:renderer.info.render.calls,triangles:renderer.info.render.triangles,dpr});
  }
  function dispose(){disposed=true;studio.dispose()}
  return {update,resize,dispose};
}
