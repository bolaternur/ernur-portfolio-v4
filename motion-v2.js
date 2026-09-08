const gsap = window.gsap;
const ScrollTrigger = window.ScrollTrigger;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const coarse = matchMedia('(pointer: coarse)').matches;
const base = document.body?.dataset?.base || './';

function ensureCss(){
  if(document.querySelector('link[data-motion-v2]')) return;
  const link=document.createElement('link');
  link.rel='stylesheet';
  link.href=`${base}motion-v2.css`;
  link.dataset.motionV2='1';
  document.head.appendChild(link);
}
ensureCss();

function splitChars(el){
  if(!el || el.dataset.motionSplit==='1') return [...el.querySelectorAll('.motion-char')];
  const walker=document.createTreeWalker(el,NodeFilter.SHOW_TEXT,{acceptNode(node){
    return node.nodeValue?.trim()?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT;
  }});
  const nodes=[]; while(walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach(node=>{
    const frag=document.createDocumentFragment();
    [...node.nodeValue].forEach(ch=>{
      if(ch===' '){frag.appendChild(document.createTextNode(' '));return;}
      const span=document.createElement('span');
      span.className='motion-char';span.textContent=ch;frag.appendChild(span);
    });
    node.replaceWith(frag);
  });
  el.dataset.motionSplit='1';
  return [...el.querySelectorAll('.motion-char')];
}

function setupLineHover(container, text){
  if(!container||!text||reduced) return;
  const chars=splitChars(text);
  if(!chars.length) return;
  const line=document.createElement('i');line.className='motion-sweep';text.appendChild(line);
  let tl=null;
  const play=()=>{
    tl?.kill();
    gsap.set(line,{scaleX:0,transformOrigin:'0% 50%'});
    tl=gsap.timeline();
    tl.to(line,{scaleX:1,duration:.18,ease:'power3.in'},0)
      .to(chars,{yPercent:(i)=>i%2?-9:9,rotation:(i)=>i%3===0?-1.5:1.2,duration:.2,stagger:.006,ease:'power2.out'},.02)
      .to(line,{scaleX:0,transformOrigin:'100% 50%',duration:.38,ease:'power3.out'},.18)
      .to(chars,{yPercent:0,rotation:0,duration:.46,stagger:.006,ease:'power3.out'},.16);
  };
  container.addEventListener('mouseenter',play);
  container.addEventListener('focusin',play);
}

const rails={
  'TraceLab':['source','iteration','test','decision'],
  'DECODE Simple Bot':['inspect','separate','understand','rebuild'],
  '3209':['perspective','profile','orthographic','detail'],
  'Fusion 360':['sketch','constraint','assembly','fit'],
  'Web Development':['brief','interface','motion','ship'],
  'Beyond work':['pattern','strategy','play','repeat']
};

function setupWorkCards(){
  document.querySelectorAll('.work-card').forEach((card,index)=>{
    const title=card.querySelector('h2');
    const key=(title?.textContent||'').replace(/\s+/g,' ').trim();
    const labels=rails[key]||['idea','build','test','improve'];
    if(!card.querySelector('.motion-card-plane')) card.insertAdjacentHTML('afterbegin','<span class="motion-card-plane" aria-hidden="true"></span>');
    if(!card.querySelector('.motion-card-rail')) card.insertAdjacentHTML('beforeend',`<div class="motion-card-rail" aria-hidden="true">${labels.map((x,i)=>`${i?'<i></i>':''}<span>${x}</span>`).join('')}</div>`);
    setupLineHover(card,title);
    const plane=card.querySelector('.motion-card-plane');
    if(!coarse&&plane){
      card.addEventListener('pointermove',e=>{
        const r=card.getBoundingClientRect();
        const nx=(e.clientX-r.left)/r.width-.5, ny=(e.clientY-r.top)/r.height-.5;
        plane.style.setProperty('--rx',`${(-ny*8).toFixed(2)}deg`);
        plane.style.setProperty('--ry',`${(nx*11).toFixed(2)}deg`);
      },{passive:true});
      card.addEventListener('pointerleave',()=>{plane.style.setProperty('--rx','0deg');plane.style.setProperty('--ry','0deg')});
    }
    if(gsap&&ScrollTrigger&&!reduced&&plane){
      gsap.fromTo(plane,{rotationZ:index%2?-6:6,xPercent:index%2?8:-8,opacity:.15},{rotationZ:index%2?3:-3,xPercent:0,opacity:.78,ease:'none',scrollTrigger:{trigger:card,start:'top 100%',end:'bottom 10%',scrub:1}});
    }
  });
}

function setupHomeRows(){
  document.querySelectorAll('.project-row').forEach(row=>{
    if(!row.querySelector('.motion-row-signal')) row.insertAdjacentHTML('beforeend','<i class="motion-row-signal" aria-hidden="true"></i>');
    setupLineHover(row,row.querySelector('h3'));
  });
}

function wrapWords(el){
  if(!el||el.dataset.motionWords==='1') return [...el.querySelectorAll('.motion-highlight__word')];
  const text=el.textContent.trim();el.textContent='';
  text.split(/\s+/).forEach((word,i,arr)=>{
    const span=document.createElement('span');span.className='motion-highlight__word';span.textContent=word;el.appendChild(span);
    if(i<arr.length-1) el.appendChild(document.createTextNode(' '));
  });
  el.dataset.motionWords='1';return [...el.querySelectorAll('.motion-highlight__word')];
}

function setupTraceHighlight(){
  if(document.body.dataset.page!=='tracelab') return;
  const intro=document.querySelector('.case-intro');
  if(!intro||document.querySelector('.motion-highlight')) return;
  const section=document.createElement('section');
  section.className='motion-highlight';
  section.innerHTML='<div class="motion-highlight__label"><span>Engineering memory</span><span>scroll / causal chain</span></div><p class="motion-highlight__text">Every change should leave enough evidence to explain what changed, why it changed, what was tested, and what should happen next.</p>';
  intro.after(section);
  const text=section.querySelector('.motion-highlight__text');
  const words=wrapWords(text);
  if(reduced||!ScrollTrigger){words.forEach(w=>w.classList.add('is-lit'));return;}
  ScrollTrigger.create({trigger:section,start:'top 72%',end:'bottom 42%',scrub:true,onUpdate(self){
    const lit=Math.floor(self.progress*(words.length+2));
    words.forEach((w,i)=>{w.classList.toggle('is-lit',i<=lit);w.classList.toggle('is-hot',i===lit||i===lit-1)});
  }});
}

function setupBlurTypography(){
  if(!gsap||!ScrollTrigger||reduced) return;
  const page=document.body.dataset.page;
  let selectors=[];
  if(page==='tracelab') selectors=['.section .display--small'];
  if(page==='about') selectors=['.section__copy.body-large > p:first-child'];
  if(page==='work') selectors=['.page-hero__bottom .lead'];
  if(page==='lab') selectors=['.page-hero__bottom .lead'];
  document.querySelectorAll(selectors.join(',')).forEach((el,index)=>{
    if(index>4) return;
    el.classList.add('motion-blur-target');
    gsap.fromTo(el,{filter:'blur(9px)',opacity:.22},{filter:'blur(0px)',opacity:1,ease:'none',scrollTrigger:{trigger:el,start:'top 94%',end:'top 62%',scrub:.7}});
  });
}

function setupSvgFilterEntrance(){
  if(document.body.dataset.page!=='tracelab'||reduced||coarse||!gsap) return;
  const title=document.querySelector('.page-hero h1');if(!title) return;
  const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
  svg.setAttribute('width','0');svg.setAttribute('height','0');svg.setAttribute('aria-hidden','true');
  svg.innerHTML='<defs><filter id="ernur-trace-noise" x="-20%" y="-20%" width="140%" height="140%"><feTurbulence type="fractalNoise" baseFrequency="0.03 0.05" numOctaves="1" seed="7" result="noise"/><feDisplacementMap in="SourceGraphic" in2="noise" scale="0" xChannelSelector="R" yChannelSelector="B"/></filter></defs>';
  document.body.appendChild(svg);
  const turbulence=svg.querySelector('feTurbulence');const displacement=svg.querySelector('feDisplacementMap');
  title.style.filter='url(#ernur-trace-noise)';
  const state={scale:20,freq:.03};
  gsap.to(state,{scale:0,freq:.008,duration:1.35,delay:.18,ease:'power3.out',onUpdate(){displacement.setAttribute('scale',state.scale.toFixed(2));turbulence.setAttribute('baseFrequency',`${state.freq.toFixed(4)} ${(state.freq*1.7).toFixed(4)}`)},onComplete(){title.style.filter='none';svg.remove()}});
}

function setupTraceDepth(){
  const canvas=document.querySelector('.trace-canvas');if(!canvas||coarse||reduced) return;
  const nodes=[...canvas.querySelectorAll('.trace-node')];
  canvas.addEventListener('pointermove',e=>{
    const r=canvas.getBoundingClientRect();
    const nx=(e.clientX-r.left)/r.width-.5,ny=(e.clientY-r.top)/r.height-.5;
    canvas.style.setProperty('--tx',`${((nx+.5)*100).toFixed(1)}%`);canvas.style.setProperty('--ty',`${((ny+.5)*100).toFixed(1)}%`);
    nodes.forEach((node,i)=>gsap?.to(node,{x:nx*(5+i*1.6),y:ny*(3+i),duration:.65,ease:'power3.out',overwrite:true}));
  },{passive:true});
  canvas.addEventListener('pointerleave',()=>nodes.forEach(node=>gsap?.to(node,{x:0,y:0,duration:.8,ease:'power3.out',overwrite:true})));
}

function setupSkillHover(){
  document.querySelectorAll('.skill-row').forEach(row=>setupLineHover(row,row.querySelector('strong')));
}

function setupSectionScans(){
  document.querySelectorAll('.trace-demo,.cube-lab,.work-grid').forEach(section=>{
    if(getComputedStyle(section).position==='static') section.style.position='relative';
    const scan=document.createElement('i');scan.className='motion-section-scan';scan.setAttribute('aria-hidden','true');section.appendChild(scan);
    if('IntersectionObserver' in window&&!reduced){const io=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){scan.classList.remove('is-running');void scan.offsetWidth;scan.classList.add('is-running')}}),{threshold:.3});io.observe(section)}
  });
}

async function setupLabCube(){
  if(document.body.dataset.page!=='lab') return;
  try{await import(new URL('./lab-cube.js',import.meta.url).href)}catch(error){console.warn('Cube WebGL enhancement unavailable',error)}
}

function init(){
  setupWorkCards();
  setupHomeRows();
  setupTraceHighlight();
  setupBlurTypography();
  setupSvgFilterEntrance();
  setupTraceDepth();
  setupSkillHover();
  setupSectionScans();
  setupLabCube();
  setTimeout(()=>ScrollTrigger?.refresh(),220);
}

if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true}); else init();
