import {
  Workspace,
  Photographer,
  Venue,
  VenueSpace,
  Job,
  Assignment,
  JobPackVersion,
  ChangeEvent,
  Handover,
  Settlement,
  PaymentEntry,
  Delivery,
  HallObservation,
  JobDisplayStatus,
  ConflictWarning,
  DashboardActionItem,
} from '@/types/database';

export const WORKSPACE_ID = '11111111-1111-1111-1111-111111111111';

// 초기 시드 데이터 정의
const INITIAL_WORKSPACE: Workspace = {
  id: WORKSPACE_ID,
  name: '디어메모리 (Dear Memory)',
  created_at: new Date('2026-09-01').toISOString(),
  updated_at: new Date('2026-09-01').toISOString(),
};

const INITIAL_PHOTOGRAPHERS: Photographer[] = [
  {
    id: '22222222-2222-2222-2222-222222222201',
    workspace_id: WORKSPACE_ID,
    name: '한민규 (대표)',
    phone: '010-1234-5678',
    notes: '디어메모리 대표 / 1인 메인 스냅 디렉팅',
    is_active: true,
    created_at: new Date('2026-09-01').toISOString(),
    updated_at: new Date('2026-09-01').toISOString(),
  },
  {
    id: '22222222-2222-2222-2222-222222222202',
    workspace_id: WORKSPACE_ID,
    name: '준호',
    phone: '010-9876-5432',
    notes: '디어메모리 크루 / 서브 스냅 전문 / 기동성 우수 / Sony A7M4',
    is_active: true,
    created_at: new Date('2026-09-01').toISOString(),
    updated_at: new Date('2026-09-01').toISOString(),
  },
  {
    id: '22222222-2222-2222-2222-222222222203',
    workspace_id: WORKSPACE_ID,
    name: '성민',
    phone: '010-5555-4444',
    notes: '디어메모리 크루 / 원판 및 정자세 연출 안정적 / 주말 고정 가능',
    is_active: true,
    created_at: new Date('2026-09-01').toISOString(),
    updated_at: new Date('2026-09-01').toISOString(),
  },
];

import {
  INITIAL_VENUES,
  INITIAL_VENUE_SPACES,
  INITIAL_HALL_OBSERVATIONS,
} from '@/lib/venueData';


const INITIAL_JOB: Job = {
  id: '66666666-6666-6666-6666-666666666601',
  workspace_id: WORKSPACE_ID,
  title: '김민수 ♥ 박지은',
  shoot_date: '2026-09-26',
  arrival_time: '12:30',
  ceremony_time: '14:00',
  estimated_end_time: '16:00',
  venue_id: '33333333-3333-3333-3333-333333333301',
  venue_space_id: '44444444-4444-4444-4444-444444444401',
  client_name: '김민수 / 박지은',
  client_phone: '010-1111-2222',
  notes: '신랑 측 하객 많음. 식장 내 포토월 별도 설치 예정.',
  shoot_scope: ['신부대기실', '본식', '원판'],
  special_requests: '신부 친할머니 거동이 불편하시니 대기실에서 가족 원판 사전 촬영 요청',
  must_shoot_notes: '플라워샤워 시 양가 부모님 환호 표정 및 축가 하객 반응 필수 캐치',
  deliverable_notes: '원본 전체 JPG + 대표 셀렉본 50장 우선 전달',
  required_photographer_count: 2,
  status: 'scheduled',
  created_at: new Date('2026-09-18T10:00:00Z').toISOString(),
  updated_at: new Date('2026-09-18T10:00:00Z').toISOString(),
};

const INITIAL_ASSIGNMENTS: Assignment[] = [
  {
    id: '77777777-7777-7777-7777-777777777701',
    workspace_id: WORKSPACE_ID,
    job_id: '66666666-6666-6666-6666-666666666601',
    photographer_id: '22222222-2222-2222-2222-222222222201', // 민규
    role: 'main',
    participation_start: '12:30',
    participation_end: '16:00',
    assignment_status: 'accepted',
    agreed_fee: null,
    additional_fee: 0,
    notes: '대표 메인 촬영 및 신부 연출 리드',
    created_at: new Date('2026-09-18T10:05:00Z').toISOString(),
    updated_at: new Date('2026-09-18T10:05:00Z').toISOString(),
  },
  {
    id: '77777777-7777-7777-7777-777777777702',
    workspace_id: WORKSPACE_ID,
    job_id: '66666666-6666-6666-6666-666666666601',
    photographer_id: '22222222-2222-2222-2222-222222222202', // 준호
    role: 'sub',
    participation_start: '12:30',
    participation_end: '16:00',
    assignment_status: 'proposed',
    agreed_fee: 200000,
    additional_fee: 30000,
    notes: '서브스냅 및 신랑 대기 / 부모님 표정 집중 포착',
    created_at: new Date('2026-09-18T10:05:00Z').toISOString(),
    updated_at: new Date('2026-09-18T10:05:00Z').toISOString(),
  },
];

const INITIAL_HANDOVERS: Handover[] = [
  {
    id: '88888888-8888-8888-8888-888888888801',
    workspace_id: WORKSPACE_ID,
    assignment_id: '77777777-7777-7777-7777-777777777702', // 준호
    due_at: '2026-09-27T20:00:00+09:00',
    status: 'pending',
    notes: '촬영 다음 날 20시까지 구글 드라이브 업로드',
    created_at: new Date('2026-09-18T10:06:00Z').toISOString(),
    updated_at: new Date('2026-09-18T10:06:00Z').toISOString(),
  },
];

const INITIAL_SETTLEMENTS: Settlement[] = [
  {
    id: '99999999-9999-9999-9999-999999999901',
    workspace_id: WORKSPACE_ID,
    assignment_id: '77777777-7777-7777-7777-777777777702', // 준호
    agreed_amount: 200000,
    additional_amount: 30000,
    adjustment_note: '기본 외주비 200,000원 + 원거리 교통비 30,000원',
    due_at: '2026-09-30',
    settlement_status: 'unpaid',
    created_at: new Date('2026-09-18T10:06:00Z').toISOString(),
    updated_at: new Date('2026-09-18T10:06:00Z').toISOString(),
  },
];

const INITIAL_DELIVERIES: Delivery[] = [
  {
    id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    workspace_id: WORKSPACE_ID,
    job_id: '66666666-6666-6666-6666-666666666601',
    delivery_due_at: '2026-10-26',
    delivery_status: 'pending',
    notes: '예식 후 30일 이내 셀렉 및 기본 보정본 전달',
    created_at: new Date('2026-09-18T10:06:00Z').toISOString(),
    updated_at: new Date('2026-09-18T10:06:00Z').toISOString(),
  },
];

interface AppState {
  workspace: Workspace;
  photographers: Photographer[];
  venues: Venue[];
  venue_spaces: VenueSpace[];
  jobs: Job[];
  assignments: Assignment[];
  job_pack_versions: JobPackVersion[];
  change_events: ChangeEvent[];
  handovers: Handover[];
  settlements: Settlement[];
  payment_entries: PaymentEntry[];
  deliveries: Delivery[];
  hall_observations: HallObservation[];
}

const STORAGE_KEY = 'wedding_ops_data_v2';

function getInitialState(): AppState {
  return {
    workspace: INITIAL_WORKSPACE,
    photographers: INITIAL_PHOTOGRAPHERS,
    venues: INITIAL_VENUES,
    venue_spaces: INITIAL_VENUE_SPACES,
    jobs: [INITIAL_JOB],
    assignments: INITIAL_ASSIGNMENTS,
    job_pack_versions: [],
    change_events: [],
    handovers: INITIAL_HANDOVERS,
    settlements: INITIAL_SETTLEMENTS,
    payment_entries: [],
    deliveries: INITIAL_DELIVERIES,
    hall_observations: INITIAL_HALL_OBSERVATIONS,
  };
}

