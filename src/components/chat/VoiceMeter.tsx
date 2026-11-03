"use client";
/** The visual meter never requests a second microphone stream. */
export function VoiceMeter({listening}:{listening:boolean}) {
 if(!listening)return null;
 return <div className="voice-meter" role="status" aria-label="Microphone listening"><svg viewBox="0 0 240 40" preserveAspectRatio="none" aria-hidden="true"><path d="M0 20H240" stroke="currentColor" fill="none" strokeWidth="1.8"/></svg><span className="sr-only">Listening (waveform disabled to avoid a second microphone stream)</span></div>;
}
