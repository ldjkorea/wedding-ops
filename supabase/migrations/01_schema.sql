-- ==============================================================================
-- 본식 웨딩 촬영팀 내부 운영 앱 (Phase 1 MVP) - Database Schema
-- ==============================================================================

-- 1. Workspaces (스튜디오/팀 단위 격리)
CREATE TABLE IF NOT EXISTS public.workspaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Profiles (사용자 프로필 - Phase 1: 대표작가 1명, Phase 2: 외주작가 연동 대비)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY, -- auth.users.id
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'representative' CHECK (role IN ('representative', 'photographer')),
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Photographers (작가 마스터 - 외주/대표 작가 엔티티)
CREATE TABLE IF NOT EXISTS public.photographers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT,
    notes TEXT,
    linked_user_id UUID, -- Phase 2에서 profiles.id와 연동
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Venues (웨딩홀/베뉴)
CREATE TABLE IF NOT EXISTS public.venues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    address TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Venue Spaces (베뉴 내 공간/홀/층)
CREATE TABLE IF NOT EXISTS public.venue_spaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    venue_id UUID NOT NULL REFERENCES public.venues(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    floor TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Jobs (본식 촬영 한 건)
CREATE TABLE IF NOT EXISTS public.jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    title TEXT NOT NULL, -- 예: 김OO ♥ 박OO
    shoot_date DATE NOT NULL,
    arrival_time TIME NOT NULL,
    ceremony_time TIME NOT NULL,
    estimated_end_time TIME,
    venue_id UUID REFERENCES public.venues(id) ON DELETE SET NULL,
    venue_space_id UUID REFERENCES public.venue_spaces(id) ON DELETE SET NULL,
    client_name TEXT,
    client_phone TEXT,
    notes TEXT,
    shoot_scope JSONB NOT NULL DEFAULT '["신부대기실", "본식", "원판"]'::jsonb,
    special_requests TEXT,
    must_shoot_notes TEXT,
    deliverable_notes TEXT,
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'shoot_completed', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Assignments (작가 배정 N:M)
CREATE TABLE IF NOT EXISTS public.assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
    photographer_id UUID NOT NULL REFERENCES public.photographers(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'sub' CHECK (role IN ('main', 'sub', 'etc')),
    participation_start TIME,
    participation_end TIME,
    assignment_status TEXT NOT NULL DEFAULT 'proposed' CHECK (assignment_status IN ('proposed', 'accepted', 'declined', 'replaced', 'cancelled')),
    agreed_fee NUMERIC(12, 0), -- 대표작가는 NULL 가능
    additional_fee NUMERIC(12, 0) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Job Pack Versions (촬영 안내 스냅샷 기록)
CREATE TABLE IF NOT EXISTS public.job_pack_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
    version_number INT NOT NULL,
    content TEXT NOT NULL,
    snapshot_job_data JSONB NOT NULL,
    created_by TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Change Events (핵심 정보 변경 감사 로그)
CREATE TABLE IF NOT EXISTS public.change_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
    changed_by TEXT,
    change_type TEXT NOT NULL, -- 'job_info', 'time', 'venue', 'assignment' 등
    field_name TEXT NOT NULL,
    old_value TEXT,
    new_value TEXT,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. Handovers (원본 제출 및 검수)
CREATE TABLE IF NOT EXISTS public.handovers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
    due_at TIMESTAMPTZ,
    submitted_at TIMESTAMPTZ,
    external_url TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'submitted', 'review_needed', 'revision_requested', 'verified')),
    representative_checked_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. Settlements (외주 정산)
CREATE TABLE IF NOT EXISTS public.settlements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
    agreed_amount NUMERIC(12, 0) NOT NULL DEFAULT 0,
    additional_amount NUMERIC(12, 0) NOT NULL DEFAULT 0,
    adjustment_note TEXT,
    due_at DATE,
    settlement_status TEXT NOT NULL DEFAULT 'unpaid' CHECK (settlement_status IN ('unpaid', 'partially_paid', 'paid', 'waived')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. Payment Entries (정산 분할 지급 내역)
CREATE TABLE IF NOT EXISTS public.payment_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    settlement_id UUID NOT NULL REFERENCES public.settlements(id) ON DELETE CASCADE,
    payment_amount NUMERIC(12, 0) NOT NULL,
    paid_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    memo TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. Deliveries (고객 최종 납품 추적)
CREATE TABLE IF NOT EXISTS public.deliveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
    delivery_due_at DATE,
    external_work_url TEXT,
    delivery_status TEXT NOT NULL DEFAULT 'pending' CHECK (delivery_status IN ('pending', 'delivered', 'not_applicable')),
    delivered_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. Hall Observations (웨딩홀/홀별 현장 관찰 지식 축적)
CREATE TABLE IF NOT EXISTS public.hall_observations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    venue_space_id UUID NOT NULL REFERENCES public.venue_spaces(id) ON DELETE CASCADE,
    related_job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
    author TEXT NOT NULL DEFAULT '대표작가',
    observed_at DATE NOT NULL DEFAULT CURRENT_DATE,
    source_type TEXT NOT NULL DEFAULT 'direct' CHECK (source_type IN ('direct', 'teammate', 'external')),
    category TEXT NOT NULL CHECK (category IN ('must_caution', 'team_routine', 'next_check')),
    observation_text TEXT NOT NULL,
    action_note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS (Row Level Security) 활성화
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photographers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venue_spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_pack_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.change_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.handovers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hall_observations ENABLE ROW LEVEL SECURITY;
