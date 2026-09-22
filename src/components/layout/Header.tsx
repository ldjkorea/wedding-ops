'use client';

import React from 'react';
import Link from 'next/link';
import { Camera } from 'lucide-react';

// 헤더: 로고 + 브랜드명만 노출 (시드리셋/설정은 더보기 페이지로 이동)
export function Header() {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm group-hover:bg-indigo-700 transition">
            <Camera className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-slate-900 tracking-tight text-base block leading-none">
              스냅오피스
            </span>
            <span className="text-[10px] text-indigo-700 font-semibold leading-tight">
              디어메모리 · 한민규 대표
            </span>
          </div>
        </Link>

        {/* 우측 아바타 */}
        <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-semibold border border-indigo-700">
          한
        </div>
      </div>
    </header>
  );
}
