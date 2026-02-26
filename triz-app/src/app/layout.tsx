import type { Metadata } from "next";
import { Suspense } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ProgressProvider } from "@/lib/progress";
import { Sidebar } from "@/components/sidebar";
import { ContentHeader } from "@/components/content-header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ТРИЗ-тренажёр",
  description: "Платформа для изучения Теории Решения Изобретательских Задач",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ProgressProvider>
          <Suspense>
            <Sidebar />
          </Suspense>
          <main className="ml-72 min-h-screen bg-[#F9F9F9]">
            <Suspense>
              <ContentHeader />
            </Suspense>
            {children}
          </main>
        </ProgressProvider>
      </body>
    </html>
  );
}
