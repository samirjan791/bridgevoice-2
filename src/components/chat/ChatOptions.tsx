"use client";
import { Download, Trash2 } from "lucide-react";
import { Language, packs } from "@/lib/languages";
import { Task, ChatMessage as Message } from "@/lib/chat/schema";
import { download } from "@/lib/storage";
export function ChatOptions({ task, setTask, setMirror, startBridge, level, setLevel, voiceLanguage, setVoiceLanguage, voice, settings, update, chat, newChat }: {
 task: Task; setTask: (v: Task) => void; setMirror: (v:boolean)=>void; startBridge:()=>void;
 level:"simple"|"standard"|"detailed"; setLevel:(v:"simple"|"standard"|"detailed")=>void;
 voiceLanguage:Language; setVoiceLanguage:(v:Language)=>void; voice:{stop:()=>void;supported:boolean};
 settings:{volume:number}; update:(v:{volume:number})=>void; chat:{messages:Message[]}; newChat:()=>void;
}) { return (<section className="chat-options">
                <div>
                  <label>
                    Task
                    <select
                      value={task}
                      onChange={(e) => {
                        setTask(e.target.value as Task);
                        if (e.target.value === "compare") setMirror(true);
                        if (e.target.value === "bridge") startBridge();
                      }}
                    >
                      {[
                        ["auto", "Automatic"],
                        ["chat", "Conversation"],
                        ["translate", "Translation"],
                        ["explain", "Explanation"],
                        ["simplify", "Simplify"],
                        ["compare", "Compare translations"],
                        ["terms", "Terminology"],
                        ["document", "Document"],
                        ["bridge", "Interpretation"],
                      ].map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Explanation
                    <select
                      value={level}
                      onChange={(e) => setLevel(e.target.value as typeof level)}
                    >
                      <option value="simple">Simple</option>
                      <option value="standard">Standard</option>
                      <option value="detailed">Detailed</option>
                    </select>
                  </label>
                  <label>
                    Read-aloud language
                    <select
                      value={voiceLanguage}
                      onChange={(e) => {
                        voice.stop();
                        setVoiceLanguage(e.target.value as Language);
                      }}
                    >
                      {Object.values(packs).map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Volume
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={settings.volume}
                      onChange={(e) =>
                        update({ volume: Number(e.target.value) })
                      }
                    />
                  </label>
                </div>
                <div className="option-actions">
                  <button
                    disabled={!chat.messages.length}
                    onClick={() =>
                      download(
                        "bridgevoice-chat.json",
                        JSON.stringify(
                          {
                            exportedAt: new Date().toISOString(),
                            messages: chat.messages,
                          },
                          null,
                          2,
                        ),
                        "application/json",
                      )
                    }
                  >
                    <Download size={14} />
                    Export chat
                  </button>
                  <button onClick={newChat}>
                    <Trash2 size={14} />
                    Clear session
                  </button>
                  <small>
                    {voice.supported
                      ? "Read-aloud is available through an installed voice or configured cloud speech."
                      : "Read-aloud setup is available in Settings."}
                  </small>
                </div>
              </section>); }
