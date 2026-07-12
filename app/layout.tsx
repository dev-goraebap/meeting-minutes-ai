import type { Metadata } from "next";
import "./globals.css";
import { AppNav } from "@/shared/ui/app-nav";
import { MobileTabBar, MobileFab } from "@/shared/ui/mobile-chrome";

export const metadata: Metadata = {
  title: "회의록",
  description: "회의 녹음을 자동으로 전사·화자분리·구조화 회의록으로 만들어드려요.",
};

export default function RootLayout({
  children,
  modal,
}: Readonly<{
  children: React.ReactNode;
  modal: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <AppNav />
        <div className="pb-16 sm:pb-0">{children}</div>
        {modal}
        <MobileTabBar />
        <MobileFab />
      </body>
    </html>
  );
}
