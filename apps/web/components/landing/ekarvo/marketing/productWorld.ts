// Adapted from Website/src/creative/productWorld.ts. Loaded only by the visible-scene runtime.
import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {createMaterialStudio} from '../film/materialStudio';
import {createProofObject} from '../film/proofObject';
import {clamp} from '../film/filmTimeline';

type Mode='operations'|'execution';
/** Product key art shares the material language, but explains its subject without the movie. */
export function createProductWorld(host:HTMLElement,mode:Mode,paper:boolean){
 const studio=createMaterialStudio(host),{renderer,scene,camera,materials}=studio;
 const {titanium,ceramic,glass,edge,blue}=materials;
 const root=new THREE.Group();scene.add(root);
 const labels=Array.from(host.parentElement?.querySelectorAll<HTMLElement>('[data-product-label]')||[]);
 const tethers=Array.from(host.parentElement?.querySelectorAll<SVGLineElement>('[data-product-tether]')||[]);
 const anchors:THREE.Vector3[]=[],layers:THREE.Group[]=[];
 const baseColor=new THREE.Color(paper?'#e8e7e3':'#0b0f14');renderer.setClearColor(baseColor);scene.fog!.color.copy(baseColor);
 const floor=new THREE.Mesh(new THREE.PlaneGeometry(400,400),new THREE.ShadowMaterial({color:'#000000',opacity:paper?.22:.4}));floor.rotation.x=-Math.PI/2;floor.position.y=-3.4;floor.receiveShadow=true;scene.add(floor);
 renderer.shadowMap.type=THREE.PCFShadowMap;studio.key.castShadow=true;studio.key.shadow.mapSize.set(1024,1024);
 Object.assign(studio.key.shadow.camera,{left:-14,right:14,top:14,bottom:-14,near:1,far:65});studio.key.shadow.camera.updateProjectionMatrix();studio.key.shadow.bias=-.0003;studio.key.shadow.normalBias=.02;
 const tube=(points:THREE.Vector3[],radius:number,material:THREE.Material)=>new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),80,radius,8,false),material);
 let drivePath:THREE.CatmullRomCurve3|undefined,signal:THREE.Mesh|undefined,carrier:THREE.Group|undefined,proof:ReturnType<typeof createProofObject>|undefined;

 if(mode==='operations'){
  // Four machined strata terminate in one common optical core. No unconnected ends.
  const contour=new THREE.Shape();contour.absarc(0,0,7,-.35,2.25,false);contour.absarc(0,0,1.5,2.25,-.35,true);contour.closePath();
  const stratumGeo=new THREE.ExtrudeGeometry(contour,{depth:.22,steps:1,bevelEnabled:true,bevelSegments:3,bevelSize:.07,bevelThickness:.045,curveSegments:56});stratumGeo.rotateX(-Math.PI/2);
  for(let i=0;i<4;i++){
   const layer=new THREE.Group();layers.push(layer);root.add(layer);
   const plate=new THREE.Mesh(stratumGeo,i===1?glass:titanium);layer.add(plate);
   const underside=new THREE.Mesh(stratumGeo,ceramic);underside.position.y=-.18;layer.add(underside);
   const points=[new THREE.Vector3(6.5, .29,2.05),new THREE.Vector3(4.5,.29,1.4),new THREE.Vector3(2.2,.29,.7),new THREE.Vector3(1.15,.29,.35)];
   layer.add(tube(points,.045,blue));
   anchors.push(new THREE.Vector3(5.8,(1.5-i)*1.15+.3,1.85));
  }
  const core=new THREE.Mesh(new THREE.CylinderGeometry(1.45,1.45,5.2,64),ceramic);core.position.y=.15;root.add(core);
  const lens=new THREE.Mesh(new THREE.CylinderGeometry(1.49,1.49,4.6,64,1,true,-.7,1.9),glass);lens.position.y=.15;root.add(lens);
  const seam=new THREE.Mesh(new RoundedBoxGeometry(.14,4.35,.12,3,.04),blue);seam.position.set(1.36,.15,.52);root.add(seam);
  for(const y of [-2.55,2.85]){
   const end=new THREE.Mesh(new THREE.CylinderGeometry(1.65,1.65,.28,64),edge);end.position.y=y;root.add(end);
  }
  const foot=new THREE.Mesh(new THREE.CylinderGeometry(2.1,2.4,.55,64),ceramic);foot.position.y=-2.95;root.add(foot);
 }else{
  drivePath=new THREE.CatmullRomCurve3([new THREE.Vector3(-8,0,3),new THREE.Vector3(-5.5,0,3),new THREE.Vector3(-2,0,0),new THREE.Vector3(1,0,0),new THREE.Vector3(4.5,0,-3.5),new THREE.Vector3(8,0,-3.5)]);
  const rail=(offset:number,width:number,height:number,material:THREE.Material)=>{
   const positions:number[]=[],indices:number[]=[];
   for(let i=0;i<=160;i++){
    const t=i/160,p=drivePath!.getPoint(t),tangent=drivePath!.getTangent(t),side=new THREE.Vector3(-tangent.z,0,tangent.x).normalize();
    for(const [x,y] of [[-width/2,height/2],[width/2,height/2],[width/2,-height/2],[-width/2,-height/2]] as const){const v=p.clone().addScaledVector(side,x+offset);v.y=y;positions.push(v.x,v.y,v.z)}
    if(i<160)for(let j=0;j<4;j++){const a=i*4+j,b=i*4+(j+1)%4,c=a+4,d=b+4;indices.push(a,b,c,b,d,c)}
   }
   indices.push(0,2,1,0,3,2,640,641,642,640,642,643);
   const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.setIndex(indices);geo.computeVertexNormals();const mesh=new THREE.Mesh(geo,material);root.add(mesh);return mesh;
  };
  rail(0,2.8,.75,ceramic);for(const side of [-1,1]){const trim=rail(side*1.2,.16,.12,edge);trim.position.y=.45}
  const inset=rail(0,.28,.04,ceramic);inset.position.y=.41;
  signal=rail(0,.16,.05,blue);signal.position.y=.46;
  const gate=new THREE.Group(),gatePoint=drivePath.getPoint(.45);gate.position.copy(gatePoint);root.add(gate);
  for(const x of [-1.65,1.65]){const upright=new THREE.Mesh(new RoundedBoxGeometry(.48,3.7,.65,4,.12),titanium);upright.position.set(0,1.8,x);gate.add(upright)}
  const lintel=new THREE.Mesh(new RoundedBoxGeometry(.48,.45,3.8,4,.12),edge);lintel.position.y=3.6;gate.add(lintel);
  const shutter=new THREE.Mesh(new RoundedBoxGeometry(.24,2.8,2.8,3,.12),ceramic);shutter.position.set(0,2.1,-2.9);shutter.rotation.y=-.65;gate.add(shutter);
  const start=drivePath.getPoint(0),origin=new THREE.Mesh(new RoundedBoxGeometry(2.5,.35,3.1,4,.16),titanium);origin.position.copy(start);origin.position.y=-.12;root.add(origin);
  proof=createProofObject(materials);proof.group.position.copy(drivePath.getPoint(1));proof.group.scale.setScalar(.65);proof.group.position.y=.35;root.add(proof.group);
  carrier=new THREE.Group();root.add(carrier);carrier.add(new THREE.Mesh(new RoundedBoxGeometry(.9,.4,1.2,4,.12),ceramic));const face=new THREE.Mesh(new RoundedBoxGeometry(.65,.06,.75,3,.06),blue);face.position.y=.22;carrier.add(face);
  anchors.push(start.clone().add(new THREE.Vector3(0,.5,0)),gatePoint.clone().add(new THREE.Vector3(0,3.8,0)),drivePath.getPoint(.7).add(new THREE.Vector3(0,.6,0)),drivePath.getPoint(1).add(new THREE.Vector3(0,2,0)));
 }
 root.traverse(o=>{if(o instanceof THREE.Mesh){o.castShadow=o.material!==glass;o.receiveShadow=true}});
 let width=1,height=1,dpr=1,disposed=false,slow=0,degraded=false;
 const resize=()=>{width=host.clientWidth;height=host.clientHeight;const weak=degraded||width<650||(navigator.hardwareConcurrency||8)<=4;dpr=Math.min(devicePixelRatio||1,weak?1:1.5);renderer.shadowMap.enabled=!weak;renderer.setPixelRatio(dpr);renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix()};resize();
 function update(progress:number,pointerX=0,pointerY=0){
  if(disposed)return;const started=performance.now(),mobile=width<650;
  const p=clamp(mode==='operations'?(progress-1.85)/.35:(progress-4.1)/.85);
  if(mode==='operations'){
   layers.forEach((layer,i)=>layer.position.y=(i-1.5)*(1.05+p*.18));
   camera.position.set(10+pointerX*.5,7+pointerY*.3,13);camera.lookAt(1.6,-.1,-.9);
  }else{
   const t=.55+p*.4,point=drivePath!.getPoint(t),tangent=drivePath!.getTangent(t);carrier!.position.copy(point);carrier!.position.y=.85;carrier!.rotation.y=Math.atan2(tangent.x,tangent.z);
   signal!.geometry.setDrawRange(0,Math.floor(signal!.geometry.index!.count*t/24)*24);proof!.update(.4+p*.6,1);
   camera.position.set(11+pointerX*.5,9+pointerY*.3,15);camera.lookAt(0,.5,-.7);
  }
  if(mobile){const target=mode==='operations'?new THREE.Vector3(1.6,-.1,-.9):new THREE.Vector3(.7,.5,-.7);camera.position.sub(target).multiplyScalar(mode==='operations'?1.32:1.6).add(target);camera.lookAt(target)}
  root.rotation.y=-.15;camera.setViewOffset(width,height,mobile?0:-width*.06,0,width,height);camera.updateMatrixWorld();renderer.render(scene,camera);
  labels.forEach((el,i)=>{
   const anchor=anchors[i]!.clone();if(mode==='operations')anchor.y=layers[3-i]!.position.y+.3;
   const point=root.localToWorld(anchor).project(camera),px=(point.x*.5+.5)*width,py=(-point.y*.5+.5)*height;
   let x:number,y:number;
   if(mode==='operations'){x=width*(mobile?.07:.10);y=height*.27+i*(mobile?36:42)}
   else{x=width*([.05,.32,.47,.73][i]!);y=height*([.76,.16,.76,.33][i]!);if(mobile){x=width*(i%2?.55:.06);y=height*(i<2?.08:.83)}}
   el.style.transform=`translate3d(${x}px,${y}px,0)`;
   const line=tethers[i];if(line){line.setAttribute('x1',String(x+20));line.setAttribute('y1',String(y+26));line.setAttribute('x2',String(px));line.setAttribute('y2',String(py))}
  });
  if(performance.now()-started>25&&++slow>12&&!degraded){degraded=true;resize()}
  host.dataset.frame=JSON.stringify({product:mode,progress:+progress.toFixed(3),calls:renderer.info.render.calls,triangles:renderer.info.render.triangles,dpr});
 }
 return {update,resize,dispose:()=>{disposed=true;studio.dispose()}};
}
