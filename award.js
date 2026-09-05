const gsap = window.gsap;
const ScrollTrigger = window.ScrollTrigger;
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const coarse = window.matchMedia('(pointer: coarse)').matches;

function ensureAwardCss(){
  if(document.querySelector('link[data-award-css]')) return;
  const link=document.createElement('link');
  link.rel='stylesheet';
  link.href=new URL('./award.css',import.meta.url).href;
  link.dataset.awardCss='1';
  document.head.appendChild(link);
}
ensureAwardCss();

function addGlobalChrome(){
  if(!document.querySelector('.award-progress')){
    document.body.insertAdjacentHTML('afterbegin','<div class="award-progress" aria-hidden="true"><span></span></div><div class="award-frame" aria-hidden="true"><i class="tl"></i><i class="tr"></i><i class="br"></i><i class="bl"></i></div><div class="award-readout" aria-hidden="true">scroll / 000</div>');
  }
  const bar=document.querySelector('.award-progress span');
  const readout=document.querySelector('.award-readout');
  let ticking=false;
  const update=()=>{
    ticking=false;
    const max=Math.max(1,document.documentElement.scrollHeight-innerHeight);
    const p=Math.min(1,Math.max(0,scrollY/max));
    if(bar) bar.style.transform=`scaleX(${p})`;
    if(readout) readout.textContent=`scroll / ${String(Math.round(p*100)).padStart(3,'0')}`;
  };
  addEventListener('scroll',()=>{if(!ticking){ticking=true;requestAnimationFrame(update)}},{passive:true});
  update();
}

function wrapTextNodes(el){
  if(!el || el.dataset.awardSplit==='1') return [...el.querySelectorAll('.award-word')];
  const walker=document.createTreeWalker(el,NodeFilter.SHOW_TEXT,{acceptNode(node){
    if(!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
    if(node.parentElement?.closest('.award-word,.award-word-clip,script,style')) return NodeFilter.FILTER_REJECT;
    return NodeFilter.FILTER_ACCEPT;
  }});
  const nodes=[];
  while(walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach(node=>{
    const frag=document.createDocumentFragment();
    const parts=node.nodeValue.split(/(\s+)/);
    parts.forEach(part=>{
      if(!part) return;
      if(/^\s+$/.test(part)){frag.appendChild(document.createTextNode(part));return;}
      const clip=document.createElement('span');
      clip.className='award-word-clip';
      const word=document.createElement('span');
      word.className='award-word';
      word.textContent=part;
      clip.appendChild(word);
      frag.appendChild(clip);
    });
    node.replaceWith(frag);
  });
  el.dataset.awardSplit='1';
  el.classList.add('award-split-ready');
  return [...el.querySelectorAll('.award-word')];
}

function waitForIntro(){
  return new Promise(resolve=>{
    const boot=document.querySelector('.boot');
    if(!boot || boot.classList.contains('is-hidden')) return resolve();
    const obs=new MutationObserver(()=>{
      if(boot.classList.contains('is-hidden')){obs.disconnect();setTimeout(resolve,80)}
    });
    obs.observe(boot,{attributes:true,attributeFilter:['class']});
    setTimeout(()=>{obs.disconnect();resolve()},5600);
  });
}

async function setupTypography(){
  await document.fonts?.ready?.catch?.(()=>{});
  const selectors=['.home-hero__copy h1','.page-hero h1','.section h2','.identity__statement','.contact-hero h1','.work-card h2'];
  const blocks=[...document.querySelectorAll(selectors.join(','))];
  blocks.forEach((el,index)=>{
    const words=wrapTextNodes(el);
    if(!words.length || reduced) return;
    if(gsap && ScrollTrigger){
      gsap.set(words,{yPercent:112,opacity:0});
      const isHero=Boolean(el.closest('.home-hero,.page-hero'));
      if(isHero){
        waitForIntro().then(()=>gsap.to(words,{yPercent:0,opacity:1,duration:1.05,stagger:.028,ease:'power4.out',delay:index*.01,overwrite:true}));
      }else{
        gsap.to(words,{yPercent:0,opacity:1,duration:.92,stagger:.022,ease:'power4.out',scrollTrigger:{trigger:el,start:'top 88%',once:true}});
      }
    }
  });

  const statement=document.querySelector('.statement-band p');
  if(statement){
    const words=wrapTextNodes(statement);
    if(!reduced && ScrollTrigger){
      ScrollTrigger.create({trigger:statement,start:'top 82%',end:'bottom 32%',scrub:true,onUpdate(self){
        const lit=Math.floor(self.progress*(words.length+2));
        words.forEach((w,i)=>{
          w.classList.toggle('is-lit',i<=lit);
          w.classList.toggle('is-hot',i===lit || i===lit-1);
        });
      }});
    } else words.forEach(w=>w.classList.add('is-lit'));
  }
}

function setupSignalChapter(){
  if(document.body.dataset.page!=='home' || document.querySelector('.award-signal')) return;
  const hero=document.querySelector('.home-hero');
  if(!hero) return;
  const section=document.createElement('section');
  section.className='award-signal';
  section.setAttribute('aria-label','Engineering process');
  section.innerHTML=`
    <span class="award-signal__scan" aria-hidden="true"></span>
    <div class="award-signal__cell is-active" data-index="01"><div><strong>CODE</strong><p>Python · C++ · Java · architecture</p></div></div>
    <div class="award-signal__cell" data-index="02"><div><strong>TRACE</strong><p>Evidence · tests · decisions · iteration</p></div></div>
    <div class="award-signal__cell" data-index="03"><div><strong>CAD</strong><p>Fusion 360 · assemblies · geometry</p></div></div>
    <div class="award-signal__cell" data-index="04"><div><strong>MOTION</strong><p>Robotics · control · physical behavior</p></div></div>`;
  hero.after(section);
  const cells=[...section.querySelectorAll('.award-signal__cell')];
  cells.forEach(cell=>cell.addEventListener('mouseenter',()=>{cells.forEach(c=>c.classList.toggle('is-active',c===cell))}));
  if(gsap && ScrollTrigger && !reduced){
    gsap.from(cells,{yPercent:(i)=>i%2?18:-18,opacity:.2,stagger:.04,ease:'none',scrollTrigger:{trigger:section,start:'top bottom',end:'top 30%',scrub:1}});
  }
}

function setupSectionLines(){
  const sections=[...document.querySelectorAll('.section,.case-intro,.identity,.featured')];
  const io=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting) entry.target.classList.add('award-in')}),{threshold:.18});
  sections.forEach(s=>io.observe(s));
}

