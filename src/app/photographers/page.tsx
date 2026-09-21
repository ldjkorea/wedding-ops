'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Phone } from 'lucide-react';
import { DataStore } from '@/lib/storage';
import { Photographer } from '@/types/database';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';

export default function PhotographersPage() {
  const [photographers, setPhotographers] = useState<Photographer[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setPhotographers(DataStore.getAllPhotographers());
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    DataStore.addPhotographer({
      name: name.trim(),
      phone: phone.trim() || '010-0000-0000',
      notes: notes.trim() || null,
      linked_user_id: null,
      is_active: true,
    });

    setIsModalOpen(false);
    setName('');
    setPhone('');
    setNotes('');
    loadData();
  };

  const handleToggleActive = (id: string, current: boolean) => {
    DataStore.updatePhotographer(id, { is_active: !current });
    loadData();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">작가 관리</h1>
          <p className="text-xs text-indigo-700 font-medium">
            디어메모리 크루 (한민규 대표 외 팀/외주 작가진)
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3 py-2 rounded-lg shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          작가 등록
        </button>
      </div>

      <div className="space-y-3">
        {photographers.map((p) => (
          <div
            key={p.id}
            className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-slate-900">{p.name}</span>
                <Badge variant={p.is_active ? 'success' : 'neutral'}>
                  {p.is_active ? '활동중' : '비활성'}
                </Badge>
                {p.name.includes('대표') && (
                  <span className="text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-200 px-1.5 py-0.5 rounded font-bold">
                    대표작가
                  </span>
                )}
              </div>
              <button
                onClick={() => handleToggleActive(p.id, p.is_active)}
                className="text-xs text-slate-500 hover:text-slate-800"
              >
                {p.is_active ? '비활성화' : '활성화'}
              </button>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>{p.phone}</span>
            </div>

            {p.notes && (
              <p className="text-xs text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100">
                {p.notes}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* 작가 등록 모달 */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="새 작가 등록">
        <form onSubmit={handleAdd} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              작가 이름 <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="예: 김성민"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-sm px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">연락처</label>
            <input
              type="tel"
              placeholder="010-0000-0000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full text-sm px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">기본 메모</label>
            <textarea
              rows={2}
              placeholder="예: 서브스냅 주력 / 소니 바디 사용"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-sm px-3 py-2 border rounded-lg"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
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
    </div>
  );
}
