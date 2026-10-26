import * as THREE from 'three';

function brushedTexture(){
 const size=256,data=new Uint8Array(size*size*4);
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  const n=Math.sin(y*91.73+x*.019)*43758.5,v=170+(n-Math.floor(n))*18+Math.sin(y*2.3)*12,i=(y*size+x)*4;
  data[i]=data[i+1]=data[i+2]=v;data[i+3]=255;
 }
 const texture=new THREE.DataTexture(data,size,size);texture.wrapS=texture.wrapT=THREE.RepeatWrapping;
 texture.generateMipmaps=true;texture.minFilter=THREE.LinearMipmapLinearFilter;texture.needsUpdate=true;return texture;
}

/** One material and lighting family for the movie and self-contained product compositions. */
export function createMaterialStudio(host:HTMLElement){
 const renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});
 renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.95;
 renderer.domElement.setAttribute('aria-hidden','true');host.appendChild(renderer.domElement);
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(42,1,.1,400);
 scene.fog=new THREE.FogExp2('#0b0f14',.006);
 const pmrem=new THREE.PMREMGenerator(renderer),studio=new THREE.Scene();studio.background=new THREE.Color('#0b1017');
 for(const [p,size,color,intensity] of [
  [[-12,10,8],[7,24],'#fff3e2',6],[[14,7,-5],[3,22],'#d8e8ff',5],[[0,18,-3],[20,7],'#ffffff',3],
 ] as const){
  const panel=new THREE.Mesh(new THREE.PlaneGeometry(size[0],size[1]),new THREE.MeshBasicMaterial({color:new THREE.Color(color).multiplyScalar(intensity),side:THREE.DoubleSide}));
  panel.position.set(p[0],p[1],p[2]);panel.lookAt(0,0,0);studio.add(panel);
 }
 const environment=pmrem.fromScene(studio,.06);scene.environment=environment.texture;scene.environmentIntensity=1;
 studio.traverse(o=>{if(o instanceof THREE.Mesh){o.geometry.dispose();o.material.dispose()}});pmrem.dispose();
 const grain=brushedTexture();
 const materials={
  titanium:new THREE.MeshPhysicalMaterial({color:'#a4aeb8',metalness:.92,roughness:.38,bumpMap:grain,bumpScale:.008,anisotropy:.65,clearcoat:.12,clearcoatRoughness:.3}),
  edge:new THREE.MeshStandardMaterial({color:'#d6dfe2',metalness:.95,roughness:.18}),
  ceramic:new THREE.MeshPhysicalMaterial({color:'#17232d',metalness:.22,roughness:.29,clearcoat:.45,clearcoatRoughness:.22}),
  glass:new THREE.MeshPhysicalMaterial({color:'#7fabb5',metalness:.35,roughness:.16,transparent:true,opacity:.36,depthWrite:false,side:THREE.DoubleSide,clearcoat:1}),
  blue:new THREE.MeshBasicMaterial({color:'#315cf5',toneMapped:false,fog:false}),
 };
 const key=new THREE.DirectionalLight('#fff0d9',2.6);key.position.set(-12,24,9);scene.add(key);
 const rim=new THREE.DirectionalLight('#afc9ee',1.8);rim.position.set(13,14,-23);scene.add(rim);
 scene.add(new THREE.HemisphereLight('#c5d2e1','#10151d',.55));
 const dispose=()=>{
  const geometries=new Set<THREE.BufferGeometry>(),mats=new Set<THREE.Material>();
  scene.traverse(o=>{if(o instanceof THREE.Mesh||o instanceof THREE.Line){geometries.add(o.geometry);for(const m of Array.isArray(o.material)?o.material:[o.material])mats.add(m)}if(o instanceof THREE.DirectionalLight||o instanceof THREE.SpotLight||o instanceof THREE.PointLight)o.shadow.dispose()});
  geometries.forEach(g=>g.dispose());mats.forEach(m=>m.dispose());Object.values(materials).forEach(m=>m.dispose());
  grain.dispose();environment.dispose();renderer.dispose();renderer.domElement.remove();
 };
 return {renderer,scene,camera,materials,key,dispose};
}
