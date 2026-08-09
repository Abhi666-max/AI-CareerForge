import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "AI CareerForge — Interview Readiness Platform",
  description:
    "Measure your interview readiness in 2 minutes. AI-powered resume analysis, mock interview simulation, and your personalised Aura Score.",
  keywords: ["AI interview", "career readiness", "mock interview", "resume analysis", "job preparation"],
  openGraph: {
    title: "AI CareerForge",
    description: "Your Interview Readiness Score — powered by AI.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${inter.variable}`}>
      <body className="noise-overlay font-sans">
        <div className="ambient-bg" aria-hidden="true" />
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}
