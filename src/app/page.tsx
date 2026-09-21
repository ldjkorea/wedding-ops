'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Calendar,
  ChevronRight,
  CheckCircle2,
  CalendarCheck,
  ArrowRight,
} from 'lucide-react';
import { DataStore } from '@/lib/storage';
import { Badge } from '@/components/ui/Badge';
import { Job, Venue, VenueSpace, Assignment, Photographer, DashboardActionItem } from '@/types/database';
import { getKSTTodayString } from '@/lib/dateUtils';

export default function DashboardPage() {
  const [operations, setOperations] = useState<DashboardActionItem[]>([]);
  const [todayJobs, setTodayJobs] = useState<Job[]>([]);
  const [thisWeekJobs, setThisWeekJobs] = useState<Job[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [spaces, setSpaces] = useState<VenueSpace[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [photographers, setPhotographers] = useState<Photographer[]>([]);

  const todayStr = getKSTTodayString();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setOperations(DataStore.getDashboardOperations());
    setTodayJobs(DataStore.getTodayJobs());
    setThisWeekJobs(DataStore.getThisWeekJobs());
    setVenues(DataStore.getVenues());
    setSpaces(DataStore.getVenueSpaces());
    const state = DataStore.getState();
    setAssignments(state.assignments);
    setPhotographers(state.photographers);
  };

  const getVenueDisplay = (venueId?: string | null, spaceId?: string | null) => {
    const v = venues.find((item) => item.id === venueId);
    const s = spaces.find((item) => item.id === spaceId);
    if (!v) return '장소 미정';
    return `${v.name} ${s ? `· ${s.name}${s.floor ? ` (${s.floor})` : ''}` : ''}`;
  };

  const getAssignedNames = (jobId: string) => {
    const jobAssignments = assignments.filter(
      (a) => a.job_id === jobId && a.assignment_status !== 'cancelled' && a.assignment_status !== 'declined'
    );
    if (jobAssignments.length === 0) return '미배정';
    return jobAssignments
      .map((a) => {
        const p = photographers.find((item) => item.id === a.photographer_id);
        const name = p ? p.name.replace(' (대표)', '') : '미정';
        return a.assignment_status === 'proposed' ? `${name}(수락대기)` : name;
      })
      .join(' / ');
  };

  // 날짜 문자열을 요일 포함 짧은 문자열로 포맷 (예: 2026-09-26 -> 토 9/26)
  const formatDayWithWeekday = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    const weekday = days[dateObj.getDay()];
    return `${weekday} ${m}/${d}`;
  };

  return (
    <div className="space-y-6 pb-6">
      {/* ========================================================================= */}
      {/* 1. 최상단: 확인 필요 (Action Required - 우선순위 1~8) */}
      {/* ========================================================================= */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className={`w-2.5 h-2.5 rounded-full ${
                operations.length > 0 ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'
              }`}
            />
            <h2 className="text-base font-bold text-slate-900">확인이 필요한 작업</h2>
          </div>
          {operations.length > 0 ? (
            <span className="text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full">
              {operations.length}건 조치 대기
            </span>
          ) : (
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              모두 조치 완료
            </span>
          )}
        </div>

        {operations.length === 0 ? (
          <div className="bg-white rounded-xl p-6 border border-slate-200 text-center space-y-1">
            <div className="inline-flex p-2.5 rounded-full bg-emerald-50 text-emerald-600 mb-1">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-800">현재 대기 중인 긴급 업무가 없습니다.</p>
            <p className="text-xs text-slate-500">배정, 수락, 원본 검수, 정산이 모두 정상 완료되었습니다.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {operations.map((item) => (
              <Link
                key={item.id}
                href={item.linkUrl}
                className="group block bg-white rounded-xl p-3.5 border border-slate-200 hover:border-indigo-400 hover:shadow-sm transition"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          item.priority <= 2
                            ? 'bg-rose-100 text-rose-700'
                            : item.priority <= 4
                            ? 'bg-amber-100 text-amber-800'
                            : item.priority <= 6
                            ? 'bg-indigo-100 text-indigo-700'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {item.categoryLabel}
                      </span>
                      <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition">
                        {item.title}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-snug">{item.description}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 pt-0.5">
                    <Badge variant={item.badgeVariant}>{item.badgeText}</Badge>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* 2. 오늘 촬영 (Today's Jobs) */}
      {/* ========================================================================= */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarCheck className="w-4 h-4 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">오늘 촬영</h2>
          </div>
          <span className="text-xs text-slate-500">{todayStr}</span>
        </div>

        {todayJobs.length === 0 ? (
          <div className="bg-white rounded-xl p-5 border border-slate-200 text-center text-slate-500 text-xs">
            오늘 예정된 본식 촬영이 없습니다.
          </div>
        ) : (
          <div className="space-y-3">
            {todayJobs.map((job) => {
              const displayStatus = DataStore.getJobDisplayStatus(job.id, job);
              return (
                <div
                  key={job.id}
                  className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-2xl p-5 shadow-md space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="inline-block text-[11px] font-bold text-indigo-200 bg-white/10 px-2 py-0.5 rounded-md mb-1.5">
                        오늘 예식 {job.ceremony_time}
                      </span>
                      <h3 className="text-lg font-bold text-white tracking-tight">{job.title}</h3>
                    </div>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/20 text-white">
                      {displayStatus.label}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 pt-1 border-t border-white/10">
                    <div>
                      <span className="block text-[10px] text-slate-400">장소</span>
                      <span className="font-semibold text-white">
                        {getVenueDisplay(job.venue_id, job.venue_space_id)}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-400">도착 시각</span>
                      <span className="font-semibold text-white">{job.arrival_time}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="block text-[10px] text-slate-400">출동 작가</span>
                      <span className="font-semibold text-white">{getAssignedNames(job.id)}</span>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <Link
                      href={`/jobs/${job.id}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-slate-900 bg-white hover:bg-slate-100 px-3.5 py-2 rounded-xl transition shadow-sm"
                    >
                      촬영 보기
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* 3. 이번 주 촬영 (This Week's Jobs) */}
      {/* ========================================================================= */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">이번 주 촬영 일정</h2>
          </div>
          <Link
            href="/jobs"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5"
          >
            전체 일정 보기
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {thisWeekJobs.length === 0 ? (
          <div className="bg-white rounded-xl p-5 border border-slate-200 text-center text-slate-500 text-xs">
            이번 주 예정된 본식 촬영이 없습니다.
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 shadow-sm overflow-hidden">
            {thisWeekJobs.slice(0, 5).map((job) => {
              const displayStatus = DataStore.getJobDisplayStatus(job.id, job);
              return (
                <Link
                  key={job.id}
                  href={`/jobs/${job.id}`}
                  className="flex items-center justify-between p-3.5 hover:bg-slate-50 transition group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 text-center shrink-0">
                      <span className="block text-xs font-bold text-indigo-600">
                        {formatDayWithWeekday(job.shoot_date)}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {job.ceremony_time}
                      </span>
                    </div>
                    <div className="space-y-0.5 min-w-0">
                      <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition block truncate">
                        {job.title}
                      </span>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 truncate">
                        <span className="truncate">{getVenueDisplay(job.venue_id, job.venue_space_id)}</span>
                        <span>·</span>
                        <span className="text-slate-600 truncate">{getAssignedNames(job.id)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 pl-2">
                    <Badge variant={displayStatus.variant}>{displayStatus.label}</Badge>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 transition" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        <div className="pt-1">
          <Link
            href="/jobs"
            className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 py-2.5 rounded-xl shadow-xs transition"
          >
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            월간 달력에서 전체 스케줄 확인하기
          </Link>
        </div>
      </section>
    </div>
  );
}
