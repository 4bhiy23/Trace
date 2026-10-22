import type { Metadata } from "next";
import {
  Inter,
  Inter_Tight,
  JetBrains_Mono,
  Playfair_Display,
} from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { QueryProvider } from "@/components/providers/query-provider";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const interTight = Inter_Tight({
  variable: "--font-display",
  subsets: ["latin"],
});

const playfairDisplay = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Trace - Collaborative Canvas",
  description:
    "Real-time collaborative canvas and whiteboard for creative teams.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full",
        "antialiased",
        inter.variable,
        interTight.variable,
        playfairDisplay.variable,
        jetbrainsMono.variable,
        "font-sans",
      )}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const storedTheme = localStorage.getItem('trace-theme');
                if (storedTheme === 'dark') {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-[var(--background)] text-[var(--foreground)] relative z-[2]">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
