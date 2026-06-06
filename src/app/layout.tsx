import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Header } from "@/components/Header";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export const metadata: Metadata = {
  title: "CleanersApp — Book trusted cleaners in minutes",
  description:
    "On-demand or scheduled professional cleaning with live job status like a ride.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geist.variable} antialiased`}>
        <Header />
        <main className="mx-auto min-h-[calc(100dvh-56px)] max-w-lg">{children}</main>
      </body>
    </html>
  );
}
