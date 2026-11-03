/**
 * Tiny script inlined in <head> so the theme and the opening sequence are
 * decided BEFORE first paint (no wrong-theme flash, no UI-then-intro flicker).
 * Every storage access is wrapped in try/catch; it must work with storage blocked.
 */
export const SETTINGS_KEY = "bridgevoice.settings.v2";
export const INTRO_SESSION_KEY = "bridgevoice.intro.v1";

export const bootScript = `(function(){try{
var d=document.documentElement,s={};
try{s=JSON.parse(localStorage.getItem("${SETTINGS_KEY}")||"{}")||{}}catch(e){}
var t=s.theme||"light";
if(t==="system"){t=window.matchMedia&&window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark"}
if(t!=="light"&&t!=="dark")t="dark";
d.dataset.theme=t;
var reduced=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
var seen=false;
try{seen=sessionStorage.getItem("${INTRO_SESSION_KEY}")==="1"}catch(e){}
var off=s.intro===false||s.motion===false;
if(!reduced&&!seen&&!off){
d.dataset.intro="play";
try{sessionStorage.setItem("${INTRO_SESSION_KEY}","1")}catch(e){}
}else{d.dataset.intro="off"}
}catch(e){}})();`;

/** Pure helper mirroring the boot script's decision, used by tests. */
export function shouldPlayIntro(o: {
  reducedMotion: boolean;
  seenThisSession: boolean;
  settings: { intro?: boolean; motion?: boolean };
}): boolean {
  return (
    !o.reducedMotion &&
    !o.seenThisSession &&
    o.settings.intro !== false &&
    o.settings.motion !== false
  );
}
