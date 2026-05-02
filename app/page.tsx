import { cn } from "@/lib/utils"
import Link from "next/link"
import Image from "next/image"
import './globals.css';
import { FiArrowRight } from "react-icons/fi"
import LandingNav from "@/components/landing/LandingNav";
import SportCarousel from "@/components/landing/SportCarousel";
import FadeInOnScroll from "@/components/landing/FadeInOnScroll";
import ScrollDownIndicator from "@/components/landing/ScrollDownIndicator";
import heroImg from "@/public/hero_v1.jpg";
import ctaBgImg from "@/public/background_1.png";


// Hero 右側裝飾用的假揪團卡資料
const MOCK_POSTS = [
  {
    emoji: "🏋️",
    title: "重訓揪人",
    place: "健身工廠信義場",
    time: "週六 10:00",
    count: 3,
    max: 4,
    delay: "0s",
    position: "top-10 left-0",
  },
  {
    emoji: "🏸",
    title: "羽球雙打",
    place: "土城國民運動中心",
    time: "週三 20:00",
    count: 4,
    max: 6,
    delay: "0.9s",
    position: "top-32 right-0",
  },
  {
    emoji: "🚴",
    title: "單車環湖",
    place: "碧潭風景區",
    time: "週六 07:30",
    count: 2,
    max: 8,
    delay: "1.8s",
    position: "bottom-8 left-8",
  },
];

// 核心功能介紹
const FEATURES = [
  {
    icon: "🗺️",
    step: "01",
    title: "探索附近用戶",
    desc: "透過共同常去地點及 GPS 定位，找到附近有共同運動偏好的夥伴。",
    accentClass: "from-blue-500/15 to-transparent",
    borderHover: "hover:border-blue-500/40",
  },
  {
    icon: "🤝",
    step: "02",
    title: "發揪或加入揪團",
    desc: "發起活動，填好時間地點人數，等人來報名。或主動瀏覽有趣的揪團，一鍵參加！",
    accentClass: "from-primary/15 to-transparent",
    borderHover: "hover:border-primary/40",
  },
  {
    icon: "💬",
    step: "03",
    title: "即時聊天",
    desc: "看上眼的夥伴？直接傳訊息開聊，支援圖片傳送，約好時間地點，一起動起來。",
    accentClass: "from-accent/15 to-transparent",
    borderHover: "hover:border-accent/40",
  },
];


