import * as THREE from 'three';
type ArtRect={left:number;right:number;top:number;bottom:number};
/** Fit actual landmarks to reserved negative space. Evaluated on resize, never per frame. */
export function fitComposition(points:THREE.Vector3[],direction:THREE.Vector3,width:number,height:number,rect:ArtRect,roll=0){
 const gaze=new THREE.Box3().setFromPoints(points).getCenter(new THREE.Vector3());
 const camera=new THREE.PerspectiveCamera(42,width/height,.1,400),axis=direction.clone().normalize();
 const offsetX=(.5-(rect.left+rect.right)/2)*width,offsetY=(.5-(rect.top+rect.bottom)/2)*height;
 camera.setViewOffset(width,height,offsetX,offsetY,width,height);
 let low=5,high=300;
 for(let i=0;i<25;i++){
  const distance=(low+high)/2;camera.position.copy(gaze).addScaledVector(axis,distance);camera.lookAt(gaze);camera.rotateZ(roll);camera.updateMatrixWorld();
  const fits=points.every(point=>{const p=point.clone().project(camera),x=p.x*.5+.5,y=-p.y*.5+.5;return p.z<1&&p.z>-1&&x>=rect.left&&x<=rect.right&&y>=rect.top&&y<=rect.bottom});
  if(fits)high=distance;else low=distance;
 }
 return {eye:gaze.clone().addScaledVector(axis,high*1.025),gaze,offsetX,offsetY};
}
