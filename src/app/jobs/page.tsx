'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, MapPin, Clock, Users, ChevronRight } from 'lucide-react';
import { DataStore } from '@/lib/storage';
import { Badge } from '@/components/ui/Badge';
import { Job, Venue, VenueSpace, Assignment, Photographer } from '@/types/database';

export default function JobsListPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [spaces, setSpaces] = useState<VenueSpace[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [photographers, setPhotographers] = useState<Photographer[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    setJobs(DataStore.getJobs());
    setVenues(DataStore.getVenues());
    setSpaces(DataStore.getVenueSpaces());
    const state = DataStore.getState();
    setAssignments(state.assignments);
    setPhotographers(state.photographers);
  }, []);

  const getVenueDisplay = (venueId?: string | null, spaceId?: string | null) => {
    const v = venues.find((item) => item.id === venueId);
    const s = spaces.find((item) => item.id === spaceId);
    if (!v) return '장소 미정';
    return `${v.name} ${s ? `· ${s.name}${s.floor ? ` (${s.floor})` : ''}` : ''}`;
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

  const filteredJobs = jobs.filter((j) => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'active') return j.status === 'scheduled' || j.status === 'in_progress' || j.status === 'shoot_completed';
    if (filterStatus === 'completed') return j.status === 'completed';
    if (filterStatus === 'cancelled') return j.status === 'cancelled';
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">본식 촬영 관리</h1>
        <Link
          href="/jobs/new"
          className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3 py-2 rounded-lg shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          촬영 등록
        </Link>
      </div>

      {/* 상태 필터 탭 */}
      <div className="flex gap-1.5 p-1 bg-slate-200/70 rounded-xl text-xs font-medium">
        {[
          { id: 'all', label: `전체 (${jobs.length})` },
          {
            id: 'active',
            label: `진행/예정 (${jobs.filter((j) => j.status !== 'completed' && j.status !== 'cancelled').length})`,
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
      <div className="space-y-3">
        {filteredJobs.length === 0 ? (
          <div className="bg-white rounded-xl p-8 border border-slate-200 text-center text-slate-500 text-sm">
            해당하는 본식 촬영 일정이 없습니다.
          </div>
        ) : (
          filteredJobs.map((job) => (
            <Link
              key={job.id}
              href={`/jobs/${job.id}`}
              className="block bg-white rounded-xl p-4 border border-slate-200 shadow-sm hover:border-indigo-400 hover:shadow-md transition active:scale-[0.99]"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                  {job.shoot_date}
                </span>
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
                    ? '완료'
                    : job.status === 'cancelled'
                    ? '취소'
                    : '진행중'}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 mb-1">{job.title}</h3>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>

              <div className="space-y-1 text-xs text-slate-600 mt-2">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{getVenueDisplay(job.venue_id, job.venue_space_id)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>
                    예식 <strong className="text-slate-800">{job.ceremony_time}</strong> (도착{' '}
                    {job.arrival_time} ~ 종료 {job.estimated_end_time || '16:00'})
                  </span>
                </div>
                <div className="flex items-center gap-1.5 pt-1 text-slate-700">
                  <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>배정: <strong className="text-indigo-900">{getAssignedNames(job.id)}</strong></span>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