function MockPostCard({
  emoji,
  title,
  place,
  time,
  count,
  max,
}: {
  emoji: string;
  title: string;
  place: string;
  time: string;
  count: number;
  max: number;
}) {
  return (
    <div className="w-52 bg-bg-secondary border border-border rounded-2xl p-4 shadow-2xl shadow-black/40">
      {/* 卡片頂部：圖示 + 標題地點 */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 bg-bg-tertiary rounded-xl flex items-center justify-center text-xl shrink-0">
          {emoji}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-text-primary truncate">{title}</p>
          <p className="text-xs text-text-secondary truncate">{place}</p>
        </div>
      </div>
      {/* 卡片底部：時間 + 人數 */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-text-tertiary">{time}</span>
        <span className="text-xs font-semibold text-primary bg-primary/15 px-2 py-0.5 rounded-full">
          {count}/{max} 人
        </span>
      </div>
    </div>
  );
}


export default function Home(){

  return (
    <div>
      
      {/* nav */}
      <LandingNav/>

      {/* hero */}
      <section className="relative min-h-screen overflow-hidden px-20">
        {/* 背景圖 + 遮罩 */}
        {/* div 負責定位和 z-index；Image fill 需要有 position 的父容器 */}
        {/* priority：插入 preload link，LCP 圖片盡早開始下載 */}
        {/* placeholder="blur"：下載中顯示模糊縮圖，完成後 fade 到清晰 */}
        {/* sizes="100vw"：告知 Next.js 這張圖永遠是全視窗寬，讓它選最適合的尺寸 */}
        <div className="absolute inset-0 -z-50">
          <Image
            src={heroImg}
            alt="hero背景圖"
            fill
            priority
            placeholder="blur"
            sizes="100vw"
            className="object-cover"
          />
        </div>
        <div className="absolute inset-0 -z-40 bg-bg-primary/70" />

        {/* 文字及其他內容 */}
        <div className="max-w-[1200px] mt-45 mx-auto grid md:grid-cols-2 gap-12 md:gap-8 items-center">
          {/* 左側文案 */}
          <div className="space-y-6">
            
            <div 
              className="animate-fade-in-up inline-flex items-center gap-2 px-4 py-1.5 bg-primary/15 border border-primary/30 rounded-full text-primary text-sm font-semibold"
              style={{ animationDelay: '0ms' }}
            >
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" aria-hidden />
              最簡單直接的運動揪團平台
            </div>
            {/* 主標題 */}
            <h1 
              className="animate-fade-in-up text-5xl md:text-6xl lg:text-7xl font-black leading-[1.1] tracking-tight"
              style={{ animationDelay: '100ms' }}
            >
              找到你的
              <br />
              <span className="text-primary">運動夥伴</span>
            </h1>

            {/* 副標 */}
            <p 
              className="animate-fade-in-up text-text-secondary text-lg md:text-xl leading-relaxed max-w-md"
              style={{ animationDelay: '200ms' }}
            >
              不管是羽球、跑步還是健身——
              Got You 幫你找到附近志同道合的夥伴，一起動起來。
            </p>

            {/* CTA 按鈕群 */}
            <div 
              className="flex flex-col sm:flex-row gap-3 pt-2 animate-fade-in-up"
              style={{ animationDelay: '300ms' }}
            >
              {/* 主要 CTA */}
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-primary text-bg-primary font-bold rounded-xl hover:bg-primary-hover transition-all duration-200 shadow-lg shadow-primary/25 hover:shadow-primary/40 text-base"
              >
                免費開始使用
                {/* 右箭頭 icon */}
                <FiArrowRight/>
              </Link>

              {/* 次要 CTA */}
              <Link
                href="/login"
                className="inline-flex items-center justify-center px-8 py-3.5 border border-border text-text-primary font-semibold rounded-xl hover:bg-bg-secondary transition-all duration-200 text-base"
              >
                已有帳號？登入
              </Link>
            </div>
          </div>

          <div 
            className="relative hidden md:block h-[460px] animate-fade-in-up"
            style={{ animationDelay: '400ms' }}
          >
            {/* 浮動卡片 */}
            {MOCK_POSTS.map((post) => (
              <div
                key={post.title}
                className={`absolute ${post.position} animate-float`}
                style={{ animationDelay: post.delay }}
              >
                <MockPostCard
                  emoji={post.emoji}
                  title={post.title}
                  place={post.place}
                  time={post.time}
                  count={post.count}
                  max={post.max}
                />
              </div>
            ))}
          </div>

        </div>

        {/* 滑動指示器 */}
        <div 
          className="absolute bottom-4 left-[50%] translate-x-[50%]"
        >
          <ScrollDownIndicator />
        </div>
      </section>

      {/* 運動類型標籤列 */}
      <SportCarousel/>

      {/* 核心功能說明區 */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 py-20">
        {/* 標題 */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-black mb-3">
            三步驟，開始你的<span className="text-primary">運動社交</span>
          </h2>
          <p className="text-text-secondary text-base md:text-lg">
            從探索到聊天，一個平台搞定
          </p>
        </div>

        {/* 功能卡片 grid */}
        <div className="grid md:grid-cols-3 gap-5"> {/* 手機一欄，桌機改三欄 */}
          {FEATURES.map((feature, i) => (
            <FadeInOnScroll key={i} delay={i*150}>
              <div
                key={feature.title}
                className={`relative p-6 bg-bg-secondary border border-border rounded-2xl ${feature.borderHover} transition-all duration-300 group overflow-hidden h-full`}
              >
                {/* 懸停時的漸層背景 */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.accentClass} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                  aria-hidden
                />

                <div className="relative space-y-3">
                  {/* 大圖示 */}
                  <div className="text-4xl">{feature.icon}</div>

                  {/* 步驟編號 + 標題 */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-primary bg-primary/15 px-2 py-0.5 rounded-full">
                      {feature.step}
                    </span>
                    <h3 className="text-base font-bold text-text-primary">{feature.title}</h3>
                  </div>

                  {/* 描述文字 */}
                  <p className="text-text-secondary text-sm leading-relaxed">{feature.desc}</p>
                </div>
              </div>
            </FadeInOnScroll>
          ))}
        </div>
      </section>

      {/* ════ CTA BANNER ════════════════════════════════════ */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 py-16">
        <div className="relative overflow-hidden bg-bg-secondary border border-border rounded-3xl px-8 py-14 md:py-20 text-center">
          {/* 背景光暈 */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none"
            aria-hidden
          />
          {/* 背景圖片 */}
          <div className="absolute inset-0 w-full h-full rounded-3xl pointer-events-none overflow-hidden">
            <Image
              src={ctaBgImg}
              alt=""
              fill
              sizes="(max-width: 1280px) 100vw, 1280px"
              className="object-cover opacity-50"
            />
          </div>

          <div className="relative space-y-5">
            {/* 小標 */}
            <p className="text-primary font-semibold text-sm uppercase tracking-[0.15em]">
              Ready to move?
            </p>

            {/* 主標 */}
            <h2 className="text-3xl md:text-5xl font-black leading-tight">
              你的運動夥伴
              <br />
              <span className="text-primary">正在等你</span>
            </h2>

            {/* 說明 */}
            <p className="text-text-secondary text-base md:text-lg max-w-sm mx-auto">
              現在加入<br/>探索附近用戶、發起揪團、開始聊天。
            </p>

            {/* 按鈕 */}
            <div className="pt-2">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 px-10 py-4 bg-primary text-bg-primary font-bold rounded-xl hover:bg-primary-hover transition-all duration-200 shadow-xl shadow-primary/30 hover:shadow-primary/50 text-lg"
              >
                免費加入
                <FiArrowRight/>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ════ FOOTER ═════════════════════════════════════════ */}
      <footer className="relative z-10 border-t border-border/50 py-8">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Logo + 品牌名 */}
          <div className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/Logo-removebg.png"
              alt=""
              aria-hidden
              className="w-5 h-5 object-contain"
            />
            <span className="text-text-secondary text-sm">Copyright © Got You 咖揪 2026</span>
          </div>
          <p className="text-text-tertiary text-xs">找到你的運動夥伴，一起動起來</p>
        </div>
      </footer>

    </div>
  )
}