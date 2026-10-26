import {clamp,ease} from './filmTimeline';

/** Binds the scroll-scrubbed film to the server-rendered chapters. Returns a cleanup for React effects. */
export function initCinematicLanding(root:HTMLElement){
  const host=root.querySelector<HTMLElement>('[data-ek-camera]');
  // Film colors live on the landing wrapper (the Astro site used <body>).
  const page=root.closest<HTMLElement>('.cinematic-home')??document.body;
  if(!host)return ()=>{};
  const chapters=[...root.querySelectorAll<HTMLElement>('[data-ek-chapter]')];
  const rail=[...root.querySelectorAll<HTMLAnchorElement>('[data-ek-rail]')];
  const labels=[...root.querySelectorAll<HTMLElement>('[data-ek-layer]')];
  const anchors=[...root.querySelectorAll<HTMLElement>('[data-ek-anchor]')];
  const reading=root.querySelector<HTMLButtonElement>('[data-ek-reading]')!;
  const readingReturn=root.querySelector<HTMLButtonElement>('[data-ek-reading-return]')!;
  const readingTitle=root.querySelector<HTMLElement>('[data-ek-reading-title]')!;
  const readingSubtitle=root.querySelector<HTMLElement>('[data-ek-reading-subtitle]')!;
  const previous=root.querySelector<HTMLButtonElement>('[data-ek-prev]')!;
  const next=root.querySelector<HTMLButtonElement>('[data-ek-next]')!;
  const progressBar=root.querySelector<HTMLElement>('[data-ek-progress]')!;
  const hint=root.querySelector<HTMLElement>('.ek-scroll-hint')!;
  const status=root.querySelector<HTMLElement>('[data-ek-status]')!;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const shortViewport=matchMedia('(max-height: 580px)');
  let world:ReturnType<typeof import('./kineticWorld')['createKineticWorld']>|undefined;
  let visible=true,frame=0,pointerX=0,pointerY=0,scrollSpan=1,rootTop=0,disposed=false,readingMode=false,lastChapter=-1;
  const measure=()=>{
    const header=page.querySelector('.site-header')?.getBoundingClientRect().height||0;
    rootTop=root.getBoundingClientRect().top+scrollY-header;
    scrollSpan=Math.max(1,root.offsetHeight-(innerHeight-header));
    anchors.forEach((anchor,i)=>{
      const cinematic=root.classList.contains('is-film'),id=anchor.dataset.ekAnchorId!;
      anchor.style.top=cinematic?`${i/6*scrollSpan}px`:`${chapters[i]!.offsetTop}px`;
      if(cinematic){anchor.id=id;chapters[i]!.removeAttribute('id')}
      else{chapters[i]!.id=id;anchor.removeAttribute('id')}
    });
    world?.resize();schedule();
  };
  const phaseAt=()=>clamp((scrollY-rootTop)/scrollSpan)*6;
  function render(){
    frame=0;if(!visible||document.hidden||disposed)return;
    const phase=phaseAt();
    root.classList.toggle('is-final',phase>5.82);
    root.dataset.phase=phase.toFixed(4);
    const daylight=root.classList.contains('is-film')?ease(phase,5.4,6):0;
    page.style.setProperty('--film-daylight',`${daylight*100}%`);
    // Keep navigation readable even when the viewer stops halfway through the lighting transition.
    const rgb=[11+(232-11)*daylight,15+(231-15)*daylight,20+(227-20)*daylight];
    const linear=rgb.map(v=>{const s=v/255;return s<=.04045?s/12.92:((s+.055)/1.055)**2.4});
    const luminance=.2126*linear[0]!+.7152*linear[1]!+.0722*linear[2]!;
    if(daylight>.1&&daylight<.9){
      const ink=luminance>.179?'#000000':'#ffffff';page.style.setProperty('--film-ink',ink);page.style.setProperty('--film-muted',ink);
    }else{page.style.removeProperty('--film-ink');page.style.removeProperty('--film-muted')}
    rail.forEach((item,index)=>{if(index===Math.round(phase))item.setAttribute('aria-current','location');else item.removeAttribute('aria-current')});
    const cinematic=root.classList.contains('is-film');
    const currentChapter=Math.round(phase);
    previous.disabled=phase<.01;next.disabled=phase>5.99;
    if(cinematic&&lastChapter!==currentChapter){lastChapter=currentChapter;status.textContent=`Chapter ${currentChapter+1} of 7. ${chapters[currentChapter]!.querySelector('h1,h2')?.textContent}`}
    chapters.forEach((chapter,i)=>{
      const opacity=1-ease(Math.abs(phase-i),.16,.46),active=!cinematic||opacity>.3;
      chapter.style.opacity=String(cinematic?opacity:1);
      chapter.classList.toggle('is-active',active);
      chapter.querySelectorAll<HTMLAnchorElement>('a').forEach(link=>link.tabIndex=active?0:-1);
      if(!active&&chapter.contains(document.activeElement))(phase>5.9?previous:next).focus({preventScroll:true});
    });
    hint.textContent=phase>5.9?'Scroll back to revisit':'Scroll to move through the story';
    progressBar.style.transform=`scaleX(${phase/6})`;
    if(!reduced.matches&&!readingMode)world?.update(phase,pointerX,pointerY);
  }
  function schedule(){if(!frame&&visible&&!document.hidden&&!disposed)frame=requestAnimationFrame(render)}
  async function setup(){
    if(reduced.matches||readingMode||shortViewport.matches){world?.dispose();world=undefined;root.classList.remove('is-webgl','is-film');measure();return}
    if(world||disposed)return;
    try{
      const {createKineticWorld}=await import('./kineticWorld');
      if(disposed||reduced.matches||readingMode||shortViewport.matches||world)return;
      root.classList.add('is-film');measure();
      world=createKineticWorld(host!,labels);world.update(phaseAt());root.classList.add('is-webgl');measure();
      if(location.hash){const index=anchors.findIndex(a=>`#${a.dataset.ekAnchorId}`===location.hash);if(index>=0)go(index,false)}
    }catch(error){root.classList.remove('is-film');root.classList.add('is-static');measure();console.warn('Ekarvo uses the static story on this device.',error)}
  }
  function go(index:number,smooth=true){
    const i=clamp(index,0,6);
    const top=root.classList.contains('is-film')?rootTop+i/6*scrollSpan:chapters[i]!.getBoundingClientRect().top+scrollY-96;
    scrollTo({top,behavior:smooth&&!reduced.matches?'smooth':'instant'});
  }
  const onNavigate=(event:MouseEvent)=>{
    const link=(event.target as Element).closest<HTMLAnchorElement>('a[href^="#"]');
    if(!link)return;const i=anchors.findIndex(a=>`#${a.dataset.ekAnchorId}`===link.hash);if(i<0)return;
    event.preventDefault();history.replaceState(null,'',link.hash);go(i);
  };
  const onPrevious=()=>go(Math.max(0,Math.ceil(phaseAt()-.05)-1));
  const onNext=()=>go(Math.min(6,Math.floor(phaseAt()+.05)+1));
  const onReading=()=>{readingMode=!readingMode;root.classList.toggle('is-reading',readingMode);reading.setAttribute('aria-pressed',String(readingMode));readingTitle.textContent=readingMode?'Return to the film':'Read the story';readingSubtitle.textContent=readingMode?'Go back to the moving story':'Chapter by chapter, at your pace';void setup();scrollTo({top:0,behavior:'instant'})};
  // The header nav sits outside the film root but links to the same chapter anchors.
  page.addEventListener('click',onNavigate);previous.addEventListener('click',onPrevious);next.addEventListener('click',onNext);reading.addEventListener('click',onReading);readingReturn.addEventListener('click',onReading);
  const onPointer=(event:PointerEvent)=>{if(event.pointerType==='touch'||reduced.matches)return;pointerX=(event.clientX/innerWidth-.5)*2;pointerY=(event.clientY/innerHeight-.5)*2;schedule()};
  const onMotion=()=>{void setup();schedule()};
  const observer=new IntersectionObserver(entries=>{visible=entries[0]?.isIntersecting??false;root.classList.toggle('is-in-view',visible);schedule()},{threshold:0});
  observer.observe(root);
  const resizer=new ResizeObserver(measure);resizer.observe(root);
  window.addEventListener('scroll',schedule,{passive:true});
  window.addEventListener('resize',measure,{passive:true});
  window.addEventListener('pointermove',onPointer,{passive:true});
  document.addEventListener('visibilitychange',schedule);reduced.addEventListener('change',onMotion);shortViewport.addEventListener('change',onMotion);
  const lost=(event:Event)=>{event.preventDefault();world?.dispose();world=undefined;root.classList.remove('is-webgl','is-film');root.classList.add('is-static');measure()};
  host.addEventListener('webglcontextlost',lost,true);
  root.classList.add('is-ready');measure();void setup();
  return ()=>{
    disposed=true;cancelAnimationFrame(frame);observer.disconnect();resizer.disconnect();world?.dispose();world=undefined;
    window.removeEventListener('scroll',schedule);window.removeEventListener('resize',measure);window.removeEventListener('pointermove',onPointer);
    document.removeEventListener('visibilitychange',schedule);reduced.removeEventListener('change',onMotion);shortViewport.removeEventListener('change',onMotion);
    host.removeEventListener('webglcontextlost',lost,true);page.removeEventListener('click',onNavigate);previous.removeEventListener('click',onPrevious);next.removeEventListener('click',onNext);reading.removeEventListener('click',onReading);readingReturn.removeEventListener('click',onReading);
    root.classList.remove('is-ready','is-film','is-webgl','is-static','is-reading','is-final','is-in-view');
    for(const property of ['--film-daylight','--film-ink','--film-muted'])page.style.removeProperty(property);
  };
}
