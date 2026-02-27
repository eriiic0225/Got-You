import type { Metadata } from "next";
import AuthInitializer from '@/components/shared/AuthInitializer'
import "./globals.css";


  export const metadata: Metadata = {
    title: "Got You 咖揪",
    description: "找到你的運動夥伴",
  };

  export default function RootLayout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
    return (
      <html lang="zh-TW">
        <body className="antialiased">
          <AuthInitializer /> {/* 掛載全域使用者狀態的組件 */}
          {children}
        </body>
      </html>
    );
  }
