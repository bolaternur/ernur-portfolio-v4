import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';

const gsap = window.gsap;
const ScrollTrigger = window.ScrollTrigger;
if (gsap && ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const mobile = window.matchMedia('(max-width: 820px)').matches;

const boot = document.querySelector('.boot');
const bootBar = document.querySelector('.boot__bar span');
const bootValue = document.querySelector('.boot__value');

function setBoot(v){
  const p = THREE.MathUtils.clamp(v,0,1);
  if (bootBar) bootBar.style.transform = `scaleX(${p})`;
  if (bootValue) bootValue.textContent = String(Math.round(p*100)).padStart(2,'0');
}
function hideBoot(){
  setBoot(1);
  setTimeout(()=>boot?.classList.add('is-hidden'),240);
}

function createStage(canvas,{alpha=true}={}){
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30,1,.01,10000);
  const renderer = new THREE.WebGLRenderer({canvas,antialias:true,alpha,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,mobile?1.15:1.7));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const hemi = new THREE.HemisphereLight(0xffffff,0x151515,2.25);
  scene.add(hemi);
  const key = new THREE.DirectionalLight(0xffffff,4.2);
  key.position.set(4,6,5);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x8ebfff,2.2);
  rim.position.set(-4,1,-4);
  scene.add(rim);
  const warm = new THREE.DirectionalLight(0xff8c7b,1.1);
  warm.position.set(2,-2,3);
  scene.add(warm);

  function resize(){
    const r = canvas.getBoundingClientRect();
    const w = Math.max(1,r.width), h = Math.max(1,r.height);
    renderer.setSize(w,h,false);
    camera.aspect = w/h;
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(canvas);
  resize();

  let visible = true;
  new IntersectionObserver(entries=>{visible = entries[0]?.isIntersecting ?? true},{rootMargin:'300px'}).observe(canvas);
  const ticks=[];
  function frame(t){
    requestAnimationFrame(frame);
    if(!visible) return;
    ticks.forEach(fn=>fn(t));
    renderer.render(scene,camera);
  }
  requestAnimationFrame(frame);
  return {scene,camera,renderer,onFrame:fn=>ticks.push(fn)};
}

function normalizeObject(root,camera,mult=1.3){
  root.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(root);
  const center = box.getCenter(new THREE.Vector3());
  root.position.sub(center);
  root.updateMatrixWorld(true);
  const size = new THREE.Box3().setFromObject(root).getSize(new THREE.Vector3());
  const max = Math.max(size.x,size.y,size.z) || 1;
  const fov = THREE.MathUtils.degToRad(camera.fov);
  const dist = (max/(2*Math.tan(fov/2)))*mult;
  camera.position.set(dist*.78,dist*.45,dist);
  camera.near = Math.max(.001,dist/1000);
  camera.far = dist*50;
  camera.lookAt(0,0,0);
  camera.updateProjectionMatrix();
  return {max,dist};
}

function cloneMaterials(root){
  root.traverse(o=>{
    if(!o.isMesh) return;
    if(Array.isArray(o.material)) o.material=o.material.map(m=>m.clone());
    else if(o.material) o.material=o.material.clone();
  });
}

/* ------------------------------------------------------------------
   KEYBOARD — real OBJ when available, procedural fallback otherwise
------------------------------------------------------------------- */

const keyboardCanvas = document.getElementById('keyboard-canvas');
const keyboardStage = createStage(keyboardCanvas);
keyboardStage.camera.fov = 28;
keyboardStage.camera.updateProjectionMatrix();

const keyboardRoot = new THREE.Group();
keyboardStage.scene.add(keyboardRoot);

const keyMap = new Map();
const activeKeys = new Set();
const typed = document.getElementById('typed-text');
const typedBuffer=[];
const palette = [0xff2a2a,0x2a7fff,0x2aff2a];

const qwertyRows = [
  ['1','2','3','4','5','6','7','8','9','0'],
  ['Q','W','E','R','T','Y','U','I','O','P'],
  ['A','S','D','F','G','H','J','K','L'],
  ['Z','X','C','V','B','N','M'],
  ['SPACE']
];

