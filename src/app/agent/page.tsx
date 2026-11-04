import { redirect } from "next/navigation";

// BridgeVoice 5.0.0: there is no separate agent chat anymore. The agent
// engines live inside the one main chat, so old /agent links and bookmarks
// land on the working chat instead of a dead page.
export default function AgentRedirect() {
  redirect("/");
}
