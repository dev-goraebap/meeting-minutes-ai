import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "회의록",
  description: "회의 녹음을 자동으로 전사·화자분리·구조화 회의록으로 만들어드려요.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
