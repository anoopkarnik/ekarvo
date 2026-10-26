import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import type {createMaterialStudio} from './materialStudio';

/** A keyed result registers with its acceptance aperture. Both are present before verification. */
export function createProofObject(materials:ReturnType<typeof createMaterialStudio>['materials']){
 const {ceramic,titanium,edge,blue}=materials,group=new THREE.Group();
 const base=new THREE.Mesh(new RoundedBoxGeometry(5.8,.6,4.8,4,.2),ceramic);base.position.y=-.1;group.add(base);
 const points:[number,number][]=[[-1.8,-1.1],[.45,-1.1],[.45,-.55],[1.8,-.55],[1.8,1.1],[-1.8,1.1]];
 const aperture=new THREE.Shape();aperture.moveTo(-2.8,-2.3);aperture.lineTo(2.8,-2.3);aperture.lineTo(2.8,2.3);aperture.lineTo(-2.8,2.3);aperture.closePath();
 const hole=new THREE.Path(points.slice().reverse().map(([x,y])=>new THREE.Vector2(x,y)));hole.closePath();aperture.holes.push(hole);
 const apertureGeo=new THREE.ExtrudeGeometry(aperture,{depth:.2,bevelEnabled:true,bevelSegments:3,steps:1,bevelSize:.1,bevelThickness:.07});apertureGeo.rotateX(-Math.PI/2);
 const target=new THREE.Mesh(apertureGeo,[titanium,edge]);target.position.y=1.7;group.add(target);
 const shape=new THREE.Shape(points.map(([x,y])=>new THREE.Vector2(x*.97,y*.97)));shape.closePath();
 const resultGeo=new THREE.ExtrudeGeometry(shape,{depth:.18,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.025,bevelThickness:.025});resultGeo.rotateX(-Math.PI/2);
 const result=new THREE.Mesh(resultGeo,blue);group.add(result);
 for(const x of [-2.5,2.5]){
  const pillar=new THREE.Mesh(new THREE.CylinderGeometry(.11,.11,1.5,12),edge);pillar.position.set(x,.85,1.9);group.add(pillar);
  const foot=new THREE.Mesh(new RoundedBoxGeometry(.6,.22,.6,3,.08),edge);foot.position.set(x,.3,1.9);group.add(foot);
 }
 const update=(verified:number,arrival=1)=>{result.position.y=-.55+arrival*.9+verified*1.4};
 update(0,0);return {group,result,update};
}
