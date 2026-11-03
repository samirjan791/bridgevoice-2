"use client";
import { Fragment, useId, useState } from "react";
import { ArrowRight, Check, ShieldCheck } from "lucide-react";
import { meaningAnchors, clarificationQuestions, compareUnderstanding, reviewLimit } from "@/lib/meaning-check";
import { Language, packs } from "@/lib/languages";

export type MeaningReview = (source: string, answer: string, sourceLanguage: Language, answerLanguage: Language) => void;
export const meaningExample = "Do not take more than two tablets in 24 hours. If you feel dizzy, contact the clinic.";
export function MeaningCheck({ source, language = "en", demo = false, busy = false, onReview }: {
  source: string; language?: Language; demo?: boolean; busy?: boolean; onReview?: MeaningReview;
}) {
  const id = useId();
  const [answer, setAnswer] = useState("");
  const [answerLanguage, setAnswerLanguage] = useState<Language>(language);
  const [checked, setChecked] = useState(false);
  const [reviewed, setReviewed] = useState(false);
  const [note, setNote] = useState("");
  const anchors = meaningAnchors(source);
  const questions = clarificationQuestions(source);
  const issues = checked ? compareUnderstanding(source, answer, language, answerLanguage) : [];
  const resetReview = () => { setChecked(false); setReviewed(false); };
  return <details className="meaning-check" open={demo || undefined}>
    <summary><ShieldCheck size={18} /><span>Meaning Check<small>Understand it. Say it back. Review what changed.</small></span><ArrowRight size={17} /></summary>
    <div className="meaning-check-body">
      <div className="meaning-steps" aria-label="Review workflow"><span>01 · Original</span><span>02 · Your words</span><span>03 · Human review</span></div>
      {demo && <p className="meaning-demo-label">Fictional example · local checks · no AI request</p>}
      <p className="meaning-caption">Original passage · highlights are text markers, not an assessment</p>
      <blockquote dir="auto" lang={language}>{anchors.map((a,i) => <Fragment key={a.start}>{source.slice(i ? anchors[i-1].end : 0,a.start)}<mark title={a.kind}>{a.text}</mark></Fragment>)}{source.slice(anchors.length ? anchors.at(-1)!.end : 0)}</blockquote>
      {questions.length > 0 && <div className="meaning-questions"><b>Ask before assuming</b><ul>{questions.map(q => <li key={q}>{q}</li>)}</ul></div>}
      <label htmlFor={id}>In your own words, what does this mean?</label>
      <textarea id={id} dir="auto" maxLength={12000} rows={3} value={answer} placeholder="Explain the instruction as you understood it…" onChange={e => { setAnswer(e.target.value); resetReview(); }} />
      <div className="meaning-tools"><label>Your explanation’s language <select value={answerLanguage} onChange={e => { setAnswerLanguage(e.target.value as Language); resetReview(); }}>{Object.values(packs).map(p => <option key={p.id} value={p.id}>{p.native}</option>)}</select></label>
      <button disabled={!answer.trim()} onClick={() => {setChecked(true);setReviewed(false);}}>Check important details <ArrowRight size={15}/></button></div>
      {demo && <div className="meaning-tools"><button onClick={() => {setAnswer("Take two tablets in 24 hours.");setAnswerLanguage("en");resetReview();}}>Try a deliberate omission</button><button onClick={() => {setAnswer(source);setAnswerLanguage(language);resetReview();}}>Use the original wording</button></div>}
      {checked && <section className="meaning-findings" aria-live="polite"><b>{issues.length ? `${issues.length} possible differences to review` : "No differences detected by these limited checks"}</b>{issues.length > 0 && <ul>{issues.map(issue => <li key={issue.id}>{issue.message}</li>)}</ul>}<p>{reviewLimit(answerLanguage)}</p>
      <label htmlFor={id+"-note"}>Your clarification or review note (optional)</label><textarea id={id+"-note"} value={note} rows={2} maxLength={2000} onChange={e => {setNote(e.target.value);setReviewed(false);}} />
      <div className="meaning-tools"><button aria-pressed={reviewed} onClick={() => setReviewed(!reviewed)}><Check size={16}/>{reviewed ? "Marked reviewed by you" : "Mark reviewed by me"}</button>{onReview && <button disabled={busy} onClick={() => onReview(source,answer,language,answerLanguage)}>Ask Meta to review meaning</button>}</div>
      <small>Review notes stay in this open view only. Your review is not a certification. Meta review requires permission and a configured connection.</small></section>}
    </div>
  </details>;
}
