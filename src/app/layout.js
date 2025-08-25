// src/app/layout.js
import Link from "next/link";
import "./globals.css";


export const metadata = {
  title: "AI Travel Planner",
  description: "AI와 함께하는 스마트한 여행 계획",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      {/* - 전체적인 폰트 색상과 배경색을 지정하여 일관성을 유지합니다.
      */}
      <body className={`bg-slate-50 text-slate-800`}>
        {/* - 헤더에 반투명 블러 효과를 추가하고, 부드러운 그림자와 하단 경계선으로 세련된 느낌을 줍니다.
        */}
        <header className="h-[7vh] top-0 z-50 bg-white/80 backdrop-blur-sm shadow-md border-b border-slate-200">
          <nav className="w-full h-full mx-auto px-6 py-4 flex justify-between items-center">
            {/* - 앱 타이틀에 아이콘과 호버 효과를 추가하여 시각적 매력을 더합니다.
            */}
            <Link href="/" className="text-xl font-bold text-slate-900 hover:text-blue-600 transition-colors duration-200">
              ✈️ 여행의아이들
            </Link>
            <div>
              {/* 네비게이션 링크가 필요할 경우 여기에 추가할 수 있습니다. */}
            </div>
          </nav>
        </header>
        {/* - 메인 콘텐츠 영역입니다. children이 여기에 렌더링됩니다.
        */}
        <main className="h-[93vh]">{children}</main>
      </body>
    </html>
  );
}
