"use client";
import { BridgeProof } from "../proof/BridgeProof";
import { usePreferences } from "../providers";
import { ShieldCheck, X } from "lucide-react";
import { Language, packs } from "@/lib/languages";
import { Task } from "@/lib/chat/schema";
export function MeaningMirror({setMirror,setTask,original,setOriginal,proposed,setProposed,source,setSource,chat,send}:{
 setMirror:(v:boolean)=>void;setTask:(v:Task)=>void;original:string;setOriginal:(v:string)=>void;proposed:string;setProposed:(v:string)=>void;source:Language;setSource:(v:Language)=>void;chat:{busy:boolean};send:(s:string)=>Promise<boolean>;
}) {const {settings}=usePreferences();return (<section className="mirror-panel">
                <div>
                  <b>
                    <ShieldCheck size={17} /> Meaning Mirror
                  </b>
                  <button
                    className="tool-icon"
                    aria-label="Close Meaning Mirror"
                    onClick={() => {
                      setMirror(false);
                      setTask("auto");
                    }}
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className="mirror-fields">
                  <label>
                    Original text
                    <textarea
                      aria-label="Original text"
                      value={original}
                      dir="auto"
                      maxLength={12000}
                      onChange={(e) => setOriginal(e.target.value)}
                    />
                  </label>
                  <label>
                    Your translation
                    <textarea
                      aria-label="Proposed translation"
                      value={proposed}
                      dir="auto"
                      maxLength={12000}
                      onChange={(e) => setProposed(e.target.value)}
                    />
                  </label>
                </div>
                {original.trim()&&proposed.trim()&&<BridgeProof source={original} translation={proposed} from={source} to={settings.target}/>}
                <div className="mirror-controls">
                  <label>
                    Source language
                    <select
                      value={source}
                      onChange={(e) => setSource(e.target.value as Language)}
                    >
                      {Object.values(packs).map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button
                    className="primary"
                    disabled={!original.trim() || !proposed.trim() || chat.busy}
                    onClick={() =>
                      void send(
                        "Check whether this translation changes the original meaning.",
                      )
                    }
                  >
                    Compare meaning
                  </button>
                </div>
              </section>);}