let inMemoryState: AppState = getInitialState();

function loadState(): AppState {
  if (typeof window === 'undefined') {
    return inMemoryState;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    // 구버전(v1) 데이터가 있는 경우 사용자 데이터 유지하면서 베뉴 DB 업그레이드
    if (!raw) {
      const oldRaw = localStorage.getItem('wedding_ops_data_v1');
      if (oldRaw) {
        try {
          const parsedOld = JSON.parse(oldRaw);
          const migrated: AppState = {
            ...getInitialState(),
            ...parsedOld,
            // 서울 20개소 대량 베뉴 DB로 갱신
            venues: INITIAL_VENUES,
            venue_spaces: INITIAL_VENUE_SPACES,
            hall_observations: INITIAL_HALL_OBSERVATIONS,
          };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
          inMemoryState = migrated;
          return migrated;
        } catch (mErr) {
          console.error('Migration from v1 failed:', mErr);
        }
      }
      const init = getInitialState();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(init));
      inMemoryState = init;
      return init;
    }

    inMemoryState = JSON.parse(raw);

    // 저장된 베뉴 수가 최신(20개소)보다 적으면 최신 베뉴 및 공간/노하우 DB 병합
    if (!inMemoryState.venues || inMemoryState.venues.length < INITIAL_VENUES.length) {
      inMemoryState.venues = INITIAL_VENUES;
      inMemoryState.venue_spaces = INITIAL_VENUE_SPACES;
      inMemoryState.hall_observations = INITIAL_HALL_OBSERVATIONS;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(inMemoryState));
    }

    return inMemoryState;
  } catch (e) {
    console.error('LocalStorage load failed, using fallback:', e);
    return inMemoryState;
  }
}

function saveState(state: AppState) {
  inMemoryState = state;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('LocalStorage save failed:', e);
    }
  }
}

// ----------------------------------------------------------------------
// DataStore API
// ----------------------------------------------------------------------

