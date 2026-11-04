import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./motion.css";
import "./intro.css";
import "@/styles/chat-layout.css";
import "@/styles/mobile-composer.css";
import "@/styles/settings.css";
import { Providers } from "@/components/providers";
import { Shell } from "@/components/shell";
import { Intro } from "@/components/intro/Intro";
import { bootScript } from "@/lib/intro-boot";
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
  ],
};
export const metadata: Metadata = {
  metadataBase: new URL("https://bridgevoice.us"),
  robots: { index: false, follow: false },
  applicationName: "BridgeVoice",
  appleWebApp: { capable: true, title: "BridgeVoice", statusBarStyle: "default" },
  manifest: "/manifest.webmanifest",
  title: "BridgeVoice — Every Voice Deserves to Be Understood",
  twitter: {
    card: "summary_large_image",
    title: "BridgeVoice — Every Voice Deserves to Be Understood",
    images: ["/brand/bridgevoice-unified.png"],
  },
  openGraph: {
    title: "BridgeVoice — The Human Connection Engine",
    images: [
      {
        url: "/brand/bridgevoice-unified.png",
        width: 1254,
        height: 1254,
        alt: "BridgeVoice brand mark",
      },
    ],
  },
  icons: { icon: "/brand/favicon.png", apple: "/brand/apple-touch-icon.png" },
  description:
    "A human-first interpreter co-pilot for terminology, critical details, Pashto and Dari.",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <head>
        {/* Decides theme + opening sequence before first paint (no flash). */}
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
      </head>
      <body>
        <Intro />
        <Providers>
          <Shell>{children}</Shell>
        </Providers>
      </body>
    </html>
  );
}
