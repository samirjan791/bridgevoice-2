// Merged agent engines for the ONE BridgeVoice chat (5.0.0).
// The separate agent page is gone; its behaviors live here and in the main
// chat request pipeline. No UI lives in this module — only routing,
// naming, and the agent-mode instruction block.

// Same localStorage keys the former agent page used, so a name saved there
// keeps working in the merged chat.
export const USERNAME_KEY = "bridgevoice.userName.v1";
export const NAME_ASKED_KEY = "bridgevoice.nameAsked.v1";

const NAME_VERB_START = new Set([
  "help", "plan", "analyze", "create", "make", "translate", "explain",
  "what", "how", "why", "when", "where", "write", "show", "tell", "give",
  "do", "can", "please", "hi", "hello", "hey",
]);

// Capture ONLY explicit self-introductions ("Call me X", "My name is X").
// The former agent page also accepted "I'm …" / "I am …", but in the main
// chat that misfires on ordinary sentences ("I'm going tomorrow"), so
// those prefixes are deliberately NOT accepted here.
export function parseVolunteeredName(raw: string): string | null {
  const text = raw.trim().toLowerCase();
  let rest: string | null = null;
  for (const prefix of ["call me", "my name is"]) {
    if (text.startsWith(prefix + " ")) {
      rest = text.slice(prefix.length).trim();
      break;
    }
  }
  if (!rest || rest.length > 40) return null;
  const words = rest.split(/\s+/);
  if (words.length < 1 || words.length > 3) return null;
  if (!/^[a-z\u0600-\u06FF' -]+$/.test(rest)) return null;
  if (NAME_VERB_START.has(words[0])) return null;
  return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

// Planning / multi-step task requests route to the agent engine. Kept
// conservative on purpose: plain questions ("What does this mean?") and
// translation requests must keep their existing routes.
const AGENT_PATTERNS = [
  /\bplan (my|the|our|a)\b/i,
  /\bhelp me (plan|prepare|organize|schedule)\b/i,
  /\bprepare (me )?for (my|the|an)\b/i,
  /\borganize\b[\s\S]{0,60}\b(into|create|make)\b/i,
  /\bcreate a (project )?plan\b/i,
  /\bmake (me )?a plan\b/i,
  /\bbreak (this|it|that) into steps\b/i,
  /\bstep[- ]by[- ]step plan\b/i,
  /\bcreate a report\b/i,
];

export function detectAgentTask(text: string): boolean {
  return AGENT_PATTERNS.some((p) => p.test(text));
}

// Agent-mode instruction block. The confirmation rule is the safety gate
// from the merge proposal: sensitive actions, external communications, and
// changes to user data are presented first and need the user's explicit
// confirmation — never executed on the model's say-so.
export function agentInstruction(): string {
  return `You are acting as a planning and multi-step task assistant inside the one BridgeVoice chat. Break the request into a clear, ordered plan with concrete steps, ask for missing essentials instead of inventing them, and separate what you can draft now from what needs the user or an outside tool. NEVER claim to have performed an action you did not perform: you have no tools, you cannot send messages, book, call, or change user data. For sensitive actions, external communications, and changes to user data, present the exact action first and ASK FOR CONFIRMATION before proceeding; only proceed when the user confirms.`;
}
