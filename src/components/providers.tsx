"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { motionTiming } from "@/lib/motion";
import { z } from "zod";
const schema = z.object({
  target: z.enum(["ps", "fa-AF", "en", "es-US"]),
  uiLanguage: z.enum(["en", "ps", "fa-AF", "es-US"]).default("en"),
  autoLanguage: z.boolean().default(false),
  dictation: z.boolean().default(true),
  history: z.boolean().default(false),
  volume: z.number().min(0).max(1).default(0.8),
  theme: z.enum(["dark", "light", "system"]),
  font: z.enum(["normal", "large"]),
  intro: z.boolean().default(true),
  motion: z.boolean(),
  contrast: z.boolean(),
  showcase: z.boolean(),
  memory: z.boolean(),
  automatic: z.boolean(),
  domain: z.string().max(100),
  sensitivity: z.enum(["all", "critical"]),
});
type Settings = z.infer<typeof schema>;
const defaults: Settings = {
  target: "en",
  uiLanguage: "en",
  autoLanguage: false,
  dictation: true,
  history: false,
  volume: 0.8,
  theme: "light",
  font: "normal",
  intro: true,
  motion: true,
  contrast: false,
  showcase: false,
  memory: true,
  automatic: true,
  domain: "Medical",
  sensitivity: "all",
};
const Context = createContext({
  settings: defaults,
  update: (_s: Partial<Settings>) => {},
  notice: "",
  notify: (_s: string) => {},
});
export function Providers({ children }: { children: ReactNode }) {
  const [settings, set] = useState(defaults),
    [notice, notify] = useState("");
  useEffect(() => {
    try {
      const v = localStorage.getItem("bridgevoice.settings.v2");
      if (v) set(schema.parse(JSON.parse(v)));
    } catch {
      notify("Preferences could not be restored. Defaults are active.");
    }
  }, []);
  useEffect(() => {
    if (!settings.autoLanguage) return;
    const detect = () => { const l=navigator.language.toLowerCase(); const uiLanguage=l.startsWith("ps")?"ps":l.startsWith("fa")?"fa-AF":l.startsWith("es")?"es-US":"en";set(old=>({...old,uiLanguage})); };
    detect();window.addEventListener("languagechange",detect);return()=>window.removeEventListener("languagechange",detect);
  },[settings.autoLanguage]);
  useEffect(() => {
    document.documentElement.style.setProperty("--motion-fast", `${motionTiming.fast * 1000}ms`);
    document.documentElement.style.setProperty("--motion-enter", `${motionTiming.enter * 1000}ms`);
    document.documentElement.lang = settings.uiLanguage;
    document.documentElement.dir = ["ps", "fa-AF"].includes(settings.uiLanguage)
      ? "rtl"
      : "ltr";
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const applyTheme = () => {
      document.documentElement.dataset.theme =
        settings.theme === "system"
          ? media.matches
            ? "dark"
            : "light"
          : settings.theme;
    };
    applyTheme();
    media.addEventListener("change", applyTheme);
    document.documentElement.dataset.font = settings.font;
    document.documentElement.dataset.motion = String(settings.motion);
    document.documentElement.dataset.contrast = String(settings.contrast);
    return () => media.removeEventListener("change", applyTheme);
  }, [settings]);
  useEffect(() => {
    if (notice) {
      const t = setTimeout(() => notify(""), 6000);
      return () => clearTimeout(t);
    }
  }, [notice]);
  function update(s: Partial<Settings>) {
    const next = { ...settings, ...s };
    set(next);
    try {
      localStorage.setItem("bridgevoice.settings.v2", JSON.stringify(next));
    } catch {
      notify("Storage unavailable. Preferences apply only until reload.");
    }
  }
  return (
    <Context.Provider value={{ settings, update, notice, notify }}>
      {children}
      <div className="toast" role="status" aria-live="polite">
        {notice}
      </div>
    </Context.Provider>
  );
}
export const usePreferences = () => useContext(Context);
