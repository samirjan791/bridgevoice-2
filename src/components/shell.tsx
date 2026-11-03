"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Brand } from "./brand/Brand";
import { usePreferences } from "./providers";
import { ui } from "@/lib/ui-text";
export const Logo = Brand;
export function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const { settings } = usePreferences();
  const t = ui[settings.uiLanguage];
  const words = { en: ["Chat", "Glossary", "Demo", "Privacy", "Terms"], ps: ["خبرې", "لغتونه", "بېلګه", "محرمیت", "شرطونه"], "fa-AF": ["گفتگو", "واژه‌ها", "نمایش", "حریم خصوصی", "شرایط"], "es-US": ["Chat", "Glosario", "Demostración", "Privacidad", "Términos"] }[settings.uiLanguage];
  if (path === "/settings") return <>{children}</>;
  if (path === "/" || path === "/demo")
    return (
      <>
        <a className="skip" href="#main">
          Skip to content
        </a>
        {children}
      </>
    );
  return (
    <>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <header className="simple-header">
        <Link href="/">
          <Brand />
        </Link>
        <nav>
          <Link href="/">{words[0]}</Link>
          <Link href="/glossary">{words[1]}</Link>
          <Link href="/demo">{words[2]}</Link>
          <Link href="/settings">{t.settings}</Link>
        </nav>
      </header>
      <main id="main">{children}</main>
      <footer>
        <Link href="/about">{t.about}</Link>
        <Link href="/privacy">{words[3]}</Link>
        <Link href="/terms">{words[4]}</Link>
        <small>{t.review}</small>
      </footer>
    </>
  );
}
