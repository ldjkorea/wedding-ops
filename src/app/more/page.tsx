'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Building2,
  Database,
  RotateCcw,
  ChevronRight,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { DataStore } from '@/lib/storage';

// 더보기 페이지: 웨딩홀·저장소 설정·시드 초기화 등 부가 기능 진입점
export default function MorePage() {
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleReset = () => {
    DataStore.resetToSeedData();
    window.location.href = '/';
  };

  return (
    <div className="space-y-5 pb-12">
      {/* 페이지 헤더 */}
      <div>
        <h1 className="text-xl font-bold text-slate-900">더보기</h1>
        <p className="text-xs text-slate-500 mt-0.5">부가 기능 및 설정</p>
      </div>

      {/* ===== 촬영 운영 데이터 ===== */}
      <section className="space-y-1">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1 mb-2">
          운영 데이터
        </p>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden divide-y divide-slate-100">
          <Link
            href="/venues"
            className="flex items-center justify-between px-4 py-3.5 hover:bg-slate-50 transition group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center">
                <Building2 className="w-4 h-4 text-indigo-600" />
              </div>
              <div>
                <span className="text-sm font-semibold text-slate-900 block">웨딩홀 관리</span>
                <span className="text-[11px] text-slate-500">
                  웨딩홀·홀 정보, 팩트 시트, 크루 노하우
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition" />
          </Link>
        </div>
      </section>

      {/* ===== 시스템 설정 ===== */}
      <section className="space-y-1">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1 mb-2">
          시스템 설정
        </p>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden divide-y divide-slate-100">
          <Link
            href="/settings/storage"
            className="flex items-center justify-between px-4 py-3.5 hover:bg-slate-50 transition group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
                <Database className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <span className="text-sm font-semibold text-slate-900 block">데이터 저장소 설정</span>
                <span className="text-[11px] text-slate-500">
                  로컬 / Google Sheets 전환 및 연결 관리
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition" />
          </Link>
        </div>
      </section>

      {/* ===== 위험 구역 ===== */}
      <section className="space-y-1">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1 mb-2">
          데이터 관리
        </p>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <button
            onClick={() => setShowResetConfirm(true)}
            className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-rose-50/50 transition group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center">
                <RotateCcw className="w-4 h-4 text-rose-500" />
              </div>
              <div className="text-left">
                <span className="text-sm font-semibold text-rose-700 block">샘플 데이터로 초기화</span>
                <span className="text-[11px] text-slate-500">
                  모든 데이터가 초기 시드 데이터로 리셋됩니다
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-rose-500 transition" />
          </button>
        </div>
      </section>

      {/* 앱 정보 */}
      <section className="bg-slate-100/70 rounded-2xl p-4 space-y-1.5">
        <div className="flex items-center gap-2 text-slate-500">
          <Info className="w-3.5 h-3.5 shrink-0" />
          <span className="text-[11px] font-semibold text-slate-600">스냅오피스 — 디어메모리 OS</span>
        </div>
        <p className="text-[10.5px] text-slate-400 leading-relaxed pl-5">
          본식 웨딩 촬영팀 내부 운영 시스템 · Phase 1–3 완비<br />
          Job / 작가 배정 / Job Pack / 원본 인수 / 정산 / 납품 / 웨딩홀 인텔리전스
        </p>
      </section>

      {/* 초기화 확인 모달 (인라인) */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-6">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">샘플 데이터로 초기화</h2>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  현재 저장된 모든 촬영·작가·정산 데이터가 삭제되고
                  초기 샘플 데이터로 되돌아갑니다.
                  <br />
                  <strong className="text-rose-700">이 작업은 되돌릴 수 없습니다.</strong>
                </p>
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
              >
                취소
              </button>
              <button
                onClick={handleReset}
                className="flex-1 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition shadow-sm"
              >
                초기화 진행
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
