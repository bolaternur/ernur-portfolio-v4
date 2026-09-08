import * as THREE from 'three';

const host=document.querySelector('.cube-scene');
if(!host) throw new Error('Cube scene not found');
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const coarse=matchMedia('(pointer: coarse)').matches;

const canvas=document.createElement('canvas');
canvas.className='cube-webgl';canvas.setAttribute('aria-label','Interactive procedural twisty cube');
host.appendChild(canvas);
host.insertAdjacentHTML('beforeend','<div class="cube-webgl-hud" aria-hidden="true"><span>procedural / 27 cubies</span><span>drag / orbit<br>click / twist</span><span>cubing club · ~15 variants</span></div>');

const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio||1,coarse?1.1:1.55));
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.03;
const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(32,1,.1,100);
camera.position.set(6.2,4.8,7.4);camera.lookAt(0,0,0);

scene.add(new THREE.HemisphereLight(0xf7f4ee,0x24211c,2.2));
const key=new THREE.DirectionalLight(0xffffff,4.6);key.position.set(4,7,5);scene.add(key);
const rim=new THREE.DirectionalLight(0xd45a36,2.1);rim.position.set(-4,2,-5);scene.add(rim);
const fill=new THREE.DirectionalLight(0xa9b0b6,1.25);fill.position.set(-5,-2,3);scene.add(fill);

const root=new THREE.Group();root.rotation.set(-.34,.58,.08);scene.add(root);
const pivot=new THREE.Group();root.add(pivot);
const cubelets=[];
const gap=1.04,size=.91;
const baseMat=new THREE.MeshStandardMaterial({color:0x171714,metalness:.12,roughness:.55});
const paperMat=new THREE.MeshStandardMaterial({color:0xeee9df,metalness:.08,roughness:.43});
const accentMat=new THREE.MeshStandardMaterial({color:0xd45a36,metalness:.05,roughness:.48});
const greyMat=new THREE.MeshStandardMaterial({color:0x77756f,metalness:.12,roughness:.52});
const edgeMat=new THREE.LineBasicMaterial({color:0x0b0b0a,transparent:true,opacity:.58});

for(let x=-1;x<=1;x++)for(let y=-1;y<=1;y++)for(let z=-1;z<=1;z++){
  const mats=[x===1?accentMat:baseMat,x===-1?greyMat:baseMat,y===1?paperMat:baseMat,y===-1?greyMat:baseMat,z===1?paperMat:baseMat,z===-1?accentMat:baseMat];
  const geo=new THREE.BoxGeometry(size,size,size);
  const mesh=new THREE.Mesh(geo,mats);mesh.position.set(x*gap,y*gap,z*gap);mesh.userData.grid={x,y,z};root.add(mesh);cubelets.push(mesh);
  const edges=new THREE.LineSegments(new THREE.EdgesGeometry(geo),edgeMat);mesh.add(edges);
}

const pointer={x:0,y:0},target={x:.58,y:-.34};let dragging=false,lastX=0,lastY=0,twisting=false,axisIndex=0;
function onPointerMove(e){
  const r=host.getBoundingClientRect();pointer.x=(e.clientX-r.left)/r.width-.5;pointer.y=(e.clientY-r.top)/r.height-.5;
  if(dragging){target.x+=(e.clientX-lastX)*.008;target.y+=(e.clientY-lastY)*.008;lastX=e.clientX;lastY=e.clientY}else{target.x=.58+pointer.x*.32;target.y=-.34+pointer.y*.24}
}
host.addEventListener('pointermove',onPointerMove,{passive:true});
host.addEventListener('pointerdown',e=>{dragging=true;lastX=e.clientX;lastY=e.clientY;host.setPointerCapture?.(e.pointerId)});
host.addEventListener('pointerup',e=>{dragging=false;host.releasePointerCapture?.(e.pointerId)});
host.addEventListener('pointerleave',()=>{dragging=false});

function nearestQuarter(v){const q=Math.PI/2;return Math.round(v/q)*q}
function twistLayer(){
  if(twisting||reduced)return;twisting=true;
  const axes=['y','x','z'];const axis=axes[axisIndex++%axes.length];
  const selected=cubelets.filter(c=>c.position[axis]>.72);
  selected.forEach(c=>pivot.attach(c));
  const state={v:0};
  const finish=()=>{
    selected.forEach(c=>{root.attach(c);c.position.x=Math.round(c.position.x/gap)*gap;c.position.y=Math.round(c.position.y/gap)*gap;c.position.z=Math.round(c.position.z/gap)*gap;c.rotation.x=nearestQuarter(c.rotation.x);c.rotation.y=nearestQuarter(c.rotation.y);c.rotation.z=nearestQuarter(c.rotation.z)});
    pivot.rotation.set(0,0,0);twisting=false;
  };
  if(window.gsap){window.gsap.to(state,{v:Math.PI/2,duration:.72,ease:'power3.inOut',onUpdate(){pivot.rotation[axis]=state.v},onComplete:finish})}
  else{pivot.rotation[axis]=Math.PI/2;finish()}
}
host.addEventListener('click',e=>{if(Math.abs(e.clientX-lastX)<8&&Math.abs(e.clientY-lastY)<8)twistLayer()});

let visible=true;new IntersectionObserver(entries=>{visible=entries[0]?.isIntersecting??true},{rootMargin:'300px'}).observe(host);
const clock=new THREE.Clock();
function frame(){requestAnimationFrame(frame);if(!visible)return;const dt=Math.min(.04,clock.getDelta());
  root.rotation.y+=(target.x-root.rotation.y)*(reduced?1:.045);
  root.rotation.x+=(target.y-root.rotation.x)*(reduced?1:.045);
  if(!reduced&&!dragging&&!twisting) root.rotation.z=Math.sin(performance.now()*.00035)*.045;
  renderer.render(scene,camera);
}
function resize(){const r=host.getBoundingClientRect();const w=Math.max(1,r.width),h=Math.max(1,r.height);renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}
new ResizeObserver(resize).observe(host);resize();frame();host.classList.add('is-webgl-ready');
