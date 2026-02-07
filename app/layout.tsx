import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SideMenu } from "@/components/SideMenu";
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
  title: "Phone Call Agent",
  description: "Talk to an AI assistant over the phone",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-screen">
      <body
        className={`${geistSans.variable} ${geistMono.variable} flex antialiased root h-full`}
      >
        <SideMenu />
        <div className="flex-1">{children}</div>
      </body>
    </html>
  );
}
