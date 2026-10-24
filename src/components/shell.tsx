"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Brand } from "./brand/Brand";
export const Logo = Brand;
export function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
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
          <Link href="/">Chat</Link>
          <Link href="/glossary">Glossary</Link>
          <Link href="/demo">Demo</Link>
          <Link href="/settings">Settings</Link>
        </nav>
      </header>
      <main id="main">{children}</main>
      <footer>
        <Link href="/about">About</Link>
        <Link href="/privacy">Privacy</Link>
        <Link href="/terms">Terms</Link>
        <small>AI suggestions require human judgment and verification.</small>
      </footer>
    </>
  );
}
