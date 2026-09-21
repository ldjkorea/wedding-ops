'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  Building2,
  MapPin,
  Layers,
  ChevronRight,
  Sparkles,
  Search,
  Filter,
  RefreshCw,
} from 'lucide-react';
import { DataStore } from '@/lib/storage';
import { Venue, VenueSpace, HallObservation, Photographer } from '@/types/database';
import { Modal } from '@/components/ui/Modal';
import { VenueIntelligenceCard } from '@/components/venue/VenueIntelligenceCard';

export default function VenuesPage() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [spaces, setSpaces] = useState<VenueSpace[]>([]);
  const [observations, setObservations] = useState<HallObservation[]>([]);
  const [photographers, setPhotographers] = useState<Photographer[]>([]);

  // 검색 및 필터 상태
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedStyle, setSelectedStyle] = useState('all');

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

    if (activeSpace) {
      const refreshed = sList.find((s) => s.id === activeSpace.id);
      if (refreshed) setActiveSpace(refreshed);
    }
  };

  const handleResetToSeed = () => {
    if (confirm('서울 주요 20개 웨딩홀 최신 팩트시트 및 디어메모리 크루 노트 DB로 다시 동기화하시겠습니까?')) {
      DataStore.resetToSeedData();
      loadData();
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

  // 필터링 로직
  const filteredVenues = useMemo(() => {
    return venues.filter((v) => {
      // 1. 검색어 필터 (웨딩홀 이름, 주소, 또는 하위 홀 이름)
      const vSpaces = spaces.filter((s) => s.venue_id === v.id);
      const matchesSearch =
        searchTerm.trim() === '' ||
        v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (v.address && v.address.toLowerCase().includes(searchTerm.toLowerCase())) ||
        vSpaces.some((s) => s.name.toLowerCase().includes(searchTerm.toLowerCase()));

      if (!matchesSearch) return false;

      // 2. 지역 필터
      if (selectedRegion !== 'all') {
        const addr = v.address || '';
        if (selectedRegion === 'gangnam' && !(addr.includes('강남') || addr.includes('서초'))) {
          return false;
        }
        if (selectedRegion === 'songpa' && !(addr.includes('송파') || addr.includes('강동'))) {
          return false;
        }
        if (selectedRegion === 'yeouido' && !(addr.includes('영등포') || addr.includes('여의도') || addr.includes('마포'))) {
          return false;
        }
        if (selectedRegion === 'central' && !(addr.includes('중구') || addr.includes('종로') || addr.includes('용산'))) {
          return false;
        }
      }

      // 3. 홀 스타일 필터
      if (selectedStyle !== 'all') {
        const matchesStyle = vSpaces.some((s) => {
          const lt = (s.lighting_type || '') + (s.notes || '') + (v.notes || '');
          if (selectedStyle === 'hotel') return lt.includes('호텔');
          if (selectedStyle === 'chapel') return lt.includes('채플');
          if (selectedStyle === 'house') return lt.includes('하우스') || lt.includes('가든') || lt.includes('자연광') || lt.includes('온실');
          if (selectedStyle === 'convention') return lt.includes('컨벤션') || lt.includes('그랜드');
          return true;
        });
        if (!matchesStyle) return false;
      }

      return true;
    });
  }, [venues, spaces, searchTerm, selectedRegion, selectedStyle]);

  return (
    <div className="space-y-4 pb-12">
      {/* 상단 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">웨딩홀 인텔리전스</h1>
          <p className="text-xs text-indigo-700 font-medium mt-0.5">
            서울 주요 베뉴 최신 팩트시트 & 디어메모리 크루 현장 기록
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleResetToSeed}
            title="최신 DB 재동기화"
            className="p-2 text-slate-500 hover:text-slate-800 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setIsVenueModalOpen(true)}
            className="inline-flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3 py-2 rounded-lg shadow-sm transition"
          >
            <Plus className="w-3.5 h-3.5" />
            웨딩홀 추가
          </button>
        </div>
      </div>

      {/* 요약 통계 배너 */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-900 rounded-2xl p-4 text-white shadow-sm flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-indigo-500/30 text-indigo-200 text-[10px] font-bold px-2 py-0.5 rounded border border-indigo-400/30">
              실전 작가 전용 DB
            </span>
            <span className="text-[11px] text-slate-300">한민규 대표 & 크루 검증</span>
          </div>
          <h3 className="text-sm font-bold mt-1 text-white">
            서울 핵심 웨딩홀 {venues.length}개소 · 총 {spaces.length}개 홀 완비
          </h3>
          <p className="text-[11px] text-indigo-200/80 mt-0.5">
            홀을 클릭하면 상단 팩트시트(조명/천고/버진로드)와 하단 크루 노하우가 표시됩니다.
          </p>
        </div>
        <div className="text-right shrink-0 pl-2">
          <span className="text-2xl font-black text-indigo-300">{observations.length}</span>
          <span className="text-xs text-indigo-200 block font-medium">크루 꿀팁 노트</span>
        </div>
      </div>

      {/* 검색창 및 필터 바 */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200/90 shadow-sm space-y-2.5">
        {/* 실시간 검색창 */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="웨딩홀명, 홀 이름, 지역(강남, 선릉, 논현 등) 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition"
          />
        </div>

        {/* 지역 필터 칩 */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px]">
          <span className="text-slate-400 font-bold shrink-0 mr-1 flex items-center gap-0.5">
            <MapPin className="w-3 h-3" /> 지역:
          </span>
          {[
            { id: 'all', label: '전체 서울' },
            { id: 'gangnam', label: '강남·서초' },
            { id: 'songpa', label: '송파·강동' },
            { id: 'yeouido', label: '영등포·여의도' },
            { id: 'central', label: '중구·종로' },
          ].map((reg) => (
            <button
              key={reg.id}
              onClick={() => setSelectedRegion(reg.id)}
              className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition ${
                selectedRegion === reg.id
                  ? 'bg-indigo-600 text-white font-bold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {reg.label}
            </button>
          ))}
        </div>

        {/* 스타일 필터 칩 */}
        <div className="flex items-center gap-1 overflow-x-auto pb-0.5 text-[11px]">
          <span className="text-slate-400 font-bold shrink-0 mr-1 flex items-center gap-0.5">
            <Filter className="w-3 h-3" /> 스타일:
          </span>
          {[
            { id: 'all', label: '전체 스타일' },
            { id: 'hotel', label: '호텔 예식' },
            { id: 'chapel', label: '채플형' },
            { id: 'house', label: '하우스·자연광' },
            { id: 'convention', label: '대형 컨벤션' },
          ].map((sty) => (
            <button
              key={sty.id}
              onClick={() => setSelectedStyle(sty.id)}
              className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition ${
                selectedStyle === sty.id
                  ? 'bg-slate-900 text-white font-bold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {sty.label}
            </button>
          ))}
        </div>
      </div>

      {/* 웨딩홀 목록 */}
      <div className="space-y-3">
        {filteredVenues.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center text-slate-400 text-xs border border-slate-200">
            검색 결과와 일치하는 웨딩홀이 없습니다.
          </div>
        ) : (
          filteredVenues.map((v) => {
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
                    {v.notes && (
                      <p className="text-[11px] text-indigo-900 font-medium mt-1 bg-indigo-50/60 px-2 py-0.5 rounded inline-block">
                        {v.notes}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setSelectedVenueId(v.id);
                      setIsSpaceModalOpen(true);
                    }}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2.5 py-1.5 rounded-lg shrink-0 ml-2"
                  >
                    + 홀 추가
                  </button>
                </div>

                {/* 하위 홀 목록 */}
                <div className="space-y-2 pt-1 border-t border-slate-100">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-bold">
                    <span>소속 홀 ({venueSpaces.length}개)</span>
                    <span className="text-indigo-600 font-medium">카드를 누르면 2단 인텔리전스가 열립니다</span>
                  </div>

                  {venueSpaces.length === 0 ? (
                    <p className="text-xs text-slate-400 py-1">등록된 홀이 없습니다.</p>
                  ) : (
                    venueSpaces.map((s) => {
                      const spaceObs = observations.filter((o) => o.venue_space_id === s.id);

                      return (
                        <div
                          key={s.id}
                          onClick={() => setActiveSpace(s)}
                          className="bg-slate-50/90 hover:bg-indigo-50/60 border border-slate-200/90 hover:border-indigo-300 rounded-xl p-3 space-y-2 transition cursor-pointer group shadow-sm active:scale-[0.99]"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
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
                                  <span className="font-medium text-slate-700">{s.lighting_type || '밝은 채플형'}</span>
                                  <span>·</span>
                                  <span>천고 {s.ceiling_height || '7m'}</span>
                                  <span>·</span>
                                  <span>버진로드 {s.aisle_info || '25m'}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 text-xs font-bold text-indigo-600 shrink-0">
                              <span className="bg-indigo-100/70 px-2 py-0.5 rounded-full text-[11px]">
                                크루 노트 {spaceObs.length}건
                              </span>
                              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition" />
                            </div>
                          </div>

                          {/* 최근 크루 관찰 한 줄 미리보기 */}
                          {spaceObs.length > 0 && (
                            <div className="bg-white p-2 rounded-lg border border-slate-200/70 text-[11px] text-slate-700 flex items-center gap-1.5 shadow-2xs">
                              <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
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
          })
        )}
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
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              웨딩홀 위치/주소
            </label>
            <input
              type="text"
              placeholder="예: 서울 강남구 논현로 549"
              value={venueAddress}
              onChange={(e) => setVenueAddress(e.target.value)}
              className="w-full text-sm px-3 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              기본 메모/특징
            </label>
            <textarea
              rows={2}
              placeholder="예: 도심 속 가든 채플, 천고 10m 초록 숲속 컨셉"
              value={venueNotes}
              onChange={(e) => setVenueNotes(e.target.value)}
              className="w-full text-sm px-3 py-2 border rounded-lg"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsVenueModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition"
            >
              웨딩홀 저장
            </button>
          </div>
        </form>
      </Modal>

      {/* 홀(Space) 추가 모달 */}
      <Modal
        isOpen={isSpaceModalOpen}
        onClose={() => setIsSpaceModalOpen(false)}
        title="세부 홀(Space) 및 작가 팩트시트 등록"
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

          <div className="bg-indigo-50/50 p-3 rounded-xl border border-indigo-100 space-y-2.5">
            <span className="text-[11px] font-bold text-indigo-900 block flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-indigo-600" /> 작가 필수 팩트시트
            </span>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                  조명 스타일
                </label>
                <input
                  type="text"
                  placeholder="예: 밝은 채플형 / 어두운 호텔형"
                  value={lightingType}
                  onChange={(e) => setLightingType(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 border rounded-lg bg-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-0.5">천고 높이</label>
                <input
                  type="text"
                  placeholder="예: 10m (높음)"
                  value={ceilingHeight}
                  onChange={(e) => setCeilingHeight(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 border rounded-lg bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                  버진로드 & 단상
                </label>
                <input
                  type="text"
                  placeholder="예: 25m (단상 1단)"
                  value={aisleInfo}
                  onChange={(e) => setAisleInfo(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 border rounded-lg bg-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-0.5">예식 간격</label>
                <input
                  type="text"
                  placeholder="예: 90분"
                  value={ceremonyInterval}
                  onChange={(e) => setCeremonyInterval(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 border rounded-lg bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                신부대기실 동선
              </label>
              <input
                type="text"
                placeholder="예: 홀 바로 뒤 정원 통로 연결"
                value={bridalRoomFlow}
                onChange={(e) => setBridalRoomFlow(e.target.value)}
                className="w-full text-xs px-2.5 py-1.5 border rounded-lg bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">기타 메모</label>
            <input
              type="text"
              placeholder="예: 하객석 통로 좁음"
              value={spaceNotes}
              onChange={(e) => setSpaceNotes(e.target.value)}
              className="w-full text-xs px-3 py-2 border rounded-lg"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsSpaceModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition"
            >
              홀 등록
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