function makeProceduralKeyboard(){
  const deck = new THREE.Mesh(
    new THREE.BoxGeometry(11.8,.42,4.6),
    new THREE.MeshStandardMaterial({color:0x141516,roughness:.52,metalness:.55})
  );
  deck.position.y=-.22;
  keyboardRoot.add(deck);

  const capMat = new THREE.MeshStandardMaterial({color:0x232527,roughness:.56,metalness:.12});
  const edgeMat = new THREE.MeshStandardMaterial({color:0x0a0b0c,roughness:.5,metalness:.35});

  const rowZ=[-1.55,-.55,.45,1.45,2.03];
  const widths=[1,1,1,1,4.5];
  const offsets=[-4.92,-4.92,-4.4,-3.4,-2.15];

  qwertyRows.forEach((row,ri)=>{
    row.forEach((label,ci)=>{
      const w=widths[ri];
      const group=new THREE.Group();
      const base=new THREE.Mesh(new THREE.BoxGeometry(w*.94,.22,.82),edgeMat.clone());
      base.position.y=.09;
      group.add(base);
      const cap=new THREE.Mesh(new THREE.BoxGeometry(w*.88,.22,.76),capMat.clone());
      cap.position.y=.25;
      cap.userData.baseY=.25;
      group.add(cap);
      group.position.set(offsets[ri]+ci*1.08,0,rowZ[ri]);
      group.userData.keyLabel=label;
      group.userData.cap=cap;
      keyMap.set(label,group);
      keyboardRoot.add(group);
    });
  });

  keyboardRoot.rotation.set(-.18,.38,-.08);
  keyboardRoot.scale.setScalar(.9);
  keyboardStage.camera.position.set(0,6.8,12.8);
  keyboardStage.camera.lookAt(0,0,0);
}

function assignRealModelKeys(root){
  const meshes=[];
  root.updateMatrixWorld(true);
  const whole = new THREE.Box3().setFromObject(root);
  const wholeSize = whole.getSize(new THREE.Vector3());
  root.traverse((o)=>{
    if(!o.isMesh) return;
    const b = new THREE.Box3().setFromObject(o);
    const s = b.getSize(new THREE.Vector3());
    if(s.x < wholeSize.x*.33 && s.z < wholeSize.z*.45 && s.y < wholeSize.y*.65) {
      const c=b.getCenter(new THREE.Vector3());
      meshes.push({o,c,s});
    }
  });

  if(meshes.length < 20) return false;
  meshes.sort((a,b)=> a.c.z===b.c.z ? a.c.x-b.c.x : a.c.z-b.c.z);
  const labels=qwertyRows.flat();
  const chosen=meshes.slice(0,labels.length);
  chosen.forEach((item,i)=>{
    const group=item.o;
    group.userData.baseY=group.position.y;
    group.userData.realKey=true;
    keyMap.set(labels[i],group);
  });
  return true;
}

async function loadKeyboardModel(){
  try{
    const mtlLoader = new MTLLoader();
    const materials = await mtlLoader.loadAsync('./assets/models/keyboard/lowprofilemechanicalkeyboard.mtl');
    materials.preload();
    const objLoader = new OBJLoader();
    objLoader.setMaterials(materials);
    const obj = await objLoader.loadAsync('./assets/models/keyboard/lowprofilemechanicalkeyboard.obj');
    cloneMaterials(obj);
    keyboardRoot.add(obj);
    const fit=normalizeObject(obj,keyboardStage.camera,mobile?1.52:1.16);
    obj.rotation.set(-.12,.22,0);
    const segmented=assignRealModelKeys(obj);
    if(!segmented){
      // Keep the authentic model as hero, add invisible tactile grid above it.
      makeVirtualKeyLayer(fit.max);
    }
    return true;
  } catch(err){
    console.warn('Keyboard asset not found; using procedural keyboard.',err);
    makeProceduralKeyboard();
    return false;
  }
}

function makeVirtualKeyLayer(max){
  const group=new THREE.Group();
  const mat=new THREE.MeshStandardMaterial({color:0x242628,roughness:.48,transparent:true,opacity:.01});
  const rows=[10,10,9,7,1];
  const rowZ=[-1.45,-.48,.49,1.46,2.0];
  const offsets=[-4.9,-4.9,-4.36,-3.36,-2.2];
  qwertyRows.forEach((row,ri)=>row.forEach((label,ci)=>{
    const w=ri===4?4.4:.9;
    const cap=new THREE.Mesh(new THREE.BoxGeometry(w,.10,.72),mat.clone());
    cap.position.set(offsets[ri]+ci*1.08,.65,rowZ[ri]);
    cap.userData.baseY=.65;
    cap.userData.virtual=true;
    keyMap.set(label,cap);
    group.add(cap);
  }));
  group.scale.setScalar(max/12.5);
  keyboardRoot.add(group);
}

function keyLabelFromEvent(e){
  if(e.code==='Space') return 'SPACE';
  if(e.key.length===1) return e.key.toUpperCase();
  return null;
}

