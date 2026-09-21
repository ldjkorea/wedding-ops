import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';

export const metadata: Metadata = {
  title: '스냅오피스 — 본식 웨딩 촬영팀 내부 운영',
  description: '본식 웨딩사진작가를 위한 올인원 일정·작가·Job Pack·정산 운영 시스템',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-slate-100 flex flex-col items-center">
        <div className="w-full max-w-xl bg-slate-50 min-h-screen flex flex-col shadow-sm pb-24">
          <Header />
          <main className="flex-1 px-4 py-4">{children}</main>
          <BottomNav />
        </div>
      </body>
    </html>
  );
}
