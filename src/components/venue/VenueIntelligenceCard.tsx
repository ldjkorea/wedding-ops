'use client';

import React, { useState } from 'react';
import {
  Lightbulb,
  Clock,
  Sparkles,
  AlertTriangle,
  Building2,
  Car,
  ShieldAlert,
  ArrowRight,
  Plus,
  Edit3,
  ThumbsUp,
  ThumbsDown,
  Info,
} from 'lucide-react';
import { VenueSpace, HallObservation, HallObservationCategory, Photographer } from '@/types/database';
import { Modal } from '@/components/ui/Modal';
import { DataStore } from '@/lib/storage';

interface VenueIntelligenceCardProps {
  space: VenueSpace;
  venueName?: string;
  observations: HallObservation[];
  photographers?: Photographer[];
  currentJobId?: string;
  onRefresh?: () => void;
}

export function VenueIntelligenceCard({
  space,
  venueName,
  observations,
  photographers = [],
  currentJobId,
  onRefresh,
}: VenueIntelligenceCardProps) {
  // 하단 카드 필터 상태
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // 모달 상태
  const [isEditFactModalOpen, setIsEditFactModalOpen] = useState(false);
  const [isAddObsModalOpen, setIsAddObsModalOpen] = useState(false);

  // 상단 팩트시트 수정 폼
  const [lightingType, setLightingType] = useState(space.lighting_type || '');
  const [ceilingHeight, setCeilingHeight] = useState(space.ceiling_height || '');
  const [aisleInfo, setAisleInfo] = useState(space.aisle_info || '');
  const [ceremonyInterval, setCeremonyInterval] = useState(space.ceremony_interval || '');
  const [bridalRoomFlow, setBridalRoomFlow] = useState(space.bridal_room_flow || '');
  const [photoRestrictions, setPhotoRestrictions] = useState(space.photo_restrictions || '');
  const [parkingTransport, setParkingTransport] = useState(space.parking_transport_info || '');

  // 하단 크루 기록 추가 폼
  const [obsAuthor, setObsAuthor] = useState('한민규 (대표)');
  const [obsCategory, setObsCategory] = useState<HallObservationCategory>('tip');
  const [obsText, setObsText] = useState('');
  const [obsAction, setObsAction] = useState('');

  const handleSaveFacts = (e: React.FormEvent) => {
    e.preventDefault();
    DataStore.updateVenueSpace(space.id, {
      lighting_type: lightingType,
      ceiling_height: ceilingHeight,
      aisle_info: aisleInfo,
      ceremony_interval: ceremonyInterval,
      bridal_room_flow: bridalRoomFlow,
      photo_restrictions: photoRestrictions,
      parking_transport_info: parkingTransport,
      latest_info_source: '디어메모리 크루 현장 검증',
    });
    setIsEditFactModalOpen(false);
    onRefresh?.();
  };

  const handleAddObservation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!obsText.trim()) return;

    DataStore.addHallObservation({
      venue_space_id: space.id,
      related_job_id: currentJobId || null,
      author: obsAuthor,
      observed_at: new Date().toISOString().split('T')[0],
      source_type: 'direct',
      category: obsCategory,
      observation_text: obsText.trim(),
      action_note: obsAction.trim() || null,
    });

    setIsAddObsModalOpen(false);
    setObsText('');
    setObsAction('');
    onRefresh?.();
  };

  // 하단 카드 필터링
  const filteredObs = observations.filter((o) => {
    if (filterCategory === 'all') return true;
    if (filterCategory === 'advantage') return o.category === 'advantage';
    if (filterCategory === 'disadvantage') return o.category === 'disadvantage';
    if (filterCategory === 'caution') return o.category === 'caution' || o.category === 'must_caution';
    if (filterCategory === 'tip') return o.category === 'tip' || o.category === 'team_routine' || o.category === 'next_check';
    return true;
  });

  return (
    <div className="space-y-4">
      {/* ========================================================================= */}
      {/* 1. 상단 카드: 웨딩홀 최신 정보 (작가 필수 팩트시트) */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        {/* 상단 카드 헤더 */}
        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="bg-indigo-500/30 text-indigo-200 text-[10px] font-bold px-2 py-0.5 rounded border border-indigo-400/30">
                베뉴 최신 팩트시트
              </span>
              <span className="text-[11px] text-slate-300">
                {space.latest_info_updated_at ? `최신 검증: ${space.latest_info_updated_at}` : '최신'}
              </span>
            </div>
            <button
              onClick={() => setIsEditFactModalOpen(true)}
              className="text-xs text-indigo-200 hover:text-white flex items-center gap-1 bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-lg transition"
            >
              <Edit3 className="w-3.5 h-3.5" />
              팩트 수정
            </button>
          </div>

          <h3 className="text-lg font-bold text-white mt-1.5 flex items-center gap-2">
            <span>{venueName ? `${venueName} · ` : ''}{space.name}</span>
            {space.floor && <span className="text-xs font-normal text-indigo-200">({space.floor})</span>}
          </h3>
          <p className="text-xs text-indigo-200/80 mt-0.5">
            본식 촬영 작가가 현장 도착 전 반드시 알아야 하는 홀 스펙입니다.
          </p>
        </div>

        {/* 팩트 그리드 */}
        <div className="p-4 grid grid-cols-2 gap-3 text-xs bg-slate-50/50">
          <div className="bg-white p-3 rounded-xl border border-slate-200/80 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" /> 조명 스타일
            </span>
            <p className="font-semibold text-slate-800 leading-tight">
              {space.lighting_type || '밝은 채플형 (자연광 우드톤)'}
            </p>
          </div>

          <div className="bg-white p-3 rounded-xl border border-slate-200/80 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
              <Building2 className="w-3 h-3 text-indigo-500" /> 천고 높이
            </span>
            <p className="font-semibold text-slate-800 leading-tight">
              {space.ceiling_height || '천고 7~8m (높음)'}
            </p>
          </div>

          <div className="bg-white p-3 rounded-xl border border-slate-200/80 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
              <ArrowRight className="w-3 h-3 text-blue-500" /> 버진로드 & 단상
            </span>
            <p className="font-semibold text-slate-800 leading-tight">
              {space.aisle_info || '24m (단상 없음, 평지)'}
            </p>
          </div>

          <div className="bg-white p-3 rounded-xl border border-slate-200/80 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3 text-emerald-500" /> 예식 간격
            </span>
            <p className="font-semibold text-slate-800 leading-tight">
              {space.ceremony_interval || '80~90분 간격'}
            </p>
          </div>

          <div className="col-span-2 bg-white p-3 rounded-xl border border-slate-200/80 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
              <Info className="w-3 h-3 text-purple-500" /> 신부대기실 동선
            </span>
            <p className="text-slate-800 font-medium leading-tight">
              {space.bridal_room_flow || '홀과 동일층 인접 (신부 이동 동선 매우 원활)'}
            </p>
          </div>

          <div className="col-span-2 bg-rose-50/60 p-3 rounded-xl border border-rose-200/80 space-y-1">
            <span className="text-[10px] font-bold text-rose-800 flex items-center gap-1">
              <ShieldAlert className="w-3 h-3 text-rose-600" /> 홀 규정 및 사진 촬영 제약사항
            </span>
            <p className="text-rose-950 font-medium leading-tight">
              {space.photo_restrictions || '입장 시 중앙 통로 침범 금지, 단상 위 삼각대 금지'}
            </p>
          </div>

          {space.parking_transport_info && (
            <div className="col-span-2 bg-white p-2.5 rounded-xl border border-slate-200 text-slate-600 flex items-center gap-1.5 text-[11px]">
              <Car className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{space.parking_transport_info}</span>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. 하단 카드: 디어메모리 크루 현장 기록 (장단점 / 주의 / 팁) */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 space-y-3.5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-600" />
              <h4 className="text-sm font-bold text-slate-900">
                디어메모리 크루 현장 노하우
              </h4>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              한민규 대표와 작가들이 직접 촬영하며 축적한 실전 기록 ({observations.length}건)
            </p>
          </div>
          <button
            onClick={() => setIsAddObsModalOpen(true)}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            크루 팁 작성
          </button>
        </div>

        {/* 분류 필터 탭 */}
        <div className="flex gap-1 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'all', label: `전체 (${observations.length})` },
            {
              id: 'advantage',
              label: `장점/명당 (${observations.filter((o) => o.category === 'advantage').length})`,
              icon: ThumbsUp,
            },
            {
              id: 'disadvantage',
              label: `단점/특징 (${observations.filter((o) => o.category === 'disadvantage').length})`,
              icon: ThumbsDown,
            },
            {
              id: 'caution',
              label: `주의사항 (${observations.filter((o) => o.category === 'caution' || o.category === 'must_caution').length})`,
              icon: AlertTriangle,
            },
            {
              id: 'tip',
              label: `실전팁/렌즈 (${observations.filter((o) => o.category === 'tip' || o.category === 'team_routine' || o.category === 'next_check').length})`,
              icon: Lightbulb,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterCategory(tab.id)}
              className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition text-[11px] ${
                filterCategory === tab.id
                  ? 'bg-slate-900 text-white font-bold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 관찰 목록 리스트 */}
        {filteredObs.length === 0 ? (
          <div className="py-6 text-center text-slate-400 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200">
            해당 분류에 기록된 디어메모리 크루의 노트가 없습니다.
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredObs.map((obs) => {
              const isAdv = obs.category === 'advantage';
              const isDis = obs.category === 'disadvantage';
              const isCaution = obs.category === 'caution' || obs.category === 'must_caution';

              const badgeStyle = isAdv
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : isDis
                ? 'bg-amber-50 text-amber-800 border-amber-200'
                : isCaution
                ? 'bg-rose-50 text-rose-800 border-rose-200'
                : 'bg-indigo-50 text-indigo-800 border-indigo-200';

              const label = isAdv
                ? '장점 / 명당 스팟'
                : isDis
                ? '단점 / 현장 특이점'
                : isCaution
                ? '촬영 주의사항'
                : '실전 꿀팁 / 렌즈';

              return (
                <div
                  key={obs.id}
                  className="bg-slate-50/70 border border-slate-200/90 rounded-xl p-3 space-y-1.5 hover:bg-slate-50 transition"
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className={`px-2 py-0.5 rounded font-bold border ${badgeStyle}`}>
                      {label}
                    </span>
                    <span className="text-slate-400 font-medium">
                      {obs.author} · {obs.observed_at}
                    </span>
                  </div>

                  <p className="text-xs text-slate-800 leading-relaxed font-normal">
                    {obs.observation_text}
                  </p>

                  {obs.action_note && (
                    <div className="bg-white p-2 rounded-lg border border-slate-200/80 text-[11px] text-slate-700 font-medium flex items-start gap-1.5 mt-1">
                      <span className="text-indigo-600 font-bold shrink-0">💡 크루 권고:</span>
                      <span>{obs.action_note}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 팩트시트 수정 모달 */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isEditFactModalOpen}
        onClose={() => setIsEditFactModalOpen(false)}
        title={`웨딩홀 최신 팩트시트 수정 (${space.name})`}
      >
        <form onSubmit={handleSaveFacts} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              조명 스타일
            </label>
            <input
              type="text"
              placeholder="예: 어두운 호텔형 / 밝은 채플형 / 자연광 하우스"
              value={lightingType}
              onChange={(e) => setLightingType(e.target.value)}
              className="w-full text-xs px-3 py-2 border rounded-lg"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">천고 높이</label>
              <input
                type="text"
                placeholder="예: 7m (높음)"
                value={ceilingHeight}
                onChange={(e) => setCeilingHeight(e.target.value)}
                className="w-full text-xs px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">예식 간격</label>
              <input
                type="text"
                placeholder="예: 80분"
                value={ceremonyInterval}
                onChange={(e) => setCeremonyInterval(e.target.value)}
                className="w-full text-xs px-3 py-2 border rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              버진로드 길이 & 단상 유무
            </label>
            <input
              type="text"
              placeholder="예: 25m (단상 없음, 평지)"
              value={aisleInfo}
              onChange={(e) => setAisleInfo(e.target.value)}
              className="w-full text-xs px-3 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              신부대기실 동선
            </label>
            <input
              type="text"
              placeholder="예: 홀과 동일 3층 바로 옆"
              value={bridalRoomFlow}
              onChange={(e) => setBridalRoomFlow(e.target.value)}
              className="w-full text-xs px-3 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              홀 촬영 규정 및 제약사항
            </label>
            <textarea
              rows={2}
              placeholder="예: 단상 위 삼각대 금지, 입장 시 버진로드 침범 불가"
              value={photoRestrictions}
              onChange={(e) => setPhotoRestrictions(e.target.value)}
              className="w-full text-xs px-3 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              주차 및 교통 안내
            </label>
            <input
              type="text"
              placeholder="예: 지하주차장 200대 / 강남구청역 도보 8분"
              value={parkingTransport}
              onChange={(e) => setParkingTransport(e.target.value)}
              className="w-full text-xs px-3 py-2 border rounded-lg"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsEditFactModalOpen(false)}
              className="px-3 py-1.5 text-xs text-slate-600 bg-slate-100 rounded-lg"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
            >
              팩트시트 저장
            </button>
          </div>
        </form>
      </Modal>

      {/* ========================================================================= */}
      {/* 크루 현장 기록 작성 모달 */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isAddObsModalOpen}
        onClose={() => setIsAddObsModalOpen(false)}
        title={`디어메모리 크루 노트 작성 (${space.name})`}
      >
        <form onSubmit={handleAddObservation} className="space-y-3.5">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">작성 작가</label>
              <select
                value={obsAuthor}
                onChange={(e) => setObsAuthor(e.target.value)}
                className="w-full text-xs px-3 py-2 border rounded-lg bg-white"
              >
                <option value="한민규 (대표)">한민규 (대표)</option>
                {photographers
                  .filter((p) => !p.name.includes('대표'))
                  .map((p) => (
                    <option key={p.id} value={`${p.name} (크루)`}>
                      {p.name} (크루)
                    </option>
                  ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">분류</label>
              <select
                value={obsCategory}
                onChange={(e) => setObsCategory(e.target.value as HallObservationCategory)}
                className="w-full text-xs px-3 py-2 border rounded-lg bg-white"
              >
                <option value="advantage">장점 / 명당 스팟</option>
                <option value="disadvantage">단점 / 현장 특이점</option>
                <option value="caution">촬영 주의사항</option>
                <option value="tip">실전 꿀팁 / 렌즈 추천</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              관찰 내용 <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              placeholder="예: 신부대기실 조명이 따뜻해서 화이트밸런스 5200K 맞추면 피부톤이 매우 화사하게 나옵니다."
              value={obsText}
              onChange={(e) => setObsText(e.target.value)}
              className="w-full text-xs px-3 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              팀 권고사항 (Action Note)
            </label>
            <input
              type="text"
              placeholder="예: 85mm F1.4 단렌즈 활용 권장"
              value={obsAction}
              onChange={(e) => setObsAction(e.target.value)}
              className="w-full text-xs px-3 py-2 border rounded-lg"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddObsModalOpen(false)}
              className="px-3 py-1.5 text-xs text-slate-600 bg-slate-100 rounded-lg"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
            >
              크루 노트 등록
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
