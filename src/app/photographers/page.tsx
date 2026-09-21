'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Phone, Edit3, UserCheck, UserX, Check, AlertCircle } from 'lucide-react';
import { DataStore } from '@/lib/storage';
import { Photographer } from '@/types/database';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';

export default function PhotographersPage() {
  const [photographers, setPhotographers] = useState<Photographer[]>([]);
  const [filterTab, setFilterTab] = useState<'all' | 'active' | 'inactive'>('all');

  // 등록 모달 상태
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [isActiveNew, setIsActiveNew] = useState(true);

  // 수정 모달 상태
  const [editingPhotographer, setEditingPhotographer] = useState<Photographer | null>(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editIsActive, setEditIsActive] = useState(true);

  // 피드백 알림 상태
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setPhotographers(DataStore.getAllPhotographers());
  };

  const showFeedback = (msg: string) => {
    setFeedbackMessage(msg);
    setErrorMessage(null);
    setTimeout(() => setFeedbackMessage(null), 3000);
  };

  const showError = (err: string) => {
    setErrorMessage(err);
    setTimeout(() => setErrorMessage(null), 4000);
  };

  // 작가 신규 등록
  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showError('작가 이름은 필수입니다.');
      return;
    }

    try {
      const created = DataStore.addPhotographer({
        name: name.trim(),
        phone: phone.trim() || null,
        notes: notes.trim() || null,
        is_active: isActiveNew,
        linked_user_id: null,
      });

      setIsAddModalOpen(false);
      setName('');
      setPhone('');
      setNotes('');
      setIsActiveNew(true);
      loadData();
      showFeedback(`작가 '${created.name}'님이 등록되었습니다.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '작가 등록에 실패했습니다.';
      showError(msg);
    }
  };

  // 수정 모달 열기
  const handleOpenEdit = (p: Photographer) => {
    setEditingPhotographer(p);
    setEditName(p.name);
    setEditPhone(p.phone || '');
    setEditNotes(p.notes || '');
    setEditIsActive(p.is_active);
  };

  // 수정 저장
  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPhotographer) return;
    if (!editName.trim()) {
      showError('작가 이름은 필수 입력 항목입니다.');
      return;
    }

    try {
      const updated = DataStore.updatePhotographer(editingPhotographer.id, {
        name: editName.trim(),
        phone: editPhone.trim() || null,
        notes: editNotes.trim() || null,
        is_active: editIsActive,
      });

      setEditingPhotographer(null);
      loadData();
      showFeedback(`작가 '${updated.name}'님의 정보가 성공적으로 수정되었습니다.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '작가 수정에 실패했습니다.';
      showError(msg);
    }
  };

  // 활성/비활성화 원클릭 토글
  const handleToggleActive = (p: Photographer) => {
    try {
      const targetState = !p.is_active;
      DataStore.updatePhotographer(p.id, { is_active: targetState });
      loadData();
      showFeedback(
        `'${p.name}' 작가가 ${targetState ? '활동중' : '비활성'} 상태로 변경되었습니다.`
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '상태 변경에 실패했습니다.';
      showError(msg);
    }
  };

  // 필터링 목록 계산
  const filteredPhotographers = useMemo(() => {
    return photographers.filter((p) => {
      if (filterTab === 'active') return p.is_active;
      if (filterTab === 'inactive') return !p.is_active;
      return true;
    });
  }, [photographers, filterTab]);

  const activeCount = photographers.filter((p) => p.is_active).length;
  const inactiveCount = photographers.length - activeCount;

  return (
    <div className="space-y-4 pb-12">
      {/* 상단 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">작가 관리</h1>
          <p className="text-xs text-indigo-700 font-medium mt-0.5">
            디어메모리 크루 (한민규 대표 외 팀/외주 작가진)
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3 py-2 rounded-lg shadow-sm transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          작가 등록
        </button>
      </div>

      {/* 알림 배너 */}
      {feedbackMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-2 animate-fadeIn">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedbackMessage}</span>
        </div>
      )}
      {errorMessage && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-2 animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* 상태 필터 탭 */}
      <div className="flex items-center gap-1 bg-slate-200/70 p-1 rounded-xl text-xs">
        <button
          onClick={() => setFilterTab('all')}
          className={`flex-1 py-1.5 rounded-lg font-medium transition ${
            filterTab === 'all'
              ? 'bg-white text-slate-900 font-bold shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          전체 ({photographers.length})
        </button>
        <button
          onClick={() => setFilterTab('active')}
          className={`flex-1 py-1.5 rounded-lg font-medium transition ${
            filterTab === 'active'
              ? 'bg-white text-indigo-700 font-bold shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          활동중 ({activeCount})
        </button>
        <button
          onClick={() => setFilterTab('inactive')}
          className={`flex-1 py-1.5 rounded-lg font-medium transition ${
            filterTab === 'inactive'
              ? 'bg-white text-slate-700 font-bold shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          비활성 ({inactiveCount})
        </button>
      </div>

      {/* 작가 목록 리스트 */}
      <div className="space-y-3">
        {filteredPhotographers.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center text-slate-400 text-xs border border-slate-200">
            해당 상태의 작가가 없습니다.
          </div>
        ) : (
          filteredPhotographers.map((p) => {
            const isRep = p.name.includes('대표');

            return (
              <div
                key={p.id}
                className={`bg-white rounded-2xl p-4 border shadow-xs space-y-3 transition ${
                  p.is_active
                    ? 'border-slate-200 hover:border-indigo-200'
                    : 'border-slate-200/70 bg-slate-50/50 opacity-80'
                }`}
              >
                {/* 상단 이름 및 상태 배지 */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold text-slate-900">{p.name}</span>
                      {isRep && (
                        <span className="text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-200/80 px-2 py-0.5 rounded-full font-bold">
                          대표작가
                        </span>
                      )}
                      <Badge variant={p.is_active ? 'success' : 'neutral'}>
                        {p.is_active ? '활동중' : '비활성'}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-1">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-medium">
                        {p.phone || <span className="text-slate-400">연락처 미등록</span>}
                      </span>
                    </div>
                  </div>

                  {/* 액션 버튼 그룹 (수정 / 비활성화) */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleOpenEdit(p)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1.5 rounded-lg transition active:scale-95"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      수정
                    </button>

                    <button
                      onClick={() => handleToggleActive(p)}
                      title={p.is_active ? '비활성화 시 신규 배정에서 제외됩니다' : '다시 활성화'}
                      className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg border transition active:scale-95 ${
                        p.is_active
                          ? 'text-slate-600 hover:text-rose-700 bg-slate-50 hover:bg-rose-50 border-slate-200 hover:border-rose-200'
                          : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-200'
                      }`}
                    >
                      {p.is_active ? (
                        <>
                          <UserX className="w-3.5 h-3.5 text-slate-400" />
                          비활성화
                        </>
                      ) : (
                        <>
                          <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                          활성화
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* 간단 메모 */}
                {p.notes ? (
                  <div className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100 leading-relaxed">
                    {p.notes}
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-400 italic">등록된 메모 없음</p>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* ========================================================================= */}
      {/* 작가 등록 모달 */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="새 작가 등록"
      >
        <form onSubmit={handleAdd} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              작가 이름 <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="예: 김준호"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-sm px-3 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              연락처 (선택)
            </label>
            <input
              type="tel"
              placeholder="예: 010-1234-5678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full text-sm px-3 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              기본 메모 (선택)
            </label>
            <textarea
              rows={2}
              placeholder="예: 서브스냅 주력 / 소니 A7M4 / 기동성 우수"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-sm px-3 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="newIsActive"
              checked={isActiveNew}
              onChange={(e) => setIsActiveNew(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500"
            />
            <label htmlFor="newIsActive" className="text-xs font-medium text-slate-700 cursor-pointer">
              활동중 (즉시 신규 본식 촬영 배정 가능)
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition"
            >
              등록하기
            </button>
          </div>
        </form>
      </Modal>

      {/* ========================================================================= */}
      {/* 작가 정보 수정 모달 */}
      {/* ========================================================================= */}
      {editingPhotographer && (
        <Modal
          isOpen={Boolean(editingPhotographer)}
          onClose={() => setEditingPhotographer(null)}
          title={`작가 정보 수정 (${editingPhotographer.name})`}
        >
          <form onSubmit={handleUpdate} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                작가 이름 <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full text-sm px-3 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                연락처
              </label>
              <input
                type="tel"
                placeholder="예: 010-1234-5678"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                className="w-full text-sm px-3 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                기본 메모
              </label>
              <textarea
                rows={3}
                placeholder="예: 장비 정보, 주력 포지션, 정산 특이사항 등"
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                className="w-full text-sm px-3 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center gap-2 pt-1 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <input
                type="checkbox"
                id="editIsActive"
                checked={editIsActive}
                onChange={(e) => setEditIsActive(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500"
              />
              <label htmlFor="editIsActive" className="text-xs font-medium text-slate-800 cursor-pointer">
                <strong>활동 상태 유지</strong> (체크 해제 시 비활성화되어 신규 배정에서 숨겨집니다)
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingPhotographer(null)}
                className="px-4 py-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
              >
                취소
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition"
              >
                수정 저장
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
