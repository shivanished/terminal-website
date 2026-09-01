import type { Metadata } from "next";
import { Geist, Geist_Mono, Tinos } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { ViewModeProvider } from "./contexts/ViewModeContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const tinos = Tinos({
  variable: "--font-tinos",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Shivansh Soni",
  description: "Personal website",
  icons: {
    icon: '/icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Runs before first paint: plain-mode visitors get a white canvas immediately,
  // so no dark flash and no dark rubber-band/overscroll region in Safari.
  const modeInit = `(function(){try{if(localStorage.getItem('viewMode')==='plain'){document.documentElement.dataset.mode='plain';}}catch(e){}})();`;

  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{ __html: modeInit }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${tinos.variable} antialiased`}
      >
        <ViewModeProvider>
          {children}
        </ViewModeProvider>
        <Analytics />
      </body>
    </html>
  );
}