function pressKey(label,down=true){
  const target=keyMap.get(label);
  if(!target) return;

  if(target.userData.realKey){
    const base=target.userData.baseY ?? target.position.y;
    gsap?.to(target.position,{y:base+(down?-.035:0),duration:down?.08:.18,ease:down?'power2.out':'power3.out'});
    const mats=[];
    target.traverse(o=>{if(o.isMesh && o.material)mats.push(...(Array.isArray(o.material)?o.material:[o.material]));});
    mats.forEach((m,i)=>{
      if('emissive' in m){
        m.emissive = new THREE.Color(palette[(label.charCodeAt(0)+i)%palette.length]);
        gsap?.to(m.emissive,{r:down?m.emissive.r*.25:0,g:down?m.emissive.g*.25:0,b:down?m.emissive.b*.25:0,duration:down?.08:.3});
      }
    });
    return;
  }

  const cap=target.userData.cap || target;
  const base=cap.userData.baseY ?? cap.position.y;
  gsap?.to(cap.position,{y:base+(down?-.16:0),duration:down?.07:.2,ease:down?'power2.out':'power3.out'});
  if(cap.material){
    cap.material.transparent=true;
    gsap?.to(cap.material,{opacity:down?.58:(cap.userData.virtual?.01:1),duration:down?.05:.25});
    if('emissive' in cap.material){
      const col=new THREE.Color(palette[(label.charCodeAt(0)||1)%3]);
      cap.material.emissive.copy(col);
      cap.material.emissiveIntensity=down?.75:0;
    }
  }
}

window.addEventListener('keydown',e=>{
  const label=keyLabelFromEvent(e);
  if(!label || activeKeys.has(label)) return;
  activeKeys.add(label);
  pressKey(label,true);
  if(label==='SPACE') typedBuffer.push(' '); else if(label.length===1) typedBuffer.push(label.toLowerCase());
  if(typedBuffer.length>28) typedBuffer.splice(0,typedBuffer.length-28);
  if(typed) typed.textContent=typedBuffer.join('');
  gsap?.fromTo('.signal-dot',{scale:1},{scale:2.4,duration:.12,yoyo:true,repeat:1,ease:'power2.out'});
});
window.addEventListener('keyup',e=>{
  const label=keyLabelFromEvent(e);
  if(!label) return;
  activeKeys.delete(label);
  pressKey(label,false);
});

const pointer={x:0,y:0},smooth={x:0,y:0};
window.addEventListener('pointermove',e=>{
  pointer.x=e.clientX/innerWidth*2-1;
  pointer.y=e.clientY/innerHeight*2-1;
},{passive:true});
keyboardStage.onFrame(()=>{
  smooth.x+=(pointer.x-smooth.x)*.03;
  smooth.y+=(pointer.y-smooth.y)*.03;
  if(!reduceMotion){
    keyboardRoot.rotation.y += ((.18+smooth.x*.08)-keyboardRoot.rotation.y)*.025;
    keyboardRoot.rotation.x += ((-.08+smooth.y*.035)-keyboardRoot.rotation.x)*.025;
  }
});

/* ------------------------------------------------------------------
   ROBOT — preserve the inspect / explode / rebuild choreography
------------------------------------------------------------------- */

const robotCanvas=document.getElementById('robot-canvas');
const robotStage=createStage(robotCanvas);
const robotStatus=document.getElementById('robot-status');
const robotFallback=document.getElementById('robot-fallback');
const robotSteps=[...document.querySelectorAll('.robot-step')];
const parts=[...document.querySelectorAll('.part')];
const robotProgress=document.querySelector('.robot__progress span');

let robotRoot=null;
let explodeData=null;

function prepareExplosion(root){
  root.updateMatrixWorld(true);
  const box=new THREE.Box3().setFromObject(root);
  const centerWorld=box.getCenter(new THREE.Vector3());
  const center=root.worldToLocal(centerWorld.clone());
  const size=box.getSize(new THREE.Vector3());
  const max=Math.max(size.x,size.y,size.z);
  const items=[];
  let i=0;
  root.traverse(mesh=>{
    if(!mesh.isMesh) return;
    const posWorld=mesh.getWorldPosition(new THREE.Vector3());
    const posRoot=root.worldToLocal(posWorld.clone());
    let dir=posRoot.clone().sub(center);
    if(dir.lengthSq()<1e-8){
      const seed=(i*9301+(mesh.name||'').length*49297)%233280;
      const r=seed/233280;
      dir.set(Math.sin(r*12.7),.25+((i%5)/8),Math.cos(r*9.1));
    }
    dir.normalize();
    items.push({mesh,parent:mesh.parent,originRoot:posRoot.clone(),dir,distance:max*(.24+(i%7)*.015)});
    i++;
  });
  return {root,items};
}

