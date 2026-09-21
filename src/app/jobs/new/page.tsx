'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Check } from 'lucide-react';
import Link from 'next/link';
import { DataStore } from '@/lib/storage';
import { Venue, VenueSpace } from '@/types/database';
import { Modal } from '@/components/ui/Modal';

export default function NewJobPage() {
  const router = useRouter();

  const [venues, setVenues] = useState<Venue[]>([]);
  const [spaces, setSpaces] = useState<VenueSpace[]>([]);

  // 폼 입력 상태
  const [title, setTitle] = useState('');
  const [shootDate, setShootDate] = useState(new Date().toISOString().split('T')[0]);
  const [arrivalTime, setArrivalTime] = useState('12:30');
  const [ceremonyTime, setCeremonyTime] = useState('14:00');
  const [estimatedEndTime, setEstimatedEndTime] = useState('16:00');
  const [venueId, setVenueId] = useState('');
  const [venueSpaceId, setVenueSpaceId] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [notes, setNotes] = useState('');

  // 촬영 범위 체크박스
  const allScopes = ['신부대기실', '본식', '원판', '폐백', '기타(연출 등)'];
  const [selectedScopes, setSelectedScopes] = useState<string[]>(['신부대기실', '본식', '원판']);

  const [specialRequests, setSpecialRequests] = useState('');
  const [mustShootNotes, setMustShootNotes] = useState('');
  const [deliverableNotes, setDeliverableNotes] = useState('');

  // 베뉴 즉시 추가 모달 상태
  const [isVenueModalOpen, setIsVenueModalOpen] = useState(false);
  const [newVenueName, setNewVenueName] = useState('');
  const [newVenueAddress, setNewVenueAddress] = useState('');
  const [newSpaceName, setNewSpaceName] = useState('');
  const [newSpaceFloor, setNewSpaceFloor] = useState('');

  useEffect(() => {
    loadVenues();
  }, []);

  const loadVenues = () => {
    const vList = DataStore.getVenues();
    const sList = DataStore.getVenueSpaces();
    setVenues(vList);
    setSpaces(sList);
    if (vList.length > 0 && !venueId) {
      setVenueId(vList[0].id);
      const subSpaces = sList.filter((s) => s.venue_id === vList[0].id);
      if (subSpaces.length > 0) {
        setVenueSpaceId(subSpaces[0].id);
      }
    }
  };

  const handleVenueChange = (newVId: string) => {
    setVenueId(newVId);
    const subSpaces = spaces.filter((s) => s.venue_id === newVId);
    if (subSpaces.length > 0) {
      setVenueSpaceId(subSpaces[0].id);
    } else {
      setVenueSpaceId('');
    }
  };

  const toggleScope = (scope: string) => {
    if (selectedScopes.includes(scope)) {
      setSelectedScopes(selectedScopes.filter((s) => s !== scope));
    } else {
      setSelectedScopes([...selectedScopes, scope]);
    }
  };

  const handleQuickAddVenue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVenueName.trim() || !newSpaceName.trim()) {
      alert('웨딩홀명과 홀 이름은 필수입니다.');
      return;
    }

    const createdVenue = DataStore.addVenue({
      name: newVenueName.trim(),
      address: newVenueAddress.trim(),
    });

    const createdSpace = DataStore.addVenueSpace({
      venue_id: createdVenue.id,
      name: newSpaceName.trim(),
      floor: newSpaceFloor.trim(),
    });

    loadVenues();
    setVenueId(createdVenue.id);
    setVenueSpaceId(createdSpace.id);
    setIsVenueModalOpen(false);
    setNewVenueName('');
    setNewVenueAddress('');
    setNewSpaceName('');
    setNewSpaceFloor('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('촬영 식별명을 입력해주세요. (예: 김OO ♥ 박OO)');
      return;
    }

    const newJob = DataStore.createJob({
      title: title.trim(),
      shoot_date: shootDate,
      arrival_time: arrivalTime,
      ceremony_time: ceremonyTime,
      estimated_end_time: estimatedEndTime,
      venue_id: venueId || null,
      venue_space_id: venueSpaceId || null,
      client_name: clientName.trim() || null,
      client_phone: clientPhone.trim() || null,
      notes: notes.trim() || null,
      shoot_scope: selectedScopes,
      special_requests: specialRequests.trim() || null,
      must_shoot_notes: mustShootNotes.trim() || null,
      deliverable_notes: deliverableNotes.trim() || null,
      status: 'scheduled',
    });

    // 기본적으로 대표작가를 메인으로 자동 배정
    const photographers = DataStore.getPhotographers();
    const repPhotog = photographers.find((p) => p.name.includes('대표')) || photographers[0];
    if (repPhotog) {
      DataStore.addAssignment({
        job_id: newJob.id,
        photographer_id: repPhotog.id,
        role: 'main',
        participation_start: arrivalTime,
        participation_end: estimatedEndTime,
        assignment_status: 'accepted',
        agreed_fee: null,
        additional_fee: 0,
        notes: '대표 메인 촬영',
      });
    }

    router.push(`/jobs/${newJob.id}`);
  };

  const filteredSpaces = spaces.filter((s) => s.venue_id === venueId);

  return (
    <div className="space-y-5 pb-8">
      {/* 상단 내비 */}
      <div className="flex items-center gap-2">
        <Link
          href="/jobs"
          className="p-1.5 -ml-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-lg font-bold text-slate-900">새 본식 촬영 등록</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. 기본 정보 */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">
            기본 정보
          </h2>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              촬영 식별명 <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="예: 김민수 ♥ 박지은"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-sm px-3 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              기본 메모
            </label>
            <input
              type="text"
              placeholder="예: 신랑 측 하객 많음 / 2부 진행 예정"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                촬영 일자 <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={shootDate}
                onChange={(e) => setShootDate(e.target.value)}
                className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                예식 시작 시각 <span className="text-rose-500">*</span>
              </label>
              <input
                type="time"
                required
                value={ceremonyTime}
                onChange={(e) => setCeremonyTime(e.target.value)}
                className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                작가 도착 시각 <span className="text-rose-500">*</span>
              </label>
              <input
                type="time"
                required
                value={arrivalTime}
                onChange={(e) => setArrivalTime(e.target.value)}
                className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                예상 종료 시각
              </label>
              <input
                type="time"
                value={estimatedEndTime}
                onChange={(e) => setEstimatedEndTime(e.target.value)}
                className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* 2. 장소 (Venue & Space) */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h2 className="text-sm font-bold text-slate-800">웨딩홀 및 홀 선택</h2>
            <button
              type="button"
              onClick={() => setIsVenueModalOpen(true)}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              웨딩홀 새로 추가
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                웨딩홀 (Venue)
              </label>
              <select
                value={venueId}
                onChange={(e) => handleVenueChange(e.target.value)}
                className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {venues.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                홀 / 공간 (Space)
              </label>
              <select
                value={venueSpaceId}
                onChange={(e) => setVenueSpaceId(e.target.value)}
                className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {filteredSpaces.length === 0 ? (
                  <option value="">등록된 홀이 없습니다</option>
                ) : (
                  filteredSpaces.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} {s.floor ? `(${s.floor})` : ''}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>
        </div>

        {/* 3. 촬영 범위 (Scope) */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm space-y-3">
          <h2 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">
            촬영 범위
          </h2>
          <div className="flex flex-wrap gap-2 pt-1">
            {allScopes.map((scope) => {
              const isChecked = selectedScopes.includes(scope);
              return (
                <button
                  type="button"
                  key={scope}
                  onClick={() => toggleScope(scope)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition ${
                    isChecked
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded flex items-center justify-center border text-[10px] ${
                      isChecked
                        ? 'bg-indigo-600 border-indigo-600 text-white'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  {scope}
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. 핵심 요청사항 & 메모 */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">
            핵심 전달사항 및 주의사항
          </h2>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              특별 요청 (신랑신부 전달사항)
            </label>
            <textarea
              rows={2}
              placeholder="예: 신부 친할머니 대기실 가족사진 필수 촬영 요청"
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              반드시 놓치면 안 되는 사항
            </label>
            <textarea
              rows={2}
              placeholder="예: 플라워샤워 시 양가 부모님 환호 표정 필수 캐치"
              value={mustShootNotes}
              onChange={(e) => setMustShootNotes(e.target.value)}
              className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              필요한 결과물 메모
            </label>
            <input
              type="text"
              placeholder="예: 원본 전체 JPG + 대표 셀렉본 50장 우선 전달"
              value={deliverableNotes}
              onChange={(e) => setDeliverableNotes(e.target.value)}
              className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                고객명 / 혼주명
              </label>
              <input
                type="text"
                placeholder="예: 김민수 / 박지은"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">연락처</label>
              <input
                type="text"
                placeholder="010-0000-0000"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* 제출 버튼 */}
        <button
          type="submit"
          className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-bold rounded-xl shadow-md transition text-base"
        >
          본식 촬영 등록 완료
        </button>
      </form>

      {/* 웨딩홀 퀵 추가 모달 */}
      <Modal
        isOpen={isVenueModalOpen}
        onClose={() => setIsVenueModalOpen(false)}
        title="새 웨딩홀 및 홀 등록"
      >
        <form onSubmit={handleQuickAddVenue} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              웨딩홀 명칭 <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="예: 더채플앳논현"
              value={newVenueName}
              onChange={(e) => setNewVenueName(e.target.value)}
              className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">주소</label>
            <input
              type="text"
              placeholder="예: 서울 강남구 논현로"
              value={newVenueAddress}
              onChange={(e) => setNewVenueAddress(e.target.value)}
              className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                홀 이름 <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="예: 라포레홀"
                value={newSpaceName}
                onChange={(e) => setNewSpaceName(e.target.value)}
                className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">층수</label>
              <input
                type="text"
                placeholder="예: 6층"
                value={newSpaceFloor}
                onChange={(e) => setNewSpaceFloor(e.target.value)}
                className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsVenueModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
            >
              추가하고 선택
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