function setupModelReticles(){
  document.querySelectorAll('canvas[data-model],#robot-canvas').forEach(canvas=>{
    const host=canvas.closest('.model-card,.model-stage__sticky,.home-hero,.robot__sticky');
    if(!host || host.querySelector(':scope > .award-reticle')) return;
    const label=canvas.dataset.model || (canvas.id==='robot-canvas'?'decode / machine':'model');
    host.insertAdjacentHTML('beforeend',`<div class="award-reticle" aria-hidden="true"><i class="a"></i><i class="b"></i><i class="c"></i><i class="d"></i><span class="award-reticle__cross"></span><span class="award-reticle__scan"></span><span class="award-reticle__label">${label} / live geometry</span></div>`);
  });
}

function setupWorkMotion(){
  const cards=[...document.querySelectorAll('.work-card')];
  cards.forEach((card,index)=>{
    card.addEventListener('pointermove',e=>{
      const r=card.getBoundingClientRect();
      card.style.setProperty('--mx',`${((e.clientX-r.left)/r.width)*100}%`);
      card.style.setProperty('--my',`${((e.clientY-r.top)/r.height)*100}%`);
    },{passive:true});
    if(gsap && ScrollTrigger && !reduced){
      gsap.fromTo(card,{yPercent:index%2===0?-12:12,scale:.94,opacity:.55},{yPercent:0,scale:1,opacity:1,ease:'none',scrollTrigger:{trigger:card,start:'top 98%',end:'top 48%',scrub:1}});
    }
  });

  const rows=[...document.querySelectorAll('.project-row')];
  if(rows.length && !coarse){
    const preview=document.createElement('div');
    preview.className='award-project-preview';
    preview.innerHTML='<span class="award-project-preview__num"></span><span class="award-project-preview__meta"></span><strong class="award-project-preview__title"></strong>';
    document.body.appendChild(preview);
    const num=preview.querySelector('.award-project-preview__num');
    const meta=preview.querySelector('.award-project-preview__meta');
    const title=preview.querySelector('.award-project-preview__title');
    rows.forEach(row=>{
      row.addEventListener('mouseenter',()=>{
        num.textContent=row.querySelector('.project-row__num')?.textContent || '00';
        meta.textContent=row.querySelector('.project-row__meta')?.textContent || 'selected project';
        title.textContent=row.querySelector('h3')?.textContent || 'Project';
        preview.classList.add('is-visible');
      });
      row.addEventListener('mouseleave',()=>preview.classList.remove('is-visible'));
      row.addEventListener('pointermove',e=>preview.style.setProperty('--preview-y',`${Math.max(15,Math.min(85,(e.clientY/innerHeight)*100))}%`),{passive:true});
    });
  }
}

