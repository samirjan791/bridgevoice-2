import { z } from "zod";
import { storedChatSchema, StoredChat } from "./schema";
export const HISTORY_KEY = "bridgevoice.chats.v2";
const historySchema = z.array(storedChatSchema).max(20);
export function readHistory() {
  return historySchema.parse(
    JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]"),
  );
}
export function persistChat(chat: StoredChat) {
  const old = readHistory().filter((c) => c.id !== chat.id);
  localStorage.setItem(
    HISTORY_KEY,
    JSON.stringify(historySchema.parse([chat, ...old].slice(0, 20))),
  );
}
export function removeChat(id: string) {
  localStorage.setItem(
    HISTORY_KEY,
    JSON.stringify(readHistory().filter((c) => c.id !== id)),
  );
}
