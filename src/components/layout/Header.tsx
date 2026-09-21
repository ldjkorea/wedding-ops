'use client';

import React from 'react';
import Link from 'next/link';
import { Camera, RotateCcw, Settings } from 'lucide-react';
import { DataStore } from '@/lib/storage';

export function Header() {
  const handleReset = () => {
    if (confirm('초기 샘플(시드) 데이터로 되돌리시겠습니까? 진행 중인 수정사항이 리셋됩니다.')) {
      DataStore.resetToSeedData();
      window.location.reload();
    }
  };

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

        <div className="flex items-center gap-2">
          <Link
            href="/settings/storage"
            title="데이터 저장소 설정 (로컬 / Google Sheets)"
            className="flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 p-2 rounded-lg transition"
          >
            <Settings className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={handleReset}
            title="초기 샘플 데이터로 리셋"
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-lg transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">시드 리셋</span>
          </button>
          <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-semibold border border-indigo-700">
            한
          </div>
        </div>
      </div>
    </header>
  );
}
