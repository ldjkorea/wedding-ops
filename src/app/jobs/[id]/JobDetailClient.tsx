'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  MapPin,
  Users,
  Copy,
  Check,
  AlertTriangle,
  Plus,
  ExternalLink,
  ShieldCheck,
  RotateCcw,
  History,
  CheckCircle2,
  FileText,
  DollarSign,
  PackageCheck,
  Building2,
  Edit3,
  ChevronDown,
  ChevronUp,
  Clock,
  CalendarDays,
} from 'lucide-react';
import { DataStore } from '@/lib/storage';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { VenueIntelligenceCard } from '@/components/venue/VenueIntelligenceCard';
import {
  Job,
  Venue,
  VenueSpace,
  Assignment,
  Photographer,
  JobPackVersion,
  ChangeEvent,
  Handover,
  Settlement,
  PaymentEntry,
  Delivery,
  HallObservation,
  AssignmentStatus,
  HandoverStatus,
  DeliveryStatus,
} from '@/types/database';

// 접이식 카드 상태 타입
type ExpandedSection = 'assignment' | 'jobpack' | 'handover_settlement' | 'delivery' | 'venue' | null;

export default function JobDetailClient({ id }: { id: string }) {
  const jobId = id;
  const router = useRouter();

  const [job, setJob] = useState<Job | null>(null);
  const [venue, setVenue] = useState<Venue | null>(null);
  const [space, setSpace] = useState<VenueSpace | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [photographers, setPhotographers] = useState<Photographer[]>([]);
  const [jobPackVersions, setJobPackVersions] = useState<JobPackVersion[]>([]);
  const [changeEvents, setChangeEvents] = useState<ChangeEvent[]>([]);
  const [handovers, setHandovers] = useState<
    (Handover & { assignment: Assignment; photographer: Photographer | undefined })[]
  >([]);
  const [settlements, setSettlements] = useState<
    (Settlement & {
      assignment: Assignment;
      photographer: Photographer | undefined;
      payments: PaymentEntry[];
      total_due: number;
      total_paid: number;
      remaining: number;
    })[]
  >([]);
  const [delivery, setDelivery] = useState<Delivery | undefined>(undefined);
  const [hallObservations, setHallObservations] = useState<HallObservation[]>([]);

  // 변경 알림
  const [outdatedInfo, setOutdatedInfo] = useState<{ outdated: boolean; reason?: string }>({
    outdated: false,
  });

  // 복사 피드백 토스트
  const [copied, setCopied] = useState(false);

  // Progressive Disclosure — 현재 열린 섹션
  const [expandedSection, setExpandedSection] = useState<ExpandedSection>(null);

  // 변경이력 펼치기
  const [showChangeLog, setShowChangeLog] = useState(false);

  // 모달 상태들
  const [isEditJobModalOpen, setIsEditJobModalOpen] = useState(false);
  const [isAddAssignmentModalOpen, setIsAddAssignmentModalOpen] = useState(false);
  const [isJobPackModalOpen, setIsJobPackModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedSettlementId, setSelectedSettlementId] = useState<string | null>(null);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);

  // 작업 폼 상태
  const [editCeremonyTime, setEditCeremonyTime] = useState('');
  const [editArrivalTime, setEditArrivalTime] = useState('');
  const [editSpecialRequests, setEditSpecialRequests] = useState('');
  const [newAsgnPhotographerId, setNewAsgnPhotographerId] = useState('');
  const [newAsgnRole, setNewAsgnRole] = useState<'main' | 'sub' | 'etc'>('sub');
  const [newAsgnFee, setNewAsgnFee] = useState('200000');
  const [newAsgnAddFee, setNewAsgnAddFee] = useState('0');
  const [newAsgnNotes, setNewAsgnNotes] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMemo, setPaymentMemo] = useState('');

  useEffect(() => {
    refreshData();
  }, [jobId]);

  const refreshData = () => {
    const currentJob = DataStore.getJobById(jobId);
    if (!currentJob) {
      router.push('/jobs');
      return;
    }

    setJob(currentJob);
    setEditCeremonyTime(currentJob.ceremony_time);
    setEditArrivalTime(currentJob.arrival_time);
    setEditSpecialRequests(currentJob.special_requests || '');

    const vList = DataStore.getVenues();
    const sList = DataStore.getVenueSpaces();
    setVenue(vList.find((v) => v.id === currentJob.venue_id) || null);
    setSpace(sList.find((s) => s.id === currentJob.venue_space_id) || null);

    setAssignments(DataStore.getAssignments(jobId));
    setPhotographers(DataStore.getAllPhotographers());
    setJobPackVersions(DataStore.getJobPackVersions(jobId));
    setChangeEvents(DataStore.getChangeEvents(jobId));
    setHandovers(DataStore.getHandovers(jobId));
    setSettlements(DataStore.getSettlements(jobId));
    setDelivery(DataStore.getDelivery(jobId));
    setOutdatedInfo(DataStore.isJobPackOutdated(jobId));

    if (currentJob.venue_space_id) {
      setHallObservations(DataStore.getHallObservations(currentJob.venue_space_id));
    }
  };

  if (!job) return null;

  // 섹션 토글 (같은 섹션 누르면 닫힘)
  const toggleSection = (section: ExpandedSection) => {
    setExpandedSection((prev) => (prev === section ? null : section));
  };

  // 1. Job 정보 수정 처리
  const handleUpdateJobInfo = (e: React.FormEvent) => {
    e.preventDefault();
    DataStore.updateJob(job.id, {
      ceremony_time: editCeremonyTime,
      arrival_time: editArrivalTime,
      special_requests: editSpecialRequests,
    });
    setIsEditJobModalOpen(false);
    refreshData();
  };

  // 2. Job Pack 생성 처리
  const handleGenerateJobPack = () => {
    const content = DataStore.generateJobPackText(job.id);
    DataStore.createJobPackVersion(job.id, content, '대표작가');
    refreshData();
  };

  // 3. Job Pack 복사
  const handleCopyJobPack = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // 4. 작가 배정 추가
  const handleAddAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAsgnPhotographerId) {
      alert('작가를 선택해주세요.');
      return;
    }
    DataStore.addAssignment({
      job_id: job.id,
      photographer_id: newAsgnPhotographerId,
      role: newAsgnRole,
      participation_start: job.arrival_time,
      participation_end: job.estimated_end_time || '16:00',
      assignment_status: 'proposed',
      agreed_fee: newAsgnRole === 'main' ? null : Number(newAsgnFee),
      additional_fee: Number(newAsgnAddFee),
      notes: newAsgnNotes || null,
    });
    setIsAddAssignmentModalOpen(false);
    setNewAsgnNotes('');
    refreshData();
  };

  // 5. 작가 수락 상태 변경
  const handleAssignmentStatusChange = (assignmentId: string, status: AssignmentStatus) => {
    DataStore.updateAssignment(assignmentId, { assignment_status: status });
    refreshData();
  };

  // 6. 원본 링크 및 상태 변경
  const handleHandoverUpdate = (
    handoverId: string,
    updates: { external_url?: string; status?: HandoverStatus; notes?: string }
  ) => {
    DataStore.updateHandover(handoverId, updates);
    refreshData();
  };

  // 7. 정산 실지급 등록
  const handleAddPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSettlementId || !paymentAmount) return;
    DataStore.addPaymentEntry(selectedSettlementId, Number(paymentAmount), paymentMemo);
    setIsPaymentModalOpen(false);
    setPaymentAmount('');
    setPaymentMemo('');
    refreshData();
  };

  // 8. 납품 상태 갱신
  const handleDeliveryUpdate = (updates: Partial<Delivery>) => {
    DataStore.updateDelivery(job.id, updates);
    refreshData();
  };

  // 10. Job 완료 처리
  const completionEligibility = DataStore.checkJobCompletionEligibility(job.id);
  const handleCompleteJob = () => {
    const res = DataStore.completeJob(job.id);
    if (res.success) {
      setIsCompleteModalOpen(false);
      refreshData();
    } else {
      alert(res.message);
    }
  };

  const currentJobPackText =
    jobPackVersions.length > 0 ? jobPackVersions[0].content : DataStore.generateJobPackText(job.id);

  // ── 요약 계산 (카드 뱃지용) ──────────────────────────────
  const activeAssignments = assignments.filter(
    (a) => a.assignment_status !== 'cancelled' && a.assignment_status !== 'declined'
  );
  const pendingAssignments = assignments.filter((a) => a.assignment_status === 'proposed');
  const totalRemaining = settlements.reduce((acc, s) => acc + s.remaining, 0);
  const allHandoverVerified =
    handovers.length > 0 && handovers.every((h) => h.status === 'verified');
  const deliveryStatus = delivery?.delivery_status || 'pending';

  return (
    <div className="space-y-4 pb-12">
      {/* ─────────────────────────────────────────────────────────── */}
      {/* HERO 카드: 항상 노출 */}
      {/* ─────────────────────────────────────────────────────────── */}
      <div className="space-y-3">
        {/* 상단 네비 바 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link
              href="/jobs"
              className="p-1.5 -ml-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
              {job.shoot_date}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant={
                job.status === 'completed'
                  ? 'success'
                  : job.status === 'cancelled'
                  ? 'danger'
                  : 'primary'
              }
            >
              {job.status === 'completed'
                ? '완료됨'
                : job.status === 'cancelled'
                ? '취소'
                : '진행중'}
            </Badge>
            {job.status !== 'completed' && (
              <button
                onClick={() => setIsCompleteModalOpen(true)}
                className="text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded-lg transition shadow-sm"
              >
                촬영 종료
              </button>
            )}
          </div>
        </div>

        {/* Job Pack 변경 알림 배너 */}
        {outdatedInfo.outdated && (
          <div className="bg-rose-50 border border-rose-300 rounded-xl p-3 flex items-start gap-2.5 shadow-sm">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5 animate-bounce" />
            <div className="flex-1">
              <p className="text-xs font-bold text-rose-900">촬영 안내문 재생성 필요</p>
              <p className="text-xs text-rose-700 mt-0.5">{outdatedInfo.reason}</p>
              <button
                onClick={handleGenerateJobPack}
                className="mt-1.5 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white px-2.5 py-1 rounded-lg transition"
              >
                새 버전 재생성 (v{jobPackVersions.length + 1})
              </button>
            </div>
          </div>
        )}

        {/* ── 핵심 정보 Hero 카드 ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* 상단: 고객명 + 수정 버튼 */}
          <div className="px-4 pt-4 pb-3 flex items-start justify-between">
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">{job.title}</h1>
              {/* 웨딩홀 접근 버튼 */}
              <button
                onClick={() => toggleSection(expandedSection === 'venue' ? null : 'venue')}
                className="flex items-center gap-1.5 text-xs text-slate-600 mt-1.5 hover:text-indigo-600 transition group"
              >
                <MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                <span className="font-semibold text-slate-800 group-hover:text-indigo-700">
                  {venue?.name || '웨딩홀 미정'}
                  {space ? ` · ${space.name}${space.floor ? ` (${space.floor})` : ''}` : ''}
                </span>
                <span className="text-[10px] text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded font-semibold ml-0.5">
                  {expandedSection === 'venue' ? '닫기' : '팩트 & 꿀팁 ➜'}
                </span>
              </button>
            </div>
            <button
              onClick={() => setIsEditJobModalOpen(true)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              title="정보 수정"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          </div>

          {/* 시각 정보 */}
          <div className="grid grid-cols-3 gap-0 bg-slate-50 border-t border-slate-100 text-center divide-x divide-slate-200">
            <div className="py-2.5 px-1">
              <span className="text-[10px] text-slate-500 flex items-center justify-center gap-0.5">
                <Clock className="w-3 h-3" /> 도착
              </span>
              <strong className="text-sm text-slate-900 font-bold block mt-0.5">{job.arrival_time}</strong>
            </div>
            <div className="py-2.5 px-1">
              <span className="text-[10px] text-indigo-600 font-bold flex items-center justify-center gap-0.5">
                <CalendarDays className="w-3 h-3" /> 예식
              </span>
              <strong className="text-sm text-indigo-700 font-extrabold block mt-0.5">{job.ceremony_time}</strong>
            </div>
            <div className="py-2.5 px-1">
              <span className="text-[10px] text-slate-500 block">예상종료</span>
              <strong className="text-sm text-slate-900 font-bold block mt-0.5">
                {job.estimated_end_time || '16:00'}
              </strong>
            </div>
          </div>

          {/* 출동 작가 요약 */}
          <div className="px-4 py-2.5 border-t border-slate-100 flex items-center gap-2">
            <Users className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span className="text-xs text-slate-600">
              {activeAssignments.length > 0
                ? activeAssignments
                    .map((a) => {
                      const p = photographers.find((ph) => ph.id === a.photographer_id);
                      const name = p ? p.name.replace(' (대표)', '') : '미정';
                      return a.assignment_status === 'proposed' ? `${name}(수락대기)` : name;
                    })
                    .join(' / ')
                : '작가 미배정'}
            </span>
          </div>

          {/* 촬영 범위 태그 */}
          {job.shoot_scope && job.shoot_scope.length > 0 && (
            <div className="px-4 pb-3 flex flex-wrap gap-1.5">
              {job.shoot_scope.map((scope) => (
                <span
                  key={scope}
                  className="text-[11px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded"
                >
                  {scope}
                </span>
              ))}
            </div>
          )}

          {/* 특별 요청 / 필수 포착 */}
          {(job.special_requests || job.must_shoot_notes) && (
            <div className="mx-4 mb-3 bg-amber-50/70 border border-amber-200/80 rounded-xl p-3 text-xs space-y-1">
              {job.special_requests && (
                <p className="text-amber-950 font-medium">
                  <strong className="text-amber-800">특별 요청:</strong> {job.special_requests}
                </p>
              )}
              {job.must_shoot_notes && (
                <p className="text-amber-950 font-medium">
                  <strong className="text-rose-700">필수 포착:</strong> {job.must_shoot_notes}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* 웨딩홀 인텔리전스 (Hero 아래 expand/collapse) */}
      {/* ─────────────────────────────────────────────────────────── */}
      {expandedSection === 'venue' && space && (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 px-1">
            <Building2 className="w-4 h-4 text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-900">
              웨딩홀 인텔리전스 (작가 팩트 & 크루 노하우)
            </h2>
          </div>
          <VenueIntelligenceCard
            space={space}
            venueName={venue?.name}
            observations={hallObservations}
            photographers={photographers}
            currentJobId={job.id}
            onRefresh={refreshData}
          />
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────── */}
      {/* 4대 접이식 상태 카드 */}
      {/* ─────────────────────────────────────────────────────────── */}
      <div className="space-y-2">
        {/* ① 작가 배정 */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <button
            onClick={() => toggleSection('assignment')}
            className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-slate-50/80 transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                <Users className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-left">
                <span className="text-sm font-semibold text-slate-900 block">작가 배정</span>
                <span className="text-[11px] text-slate-500">
                  {activeAssignments.length}명 배정
                  {pendingAssignments.length > 0 && (
                    <span className="ml-1.5 text-amber-600 font-semibold">
                      · 수락대기 {pendingAssignments.length}명
                    </span>
                  )}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {pendingAssignments.length > 0 && (
                <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">
                  {pendingAssignments.length}
                </span>
              )}
              {expandedSection === 'assignment' ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </div>
          </button>

          {/* 작가 배정 상세 */}
          {expandedSection === 'assignment' && (
            <div className="border-t border-slate-100 px-4 py-3 space-y-3">
              <div className="flex justify-end">
                <button
                  onClick={() => setIsAddAssignmentModalOpen(true)}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 bg-indigo-50 px-2.5 py-1 rounded-lg"
                >
                  <Plus className="w-3.5 h-3.5" />
                  작가 추가
                </button>
              </div>

              {assignments.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-3">배정된 작가가 없습니다.</p>
              ) : (
                <div className="space-y-2.5">
                  {assignments.map((asgn) => {
                    const p = photographers.find((item) => item.id === asgn.photographer_id);
                    const isRep = p?.name.includes('대표') || asgn.role === 'main';
                    return (
                      <div
                        key={asgn.id}
                        className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-900">{p?.name || '작가'}</span>
                            <Badge variant={asgn.role === 'main' ? 'primary' : 'secondary'}>
                              {asgn.role === 'main' ? '메인' : '서브'}
                            </Badge>
                            <span className="text-xs text-slate-500">{p?.phone}</span>
                          </div>
                          <p className="text-xs text-slate-600 mt-1">
                            {asgn.notes || (asgn.role === 'main' ? '대표 메인 촬영' : '서브 스냅 담당')}
                          </p>
                          {!isRep && (
                            <div className="text-xs font-semibold text-indigo-900 mt-1">
                              외주비: {(asgn.agreed_fee || 0).toLocaleString()}원
                              {asgn.additional_fee ? ` + 추가비 ${asgn.additional_fee.toLocaleString()}원` : ''}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 self-end sm:self-center">
                          <select
                            value={asgn.assignment_status}
                            onChange={(e) =>
                              handleAssignmentStatusChange(asgn.id, e.target.value as AssignmentStatus)
                            }
                            className={`text-xs font-bold px-2.5 py-1 rounded-lg border focus:outline-none transition ${
                              asgn.assignment_status === 'accepted'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                : asgn.assignment_status === 'proposed'
                                ? 'bg-amber-50 text-amber-800 border-amber-300'
                                : 'bg-slate-100 text-slate-700 border-slate-300'
                            }`}
                          >
                            <option value="proposed">수락 대기</option>
                            <option value="accepted">수락 완료</option>
                            <option value="declined">거절</option>
                            <option value="replaced">교체</option>
                            <option value="cancelled">취소</option>
                          </select>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ② Job Pack */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <button
            onClick={() => toggleSection('jobpack')}
            className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-slate-50/80 transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-violet-50 flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4 text-violet-600" />
              </div>
              <div className="text-left">
                <span className="text-sm font-semibold text-slate-900 block">촬영 안내 (Job Pack)</span>
                <span className="text-[11px] text-slate-500">
                  {jobPackVersions.length > 0
                    ? `v${jobPackVersions[0].version_number} 생성됨`
                    : '아직 생성되지 않음'}
                  {outdatedInfo.outdated && (
                    <span className="ml-1.5 text-rose-600 font-semibold">· 재생성 필요</span>
                  )}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {outdatedInfo.outdated && (
                <span className="text-[10px] font-bold bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded-full">!</span>
              )}
              {expandedSection === 'jobpack' ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </div>
          </button>

          {/* Job Pack 상세 */}
          {expandedSection === 'jobpack' && (
            <div className="border-t border-slate-100 px-4 py-3 space-y-3">
              <div className="flex items-center justify-between">
                {jobPackVersions.length > 0 && (
                  <button
                    onClick={() => setIsJobPackModalOpen(true)}
                    className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1"
                  >
                    <History className="w-3.5 h-3.5" />
                    이력 ({jobPackVersions.length})
                  </button>
                )}
                <button
                  onClick={handleGenerateJobPack}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 bg-indigo-50 px-2.5 py-1 rounded-lg ml-auto"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  {jobPackVersions.length === 0 ? '촬영 안내 생성' : '새 버전 생성'}
                </button>
              </div>

              {jobPackVersions.length === 0 ? (
                <div className="text-center py-5 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <p className="text-xs text-slate-500 mb-2">아직 외주작가에게 전달할 촬영 안내문이 생성되지 않았습니다.</p>
                  <button
                    onClick={handleGenerateJobPack}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm transition"
                  >
                    촬영 안내 생성
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="relative bg-slate-900 text-slate-100 rounded-xl p-3.5 text-xs font-mono whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto border border-slate-800">
                    {currentJobPackText}
                  </div>
                  <button
                    onClick={() => handleCopyJobPack(currentJobPackText)}
                    className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-sm ${
                      copied
                        ? 'bg-emerald-600 text-white'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white active:scale-[0.99]'
                    }`}
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 stroke-[3]" />
                        카카오톡 전달용 복사 완료!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        카카오톡 전송용 안내문 복사
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ③ 원본 & 정산 */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <button
            onClick={() => toggleSection('handover_settlement')}
            className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-slate-50/80 transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-left">
                <span className="text-sm font-semibold text-slate-900 block">원본 인수 & 정산</span>
                <span className="text-[11px] text-slate-500">
                  {handovers.length === 0
                    ? '외주 없음'
                    : allHandoverVerified
                    ? '원본 검수 완료'
                    : `원본 ${handovers.filter((h) => h.status !== 'verified').length}건 미완`}
                  {totalRemaining > 0 && (
                    <span className="ml-1.5 text-rose-600 font-semibold">
                      · 잔액 {totalRemaining.toLocaleString()}원
                    </span>
                  )}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {totalRemaining > 0 && (
                <span className="text-[10px] font-bold bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded-full">
                  ₩
                </span>
              )}
              {expandedSection === 'handover_settlement' ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </div>
          </button>

          {/* 원본 & 정산 상세 */}
          {expandedSection === 'handover_settlement' && (
            <div className="border-t border-slate-100 px-4 py-3 space-y-5">
              {/* 원본 인수 */}
              <div className="space-y-2.5">
                <h3 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  외주 원본 인수 및 검수
                </h3>
                {handovers.length === 0 ? (
                  <p className="text-xs text-slate-400">인수 대상 외주작가가 없습니다.</p>
                ) : (
                  <div className="space-y-3">
                    {handovers.map((h) => (
                      <div key={h.id} className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900">{h.photographer?.name} 작가</span>
                            <Badge
                              variant={
                                h.status === 'verified'
                                  ? 'success'
                                  : h.status === 'revision_requested'
                                  ? 'danger'
                                  : h.status === 'submitted'
                                  ? 'warning'
                                  : 'neutral'
                              }
                            >
                              {h.status === 'pending'
                                ? '미전달'
                                : h.status === 'submitted'
                                ? '검수 필요'
                                : h.status === 'revision_requested'
                                ? '보완 요청됨'
                                : '검수 완료'}
                            </Badge>
                          </div>
                          <span className="text-[11px] text-slate-500">
                            기한: {h.due_at ? h.due_at.split('T')[0] : '미지정'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="url"
                            placeholder="드라이브 원본 링크"
                            defaultValue={h.external_url || ''}
                            onBlur={(e) => {
                              if (e.target.value !== (h.external_url || '')) {
                                handleHandoverUpdate(h.id, {
                                  external_url: e.target.value,
                                  status: e.target.value ? 'submitted' : 'pending',
                                });
                              }
                            }}
                            className="flex-1 text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                          {h.external_url && (
                            <a
                              href={h.external_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 bg-slate-200 hover:bg-slate-300 rounded-lg text-slate-700 transition"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                        <div className="flex items-center justify-between pt-1 text-xs">
                          <div className="text-[11px] text-slate-500">
                            {h.representative_checked_at
                              ? `검수 확인일: ${new Date(h.representative_checked_at).toLocaleDateString()}`
                              : '대표 미확인'}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => {
                                const note = prompt('보완 요청 사유:');
                                if (note !== null) handleHandoverUpdate(h.id, { status: 'revision_requested', notes: note });
                              }}
                              className="px-2.5 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 font-medium rounded-md border border-rose-200 transition"
                            >
                              보완 요청
                            </button>
                            <button
                              onClick={() => handleHandoverUpdate(h.id, { status: 'verified' })}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-md transition shadow-sm"
                            >
                              검수 완료
                            </button>
                          </div>
                        </div>
                        {h.notes && (
                          <p className="text-[11px] text-rose-700 bg-rose-50/50 p-1.5 rounded border border-rose-100">
                            메모: {h.notes}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 외주비 정산 */}
              <div className="space-y-2.5 pt-3 border-t border-slate-100">
                <h3 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-indigo-600" />
                  외주비 정산 관리
                </h3>
                {settlements.length === 0 ? (
                  <p className="text-xs text-slate-400">정산 대상 외주작가가 없습니다.</p>
                ) : (
                  <div className="space-y-3">
                    {settlements.map((stl) => (
                      <div key={stl.id} className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900">{stl.photographer?.name} 작가</span>
                            <Badge
                              variant={
                                stl.settlement_status === 'paid'
                                  ? 'success'
                                  : stl.settlement_status === 'partially_paid'
                                  ? 'warning'
                                  : 'neutral'
                              }
                            >
                              {stl.settlement_status === 'paid'
                                ? '지급 완료'
                                : stl.settlement_status === 'partially_paid'
                                ? '부분 지급'
                                : stl.settlement_status === 'waived'
                                ? '면제'
                                : '미지급'}
                            </Badge>
                          </div>
                          <button
                            onClick={() => { setSelectedSettlementId(stl.id); setIsPaymentModalOpen(true); }}
                            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2 py-1 rounded-md"
                          >
                            + 지급 등록
                          </button>
                        </div>
                        <div className="grid grid-cols-3 gap-2 bg-white p-2 rounded-lg border border-slate-200 text-center text-xs">
                          <div>
                            <span className="text-[10px] text-slate-500 block">총 약정액</span>
                            <strong className="text-slate-800">{stl.total_due.toLocaleString()}원</strong>
                          </div>
                          <div>
                            <span className="text-[10px] text-emerald-600 block">기지급액</span>
                            <strong className="text-emerald-700">{stl.total_paid.toLocaleString()}원</strong>
                          </div>
                          <div>
                            <span className="text-[10px] text-rose-600 block">잔액</span>
                            <strong className="text-rose-700">{stl.remaining.toLocaleString()}원</strong>
                          </div>
                        </div>
                        {stl.payments.length > 0 && (
                          <div className="space-y-1 pt-1 border-t border-slate-200/60">
                            <span className="text-[10px] font-bold text-slate-500 block">지급 이력:</span>
                            {stl.payments.map((p) => (
                              <div key={p.id} className="flex items-center justify-between text-[11px] text-slate-600 bg-white/70 px-2 py-1 rounded border border-slate-100">
                                <span>{new Date(p.paid_at).toLocaleDateString()} · {p.memo || '지급'}</span>
                                <strong className="text-slate-900">+{p.payment_amount.toLocaleString()}원</strong>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ④ 납품 */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <button
            onClick={() => toggleSection('delivery')}
            className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-slate-50/80 transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-teal-50 flex items-center justify-center shrink-0">
                <PackageCheck className="w-4 h-4 text-teal-600" />
              </div>
              <div className="text-left">
                <span className="text-sm font-semibold text-slate-900 block">고객 최종 납품</span>
                <span className="text-[11px] text-slate-500">
                  {deliveryStatus === 'delivered'
                    ? '납품 완료'
                    : deliveryStatus === 'not_applicable'
                    ? '해당 없음'
                    : delivery?.delivery_due_at
                    ? `기한: ${delivery.delivery_due_at}`
                    : '기한 미설정'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {deliveryStatus === 'delivered' && (
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              )}
              {expandedSection === 'delivery' ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </div>
          </button>

          {/* 납품 상세 */}
          {expandedSection === 'delivery' && (
            <div className="border-t border-slate-100 px-4 py-3 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600">납품 기한:</span>
                <input
                  type="date"
                  defaultValue={delivery?.delivery_due_at || ''}
                  onBlur={(e) => handleDeliveryUpdate({ delivery_due_at: e.target.value })}
                  className="px-2 py-1 border border-slate-300 rounded text-xs"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="url"
                  placeholder="완성본 전달 드라이브 링크"
                  defaultValue={delivery?.external_work_url || ''}
                  onBlur={(e) => handleDeliveryUpdate({ external_work_url: e.target.value })}
                  className="flex-1 text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white focus:outline-none"
                />
                <select
                  value={delivery?.delivery_status || 'pending'}
                  onChange={(e) => handleDeliveryUpdate({ delivery_status: e.target.value as DeliveryStatus })}
                  className="text-xs font-bold px-2 py-1.5 rounded-lg border bg-white focus:outline-none"
                >
                  <option value="pending">진행중</option>
                  <option value="delivered">납품완료</option>
                  <option value="not_applicable">해당없음</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* 변경 이력 (Change Events) — 접이식 */}
      {/* ─────────────────────────────────────────────────────────── */}
      {changeEvents.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <button
            onClick={() => setShowChangeLog((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50/80 transition"
          >
            <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-slate-400" />
              중요 정보 변경 기록 ({changeEvents.length}건)
            </span>
            {showChangeLog ? (
              <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            )}
          </button>
          {showChangeLog && (
            <div className="border-t border-slate-100 px-4 py-3 space-y-1 text-[11px] text-slate-600 divide-y divide-slate-100">
              {changeEvents.slice(0, 5).map((chg) => (
                <div key={chg.id} className="pt-1.5 first:pt-0 flex items-center justify-between">
                  <span>{chg.description}</span>
                  <span className="text-[10px] text-slate-400 shrink-0 ml-2">
                    {new Date(chg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────── */}
      {/* 모달들 (기존 로직 100% 유지) */}
      {/* ─────────────────────────────────────────────────────────── */}

      {/* 1. 기본 정보 수정 모달 */}
      <Modal isOpen={isEditJobModalOpen} onClose={() => setIsEditJobModalOpen(false)} title="촬영 기본 정보 수정">
        <form onSubmit={handleUpdateJobInfo} className="space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">예식 시작 시각</label>
              <input type="time" value={editCeremonyTime} onChange={(e) => setEditCeremonyTime(e.target.value)} className="w-full text-sm px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">작가 도착 시각</label>
              <input type="time" value={editArrivalTime} onChange={(e) => setEditArrivalTime(e.target.value)} className="w-full text-sm px-3 py-2 border rounded-lg" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">특별 요청사항</label>
            <textarea rows={2} value={editSpecialRequests} onChange={(e) => setEditSpecialRequests(e.target.value)} className="w-full text-sm px-3 py-2 border rounded-lg" />
          </div>
          <p className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded">
            ⚠️ 일시나 핵심 정보 변경 시 기존 Job Pack 이후 변경 알림이 활성화됩니다.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setIsEditJobModalOpen(false)} className="px-4 py-2 text-xs text-slate-600 bg-slate-100 rounded-lg">취소</button>
            <button type="submit" className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">수정 저장</button>
          </div>
        </form>
      </Modal>

      {/* 2. 작가 추가 모달 */}
      <Modal isOpen={isAddAssignmentModalOpen} onClose={() => setIsAddAssignmentModalOpen(false)} title="촬영 작가 추가 배정">
        <form onSubmit={handleAddAssignment} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">작가 선택 <span className="text-rose-500">*</span></label>
            <select required value={newAsgnPhotographerId} onChange={(e) => setNewAsgnPhotographerId(e.target.value)} className="w-full text-sm px-3 py-2 border rounded-lg bg-white">
              <option value="">작가를 선택하세요</option>
              {photographers.filter((p) => p.is_active).map((p) => (
                <option key={p.id} value={p.id}>{p.name} {p.phone ? `(${p.phone})` : ''}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">역할</label>
              <select value={newAsgnRole} onChange={(e) => setNewAsgnRole(e.target.value as 'main' | 'sub' | 'etc')} className="w-full text-sm px-3 py-2 border rounded-lg bg-white">
                <option value="sub">서브작가</option>
                <option value="main">메인작가</option>
                <option value="etc">기타</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">약정 외주비</label>
              <input type="number" step="10000" value={newAsgnFee} onChange={(e) => setNewAsgnFee(e.target.value)} className="w-full text-sm px-3 py-2 border rounded-lg" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">추가비 / 교통비</label>
            <input type="number" step="5000" value={newAsgnAddFee} onChange={(e) => setNewAsgnAddFee(e.target.value)} className="w-full text-sm px-3 py-2 border rounded-lg" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">담당 업무 메모</label>
            <input type="text" placeholder="예: 서브스냅 및 부모님 표정 집중" value={newAsgnNotes} onChange={(e) => setNewAsgnNotes(e.target.value)} className="w-full text-sm px-3 py-2 border rounded-lg" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setIsAddAssignmentModalOpen(false)} className="px-4 py-2 text-xs text-slate-600 bg-slate-100 rounded-lg">취소</button>
            <button type="submit" className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">배정 저장</button>
          </div>
        </form>
      </Modal>

      {/* 3. Job Pack 버전 이력 모달 */}
      <Modal isOpen={isJobPackModalOpen} onClose={() => setIsJobPackModalOpen(false)} title="촬영 안내문 (Job Pack) 버전 이력">
        <div className="space-y-4">
          {jobPackVersions.map((v) => (
            <div key={v.id} className="border border-slate-200 rounded-xl p-3 bg-slate-50 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded">버전 {v.version_number}</span>
                <span className="text-slate-400">{new Date(v.created_at).toLocaleString()} · {v.created_by}</span>
              </div>
              <pre className="text-xs bg-slate-900 text-slate-100 p-2.5 rounded-lg whitespace-pre-wrap font-mono max-h-40 overflow-y-auto">
                {v.content}
              </pre>
              <button onClick={() => handleCopyJobPack(v.content)} className="w-full py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg transition">
                이 버전 복사하기
              </button>
            </div>
          ))}
        </div>
      </Modal>

      {/* 4. 외주비 지급 내역 등록 모달 */}
      <Modal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} title="외주비 지급 내역 등록">
        <form onSubmit={handleAddPayment} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">지급 금액 (원) <span className="text-rose-500">*</span></label>
            <input type="number" required step="10000" placeholder="예: 100000" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} className="w-full text-sm px-3 py-2 border rounded-lg" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">지급 메모</label>
            <input type="text" placeholder="예: 1차 계약금 / 잔금 입금 등" value={paymentMemo} onChange={(e) => setPaymentMemo(e.target.value)} className="w-full text-sm px-3 py-2 border rounded-lg" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setIsPaymentModalOpen(false)} className="px-4 py-2 text-xs text-slate-600 bg-slate-100 rounded-lg">취소</button>
            <button type="submit" className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">지급 기록 저장</button>
          </div>
        </form>
      </Modal>

      {/* 5. 본식 완료 요건 체크 모달 */}
      <Modal isOpen={isCompleteModalOpen} onClose={() => setIsCompleteModalOpen(false)} title="본식 촬영 최종 완료 확인">
        <div className="space-y-4">
          <p className="text-xs text-slate-600">아래 4가지 필수 완료 조건을 모두 만족해야 최종 완료 처리가 가능합니다:</p>
          <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
            {completionEligibility.reasons.map((r, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                {r.fulfilled ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-slate-300 bg-white shrink-0" />
                )}
                <span className={r.fulfilled ? 'text-slate-800 font-semibold' : 'text-slate-400'}>{r.label}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setIsCompleteModalOpen(false)} className="px-4 py-2 text-xs text-slate-600 bg-slate-100 rounded-lg">닫기</button>
            <button
              type="button"
              disabled={!completionEligibility.canComplete}
              onClick={handleCompleteJob}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition ${
                completionEligibility.canComplete
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              {completionEligibility.canComplete ? '최종 완료 확정' : '조건 미충족'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
