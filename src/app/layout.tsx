import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Screen Seer Studio",
    template: "%s · Screen Seer Studio",
  },
  description:
    "Turn atmosphere into interface. Screen Seer Studio transforms creative intent into live, editable visual systems.",
  applicationName: "Screen Seer Studio",
  keywords: [
    "AI interface design",
    "visual design system",
    "interface design",
    "website builder",
    "Screen Seer Studio",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}

