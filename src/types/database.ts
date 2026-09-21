// ==============================================================================
// 본식 웨딩 촬영팀 내부 운영 앱 (Phase 1 MVP) - TypeScript 데이터베이스 타입 정의
// ==============================================================================

export type Workspace = {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
};

export type Profile = {
  id: string;
  workspace_id: string;
  role: 'representative' | 'photographer';
  name: string;
  phone?: string | null;
  email?: string | null;
  created_at: string;
  updated_at: string;
};

export type Photographer = {
  id: string;
  workspace_id: string;
  name: string;
  phone: string;
  notes?: string | null;
  linked_user_id?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Venue = {
  id: string;
  workspace_id: string;
  name: string;
  address?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
};

export type VenueSpace = {
  id: string;
  workspace_id: string;
  venue_id: string;
  name: string;
  floor?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
};

export type JobStatus = 'scheduled' | 'in_progress' | 'shoot_completed' | 'completed' | 'cancelled';

export type Job = {
  id: string;
  workspace_id: string;
  title: string; // 예: 김OO ♥ 박OO
  shoot_date: string; // YYYY-MM-DD
  arrival_time: string; // HH:mm
  ceremony_time: string; // HH:mm
  estimated_end_time?: string | null; // HH:mm
  venue_id?: string | null;
  venue_space_id?: string | null;
  client_name?: string | null;
  client_phone?: string | null;
  notes?: string | null;
  shoot_scope: string[]; // ['신부대기실', '본식', '원판', '폐백', '기타']
  special_requests?: string | null;
  must_shoot_notes?: string | null;
  deliverable_notes?: string | null;
  status: JobStatus;
  created_at: string;
  updated_at: string;
};

export type AssignmentRole = 'main' | 'sub' | 'etc';
export type AssignmentStatus = 'proposed' | 'accepted' | 'declined' | 'replaced' | 'cancelled';

export type Assignment = {
  id: string;
  workspace_id: string;
  job_id: string;
  photographer_id: string;
  role: AssignmentRole;
  participation_start?: string | null;
  participation_end?: string | null;
  assignment_status: AssignmentStatus;
  agreed_fee?: number | null; // 대표는 null 가능
  additional_fee?: number | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
};

export type JobPackVersion = {
  id: string;
  workspace_id: string;
  job_id: string;
  version_number: number;
  content: string;
  snapshot_job_data: Record<string, unknown>;
  created_by?: string | null;
  created_at: string;
};

export type ChangeEvent = {
  id: string;
  workspace_id: string;
  job_id: string;
  changed_by?: string | null;
  change_type: string;
  field_name: string;
  old_value?: string | null;
  new_value?: string | null;
  description: string;
  created_at: string;
};

export type HandoverStatus = 'pending' | 'submitted' | 'review_needed' | 'revision_requested' | 'verified';

export type Handover = {
  id: string;
  workspace_id: string;
  assignment_id: string;
  due_at?: string | null;
  submitted_at?: string | null;
  external_url?: string | null;
  status: HandoverStatus;
  representative_checked_at?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
};

export type SettlementStatus = 'unpaid' | 'partially_paid' | 'paid' | 'waived';

export type Settlement = {
  id: string;
  workspace_id: string;
  assignment_id: string;
  agreed_amount: number;
  additional_amount: number;
  adjustment_note?: string | null;
  due_at?: string | null;
  settlement_status: SettlementStatus;
  created_at: string;
  updated_at: string;
};

export type PaymentEntry = {
  id: string;
  workspace_id: string;
  settlement_id: string;
  payment_amount: number;
  paid_at: string;
  memo?: string | null;
  created_at: string;
};

export type DeliveryStatus = 'pending' | 'delivered' | 'not_applicable';

export type Delivery = {
  id: string;
  workspace_id: string;
  job_id: string;
  delivery_due_at?: string | null;
  external_work_url?: string | null;
  delivery_status: DeliveryStatus;
  delivered_at?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
};

export type HallObservationCategory = 'must_caution' | 'team_routine' | 'next_check';
export type HallObservationSource = 'direct' | 'teammate' | 'external';

export type HallObservation = {
  id: string;
  workspace_id: string;
  venue_space_id: string;
  related_job_id?: string | null;
  author: string;
  observed_at: string;
  source_type: HallObservationSource;
  category: HallObservationCategory;
  observation_text: string;
  action_note?: string | null;
  created_at: string;
};
