import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { ThemeProvider } from "@/components/layout/theme";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "CP & SysDesign Academy", template: "%s · CP & SysDesign Academy" },
  description:
    "An open-source interactive course: competitive programming and system design, from zero to advanced.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-accent focus:px-3 focus:py-2 focus:text-accent-fg"
          >
            Skip to content
          </a>
          <Header />
          <div id="main">{children}</div>
        </ThemeProvider>
      </body>
    </html>
  );
}
