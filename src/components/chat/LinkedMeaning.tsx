"use client";
import { Fragment, useState } from "react";
import { Anchor, meaningAnchors } from "@/lib/meaning-check";
import { Language } from "@/lib/languages";
const labels: Record<Anchor["kind"],string> = {value:"Numbers & units",negation:"Negation",condition:"Conditions",frequency:"Frequency"};
export function LinkedMeaning({source,translation,sourceLanguage,targetLanguage}:{source:string;translation:string;sourceLanguage:Language;targetLanguage:Language}) {
 const [active,setActive] = useState<Anchor["kind"]|null>(null);
 function passage(text:string) {
  const anchors=meaningAnchors(text);
  return <>{anchors.map((a,i)=><Fragment key={a.start}>{text.slice(i?anchors[i-1].end:0,a.start)}<button className="anchor-token" aria-label={`${labels[a.kind]}: ${a.text}`} aria-pressed={active===a.kind} onClick={()=>setActive(a.kind)} onMouseEnter={()=>setActive(a.kind)} onFocus={()=>setActive(a.kind)}>{a.text}</button></Fragment>)}{text.slice(anchors.at(-1)?.end||0)}</>;
 }
 return <details className="meaning-check linked-meaning"><summary>Did the meaning survive?</summary><div className="meaning-check-body">
 <p>Select a marked detail to highlight the same category in both passages.</p>
 <div className="anchor-legend">{Object.entries(labels).map(([kind,label])=><button key={kind} aria-pressed={active===kind} onClick={()=>setActive(active===kind?null:kind as Anchor["kind"])}>{label}</button>)}</div>
 <div className="linked-passages"><section><b>Original</b><p dir="auto" lang={sourceLanguage}>{passage(source)}</p></section><section><b>Translation</b><p dir="auto" lang={targetLanguage}>{passage(translation)}</p></section></div>
 <small>These links group recognized text markers, not verified equivalent meanings. Missing highlights do not mean a detail is absent. Pashto, Dari and Spanish coverage is limited; a qualified person must review the translation.</small>
 </div></details>;
}
