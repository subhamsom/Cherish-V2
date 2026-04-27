import type { Metadata, Viewport } from "next";
import { Fraunces, DM_Sans } from "next/font/google";
import AppNavigationShell from "@/components/AppNavigationShell";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#FF6B6C",
};

export const metadata: Metadata = {
  applicationName: "Cherish",
  title: {
    default: "Cherish",
    template: "%s · Cherish",
  },
  description: "Capture and revisit memories with your partner.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "Cherish",
    statusBarStyle: "default",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/icon-192.png", sizes: "192x192" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${dmSans.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-[#fafafa]">
        <AppNavigationShell>{children}</AppNavigationShell>
      </body>
    </html>
  );
}