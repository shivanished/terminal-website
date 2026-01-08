import type { Metadata } from "next";
import { Geist, Geist_Mono, Tinos } from "next/font/google";
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
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${tinos.variable} antialiased`}
      >
        <ViewModeProvider>
          {children}
        </ViewModeProvider>
      </body>
    </html>
  );
}
