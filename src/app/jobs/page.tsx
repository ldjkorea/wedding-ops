'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Plus,
  MapPin,
  Clock,
  Users,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  List as ListIcon,
  AlertTriangle,
  X,
} from 'lucide-react';
import { DataStore } from '@/lib/storage';
import { Badge } from '@/components/ui/Badge';
import { Job, Venue, VenueSpace, Assignment, Photographer, ConflictWarning } from '@/types/database';
import { getKSTTodayString, getMonthCalendarGrid, CalendarDayCell } from '@/lib/dateUtils';

export default function JobsPage() {
  const router = useRouter();

  // 뷰 모드: 기본값 'calendar'
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');

  // 취소 일정 숨기기 토글
  const [hideCancelled, setHideCancelled] = useState(false);

  // 달력 연도 및 월 상태 (KST 오늘 기준)
  const todayStr = getKSTTodayString();
  const [todayY, todayM] = todayStr.split('-').map(Number);
  const [currentYear, setCurrentYear] = useState(todayY);
  const [currentMonth, setCurrentMonth] = useState(todayM - 1); // 0-indexed

  // 모바일 당일 촬영 목록 팝업 상태 (2건 초과 시)
  const [selectedDayJobs, setSelectedDayJobs] = useState<{ dateStr: string; jobs: Job[] } | null>(null);

  // DB 데이터 상태
  const [jobs, setJobs] = useState<Job[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [spaces, setSpaces] = useState<VenueSpace[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [photographers, setPhotographers] = useState<Photographer[]>([]);
  const [conflicts, setConflicts] = useState<ConflictWarning[]>([]);

  // 리스트 뷰용 필터
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setJobs(DataStore.getJobs());
    setVenues(DataStore.getVenues());
    setSpaces(DataStore.getVenueSpaces());
    const state = DataStore.getState();
    setAssignments(state.assignments);
    setPhotographers(state.photographers);
    setConflicts(DataStore.detectPhotographerConflicts());
  };

  // 이전 달 / 다음 달 / 오늘 이동
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentYear((y) => y - 1);
      setCurrentMonth(11);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentYear((y) => y + 1);
      setCurrentMonth(0);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleToday = () => {
    setCurrentYear(todayY);
    setCurrentMonth(todayM - 1);
  };

  const getVenueDisplay = (venueId?: string | null, spaceId?: string | null) => {
    const v = venues.find((item) => item.id === venueId);
    const s = spaces.find((item) => item.id === spaceId);
    if (!v) return '장소 미정';
    return `${v.name} ${s ? `· ${s.name}${s.floor ? ` (${s.floor})` : ''}` : ''}`;
  };

  const getShortVenueDisplay = (venueId?: string | null, spaceId?: string | null) => {
    const v = venues.find((item) => item.id === venueId);
    const s = spaces.find((item) => item.id === spaceId);
    if (!v) return '장소 미정';
    const shortVenue = v.name.replace(' (서울)', '').replace('호텔', '');
    return `${shortVenue} ${s ? s.name.replace('홀', '') : ''}`.trim();
  };

  const getAssignedNames = (jobId: string) => {
    const jobAssignments = assignments.filter((a) => a.job_id === jobId);
    if (jobAssignments.length === 0) return '작가 미배정';
    return jobAssignments
      .map((a) => {
        const p = photographers.find((item) => item.id === a.photographer_id);
        return p ? p.name.replace(' (대표)', '') : '미정';
      })
      .join(' / ');
  };

  // 달력 그리드 계산
  const calendarCells: CalendarDayCell[] = getMonthCalendarGrid(currentYear, currentMonth);

  // 날짜별 Job 매핑
  const jobsByDate: Record<string, Job[]> = {};
  jobs.forEach((job) => {
    if (hideCancelled && job.status === 'cancelled') return;
    if (!jobsByDate[job.shoot_date]) {
      jobsByDate[job.shoot_date] = [];
    }
    jobsByDate[job.shoot_date].push(job);
  });

  // 각 날짜 내 시간순 정렬
  Object.keys(jobsByDate).forEach((dateKey) => {
    jobsByDate[dateKey].sort((a, b) => (a.ceremony_time || '').localeCompare(b.ceremony_time || ''));
  });

  // 해당 Job에 일정 충돌이 있는지 확인
  const isJobInConflict = (jobId: string) => {
    return conflicts.some((c) => c.job1Id === jobId || c.job2Id === jobId);
  };

  // 리스트 뷰 필터링
  const filteredJobs = jobs.filter((j) => {
    if (hideCancelled && j.status === 'cancelled') return false;
    if (filterStatus === 'all') return true;
    if (filterStatus === 'active')
      return j.status === 'scheduled' || j.status === 'in_progress' || j.status === 'shoot_completed';
    if (filterStatus === 'completed') return j.status === 'completed';
    if (filterStatus === 'cancelled') return j.status === 'cancelled';
    return true;
  });

  return (
    <div className="space-y-4">
      {/* 1. 상단 타이틀 및 신규 등록 버튼 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">본식 촬영 일정</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Job 기준 실시간 스케줄 및 업무 상태 뷰어
          </p>
        </div>
        <Link
          href="/jobs/new"
          className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3 py-2 rounded-lg shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          촬영 등록
        </Link>
      </div>

      {/* 2. 상단 뷰 토글 [달력] [목록] 및 취소 숨기기 토글 */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex bg-slate-200/80 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setViewMode('calendar')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
              viewMode === 'calendar'
                ? 'bg-white text-indigo-700 shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            달력
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
              viewMode === 'list'
                ? 'bg-white text-indigo-700 shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ListIcon className="w-3.5 h-3.5" />
            목록 ({jobs.length})
          </button>
        </div>

        <label className="inline-flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={hideCancelled}
            onChange={(e) => setHideCancelled(e.target.checked)}
            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
          />
          <span>취소된 촬영 숨기기</span>
        </label>
      </div>

      {/* ========================================================================= */}
      {/* 3. CALENDAR VIEW (기본) */}
      {/* ========================================================================= */}
      {viewMode === 'calendar' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {/* 달력 헤더 (월 네비게이션) */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50/70">
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-slate-900">
                {currentYear}년 {currentMonth + 1}월
              </span>
              <button
                onClick={handleToday}
                className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md transition"
              >
                오늘
              </button>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handlePrevMonth}
                aria-label="이전 달"
                className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextMonth}
                aria-label="다음 달"
                className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 요일 헤더 (일 ~ 토) */}
          <div className="grid grid-cols-7 border-b border-slate-200 text-center text-xs font-semibold py-2 bg-slate-100/60">
            <div className="text-rose-500">일</div>
            <div className="text-slate-600">월</div>
            <div className="text-slate-600">화</div>
            <div className="text-slate-600">수</div>
            <div className="text-slate-600">목</div>
            <div className="text-slate-600">금</div>
            <div className="text-indigo-600">토</div>
          </div>

          {/* 날짜 그리드 셀 */}
          <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 bg-slate-100">
            {calendarCells.map((cell) => {
              const cellJobs = jobsByDate[cell.dateStr] || [];
              const isToday = cell.dateStr === todayStr;
              const hasJobs = cellJobs.length > 0;

              // 최대 노출 건수 (모바일 2건)
              const maxDisplay = 2;
              const visibleJobs = cellJobs.slice(0, maxDisplay);
              const extraCount = cellJobs.length - maxDisplay;

              return (
                <div
                  key={cell.dateStr}
                  onClick={() => {
                    // 일정이 없는 날짜 클릭 시 해당 일자가 prefill된 촬영 등록 페이지로 이동
                    if (!hasJobs) {
                      router.push(`/jobs/new?date=${cell.dateStr}`);
                    }
                  }}
                  className={`min-h-[88px] sm:min-h-[105px] p-1 flex flex-col justify-between transition group ${
                    cell.isCurrentMonth ? 'bg-white' : 'bg-slate-50/50'
                  } ${!hasJobs ? 'cursor-pointer hover:bg-indigo-50/30' : ''}`}
                >
                  {/* 상단 날짜 숫자 및 신규 추가 버튼 */}
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full ${
                        isToday
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : cell.dayOfWeek === 0
                          ? cell.isCurrentMonth
                            ? 'text-rose-600'
                            : 'text-rose-300'
                          : cell.dayOfWeek === 6
                          ? cell.isCurrentMonth
                            ? 'text-indigo-600'
                            : 'text-indigo-300'
                          : cell.isCurrentMonth
                          ? 'text-slate-700'
                          : 'text-slate-300'
                      }`}
                    >
                      {cell.date}
                    </span>

                    {/* 빈 날짜 호버 시 + 버튼 힌트 */}
                    {!hasJobs && (
                      <span className="opacity-0 group-hover:opacity-100 text-[10px] text-indigo-500 font-bold transition">
                        +
                      </span>
                    )}
                  </div>

                  {/* 촬영 이벤트 목록 */}
                  <div className="space-y-1 flex-1">
                    {visibleJobs.map((job) => {
                      const displayStatus = DataStore.getJobDisplayStatus(job.id, job);
                      const hasConflict = isJobInConflict(job.id);
                      const isCancelled = job.status === 'cancelled';

                      return (
                        <div
                          key={job.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/jobs/${job.id}`);
                          }}
                          className={`p-1 rounded text-left cursor-pointer transition border text-[11px] leading-tight ${
                            isCancelled
                              ? 'bg-slate-100 border-slate-200 text-slate-400 line-through opacity-75'
                              : hasConflict
                              ? 'bg-rose-50 border-rose-300 text-rose-950 hover:bg-rose-100'
                              : displayStatus.variant === 'rose'
                              ? 'bg-rose-50 border-rose-200 text-rose-900 hover:bg-rose-100'
                              : displayStatus.variant === 'amber'
                              ? 'bg-amber-50 border-amber-200 text-amber-900 hover:bg-amber-100'
                              : displayStatus.variant === 'emerald'
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-900 hover:bg-emerald-100'
                              : 'bg-indigo-50 border-indigo-200 text-indigo-950 hover:bg-indigo-100'
                          }`}
                          title={`${job.ceremony_time} ${job.title} (${getShortVenueDisplay(
                            job.venue_id,
                            job.venue_space_id
                          )}) - ${displayStatus.label}`}
                        >
                          <div className="flex items-center justify-between gap-0.5">
                            <span className="font-bold text-[10px] whitespace-nowrap">
                              {job.ceremony_time || '시간미정'}
                            </span>
                            <div className="flex items-center gap-0.5">
                              {hasConflict && (
                                <span title="시간 충돌 경고" className="inline-flex">
                                  <AlertTriangle className="w-2.5 h-2.5 text-rose-600 shrink-0" />
                                </span>
                              )}
                              <span
                                className={`text-[9px] px-1 py-0.2 rounded font-semibold whitespace-nowrap ${
                                  isCancelled
                                    ? 'bg-slate-200 text-slate-600'
                                    : displayStatus.variant === 'rose'
                                    ? 'bg-rose-200 text-rose-800'
                                    : displayStatus.variant === 'amber'
                                    ? 'bg-amber-200 text-amber-800'
                                    : displayStatus.variant === 'emerald'
                                    ? 'bg-emerald-200 text-emerald-800'
                                    : 'bg-indigo-200 text-indigo-800'
                                }`}
                              >
                                {displayStatus.label}
                              </span>
                            </div>
                          </div>
                          <div className="font-semibold truncate mt-0.5 text-[10.5px]">
                            {job.title}
                          </div>
                          <div className="text-[9.5px] text-slate-500 truncate hidden sm:block">
                            {getShortVenueDisplay(job.venue_id, job.venue_space_id)}
                          </div>
                        </div>
                      );
                    })}

                    {/* 모바일 2건 초과 시 더보기 */}
                    {extraCount > 0 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDayJobs({ dateStr: cell.dateStr, jobs: cellJobs });
                        }}
                        className="w-full text-center text-[10px] font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 py-0.5 rounded transition"
                      >
                        +{extraCount} more
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. LIST VIEW (기존 목록 및 필터 탭) */}
      {/* ========================================================================= */}
      {viewMode === 'list' && (
        <div className="space-y-3">
          {/* 상태 필터 탭 */}
          <div className="flex gap-1.5 p-1 bg-slate-200/70 rounded-xl text-xs font-medium">
            {[
              { id: 'all', label: `전체 (${jobs.length})` },
              {
                id: 'active',
                label: `진행/예정 (${
                  jobs.filter((j) => j.status !== 'completed' && j.status !== 'cancelled').length
                })`,
              },
              { id: 'completed', label: `완료 (${jobs.filter((j) => j.status === 'completed').length})` },
              { id: 'cancelled', label: `취소 (${jobs.filter((j) => j.status === 'cancelled').length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterStatus(tab.id)}
                className={`flex-1 py-1.5 rounded-lg text-center transition ${
                  filterStatus === tab.id
                    ? 'bg-white text-indigo-700 font-bold shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* 목록 리스트 */}
          <div className="space-y-2.5">
            {filteredJobs.length === 0 ? (
              <div className="bg-white rounded-xl p-8 border border-slate-200 text-center text-slate-500 text-sm">
                해당하는 본식 촬영 일정이 없습니다.
              </div>
            ) : (
              filteredJobs.map((job) => {
                const displayStatus = DataStore.getJobDisplayStatus(job.id, job);
                const hasConflict = isJobInConflict(job.id);

                return (
                  <Link
                    key={job.id}
                    href={`/jobs/${job.id}`}
                    className={`block bg-white rounded-xl p-4 border transition hover:border-indigo-400 hover:shadow-md ${
                      job.status === 'cancelled'
                        ? 'opacity-60 border-slate-200'
                        : hasConflict
                        ? 'border-rose-300 bg-rose-50/20'
                        : 'border-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-base">{job.title}</span>
                        {hasConflict && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 bg-rose-100 px-1.5 py-0.5 rounded">
                            <AlertTriangle className="w-3 h-3" />
                            일정 충돌
                          </span>
                        )}
                      </div>
                      <Badge variant={displayStatus.variant}>{displayStatus.label}</Badge>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="font-medium text-slate-800">{job.shoot_date}</span>
                        <span>예식 {job.ceremony_time} (도착 {job.arrival_time})</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{getVenueDisplay(job.venue_id, job.venue_space_id)}</span>
                      </div>
                      <div className="flex items-center gap-1.5 sm:col-span-2">
                        <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">
                          배정: {getAssignedNames(job.id)} (필요 {job.required_photographer_count ?? 2}명)
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* 모바일 당일 촬영 목록 팝업 모달 */}
      {selectedDayJobs && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-4 space-y-3 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-bold text-slate-900 text-sm">
                {selectedDayJobs.dateStr} 촬영 목록 ({selectedDayJobs.jobs.length}건)
              </h3>
              <button
                onClick={() => setSelectedDayJobs(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto">
              {selectedDayJobs.jobs.map((j) => {
                const status = DataStore.getJobDisplayStatus(j.id, j);
                const hasConflict = isJobInConflict(j.id);
                return (
                  <div
                    key={j.id}
                    onClick={() => {
                      setSelectedDayJobs(null);
                      router.push(`/jobs/${j.id}`);
                    }}
                    className="p-2.5 rounded-xl border border-slate-200 hover:border-indigo-500 cursor-pointer transition bg-slate-50"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-900">{j.ceremony_time} {j.title}</span>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">
                      {getVenueDisplay(j.venue_id, j.venue_space_id)}
                    </div>
                    {hasConflict && (
                      <div className="text-[10px] text-rose-600 font-bold mt-1 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        일정 충돌 경고
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="pt-2 flex justify-end">
              <Link
                href={`/jobs/new?date=${selectedDayJobs.dateStr}`}
                onClick={() => setSelectedDayJobs(null)}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
              >
                + 이 날짜에 새 촬영 추가
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
