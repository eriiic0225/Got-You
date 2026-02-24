import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen grid place-items-center bg-bg-primary">
      <div className="text-center space-y-8 px-4">
        {/* Logo 和標題 */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-text-primary">
            🏋️ Got You 咖揪
          </h1>
          <p className="text-xl text-text-secondary">
            找到你的運動夥伴
          </p>
        </div>

        {/* 主按鈕 */}
        <Link
          href="/signup"
          className="inline-block px-8 py-3 bg-primary text-bg-primary font-semibold rounded-lg hover:bg-primary-hover transition
          hover:animate-pulse "
        >
          開始使用
        </Link>

        {/* 次要連結 */}
        <p className="text-text-secondary">
          已有帳號？
          <Link
            href="/login"
            className="text-primary hover:underline ml-1"
          >
            登入
          </Link>
        </p>
      </div>
    </div>
  );
}
