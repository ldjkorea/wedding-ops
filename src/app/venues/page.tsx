'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Building2, MapPin, Layers } from 'lucide-react';
import { DataStore } from '@/lib/storage';
import { Venue, VenueSpace, HallObservation } from '@/types/database';
import { Modal } from '@/components/ui/Modal';

export default function VenuesPage() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [spaces, setSpaces] = useState<VenueSpace[]>([]);
  const [observations, setObservations] = useState<HallObservation[]>([]);

  const [isVenueModalOpen, setIsVenueModalOpen] = useState(false);
  const [isSpaceModalOpen, setIsSpaceModalOpen] = useState(false);
  const [selectedVenueId, setSelectedVenueId] = useState<string | null>(null);

  const [venueName, setVenueName] = useState('');
  const [venueAddress, setVenueAddress] = useState('');
  const [venueNotes, setVenueNotes] = useState('');

  const [spaceName, setSpaceName] = useState('');
  const [spaceFloor, setSpaceFloor] = useState('');
  const [spaceNotes, setSpaceNotes] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setVenues(DataStore.getVenues());
    setSpaces(DataStore.getVenueSpaces());
    setObservations(DataStore.getHallObservations());
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
    });
    setIsSpaceModalOpen(false);
    setSpaceName('');
    setSpaceFloor('');
    setSpaceNotes('');
    loadData();
  };

  return (
    <div className="space-y-4 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">웨딩홀 및 홀 관리</h1>
          <p className="text-xs text-slate-500">베뉴 공간 구조 및 현장 관찰 데이터</p>
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
              className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm space-y-3"
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
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2 py-1 rounded-md"
                >
                  + 홀(Space) 추가
                </button>
              </div>

              {/* 하위 홀 목록 */}
              <div className="space-y-2 pt-1">
                <span className="text-[11px] font-bold text-slate-500 block">
                  등록된 홀 ({venueSpaces.length}개):
                </span>
                {venueSpaces.length === 0 ? (
                  <p className="text-xs text-slate-400 py-1">등록된 홀이 없습니다.</p>
                ) : (
                  venueSpaces.map((s) => {
                    const spaceObs = observations.filter((o) => o.venue_space_id === s.id);

                    return (
                      <div
                        key={s.id}
                        className="bg-slate-50 border border-slate-200/80 rounded-lg p-2.5 space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <Layers className="w-3.5 h-3.5 text-slate-500" />
                            <span className="text-xs font-bold text-slate-800">{s.name}</span>
                            {s.floor && (
                              <span className="text-[10px] text-slate-500 bg-slate-200/70 px-1.5 py-0.5 rounded">
                                {s.floor}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-indigo-600 font-medium">
                            관찰 기록 {spaceObs.length}건
                          </span>
                        </div>
                        {s.notes && <p className="text-[11px] text-slate-500">{s.notes}</p>}

                        {/* 관찰 기록 요약 */}
                        {spaceObs.length > 0 && (
                          <div className="pt-1 border-t border-slate-200/60 space-y-1">
                            {spaceObs.map((obs) => (
                              <div
                                key={obs.id}
                                className="text-[11px] text-slate-700 bg-white/80 p-1.5 rounded border border-slate-100 flex items-start gap-1"
                              >
                                <span className="font-bold shrink-0 text-indigo-700">
                                  {obs.category === 'must_caution' ? '⚠️ 주의:' : '💡 팁:'}
                                </span>
                                <span className="line-clamp-2">{obs.observation_text}</span>
                              </div>
                            ))}
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
              placeholder="예: 아펠가모 반포"
              value={venueName}
              onChange={(e) => setVenueName(e.target.value)}
              className="w-full text-sm px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">주소</label>
            <input
              type="text"
              placeholder="예: 서울 서초구 반포대로"
              value={venueAddress}
              onChange={(e) => setVenueAddress(e.target.value)}
              className="w-full text-sm px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">특이사항/메모</label>
            <input
              type="text"
              placeholder="예: 지하철역 직결 / 주차 혼잡"
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

      {/* 공간(홀) 추가 모달 */}
      <Modal
        isOpen={isSpaceModalOpen}
        onClose={() => setIsSpaceModalOpen(false)}
        title="웨딩홀 내 공간(홀) 추가"
      >
        <form onSubmit={handleAddSpace} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              홀 이름 <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="예: 그랜드볼룸"
              value={spaceName}
              onChange={(e) => setSpaceName(e.target.value)}
              className="w-full text-sm px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">층수</label>
            <input
              type="text"
              placeholder="예: 2층"
              value={spaceFloor}
              onChange={(e) => setSpaceFloor(e.target.value)}
              className="w-full text-sm px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">홀 메모</label>
            <input
              type="text"
              placeholder="예: 어두운 홀 / 핀조명 강함"
              value={spaceNotes}
              onChange={(e) => setSpaceNotes(e.target.value)}
              className="w-full text-sm px-3 py-2 border rounded-lg"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsSpaceModalOpen(false)}
              className="px-4 py-2 text-xs text-slate-600 bg-slate-100 rounded-lg"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
            >
              홀 추가
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
