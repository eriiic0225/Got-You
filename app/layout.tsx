import type { Metadata } from "next";
import AuthInitializer from '@/components/shared/AuthInitializer'
import "./globals.css"
import 'overlayscrollbars/overlayscrollbars.css' // 優化 windows 用戶滾動條使用
import { Audiowide } from 'next/font/google';

// 設定字體參數
const audiowide = Audiowide({
  subsets: ['latin'],
  weight: ['400'], 
  variable: '--font-audiowide', // 定義 CSS 變數名稱（整合 Tailwind 用）
  display: 'swap',
});


  export const metadata: Metadata = {
    title: "Got You 咖揪",
    description: "找到你的運動夥伴",
    icons: {
      icon: '/favicon_v2.png',
    },
  };

  export default function RootLayout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
    return (
      <html lang="zh-TW" className={audiowide.variable}>
        <body className="antialiased">
          <AuthInitializer /> {/* 掛載全域使用者狀態及各種channel監聽啟用的組件 */}
          {children}
        </body>
      </html>
    );
  }
