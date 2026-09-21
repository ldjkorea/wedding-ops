'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  Clock,
  CheckCircle2,
  DollarSign,
  Package,
  Calendar,
  ChevronRight,
  MapPin,
  Users,
  AlertCircle,
} from 'lucide-react';
import { DataStore } from '@/lib/storage';
import { Badge } from '@/components/ui/Badge';
import { Job, Venue, VenueSpace, Assignment, Photographer } from '@/types/database';

export default function DashboardPage() {
  const [alerts, setAlerts] = useState<ReturnType<typeof DataStore.getDashboardAlerts>>({
    unconfirmedAssignments: [],
    overdueHandovers: [],
    pendingReviewHandovers: [],
    unpaidSettlements: [],
    impendingDeliveries: [],
  });

  const [allJobs, setAllJobs] = useState<Job[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [spaces, setSpaces] = useState<VenueSpace[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [photographers, setPhotographers] = useState<Photographer[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setAlerts(DataStore.getDashboardAlerts());
    setAllJobs(DataStore.getJobs());
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
    return `${v.name} ${s ? `· ${s.name}` : ''}`;
  };

  const getAssignedNames = (jobId: string) => {
    const jobAssignments = assignments.filter((a) => a.job_id === jobId);
    if (jobAssignments.length === 0) return '미배정';
    return jobAssignments
      .map((a) => {
        const p = photographers.find((item) => item.id === a.photographer_id);
        return p ? p.name.replace(' (대표)', '') : '미정';
      })
      .join(' / ');
  };

  const totalAlertCount =
    alerts.unconfirmedAssignments.length +
    alerts.overdueHandovers.length +
    alerts.pendingReviewHandovers.length +
    alerts.unpaidSettlements.length +
    alerts.impendingDeliveries.length;

  // 이번 주/진행 예정 촬영
  const thisWeekJobs = allJobs.filter((j) => {
    if (j.status === 'completed' || j.status === 'cancelled') return false;
    return true; // 실사용 편의를 위해 예정된 촬영 모두 이번 주/임박 리스트로 우선 표시
  });

  return (
    <div className="space-y-6">
      {/* 1. 최상단: 확인이 필요한 작업 (Action Required) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
            <h2 className="text-base font-bold text-slate-900">확인이 필요한 작업</h2>
          </div>
          {totalAlertCount > 0 ? (
            <span className="text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
              {totalAlertCount}건 대기
            </span>
          ) : (
            <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              모두 조치 완료
            </span>
          )}
        </div>

        {totalAlertCount === 0 ? (
          <div className="bg-white rounded-xl p-4 border border-slate-200/80 text-center text-slate-500 text-sm flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            현재 확인이 필요한 긴급 작업이 없습니다.
          </div>
        ) : (
          <div className="space-y-2">
            {/* 외주작가 수락 미확인 */}
            {alerts.unconfirmedAssignments.map(({ job, assignment, photographer }) => (
              <Link
                key={`unconf-${assignment.id}`}
                href={`/jobs/${job.id}`}
                className="block bg-amber-50 border border-amber-200 rounded-xl p-3.5 hover:bg-amber-100/70 transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-amber-900">작가 수락 미확인</span>
                        <span className="text-xs text-amber-700">· {photographer?.name}</span>
                      </div>
                      <p className="text-sm font-semibold text-slate-900 mt-0.5">{job.title}</p>
                      <p className="text-xs text-slate-600 mt-0.5">
                        예식 {job.shoot_date} {job.ceremony_time} (도착 {job.arrival_time})
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-amber-400 mt-1" />
                </div>
              </Link>
            ))}

            {/* 원본 검수 필요 (submitted) */}
            {alerts.pendingReviewHandovers.map(({ job, handover, photographer }) => (
              <Link
                key={`rev-${handover.id}`}
                href={`/jobs/${job.id}?tab=handover`}
                className="block bg-blue-50 border border-blue-200 rounded-xl p-3.5 hover:bg-blue-100/70 transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-blue-900">원본 검수 대기</span>
                        <span className="text-xs text-blue-700">· {photographer?.name} 작가 제출</span>
                      </div>
                      <p className="text-sm font-semibold text-slate-900 mt-0.5">{job.title}</p>
                      <p className="text-xs text-slate-600 mt-0.5">
                        링크 확보됨 ➜ 검수 후 확인 완료 또는 보완 요청 필요
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-blue-400 mt-1" />
                </div>
              </Link>
            ))}

            {/* 원본 기한 초과 */}
            {alerts.overdueHandovers.map(({ job, handover, photographer }) => (
              <Link
                key={`overdue-${handover.id}`}
                href={`/jobs/${job.id}?tab=handover`}
                className="block bg-rose-50 border border-rose-200 rounded-xl p-3.5 hover:bg-rose-100/70 transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-2.5">
                    <Clock className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-rose-900">원본 전달 기한 초과</span>
                        <span className="text-xs text-rose-700">· {photographer?.name} 작가</span>
                      </div>
                      <p className="text-sm font-semibold text-slate-900 mt-0.5">{job.title}</p>
                      <p className="text-xs text-rose-700 mt-0.5">
                        마감 기한이 지났습니다. 작가 확인 필요.
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-rose-400 mt-1" />
                </div>
              </Link>
            ))}

            {/* 외주비 미지급 / 부분지급 */}
            {alerts.unpaidSettlements.map(({ job, settlement, photographer, remaining }) => (
              <Link
                key={`stl-${settlement.id}`}
                href={`/jobs/${job.id}?tab=settlement`}
                className="block bg-purple-50 border border-purple-200 rounded-xl p-3.5 hover:bg-purple-100/70 transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-2.5">
                    <DollarSign className="w-4 h-4 text-purple-600 mt-0.5 shrink-0" />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-purple-900">
                          {settlement.settlement_status === 'partially_paid' ? '외주비 잔액 지급 필요' : '외주비 미지급'}
                        </span>
                        <span className="text-xs text-purple-700">· {photographer?.name} 작가</span>
                      </div>
                      <p className="text-sm font-semibold text-slate-900 mt-0.5">{job.title}</p>
                      <p className="text-xs text-purple-800 font-medium mt-0.5">
                        미지급 잔액: {remaining.toLocaleString()}원
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-purple-400 mt-1" />
                </div>
              </Link>
            ))}

            {/* 최종 납품 예정일 도래 */}
            {alerts.impendingDeliveries.map(({ job, delivery }) => (
              <Link
                key={`del-${delivery.id}`}
                href={`/jobs/${job.id}?tab=delivery`}
                className="block bg-slate-100 border border-slate-300 rounded-xl p-3.5 hover:bg-slate-200/70 transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-2.5">
                    <Package className="w-4 h-4 text-slate-700 mt-0.5 shrink-0" />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900">고객 납품 기한</span>
                        <span className="text-xs text-slate-600">· {delivery.delivery_due_at}까지</span>
                      </div>
                      <p className="text-sm font-semibold text-slate-900 mt-0.5">{job.title}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 mt-1" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* 2. 이번 주 촬영 (리스트 중심) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-600" />
            이번 주 촬영
          </h2>
          <Link href="/jobs" className="text-xs font-medium text-indigo-600 hover:text-indigo-800">
            전체보기 ({allJobs.length})
          </Link>
        </div>

        {thisWeekJobs.length === 0 ? (
          <div className="bg-white rounded-xl p-5 border border-slate-200 text-center text-slate-500 text-sm">
            이번 주 예정된 촬영이 없습니다.
          </div>
        ) : (
          <div className="space-y-3">
            {thisWeekJobs.map((job) => (
              <Link
                key={job.id}
                href={`/jobs/${job.id}`}
                className="block bg-white rounded-xl p-4 border border-slate-200 shadow-sm hover:border-indigo-400 hover:shadow-md transition active:scale-[0.99]"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                    {job.shoot_date}
                  </span>
                  <Badge variant={job.status === 'completed' ? 'success' : 'primary'}>
                    {job.status === 'completed' ? '완료' : '진행중'}
                  </Badge>
                </div>

                <h3 className="text-base font-bold text-slate-900 mb-1.5">{job.title}</h3>

                <div className="space-y-1 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{getVenueDisplay(job.venue_id, job.venue_space_id)}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>
                        예식 <strong className="text-slate-800">{job.ceremony_time}</strong> (도착{' '}
                        {job.arrival_time})
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 pt-1 text-slate-700">
                    <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>배정: <strong className="text-indigo-900">{getAssignedNames(job.id)}</strong></span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* 3. 최근 촬영 */}
      <section className="space-y-3">
        <h2 className="text-base font-bold text-slate-900">최근 촬영</h2>
        <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
          {allJobs.slice(0, 5).map((job) => (
            <Link
              key={job.id}
              href={`/jobs/${job.id}`}
              className="p-3.5 flex items-center justify-between hover:bg-slate-50 transition"
            >
              <div>
                <div className="text-sm font-semibold text-slate-900">{job.title}</div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {job.shoot_date} · {getVenueDisplay(job.venue_id, job.venue_space_id)}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={job.status === 'completed' ? 'success' : 'neutral'}>
                  {job.status === 'completed' ? '완료' : '진행'}
                </Badge>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
