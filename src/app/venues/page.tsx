'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Building2, MapPin, Layers, ChevronRight, Sparkles } from 'lucide-react';
import { DataStore } from '@/lib/storage';
import { Venue, VenueSpace, HallObservation, Photographer } from '@/types/database';
import { Modal } from '@/components/ui/Modal';
import { VenueIntelligenceCard } from '@/components/venue/VenueIntelligenceCard';

export default function VenuesPage() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [spaces, setSpaces] = useState<VenueSpace[]>([]);
  const [observations, setObservations] = useState<HallObservation[]>([]);
  const [photographers, setPhotographers] = useState<Photographer[]>([]);

  const [isVenueModalOpen, setIsVenueModalOpen] = useState(false);
  const [isSpaceModalOpen, setIsSpaceModalOpen] = useState(false);
  const [selectedVenueId, setSelectedVenueId] = useState<string | null>(null);

  // 2단 인텔리전스 상세 모달 상태
  const [activeSpace, setActiveSpace] = useState<VenueSpace | null>(null);

  // 웨딩홀 등록 폼
  const [venueName, setVenueName] = useState('');
  const [venueAddress, setVenueAddress] = useState('');
  const [venueNotes, setVenueNotes] = useState('');

  // 공간(홀) 등록 폼 (작가 필수 팩트시트 포함)
  const [spaceName, setSpaceName] = useState('');
  const [spaceFloor, setSpaceFloor] = useState('');
  const [spaceNotes, setSpaceNotes] = useState('');
  const [lightingType, setLightingType] = useState('밝은 채플형');
  const [ceilingHeight, setCeilingHeight] = useState('7m (높음)');
  const [aisleInfo, setAisleInfo] = useState('25m (단상 없음)');
  const [ceremonyInterval, setCeremonyInterval] = useState('80분');
  const [bridalRoomFlow, setBridalRoomFlow] = useState('동일층 인접');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setVenues(DataStore.getVenues());
    const sList = DataStore.getVenueSpaces();
    setSpaces(sList);
    setObservations(DataStore.getHallObservations());
    setPhotographers(DataStore.getPhotographers());

    // 현재 열려있는 activeSpace가 있다면 최신 상태로 갱신
    if (activeSpace) {
      const refreshed = sList.find((s) => s.id === activeSpace.id);
      if (refreshed) setActiveSpace(refreshed);
    }
  };

  const handleAddVenue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!venueName.trim()) return;
    DataStore.addVenue({
      name: venueName.trim(),
      address: venueAddress.trim() || undefined,
      notes: venueNotes.trim() || undefined,
    });
    setIsVenueModalOpen(false);
    setVenueName('');
    setVenueAddress('');
    setVenueNotes('');
    loadData();
  };

  const handleAddSpace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVenueId || !spaceName.trim()) return;
    DataStore.addVenueSpace({
      venue_id: selectedVenueId,
      name: spaceName.trim(),
      floor: spaceFloor.trim() || undefined,
      notes: spaceNotes.trim() || undefined,
      lighting_type: lightingType,
      ceiling_height: ceilingHeight,
      aisle_info: aisleInfo,
      ceremony_interval: ceremonyInterval,
      bridal_room_flow: bridalRoomFlow,
    });
    setIsSpaceModalOpen(false);
    setSpaceName('');
    setSpaceFloor('');
    setSpaceNotes('');
    loadData();
  };

  const getVenueNameOfSpace = (space: VenueSpace) => {
    return venues.find((v) => v.id === space.venue_id)?.name;
  };

  return (
    <div className="space-y-4 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">웨딩홀 인텔리전스</h1>
          <p className="text-xs text-indigo-700 font-medium">
            최신 베뉴 팩트 & 디어메모리 크루 현장 기록
          </p>
        </div>
        <button
          onClick={() => setIsVenueModalOpen(true)}
          className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3 py-2 rounded-lg shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          웨딩홀 추가
        </button>
      </div>

      <div className="space-y-4">
        {venues.map((v) => {
          const venueSpaces = spaces.filter((s) => s.venue_id === v.id);

          return (
            <div
              key={v.id}
              className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-indigo-600" />
                    {v.name}
                  </h2>
                  {v.address && (
                    <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{v.address}</span>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => {
                    setSelectedVenueId(v.id);
                    setIsSpaceModalOpen(true);
                  }}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2.5 py-1.5 rounded-lg"
                >
                  + 홀(Space) 추가
                </button>
              </div>

              {/* 하위 홀 목록 */}
              <div className="space-y-2 pt-1">
                <span className="text-[11px] font-bold text-slate-500 block">
                  홀 목록 ({venueSpaces.length}개) — 클릭하여 최신정보 및 크루 노트 확인:
                </span>
                {venueSpaces.length === 0 ? (
                  <p className="text-xs text-slate-400 py-1">등록된 홀이 없습니다.</p>
                ) : (
                  venueSpaces.map((s) => {
                    const spaceObs = observations.filter((o) => o.venue_space_id === s.id);

                    return (
                      <div
                        key={s.id}
                        onClick={() => setActiveSpace(s)}
                        className="bg-slate-50/80 hover:bg-indigo-50/50 border border-slate-200/80 hover:border-indigo-300 rounded-xl p-3 space-y-2 transition cursor-pointer group shadow-sm active:scale-[0.99]"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                              <Layers className="w-3.5 h-3.5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-sm font-bold text-slate-900 group-hover:text-indigo-900">
                                  {s.name}
                                </span>
                                {s.floor && (
                                  <span className="text-[10px] text-slate-500 bg-slate-200/70 px-1.5 py-0.5 rounded font-medium">
                                    {s.floor}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                                <span>{s.lighting_type || '밝은 채플형'}</span>
                                <span>·</span>
                                <span>천고 {s.ceiling_height || '보통'}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 text-xs font-semibold text-indigo-600">
                            <span>크루 노트 {spaceObs.length}건</span>
                            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition" />
                          </div>
                        </div>

                        {/* 최근 크루 관찰 한 줄 미리보기 */}
                        {spaceObs.length > 0 && (
                          <div className="bg-white/80 p-2 rounded-lg border border-slate-100 text-[11px] text-slate-700 flex items-center gap-1.5">
                            <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
                            <span className="truncate">
                              <strong className="text-slate-900">[{spaceObs[0].author}]</strong>{' '}
                              {spaceObs[0].observation_text}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* 2단 인텔리전스 카드 모달 (상단: 팩트시트 + 하단: 크루 노하우) */}
      {/* ========================================================================= */}
      {activeSpace && (
        <Modal
          isOpen={Boolean(activeSpace)}
          onClose={() => setActiveSpace(null)}
          title="웨딩홀 2단 인텔리전스 카드"
        >
          <VenueIntelligenceCard
            space={activeSpace}
            venueName={getVenueNameOfSpace(activeSpace)}
            observations={observations.filter((o) => o.venue_space_id === activeSpace.id)}
            photographers={photographers}
            onRefresh={loadData}
          />
        </Modal>
      )}

      {/* 웨딩홀 추가 모달 */}
      <Modal
        isOpen={isVenueModalOpen}
        onClose={() => setIsVenueModalOpen(false)}
        title="새 웨딩홀(Venue) 등록"
      >
        <form onSubmit={handleAddVenue} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              웨딩홀 명칭 <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="예: 더채플앳논현"
              value={venueName}
              onChange={(e) => setVenueName(e.target.value)}
              className="w-full text-sm px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">주소</label>
            <input
              type="text"
              placeholder="예: 서울 강남구 논현로"
              value={venueAddress}
              onChange={(e) => setVenueAddress(e.target.value)}
              className="w-full text-sm px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">특이사항/메모</label>
            <input
              type="text"
              placeholder="예: 단독 건물 / 라포레홀 채광 우수"
              value={venueNotes}
              onChange={(e) => setVenueNotes(e.target.value)}
              className="w-full text-sm px-3 py-2 border rounded-lg"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsVenueModalOpen(false)}
              className="px-4 py-2 text-xs text-slate-600 bg-slate-100 rounded-lg"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
            >
              등록
            </button>
          </div>
        </form>
      </Modal>

      {/* 공간(홀) 추가 모달 (작가 필수 팩트시트 탑재) */}
      <Modal
        isOpen={isSpaceModalOpen}
        onClose={() => setIsSpaceModalOpen(false)}
        title="웨딩홀 내 공간(홀) 추가 및 팩트시트 등록"
      >
        <form onSubmit={handleAddSpace} className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                홀 이름 <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="예: 라포레홀"
                value={spaceName}
                onChange={(e) => setSpaceName(e.target.value)}
                className="w-full text-xs px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">층수</label>
              <input
                type="text"
                placeholder="예: 6층"
                value={spaceFloor}
                onChange={(e) => setSpaceFloor(e.target.value)}
                className="w-full text-xs px-3 py-2 border rounded-lg"
              />
            </div>
          </div>

          <div className="border-t border-slate-100 pt-2 space-y-2">
            <span className="text-[11px] font-bold text-indigo-700 block">
              💡 촬영 작가 필수 팩트 정보 (선택 입력):
            </span>

            <div>
              <label className="block text-xs text-slate-600 mb-1">조명 스타일</label>
              <input
                type="text"
                value={lightingType}
                onChange={(e) => setLightingType(e.target.value)}
                className="w-full text-xs px-3 py-1.5 border rounded-lg"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-slate-600 mb-1">천고 높이</label>
                <input
                  type="text"
                  value={ceilingHeight}
                  onChange={(e) => setCeilingHeight(e.target.value)}
                  className="w-full text-xs px-3 py-1.5 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">예식 간격</label>
                <input
                  type="text"
                  value={ceremonyInterval}
                  onChange={(e) => setCeremonyInterval(e.target.value)}
                  className="w-full text-xs px-3 py-1.5 border rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-600 mb-1">버진로드 및 단상</label>
              <input
                type="text"
                value={aisleInfo}
                onChange={(e) => setAisleInfo(e.target.value)}
                className="w-full text-xs px-3 py-1.5 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-600 mb-1">신부대기실 동선</label>
              <input
                type="text"
                value={bridalRoomFlow}
                onChange={(e) => setBridalRoomFlow(e.target.value)}
                className="w-full text-xs px-3 py-1.5 border rounded-lg"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsSpaceModalOpen(false)}
              className="px-3 py-1.5 text-xs text-slate-600 bg-slate-100 rounded-lg"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
            >
              홀 및 팩트 등록
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