const tmpA=new THREE.Vector3(),tmpB=new THREE.Vector3();
function setExplosion(data,amount){
  const root=data.root;
  root.updateMatrixWorld(true);
  data.items.forEach(item=>{
    tmpA.copy(item.originRoot).addScaledVector(item.dir,item.distance*amount);
    tmpB.copy(tmpA);
    root.localToWorld(tmpB);
    item.parent.worldToLocal(tmpB);
    item.mesh.position.copy(tmpB);
  });
  root.updateMatrixWorld(true);
}

async function loadRobot(){
  try{
    const loader=new GLTFLoader();
    const gltf=await loader.loadAsync('./assets/models/robot/DECODE Simple Bot.glb',e=>{
      if(e.total) setBoot(.22+.6*(e.loaded/e.total));
    });
    robotRoot=gltf.scene;
    cloneMaterials(robotRoot);
    robotStage.scene.add(robotRoot);
    normalizeObject(robotRoot,robotStage.camera,mobile?1.7:1.32);
    robotRoot.rotation.y=-.45;
    robotRoot.rotation.x=-.05;
    explodeData=prepareExplosion(robotRoot);
    robotFallback?.classList.add('is-hidden');
    if(robotStatus) robotStatus.textContent='ready';
    return true;
  }catch(err){
    console.warn('Robot asset not found; keeping visual fallback.',err);
    if(robotStatus) robotStatus.textContent='asset missing';
    return false;
  }
}

function setRobotStep(i){robotSteps.forEach((el,n)=>el.classList.toggle('is-active',n===i));}
function updateRobotScroll(p){
  if(robotProgress) robotProgress.style.transform=`scaleX(${p})`;
  let explode=0;
  if(p<.20){setRobotStep(0);explode=0;if(robotRoot)robotRoot.rotation.y=-.45+p*1.4;}
  else if(p<.56){setRobotStep(1);explode=THREE.MathUtils.smoothstep(p,.20,.56);}
  else if(p<.76){setRobotStep(2);explode=1;}
  else {setRobotStep(3);explode=1-THREE.MathUtils.smoothstep(p,.76,.98);}
  if(explodeData)setExplosion(explodeData,explode);
  const show=p>.47&&p<.80;
  parts.forEach((el,i)=>el.classList.toggle('is-visible',show&&p>(.49+i*.03)));
}

/* ------------------------------------------------------------------
   PAGE MOTION
------------------------------------------------------------------- */

function setupMotion(){
  if(!gsap||!ScrollTrigger||reduceMotion) return;

  gsap.from('.hero__copy>*',{y:24,opacity:0,stagger:.08,duration:1.05,delay:.3,ease:'power3.out'});
  gsap.from('.hero__typed',{opacity:0,duration:1,delay:.8});

  ScrollTrigger.create({
    trigger:'#hero',start:'top top',end:'bottom top',scrub:true,
    onUpdate:self=>{
      keyboardRoot.position.y=self.progress*.4;
      keyboardRoot.rotation.y=.18+self.progress*.42;
      gsap.set('.hero__copy',{y:-self.progress*70,opacity:1-self.progress*.85});
    }
  });

  gsap.to('.bridge__rail span',{scaleX:1,ease:'none',scrollTrigger:{trigger:'#bridge',start:'top 70%',end:'bottom 65%',scrub:true}});

  ['#bridge','#statement','#work','#experience'].forEach(sel=>{
    const section=document.querySelector(sel);
    if(!section)return;
    gsap.from(section.querySelectorAll('h2,p,article,strong'),{y:28,opacity:0,stagger:.035,duration:.9,ease:'power3.out',scrollTrigger:{trigger:section,start:'top 78%',once:true}});
  });

  ScrollTrigger.create({
    trigger:'#robot',start:'top top',end:'bottom bottom',scrub:true,
    onUpdate:self=>updateRobotScroll(self.progress)
  });

  gsap.from('.closing h2',{y:60,opacity:0,duration:1.2,ease:'power3.out',scrollTrigger:{trigger:'.closing',start:'top 65%',once:true}});
}

async function init(){
  setBoot(.08);
  await loadKeyboardModel();
  setBoot(.26);
  await loadRobot();
  setBoot(.94);
  setupMotion();
  ScrollTrigger?.refresh();
  setTimeout(hideBoot,160);
}

init();