export const DataStore = {
  resetToSeedData(): AppState {
    const fresh = getInitialState();
    saveState(fresh);
    return fresh;
  },

  getState(): AppState {
    return loadState();
  },

  // Photographers
  getPhotographers(): Photographer[] {
    const state = loadState();
    return state.photographers.filter((p) => p.is_active);
  },

  getAllPhotographers(): Photographer[] {
    const state = loadState();
    // 활성(is_active = true) 작가를 기본적으로 상단에 정렬
    return [...state.photographers].sort((a, b) => {
      if (a.is_active !== b.is_active) {
        return a.is_active ? -1 : 1;
      }
      return a.name.localeCompare(b.name, 'ko');
    });
  },

  getPhotographerById(id: string): Photographer | undefined {
    return loadState().photographers.find((p) => p.id === id);
  },

  addPhotographer(data: {
    name: string;
    phone?: string | null;
    notes?: string | null;
    is_active?: boolean;
    linked_user_id?: string | null;
  }): Photographer {
    const state = loadState();
    const newPhotographer: Photographer = {
      id: crypto.randomUUID ? crypto.randomUUID() : `p-${Date.now()}`,
      workspace_id: WORKSPACE_ID,
      name: data.name.trim(),
      phone: data.phone?.trim() || null,
      notes: data.notes?.trim() || null,
      linked_user_id: data.linked_user_id || null,
      is_active: data.is_active !== undefined ? data.is_active : true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    state.photographers.push(newPhotographer);
    saveState(state);
    return newPhotographer;
  },

  updatePhotographer(id: string, data: Partial<Omit<Photographer, 'id' | 'created_at'>>): Photographer {
    const state = loadState();
    const idx = state.photographers.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error(`Photographer not found: ${id}`);

    // workspace 권한 검증 (타 워크스페이스 작가 수정 차단)
    if (data.workspace_id && data.workspace_id !== WORKSPACE_ID) {
      throw new Error('권한 오류: 다른 워크스페이스의 작가는 수정할 수 없습니다.');
    }

    const current = state.photographers[idx];
    state.photographers[idx] = {
      ...current,
      name: data.name !== undefined ? data.name.trim() : current.name,
      phone: data.phone !== undefined ? (data.phone?.trim() || null) : current.phone,
      notes: data.notes !== undefined ? (data.notes?.trim() || null) : current.notes,
      is_active: data.is_active !== undefined ? data.is_active : current.is_active,
      linked_user_id: data.linked_user_id !== undefined ? data.linked_user_id : current.linked_user_id,
      updated_at: new Date().toISOString(),
    };
    saveState(state);
    return state.photographers[idx];
  },

  // Venues & Spaces
  getVenues(): Venue[] {
    return loadState().venues;
  },

  getVenueById(id: string): Venue | undefined {
    return loadState().venues.find((v) => v.id === id);
  },

  addVenue(data: { name: string; address?: string; notes?: string }): Venue {
    const state = loadState();
    const newVenue: Venue = {
      id: crypto.randomUUID ? crypto.randomUUID() : `venue-${Date.now()}`,
      workspace_id: WORKSPACE_ID,
      name: data.name,
      address: data.address || '',
      notes: data.notes || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    state.venues.push(newVenue);
    saveState(state);
    return newVenue;
  },

  getVenueSpaces(venueId?: string): VenueSpace[] {
    const state = loadState();
    if (!venueId) return state.venue_spaces;
    return state.venue_spaces.filter((vs) => vs.venue_id === venueId);
  },

  getVenueSpaceById(id: string): VenueSpace | undefined {
    return loadState().venue_spaces.find((vs) => vs.id === id);
  },

  addVenueSpace(data: Partial<VenueSpace> & { venue_id: string; name: string }): VenueSpace {
    const state = loadState();
    const newSpace: VenueSpace = {
      id: crypto.randomUUID ? crypto.randomUUID() : `space-${Date.now()}`,
      workspace_id: WORKSPACE_ID,
      venue_id: data.venue_id,
      name: data.name,
      floor: data.floor || '',
      notes: data.notes || '',
      lighting_type: data.lighting_type || '밝은 채플형',
      ceiling_height: data.ceiling_height || '천고 보통',
      aisle_info: data.aisle_info || '버진로드 20m 내외',
      ceremony_interval: data.ceremony_interval || '80분',
      bridal_room_flow: data.bridal_room_flow || '동일층 위치',
      photo_restrictions: data.photo_restrictions || '식장 안내 규정 준수',
      parking_transport_info: data.parking_transport_info || '주차 가능',
      latest_info_updated_at: new Date().toISOString().split('T')[0],
      latest_info_source: data.latest_info_source || '디어메모리 크루 현장 기록',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    state.venue_spaces.push(newSpace);
    saveState(state);
    return newSpace;
  },

  updateVenueSpace(id: string, data: Partial<VenueSpace>): VenueSpace {
    const state = loadState();
    const idx = state.venue_spaces.findIndex((s) => s.id === id);
    if (idx === -1) throw new Error('VenueSpace not found');
    state.venue_spaces[idx] = {
      ...state.venue_spaces[idx],
      ...data,
      latest_info_updated_at: new Date().toISOString().split('T')[0],
      updated_at: new Date().toISOString(),
    };
    saveState(state);
    return state.venue_spaces[idx];
  },

  // Jobs
  getJobs(): Job[] {
    const state = loadState();
    return [...state.jobs].sort((a, b) => new Date(a.shoot_date).getTime() - new Date(b.shoot_date).getTime());
  },

  getJobById(id: string): Job | undefined {
    return loadState().jobs.find((j) => j.id === id);
  },

  createJob(jobData: Omit<Job, 'id' | 'workspace_id' | 'created_at' | 'updated_at'>): Job {
    const state = loadState();
    const newJob: Job = {
      ...jobData,
      required_photographer_count: jobData.required_photographer_count ?? 2,
      id: crypto.randomUUID ? crypto.randomUUID() : `job-${Date.now()}`,
      workspace_id: WORKSPACE_ID,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    state.jobs.push(newJob);

    // 기본 납품 레코드 자동 생성 (예식일 + 30일)
    const dueDate = new Date(newJob.shoot_date);
    dueDate.setDate(dueDate.getDate() + 30);
    const newDelivery: Delivery = {
      id: crypto.randomUUID ? crypto.randomUUID() : `del-${Date.now()}`,
      workspace_id: WORKSPACE_ID,
      job_id: newJob.id,
      delivery_due_at: dueDate.toISOString().split('T')[0],
      delivery_status: 'pending',
      notes: '촬영 후 30일 이내 결과물 전달 예정',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    state.deliveries.push(newDelivery);

    saveState(state);
    return newJob;
  },

  updateJob(id: string, updates: Partial<Job>, changedBy = '대표작가'): Job {
    const state = loadState();
    const idx = state.jobs.findIndex((j) => j.id === id);
    if (idx === -1) throw new Error('Job not found');

    const oldJob = state.jobs[idx];
    const changedFields: { field: string; oldVal: string; newVal: string }[] = [];

    const trackFields: (keyof Job)[] = [
      'shoot_date',
      'arrival_time',
      'ceremony_time',
      'estimated_end_time',
      'venue_id',
      'venue_space_id',
      'special_requests',
      'must_shoot_notes',
      'title',
      'required_photographer_count',
    ];

    for (const key of trackFields) {
      if (updates[key] !== undefined && updates[key] !== oldJob[key]) {
        changedFields.push({
          field: key,
          oldVal: String(oldJob[key] ?? ''),
          newVal: String(updates[key] ?? ''),
        });
      }
    }

    const updatedJob: Job = {
      ...oldJob,
      ...updates,
      updated_at: new Date().toISOString(),
    };
    state.jobs[idx] = updatedJob;

    // 변경사항이 있으면 change_events 기록
    if (changedFields.length > 0) {
      for (const change of changedFields) {
        state.change_events.push({
          id: crypto.randomUUID ? crypto.randomUUID() : `chg-${Date.now()}-${Math.random()}`,
          workspace_id: WORKSPACE_ID,
          job_id: id,
          changed_by: changedBy,
          change_type: 'job_info',
          field_name: change.field,
          old_value: change.oldVal,
          new_value: change.newVal,
          description: `[${change.field}] 변경됨: '${change.oldVal}' ➜ '${change.newVal}'`,
          created_at: new Date().toISOString(),
        });
      }
    }

    saveState(state);
    return updatedJob;
  },

  // Assignments
  getAssignments(jobId: string): Assignment[] {
    const state = loadState();
    return state.assignments.filter((a) => a.job_id === jobId);
  },

  addAssignment(data: Omit<Assignment, 'id' | 'workspace_id' | 'created_at' | 'updated_at'>): Assignment {
    const state = loadState();
    const newAssignment: Assignment = {
      ...data,
      id: crypto.randomUUID ? crypto.randomUUID() : `asgn-${Date.now()}`,
      workspace_id: WORKSPACE_ID,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    state.assignments.push(newAssignment);

    // 대표작가가 아닌 경우 Handover & Settlement 자동 생성
    const photog = state.photographers.find((p) => p.id === data.photographer_id);
    const isRepresentative = photog?.name.includes('대표') || data.role === 'main';

    if (!isRepresentative) {
      // Handover 생성 (예식 다음 날 20시 기본값)
      const job = state.jobs.find((j) => j.id === data.job_id);
      const nextDay = job ? new Date(job.shoot_date) : new Date();
      nextDay.setDate(nextDay.getDate() + 1);
      const dueAt = `${nextDay.toISOString().split('T')[0]}T20:00:00+09:00`;

      state.handovers.push({
        id: crypto.randomUUID ? crypto.randomUUID() : `hnd-${Date.now()}`,
        workspace_id: WORKSPACE_ID,
        assignment_id: newAssignment.id,
        due_at: dueAt,
        status: 'pending',
        notes: '촬영 다음 날 20시까지 원본 드라이브 링크 전달',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      // Settlement 생성
      state.settlements.push({
        id: crypto.randomUUID ? crypto.randomUUID() : `stl-${Date.now()}`,
        workspace_id: WORKSPACE_ID,
        assignment_id: newAssignment.id,
        agreed_amount: data.agreed_fee || 0,
        additional_amount: data.additional_fee || 0,
        adjustment_note: data.additional_fee ? `추가비 ${data.additional_fee.toLocaleString()}원 포함` : '',
        due_at: nextDay.toISOString().split('T')[0],
        settlement_status: 'unpaid',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }

    // 변경 이벤트 로깅
    state.change_events.push({
      id: crypto.randomUUID ? crypto.randomUUID() : `chg-${Date.now()}`,
      workspace_id: WORKSPACE_ID,
      job_id: data.job_id,
      changed_by: '대표작가',
      change_type: 'assignment',
      field_name: 'photographer_id',
      new_value: data.photographer_id,
      description: `작가 배정 추가 (${data.role}): ${photog?.name || '알수없음'}`,
      created_at: new Date().toISOString(),
    });

    saveState(state);
    return newAssignment;
  },

  updateAssignment(id: string, updates: Partial<Assignment>): Assignment {
    const state = loadState();
    const idx = state.assignments.findIndex((a) => a.id === id);
    if (idx === -1) throw new Error('Assignment not found');

    const oldAsgn = state.assignments[idx];
    const updated: Assignment = {
      ...oldAsgn,
      ...updates,
      updated_at: new Date().toISOString(),
    };
    state.assignments[idx] = updated;

    // 만약 agreed_fee나 additional_fee가 변경되었고 settlement가 있으면 연동 갱신
    if (updates.agreed_fee !== undefined || updates.additional_fee !== undefined) {
      const settlement = state.settlements.find((s) => s.assignment_id === id);
      if (settlement) {
        settlement.agreed_amount = updated.agreed_fee || 0;
        settlement.additional_amount = updated.additional_fee || 0;
        settlement.updated_at = new Date().toISOString();
      }
    }

    saveState(state);
    return updated;
  },

  deleteAssignment(id: string) {
    const state = loadState();
    const asgn = state.assignments.find((a) => a.id === id);
    if (asgn) {
      state.assignments = state.assignments.filter((a) => a.id !== id);
      state.handovers = state.handovers.filter((h) => h.assignment_id !== id);
      const stl = state.settlements.find((s) => s.assignment_id === id);
      if (stl) {
        state.payment_entries = state.payment_entries.filter((p) => p.settlement_id !== stl.id);
        state.settlements = state.settlements.filter((s) => s.id !== stl.id);
      }
      saveState(state);
    }
  },

  // Job Pack & Versions
  getJobPackVersions(jobId: string): JobPackVersion[] {
    const state = loadState();
    return state.job_pack_versions
      .filter((v) => v.job_id === jobId)
      .sort((a, b) => b.version_number - a.version_number);
  },

  generateJobPackText(jobId: string, assignmentId?: string): string {
    const state = loadState();
    const job = state.jobs.find((j) => j.id === jobId);
    if (!job) return '';

    const venue = state.venues.find((v) => v.id === job.venue_id);
    const space = state.venue_spaces.find((vs) => vs.id === job.venue_space_id);
    const assignments = state.assignments.filter((a) => a.job_id === jobId);

    let targetAssignment = assignmentId
      ? assignments.find((a) => a.id === assignmentId)
      : assignments.find((a) => a.role === 'sub') || assignments[0];

    if (!targetAssignment && assignments.length > 0) {
      targetAssignment = assignments[0];
    }

    const photog = targetAssignment
      ? state.photographers.find((p) => p.id === targetAssignment?.photographer_id)
      : null;

    // 해당 홀의 주의사항 관찰 기록 가져오기 (must_caution 또는 caution)
    const cautions = state.hall_observations
      .filter((o) => o.venue_space_id === job.venue_space_id && (o.category === 'must_caution' || o.category === 'caution'))
      .map((o) => `- [주의] ${o.observation_text}${o.action_note ? ` (${o.action_note})` : ''}`);

    // 해당 홀의 디어메모리 크루 실전 팁 (tip 또는 advantage)
    const tips = state.hall_observations
      .filter((o) => o.venue_space_id === job.venue_space_id && (o.category === 'tip' || o.category === 'advantage'))
      .slice(0, 2)
      .map((o) => `- [크루팁] ${o.observation_text}${o.action_note ? ` (${o.action_note})` : ''}`);

    const shootDateObj = new Date(job.shoot_date);
    const dayNames = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
    const dateFormatted = `${shootDateObj.getMonth() + 1}/${shootDateObj.getDate()} ${dayNames[shootDateObj.getDay()]}`;

    const roleName = targetAssignment?.role === 'main' ? '메인작가' : '서브작가';

    // Handover 마감 기한
    const handover = targetAssignment ? state.handovers.find((h) => h.assignment_id === targetAssignment?.id) : null;
    let handoverDueText = '촬영 다음 날 20:00';
    if (handover?.due_at) {
      const hd = new Date(handover.due_at);
      handoverDueText = `${hd.getMonth() + 1}/${hd.getDate()} ${String(hd.getHours()).padStart(2, '0')}:${String(hd.getMinutes()).padStart(2, '0')}`;
    }

    const lines: string[] = [];
    lines.push(`[본식 촬영 안내 — ${job.title}]`);
    lines.push(`일시: ${dateFormatted}`);
    lines.push(`장소: ${venue?.name || '미정'} / ${space?.name || '미정'}${space?.floor ? ` (${space.floor})` : ''}`);
    lines.push(``);
    lines.push(`도착 시각: ${job.arrival_time}`);
    lines.push(`예식 시작: ${job.ceremony_time}`);
    lines.push(`예상 종료: ${job.estimated_end_time || '16:00'}`);
    lines.push(``);
    lines.push(`역할: ${roleName}${photog ? ` (${photog.name} 작가님)` : ''}`);
    lines.push(``);
    lines.push(`촬영 범위:`);
    if (job.shoot_scope && job.shoot_scope.length > 0) {
      job.shoot_scope.forEach((scope) => lines.push(`- ${scope}`));
    } else {
      lines.push(`- 신부대기실, 본식, 원판`);
    }
    lines.push(``);
    lines.push(`담당 업무 / 주요 동선:`);
    if (targetAssignment?.notes) {
      lines.push(`- ${targetAssignment.notes}`);
    } else if (targetAssignment?.role === 'sub') {
      lines.push(`- 신랑 대기 및 로비 하객맞이`);
      lines.push(`- 양가 부모님 표정 및 하객 반응 포착`);
      lines.push(`- 신부입장 측면/서브 앵글 와이드 샷`);
      lines.push(`- 축가 및 행진 시 다각도 연출`);
    } else {
      lines.push(`- 메인 연출 및 신부대기실/원판 진행 주관`);
    }
    lines.push(``);
    lines.push(`특별 요청:`);
    lines.push(job.special_requests ? `- ${job.special_requests}` : `- 특이사항 없음`);
    if (job.must_shoot_notes) {
      lines.push(`- 반드시 놓치면 안 되는 사항: ${job.must_shoot_notes}`);
    }

    if (space) {
      lines.push(``);
      lines.push(`베뉴 스펙 & 조명 환경 (최신 팩트):`);
      if (space.lighting_type) lines.push(`- 조명: ${space.lighting_type}`);
      if (space.ceiling_height || space.aisle_info) {
        lines.push(`- 규모: 천고 ${space.ceiling_height || '보통'} / 버진로드 ${space.aisle_info || '보통'}`);
      }
      if (space.photo_restrictions) lines.push(`- 규정: ${space.photo_restrictions}`);
      if (space.parking_transport_info) lines.push(`- 주차/교통: ${space.parking_transport_info}`);
    }

    lines.push(``);
    lines.push(`홀 주의사항 (현장 팁):`);
    const allNotes = [...cautions, ...tips];
    if (allNotes.length > 0) {
      allNotes.forEach((c) => lines.push(c));
    } else {
      lines.push(`- 현장 조명 및 버진로드 동선 확인`);
    }
    lines.push(``);
    lines.push(`촬영 후 안내:`);
    lines.push(`- 원본 전달기한: ${handoverDueText}`);
    lines.push(`- 구글 드라이브 / 웹하드 원본 링크 업로드 후 전달`);

    return lines.join('\n');
  },

  createJobPackVersion(jobId: string, content: string, createdBy = '대표작가'): JobPackVersion {
    const state = loadState();
    const existingVersions = state.job_pack_versions.filter((v) => v.job_id === jobId);
    const nextVersionNum = existingVersions.length + 1;
    const job = state.jobs.find((j) => j.id === jobId);

    const newVersion: JobPackVersion = {
      id: crypto.randomUUID ? crypto.randomUUID() : `jpv-${Date.now()}`,
      workspace_id: WORKSPACE_ID,
      job_id: jobId,
      version_number: nextVersionNum,
      content,
      snapshot_job_data: job ? JSON.parse(JSON.stringify(job)) : {},
      created_by: createdBy,
      created_at: new Date().toISOString(),
    };

    state.job_pack_versions.push(newVersion);
    saveState(state);
    return newVersion;
  },

  isJobPackOutdated(jobId: string): { outdated: boolean; reason?: string } {
    const state = loadState();
    const versions = state.job_pack_versions.filter((v) => v.job_id === jobId);

    if (versions.length === 0) {
      return { outdated: false };
    }

    const latestVersion = versions[versions.length - 1];
    const currentJob = state.jobs.find((j) => j.id === jobId);
    const snap = latestVersion.snapshot_job_data as Partial<Job> | undefined;

    // 1. 최신 버전 스냅샷과 현재 Job 데이터의 핵심 필드 직접 비교
    const diffs: string[] = [];
    if (currentJob && snap) {
      if (currentJob.ceremony_time !== snap.ceremony_time) {
        diffs.push(`예식시각(${snap.ceremony_time} ➜ ${currentJob.ceremony_time})`);
      }
      if (currentJob.arrival_time !== snap.arrival_time) {
        diffs.push(`도착시각(${snap.arrival_time} ➜ ${currentJob.arrival_time})`);
      }
      if (currentJob.shoot_date !== snap.shoot_date) {
        diffs.push(`촬영일자(${snap.shoot_date} ➜ ${currentJob.shoot_date})`);
      }
      if (currentJob.venue_id !== snap.venue_id || currentJob.venue_space_id !== snap.venue_space_id) {
        diffs.push('웨딩홀/공간');
      }
      if (currentJob.special_requests !== snap.special_requests) {
        diffs.push('특별요청');
      }
    }

    // 2. 최신 Job Pack 생성 시점 이후의 change_events 확인
    const latestCreatedTime = new Date(latestVersion.created_at).getTime();
    const newerChanges = state.change_events.filter(
      (c) => c.job_id === jobId && new Date(c.created_at).getTime() > latestCreatedTime
    );

    if (diffs.length > 0 || newerChanges.length > 0) {
      const reasons = diffs.length > 0 ? diffs.join(', ') : newerChanges.map((c) => c.description).join(', ');
      return {
        outdated: true,
        reason: `촬영 안내문(v${latestVersion.version_number}) 생성 이후 정보가 변경되었습니다: ${reasons}`,
      };
    }

    return { outdated: false };
  },

  // Change Events
  getChangeEvents(jobId: string): ChangeEvent[] {
    const state = loadState();
    return state.change_events
      .filter((c) => c.job_id === jobId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  // Handovers
  getHandovers(jobId: string): (Handover & { assignment: Assignment; photographer: Photographer | undefined })[] {
    const state = loadState();
    const assignments = state.assignments.filter((a) => a.job_id === jobId);
    const assignmentIds = new Set(assignments.map((a) => a.id));

    return state.handovers
      .filter((h) => assignmentIds.has(h.assignment_id))
      .map((h) => {
        const assignment = assignments.find((a) => a.id === h.assignment_id)!;
        const photographer = state.photographers.find((p) => p.id === assignment.photographer_id);
        return { ...h, assignment, photographer };
      });
  },

  updateHandover(id: string, updates: Partial<Handover>): Handover {
    const state = loadState();
    const idx = state.handovers.findIndex((h) => h.id === id);
    if (idx === -1) throw new Error('Handover not found');

    const updated: Handover = {
      ...state.handovers[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };

    if (updates.status === 'verified') {
      updated.representative_checked_at = new Date().toISOString();
    } else if (updates.external_url && !updated.submitted_at) {
      updated.submitted_at = new Date().toISOString();
      if (updated.status === 'pending') {
        updated.status = 'submitted';
      }
    }

    state.handovers[idx] = updated;
    saveState(state);
    return updated;
  },

  // Settlements & Payments
  getSettlements(
    jobId: string
  ): (Settlement & {
    assignment: Assignment;
    photographer: Photographer | undefined;
    payments: PaymentEntry[];
    total_due: number;
    total_paid: number;
    remaining: number;
  })[] {
    const state = loadState();
    const assignments = state.assignments.filter((a) => a.job_id === jobId);
    const assignmentIds = new Set(assignments.map((a) => a.id));

    return state.settlements
      .filter((s) => assignmentIds.has(s.assignment_id))
      .map((s) => {
        const assignment = assignments.find((a) => a.id === s.assignment_id)!;
        const photographer = state.photographers.find((p) => p.id === assignment.photographer_id);
        const payments = state.payment_entries.filter((p) => p.settlement_id === s.id);
        const total_due = (s.agreed_amount || 0) + (s.additional_amount || 0);
        const total_paid = payments.reduce((sum, p) => sum + p.payment_amount, 0);
        const remaining = Math.max(0, total_due - total_paid);
        return {
          ...s,
          assignment,
          photographer,
          payments,
          total_due,
          total_paid,
          remaining,
        };
      });
  },

  addPaymentEntry(settlementId: string, amount: number, memo?: string): PaymentEntry {
    const state = loadState();
    const settlement = state.settlements.find((s) => s.id === settlementId);
    if (!settlement) throw new Error('Settlement not found');

    const newPayment: PaymentEntry = {
      id: crypto.randomUUID ? crypto.randomUUID() : `pay-${Date.now()}`,
      workspace_id: WORKSPACE_ID,
      settlement_id: settlementId,
      payment_amount: amount,
      memo: memo || '외주비 지급',
      paid_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };
    state.payment_entries.push(newPayment);

    // 정산 상태 자동 계산
    const allPayments = state.payment_entries.filter((p) => p.settlement_id === settlementId);
    const totalPaid = allPayments.reduce((sum, p) => sum + p.payment_amount, 0);
    const totalDue = (settlement.agreed_amount || 0) + (settlement.additional_amount || 0);

    if (totalPaid >= totalDue && totalDue > 0) {
      settlement.settlement_status = 'paid';
    } else if (totalPaid > 0) {
      settlement.settlement_status = 'partially_paid';
    } else {
      settlement.settlement_status = 'unpaid';
    }
    settlement.updated_at = new Date().toISOString();

    saveState(state);
    return newPayment;
  },

  // Deliveries
  getDelivery(jobId: string): Delivery | undefined {
    return loadState().deliveries.find((d) => d.job_id === jobId);
  },

  updateDelivery(jobId: string, updates: Partial<Delivery>): Delivery {
    const state = loadState();
    let delivery = state.deliveries.find((d) => d.job_id === jobId);
    if (!delivery) {
      delivery = {
        id: crypto.randomUUID ? crypto.randomUUID() : `del-${Date.now()}`,
        workspace_id: WORKSPACE_ID,
        job_id: jobId,
        delivery_status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      state.deliveries.push(delivery);
    }

    Object.assign(delivery, updates);
    if (updates.delivery_status === 'delivered' && !delivery.delivered_at) {
      delivery.delivered_at = new Date().toISOString();
    }
    delivery.updated_at = new Date().toISOString();

    saveState(state);
    return delivery;
  },

  // Hall Observations
  getHallObservations(venueSpaceId?: string): HallObservation[] {
    const state = loadState();
    if (!venueSpaceId) return state.hall_observations;
    return state.hall_observations
      .filter((o) => o.venue_space_id === venueSpaceId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  addHallObservation(data: Omit<HallObservation, 'id' | 'workspace_id' | 'created_at'>): HallObservation {
    const state = loadState();
    const newObs: HallObservation = {
      ...data,
      id: crypto.randomUUID ? crypto.randomUUID() : `obs-${Date.now()}`,
      workspace_id: WORKSPACE_ID,
      created_at: new Date().toISOString(),
    };
    state.hall_observations.push(newObs);
    saveState(state);
    return newObs;
  },

  // Job Completion Validation
  checkJobCompletionEligibility(jobId: string): {
    canComplete: boolean;
    reasons: { label: string; fulfilled: boolean }[];
  } {
    const state = loadState();
    const job = state.jobs.find((j) => j.id === jobId);
    if (!job) return { canComplete: false, reasons: [] };

    const assignments = state.assignments.filter((a) => a.job_id === jobId);
    const handovers = state.handovers.filter((h) => assignments.some((a) => a.id === h.assignment_id));
    const settlements = state.settlements.filter((s) => assignments.some((a) => a.id === s.assignment_id));
    const delivery = state.deliveries.find((d) => d.job_id === jobId);

    // 1. 촬영 여부 (당일 이후이거나 상태가 shoot_completed 이상)
    const isPastShootDate = new Date(job.shoot_date).getTime() <= new Date().getTime();
    const isShootDone = job.status === 'shoot_completed' || isPastShootDate;

    // 2. 모든 원본 검수 완료 (모든 handover가 verified)
    const allHandoversVerified = handovers.length === 0 || handovers.every((h) => h.status === 'verified');

    // 3. 외주비 정산 처리 완료 (모든 settlement가 paid 또는 waived)
    const allSettlementsCleared =
      settlements.length === 0 ||
      settlements.every((s) => s.settlement_status === 'paid' || s.settlement_status === 'waived');

    // 4. 납품 완료 또는 해당 없음
    const isDeliveryDone = delivery?.delivery_status === 'delivered' || delivery?.delivery_status === 'not_applicable';

    const reasons = [
      { label: '본식 촬영 일정 도래 또는 촬영 완료', fulfilled: isShootDone },
      {
        label: `외주 원본 검수 완료 (${handovers.filter((h) => h.status === 'verified').length}/${handovers.length}건)`,
        fulfilled: allHandoversVerified,
      },
      {
        label: `외주 정산 완료 (${settlements.filter((s) => s.settlement_status === 'paid' || s.settlement_status === 'waived').length}/${settlements.length}건)`,
        fulfilled: allSettlementsCleared,
      },
      {
        label: `고객 최종 납품 완료 또는 해당없음 (${delivery?.delivery_status || '미완료'})`,
        fulfilled: Boolean(isDeliveryDone),
      },
    ];

    const canComplete = reasons.every((r) => r.fulfilled);
    return { canComplete, reasons };
  },

  completeJob(jobId: string): { success: boolean; message: string } {
    const { canComplete, reasons } = this.checkJobCompletionEligibility(jobId);
    if (!canComplete) {
      const missing = reasons.filter((r) => !r.fulfilled).map((r) => r.label);
      return {
        success: false,
        message: `완료 요건 미충족: ${missing.join(', ')}`,
      };
    }

    this.updateJob(jobId, { status: 'completed' }, '대표작가');
    return { success: true, message: '본식 촬영이 성공적으로 완료(Completed) 처리되었습니다.' };
  },

  // Dashboard 알림 계산 (확인 필요)
  getDashboardAlerts(): {
    unconfirmedAssignments: { job: Job; assignment: Assignment; photographer: Photographer | undefined }[];
    overdueHandovers: { job: Job; handover: Handover; photographer: Photographer | undefined }[];
    pendingReviewHandovers: { job: Job; handover: Handover; photographer: Photographer | undefined }[];
    unpaidSettlements: {
      job: Job;
      settlement: Settlement;
      photographer: Photographer | undefined;
      remaining: number;
    }[];
    impendingDeliveries: { job: Job; delivery: Delivery }[];
  } {
    const state = loadState();
    const now = new Date();

    // 1. 내일/임박 촬영 중 외주작가 수락 미확인
    const unconfirmedAssignments: {
      job: Job;
      assignment: Assignment;
      photographer: Photographer | undefined;
    }[] = [];
    state.assignments
      .filter((a) => a.assignment_status === 'proposed')
      .forEach((a) => {
        const job = state.jobs.find((j) => j.id === a.job_id);
        const photographer = state.photographers.find((p) => p.id === a.photographer_id);
        if (job && job.status !== 'completed' && job.status !== 'cancelled') {
          unconfirmedAssignments.push({ job, assignment: a, photographer });
        }
      });

    // 2. 원본 전달 기한 초과
    const overdueHandovers: { job: Job; handover: Handover; photographer: Photographer | undefined }[] = [];
    // 3. 원본 검수 필요 (submitted)
    const pendingReviewHandovers: { job: Job; handover: Handover; photographer: Photographer | undefined }[] = [];

    state.handovers.forEach((h) => {
      const assignment = state.assignments.find((a) => a.id === h.assignment_id);
      if (!assignment) return;
      const job = state.jobs.find((j) => j.id === assignment.job_id);
      const photographer = state.photographers.find((p) => p.id === assignment.photographer_id);
      if (!job || job.status === 'completed' || job.status === 'cancelled') return;

      if (h.status === 'submitted') {
        pendingReviewHandovers.push({ job, handover: h, photographer });
      } else if (h.due_at && (h.status === 'pending' || h.status === 'revision_requested')) {
        if (new Date(h.due_at).getTime() < now.getTime()) {
          overdueHandovers.push({ job, handover: h, photographer });
        }
      }
    });

    // 4. 외주비 미지급 / 부분지급
    const unpaidSettlements: {
      job: Job;
      settlement: Settlement;
      photographer: Photographer | undefined;
      remaining: number;
    }[] = [];

    state.settlements
      .filter((s) => s.settlement_status === 'unpaid' || s.settlement_status === 'partially_paid')
      .forEach((s) => {
        const assignment = state.assignments.find((a) => a.id === s.assignment_id);
        if (!assignment) return;
        const job = state.jobs.find((j) => j.id === assignment.job_id);
        const photographer = state.photographers.find((p) => p.id === assignment.photographer_id);
        if (!job || job.status === 'cancelled') return;

        const payments = state.payment_entries.filter((p) => p.settlement_id === s.id);
        const paidTotal = payments.reduce((sum, p) => sum + p.payment_amount, 0);
        const dueTotal = (s.agreed_amount || 0) + (s.additional_amount || 0);
        const remaining = Math.max(0, dueTotal - paidTotal);

        unpaidSettlements.push({ job, settlement: s, photographer, remaining });
      });

    // 5. 최종 납품 기한 임박 또는 초과
    const impendingDeliveries: { job: Job; delivery: Delivery }[] = [];
    state.deliveries
      .filter((d) => d.delivery_status === 'pending' && d.delivery_due_at)
      .forEach((d) => {
        const job = state.jobs.find((j) => j.id === d.job_id);
        if (job && job.status !== 'completed' && job.status !== 'cancelled') {
          impendingDeliveries.push({ job, delivery: d });
        }
      });

    return {
      unconfirmedAssignments,
      overdueHandovers,
      pendingReviewHandovers,
      unpaidSettlements,
      impendingDeliveries,
    };
  },

  // ============================================================================
  // Phase 3: Calendar & Operations Dashboard 비즈니스 로직
  // ============================================================================

  // 1. 한국 표준시(Asia/Seoul) 기준 YYYY-MM-DD 반환
  getKSTDateString(date = new Date()): string {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Seoul',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(date);
  },

  // 2. Job 파생 캘린더 표시 상태 (Derived Display Status)
  getJobDisplayStatus(
    jobId: string,
    inputJob?: Job
  ): {
    status: JobDisplayStatus;
    label: string;
    variant: 'rose' | 'amber' | 'indigo' | 'emerald' | 'slate';
  } {
    const state = loadState();
    const job = inputJob || state.jobs.find((j) => j.id === jobId);
    if (!job) {
      return { status: '배정 필요', label: '배정 필요', variant: 'rose' };
    }

    // ① 취소
    if (job.status === 'cancelled') {
      return { status: '취소', label: '취소', variant: 'slate' };
    }

    // ② 완료
    if (job.status === 'completed') {
      return { status: '완료', label: '완료', variant: 'emerald' };
    }

    const assignments = state.assignments.filter((a) => a.job_id === job.id);
    const activeAssignments = assignments.filter(
      (a) => a.assignment_status !== 'cancelled' && a.assignment_status !== 'declined'
    );
    const handovers = state.handovers.filter((h) =>
      assignments.some((a) => a.id === h.assignment_id)
    );

    // ③ 검수 필요 (submitted 상태의 handover가 1건이라도 존재)
    if (handovers.some((h) => h.status === 'submitted')) {
      return { status: '검수 필요', label: '검수 필요', variant: 'rose' };
    }

    // ④ 원본 대기 (촬영 완료 후 아직 pending/보완요청 handover가 존재)
    if (
      job.status === 'shoot_completed' &&
      handovers.some((h) => h.status === 'pending' || h.status === 'revision_requested')
    ) {
      return { status: '원본 대기', label: '원본 대기', variant: 'amber' };
    }

    // ⑤ 촬영 완료 (shoot_completed이고 원본 대기가 없거나 모두 검수 완료)
    if (job.status === 'shoot_completed') {
      return { status: '촬영 완료', label: '촬영 완료', variant: 'indigo' };
    }

    // ⑥ 배정 상태 계산 (scheduled / in_progress)
    const reqCount = job.required_photographer_count ?? 2;
    if (activeAssignments.length < reqCount) {
      return { status: '배정 필요', label: '배정 필요', variant: 'rose' };
    }

    // 수락 대기 (proposed 상태가 1건이라도 있음)
    if (activeAssignments.some((a) => a.assignment_status === 'proposed')) {
      return { status: '수락 대기', label: '수락 대기', variant: 'amber' };
    }

    // 모든 배정 확정
    return { status: '촬영 예정', label: '촬영 예정', variant: 'indigo' };
  },

  // 3. 작가 일정 시간대 충돌 감지
  detectPhotographerConflicts(targetJobId?: string): ConflictWarning[] {
    const state = loadState();
    const timeToMinutes = (timeStr?: string | null, fallback = '12:00'): number => {
      const val = (timeStr || fallback).trim();
      const [hh, mm] = val.split(':').map((x) => parseInt(x, 10) || 0);
      return hh * 60 + mm;
    };

    const conflicts: ConflictWarning[] = [];
    const processedPairs = new Set<string>();

    const validAssignments = state.assignments.filter((a) => {
      if (a.assignment_status === 'cancelled' || a.assignment_status === 'declined') return false;
      const job = state.jobs.find((j) => j.id === a.job_id);
      return job && job.status !== 'cancelled';
    });

    for (let i = 0; i < validAssignments.length; i++) {
      for (let j = i + 1; j < validAssignments.length; j++) {
        const a1 = validAssignments[i];
        const a2 = validAssignments[j];

        if (a1.photographer_id === a2.photographer_id && a1.job_id !== a2.job_id) {
          if (targetJobId && a1.job_id !== targetJobId && a2.job_id !== targetJobId) {
            continue;
          }

          const job1 = state.jobs.find((job) => job.id === a1.job_id);
          const job2 = state.jobs.find((job) => job.id === a2.job_id);
          if (!job1 || !job2) continue;

          if (job1.shoot_date === job2.shoot_date) {
            const start1 = timeToMinutes(a1.participation_start, job1.arrival_time);
            const end1 = timeToMinutes(a1.participation_end, job1.estimated_end_time || '16:00');
            const start2 = timeToMinutes(a2.participation_start, job2.arrival_time);
            const end2 = timeToMinutes(a2.participation_end, job2.estimated_end_time || '16:00');

            if (start1 < end2 && start2 < end1) {
              const pairKey = [a1.id, a2.id].sort().join('_');
              if (!processedPairs.has(pairKey)) {
                processedPairs.add(pairKey);
                const photographer = state.photographers.find((p) => p.id === a1.photographer_id);
                const pName = photographer ? photographer.name.replace(' (대표)', '') : '작가';

                const fmtTime = (min: number) => {
                  const h = Math.floor(min / 60);
                  const m = min % 60;
                  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
                };

                conflicts.push({
                  photographerId: a1.photographer_id,
                  photographerName: pName,
                  job1Id: job1.id,
                  job1Title: job1.title,
                  time1: `${fmtTime(start1)}~${fmtTime(end1)}`,
                  job2Id: job2.id,
                  job2Title: job2.title,
                  time2: `${fmtTime(start2)}~${fmtTime(end2)}`,
                  shootDate: job1.shoot_date,
                });
              }
            }
          }
        }
      }
    }

    return conflicts;
  },

  // 4. 미배정 촬영 조회
  getUnassignedJobs(): { job: Job; requiredCount: number; currentCount: number; missingCount: number }[] {
    const state = loadState();
    const list: { job: Job; requiredCount: number; currentCount: number; missingCount: number }[] = [];

    for (const job of state.jobs) {
      if (job.status === 'cancelled' || job.status === 'completed') continue;
      const req = job.required_photographer_count ?? 2;
      const activeAssignments = state.assignments.filter(
        (a) => a.job_id === job.id && a.assignment_status !== 'cancelled' && a.assignment_status !== 'declined'
      );
      if (activeAssignments.length < req) {
        list.push({
          job,
          requiredCount: req,
          currentCount: activeAssignments.length,
          missingCount: req - activeAssignments.length,
        });
      }
    }
    return list;
  },

  // 5. Operations Dashboard: 8단계 우선순위 정렬된 액션 아이템 목록
  getDashboardOperations(refDateStr?: string): DashboardActionItem[] {
    const state = loadState();
    const todayStr = refDateStr || this.getKSTDateString();

    // 내일 날짜 계산
    const [y, m, d] = todayStr.split('-').map(Number);
    const tomorrowObj = new Date(y, m - 1, d + 1);
    const tomorrowStr = `${tomorrowObj.getFullYear()}-${String(tomorrowObj.getMonth() + 1).padStart(2, '0')}-${String(
      tomorrowObj.getDate()
    ).padStart(2, '0')}`;

    const items: DashboardActionItem[] = [];

    // [우선순위 1] 오늘/내일 촬영 중 긴급 문제 (미배정 또는 작가 수락 미확인)
    const urgentJobs = state.jobs.filter(
      (j) => (j.shoot_date === todayStr || j.shoot_date === tomorrowStr) && j.status !== 'cancelled' && j.status !== 'completed'
    );

    const urgentJobIds = new Set<string>();

    urgentJobs.forEach((job) => {
      const activeAssignments = state.assignments.filter(
        (a) => a.job_id === job.id && a.assignment_status !== 'cancelled' && a.assignment_status !== 'declined'
      );
      const req = job.required_photographer_count ?? 2;
      const dateTag = job.shoot_date === todayStr ? '오늘' : '내일';

      if (activeAssignments.length < req) {
        urgentJobIds.add(job.id);
        items.push({
          id: `urgent-unassigned-${job.id}`,
          priority: 1,
          category: 'urgent',
          categoryLabel: '오늘/내일 긴급',
          title: `[${dateTag} 촬영] 작가 ${req - activeAssignments.length}명 미배정`,
          description: `${job.title} (${job.ceremony_time}) — 예식이 임박했으나 필요 인원이 충원되지 않았습니다.`,
          jobId: job.id,
          linkUrl: `/jobs/${job.id}`,
          badgeText: `${dateTag} 예식`,
          badgeVariant: 'rose',
          dateInfo: job.shoot_date,
        });
      }

      const pendingProposals = activeAssignments.filter((a) => a.assignment_status === 'proposed');
      if (pendingProposals.length > 0) {
        urgentJobIds.add(job.id);
        const names = pendingProposals
          .map((a) => state.photographers.find((p) => p.id === a.photographer_id)?.name.replace(' (대표)', '') || '작가')
          .join(', ');
        items.push({
          id: `urgent-proposed-${job.id}`,
          priority: 1,
          category: 'urgent',
          categoryLabel: '오늘/내일 긴급',
          title: `[${dateTag} 촬영] ${names} 작가 수락 대기`,
          description: `${job.title} (${job.ceremony_time}) — 임박한 예식의 출동 확정이 필요합니다.`,
          jobId: job.id,
          linkUrl: `/jobs/${job.id}`,
          badgeText: '수락 긴급',
          badgeVariant: 'rose',
          dateInfo: job.shoot_date,
        });
      }
    });

    // [우선순위 2] 일정 충돌 (Conflict)
    const conflicts = this.detectPhotographerConflicts();
    conflicts.forEach((c, idx) => {
      items.push({
        id: `conflict-${idx}`,
        priority: 2,
        category: 'conflict',
        categoryLabel: '일정 충돌',
        title: `${c.photographerName} 작가 동일 일자 시간대 중복`,
        description: `${c.shootDate}: "${c.job1Title}" (${c.time1}) ↔ "${c.job2Title}" (${c.time2})`,
        jobId: c.job1Id,
        linkUrl: `/jobs/${c.job1Id}`,
        badgeText: '일정 겹침',
        badgeVariant: 'rose',
        dateInfo: c.shootDate,
      });
    });

    // [우선순위 3] 작가 미배정 (오늘/내일 제외된 일반 미배정 촬영)
    const unassignedList = this.getUnassignedJobs();
    unassignedList.forEach((u) => {
      if (urgentJobIds.has(u.job.id)) return; // 1순위에서 이미 처리
      items.push({
        id: `unassigned-${u.job.id}`,
        priority: 3,
        category: 'unassigned',
        categoryLabel: '작가 미배정',
        title: `외주작가 ${u.missingCount}명 미배정`,
        description: `${u.job.title} (${u.job.shoot_date}) — 필요인원 ${u.requiredCount}명 중 현재 ${u.currentCount}명 배정됨`,
        jobId: u.job.id,
        linkUrl: `/jobs/${u.job.id}`,
        badgeText: '배정 필요',
        badgeVariant: 'amber',
        dateInfo: u.job.shoot_date,
      });
    });

    // [우선순위 4] 작가 수락 대기 / 변경사항 미확인
    state.assignments
      .filter((a) => a.assignment_status === 'proposed')
      .forEach((a) => {
        const job = state.jobs.find((j) => j.id === a.job_id);
        if (!job || job.status === 'completed' || job.status === 'cancelled') return;
        if (urgentJobIds.has(job.id)) return; // 1순위에서 이미 처리

        const photographer = state.photographers.find((p) => p.id === a.photographer_id);
        const pName = photographer ? photographer.name.replace(' (대표)', '') : '작가';

        items.push({
          id: `proposed-${a.id}`,
          priority: 4,
          category: 'acceptance',
          categoryLabel: '수락 대기',
          title: `${pName} 배정 수락 대기`,
          description: `${job.title} (${job.shoot_date}) — 작가의 배정 확인 및 수락이 필요합니다.`,
          jobId: job.id,
          linkUrl: `/jobs/${job.id}`,
          badgeText: '수락 대기',
          badgeVariant: 'amber',
          dateInfo: job.shoot_date,
        });
      });

    // [우선순위 5] 원본 지연 (due_at 경과, pending 또는 revision_requested)
    state.handovers.forEach((h) => {
      const assignment = state.assignments.find((a) => a.id === h.assignment_id);
      if (!assignment) return;
      const job = state.jobs.find((j) => j.id === assignment.job_id);
      if (!job || job.status === 'completed' || job.status === 'cancelled') return;

      if (h.due_at && (h.status === 'pending' || h.status === 'revision_requested')) {
        const dueDatePart = h.due_at.split('T')[0];
        if (dueDatePart < todayStr) {
          const photographer = state.photographers.find((p) => p.id === assignment.photographer_id);
          const pName = photographer ? photographer.name.replace(' (대표)', '') : '작가';

          items.push({
            id: `overdue-${h.id}`,
            priority: 5,
            category: 'handover_overdue',
            categoryLabel: '원본 지연',
            title: `${pName} 원본 전달 지연`,
            description: `${job.title} — 제출 마감일(${dueDatePart})이 경과하였습니다.`,
            jobId: job.id,
            linkUrl: `/jobs/${job.id}`,
            badgeText: '제출 지연',
            badgeVariant: 'rose',
            dateInfo: dueDatePart,
          });
        }
      }
    });

    // [우선순위 6] 원본 검수 필요 (status === 'submitted')
    state.handovers.forEach((h) => {
      if (h.status === 'submitted') {
        const assignment = state.assignments.find((a) => a.id === h.assignment_id);
        if (!assignment) return;
        const job = state.jobs.find((j) => j.id === assignment.job_id);
        if (!job || job.status === 'completed' || job.status === 'cancelled') return;

        const photographer = state.photographers.find((p) => p.id === assignment.photographer_id);
        const pName = photographer ? photographer.name.replace(' (대표)', '') : '작가';

        items.push({
          id: `review-${h.id}`,
          priority: 6,
          category: 'handover_review',
          categoryLabel: '원본 검수',
          title: `${pName} 작가 원본 검수 필요`,
          description: `${job.title} — 원본 링크가 제출되었습니다. 검수 후 완료 확정이 필요합니다.`,
          jobId: job.id,
          linkUrl: `/jobs/${job.id}`,
          badgeText: '검수 필요',
          badgeVariant: 'indigo',
          dateInfo: job.shoot_date,
        });
      }
    });

    // [우선순위 7] 납품 기한 임박 / 지연
    const threeDaysLater = new Date(y, m - 1, d + 3);
    const threeDaysLaterStr = `${threeDaysLater.getFullYear()}-${String(threeDaysLater.getMonth() + 1).padStart(
      2,
      '0'
    )}-${String(threeDaysLater.getDate()).padStart(2, '0')}`;

    state.deliveries.forEach((dItem) => {
      if (dItem.delivery_status === 'pending' && dItem.delivery_due_at) {
        const job = state.jobs.find((j) => j.id === dItem.job_id);
        if (!job || job.status === 'completed' || job.status === 'cancelled') return;

        const isOverdue = dItem.delivery_due_at < todayStr;
        const isImpending = dItem.delivery_due_at <= threeDaysLaterStr;

        if (isOverdue || isImpending) {
          items.push({
            id: `delivery-${dItem.id}`,
            priority: 7,
            category: 'delivery_due',
            categoryLabel: '납품 기한',
            title: isOverdue ? '고객 납품 기한 초과' : '고객 납품 기한 임박',
            description: `${job.title} — 마감일자: ${dItem.delivery_due_at}`,
            jobId: job.id,
            linkUrl: `/jobs/${job.id}`,
            badgeText: isOverdue ? '납품 지연' : '납품 임박',
            badgeVariant: isOverdue ? 'rose' : 'amber',
            dateInfo: dItem.delivery_due_at,
          });
        }
      }
    });

    // [우선순위 8] 외주비 미정산 잔액
    state.settlements.forEach((s) => {
      if (s.settlement_status === 'unpaid' || s.settlement_status === 'partially_paid') {
        const assignment = state.assignments.find((a) => a.id === s.assignment_id);
        if (!assignment) return;
        const job = state.jobs.find((j) => j.id === assignment.job_id);
        if (!job || job.status === 'cancelled') return;

        const payments = state.payment_entries.filter((p) => p.settlement_id === s.id);
        const paidTotal = payments.reduce((sum, p) => sum + p.payment_amount, 0);
        const dueTotal = (s.agreed_amount || 0) + (s.additional_amount || 0);
        const remaining = Math.max(0, dueTotal - paidTotal);

        if (remaining > 0) {
          const photographer = state.photographers.find((p) => p.id === assignment.photographer_id);
          const pName = photographer ? photographer.name.replace(' (대표)', '') : '작가';

          items.push({
            id: `settle-${s.id}`,
            priority: 8,
            category: 'settlement_unpaid',
            categoryLabel: '정산 미완료',
            title: `${pName} ${remaining.toLocaleString()}원 미지급`,
            description: `${job.title} (${job.shoot_date}) — 총 정산액 ${dueTotal.toLocaleString()}원 중 미지급 잔액`,
            jobId: job.id,
            linkUrl: `/jobs/${job.id}`,
            badgeText: '미정산',
            badgeVariant: 'amber',
            dateInfo: job.shoot_date,
          });
        }
      }
    });

    // 우선순위 1 -> 8 순 정렬
    return items.sort((a, b) => a.priority - b.priority);
  },

  // 6. 오늘 촬영
  getTodayJobs(refDateStr?: string): Job[] {
    const state = loadState();
    const todayStr = refDateStr || this.getKSTDateString();
    return state.jobs
      .filter((j) => j.shoot_date === todayStr && j.status !== 'cancelled')
      .sort((a, b) => (a.ceremony_time || '').localeCompare(b.ceremony_time || ''));
  },

  // 7. 이번 주 촬영 (오늘 포함 7일간 또는 해당 주간의 촬영)
  getThisWeekJobs(refDateStr?: string): Job[] {
    const state = loadState();
    const todayStr = refDateStr || this.getKSTDateString();
    const [y, m, d] = todayStr.split('-').map(Number);
    const endObj = new Date(y, m - 1, d + 7);
    const endStr = `${endObj.getFullYear()}-${String(endObj.getMonth() + 1).padStart(2, '0')}-${String(
      endObj.getDate()
    ).padStart(2, '0')}`;

    return state.jobs
      .filter((j) => j.shoot_date >= todayStr && j.shoot_date <= endStr && j.status !== 'cancelled')
      .sort((a, b) => {
        if (a.shoot_date !== b.shoot_date) {
          return a.shoot_date.localeCompare(b.shoot_date);
        }
        return (a.ceremony_time || '').localeCompare(b.ceremony_time || '');
      });
  },
};