function setupTraceLife(){
  const lines=[...document.querySelectorAll('.trace-line')];
  lines.forEach(line=>{
    const width=Math.max(80,line.getBoundingClientRect().width || 150);
    line.style.setProperty('--trace-distance',`${width}px`);
  });
  const nodes=[...document.querySelectorAll('.trace-node')];
  nodes.forEach((node,index)=>{
    node.tabIndex=0;
    const focus=()=>nodes.forEach(n=>n.style.opacity=n===node?'1':'.22');
    const reset=()=>nodes.forEach(n=>n.style.opacity='1');
    node.addEventListener('focus',focus);node.addEventListener('blur',reset);
    if(gsap && ScrollTrigger && !reduced) gsap.from(node,{scale:.86,opacity:0,duration:.8,delay:index*.03,ease:'power3.out',scrollTrigger:{trigger:'.trace-canvas',start:'top 72%',once:true}});
  });
}

function setupMagneticLinks(){
  if(coarse || reduced) return;
  document.querySelectorAll('.text-link,.contact-hero__actions a,.site-nav__menu').forEach(el=>{
    el.classList.add('award-magnetic');
    el.addEventListener('pointermove',e=>{
      const r=el.getBoundingClientRect();
      const x=(e.clientX-r.left-r.width/2)*.12;
      const y=(e.clientY-r.top-r.height/2)*.18;
      if(gsap) gsap.to(el,{x,y,duration:.35,ease:'power3.out',overwrite:true});
    });
    el.addEventListener('pointerleave',()=>{if(gsap) gsap.to(el,{x:0,y:0,duration:.6,ease:'elastic.out(1,.5)',overwrite:true})});
  });
}

function setupProjectMorphTransitions(){
  if(reduced || !gsap) return;
  document.addEventListener('click',event=>{
    const link=event.target.closest('a.work-card,a.project-row');
    if(!link || link.target==='_blank' || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const href=link.href;
    if(!href) return;
    const url=new URL(href,location.href);
    if(url.origin!==location.origin) return;
    event.preventDefault();
    event.stopImmediatePropagation();

    const rect=link.getBoundingClientRect();
    const clone=link.cloneNode(true);
    const back=document.createElement('div');
    back.className='award-route-backdrop';
    clone.classList.add('award-route-clone');
    Object.assign(clone.style,{left:`${rect.left}px`,top:`${rect.top}px`,width:`${rect.width}px`,height:`${rect.height}px`});
    document.body.append(back,clone);
    link.style.visibility='hidden';
    document.body.classList.add('is-transitioning');
    const label=link.dataset.transitionTitle || link.querySelector('h2,h3')?.textContent?.trim() || 'next';
    sessionStorage.setItem('ernur-v5-route',label);

    const tl=gsap.timeline({defaults:{ease:'power4.inOut'}});
    tl.to(back,{opacity:1,duration:.55},0)
      .to('main',{opacity:.28,scale:.992,duration:.55,transformOrigin:'50% 50%'},0)
      .add(()=>clone.classList.add('is-expanded'),.06)
      .to(clone,{left:0,top:0,width:innerWidth,height:innerHeight,padding:'clamp(40px,7vw,120px)',duration:.92},0)
      .to(clone.querySelectorAll('p,.work-card__top,.project-row__num,.project-row__meta'),{opacity:.25,duration:.35},.12)
      .to(clone.querySelector('h2,h3'),{x:8,y:-4,scale:1.06,duration:.78,transformOrigin:'left bottom'},.08)
      .call(()=>{location.href=url.href},null,.9);
  },true);
}

function setupHeroParallax(){
  if(coarse || reduced || !gsap) return;
  const hero=document.querySelector('.home-hero,.page-hero');
  if(!hero) return;
  const copy=hero.querySelector('.home-hero__copy,.page-hero__bottom,.display');
  hero.addEventListener('pointermove',e=>{
    const nx=e.clientX/innerWidth-.5;
    const ny=e.clientY/innerHeight-.5;
    if(copy) gsap.to(copy,{x:nx*10,y:ny*6,duration:1.1,ease:'power3.out',overwrite:true});
  },{passive:true});
  hero.addEventListener('pointerleave',()=>copy&&gsap.to(copy,{x:0,y:0,duration:1.2,ease:'power3.out'}));
}

function initAwardLayer(){
  addGlobalChrome();
  setupSignalChapter();
  setupSectionLines();
  setupModelReticles();
  setupWorkMotion();
  setupTraceLife();
  setupMagneticLinks();
  setupProjectMorphTransitions();
  setupHeroParallax();
  setupTypography();
  setTimeout(()=>ScrollTrigger?.refresh(),180);
}

if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',initAwardLayer,{once:true});
else initAwardLayer();
