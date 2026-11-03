import { z } from "zod";
import { storedChatSchema, StoredChat } from "./schema";
export const HISTORY_KEY = "bridgevoice.chats.v2";
const historySchema = z.array(storedChatSchema).max(100);
export function readHistory() {
  return historySchema.parse(
    JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]"),
  );
}
export function persistChat(chat: StoredChat) {
  const all = readHistory();
  const previous = all.find(c => c.id === chat.id);
  const old = all.filter((c) => c.id !== chat.id);
  chat = {...chat, pinned: chat.pinned ?? previous?.pinned ?? false};
  localStorage.setItem(
    HISTORY_KEY,
    JSON.stringify(historySchema.parse([chat, ...old].slice(0, 100))),
  );
}
export function removeChat(id: string) {
  localStorage.setItem(
    HISTORY_KEY,
    JSON.stringify(readHistory().filter((c) => c.id !== id)),
  );
}

export function toggleChatPin(id: string) {
 const chats = readHistory();
 localStorage.setItem(HISTORY_KEY, JSON.stringify(chats.map(c => c.id === id ? {...c,pinned:!c.pinned} : c)));
}
