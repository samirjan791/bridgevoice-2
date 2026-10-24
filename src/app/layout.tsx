import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Shell } from "@/components/shell";
export const metadata: Metadata = {
  title: "BridgeVoice — Every Voice Deserves to Be Understood",
  openGraph: {
    title: "BridgeVoice — The Human Connection Engine",
    images: [
      {
        url: "/brand/bridgevoice-approved.jpeg",
        width: 1254,
        height: 1254,
        alt: "BridgeVoice brand mark",
      },
    ],
  },
  icons: { icon: "/brand/bridge-symbol.svg" },
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
      <body>
        <Providers>
          <Shell>{children}</Shell>
        </Providers>
      </body>
    </html>
  );
}
