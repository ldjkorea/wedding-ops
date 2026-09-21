-- ==============================================================================
-- 본식 웨딩 촬영팀 내부 운영 앱 (Phase 1 MVP) - Seed Data
-- ==============================================================================

-- 1. 기본 Workspace 생성
INSERT INTO public.workspaces (id, name)
VALUES ('11111111-1111-1111-1111-111111111111', '스튜디오 민규')
ON CONFLICT (id) DO NOTHING;

-- 2. 작가 마스터 (대표작가 1명, 외주작가 2명)
INSERT INTO public.photographers (id, workspace_id, name, phone, notes, is_active)
VALUES 
  ('22222222-2222-2222-2222-222222222201', '11111111-1111-1111-1111-111111111111', '민규 (대표)', '010-1234-5678', '대표작가 본인', true),
  ('22222222-2222-2222-2222-222222222202', '11111111-1111-1111-1111-111111111111', '준호', '010-9876-5432', '서브 스냅 전문 / 기동성 우수', true),
  ('22222222-2222-2222-2222-222222222203', '11111111-1111-1111-1111-111111111111', '성민', '010-5555-4444', '원판 촬영 안정적 / 주말 고정 가능', true)
ON CONFLICT (id) DO NOTHING;

-- 3. 베뉴 및 공간 (Venue & Venue Space)
INSERT INTO public.venues (id, workspace_id, name, address, notes)
VALUES 
  ('33333333-3333-3333-3333-333333333301', '11111111-1111-1111-1111-111111111111', '더채플앳청담', '서울 강남구 선릉로 757', '자연광 느낌의 우드톤 채플홀')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.venue_spaces (id, workspace_id, venue_id, name, floor, notes)
VALUES 
  ('44444444-4444-4444-4444-444444444401', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333301', '커티지홀', '3층', '천고 높음 / 버진로드 단상 없음')
ON CONFLICT (id) DO NOTHING;

-- 4. 홀 관찰 기록 초기 데이터 (더채플앳청담 커티지홀)
INSERT INTO public.hall_observations (id, workspace_id, venue_space_id, author, observed_at, source_type, category, observation_text, action_note)
VALUES
  ('55555555-5555-5555-5555-555555555501', '11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444401', '민규', '2026-09-10', 'direct', 'must_caution', '입장 직후 조명이 급격히 어두워져 노출 변화가 큼. 중앙 통로 이동 시 하객 동선과 겹치므로 사전 위치 선점 필수.', '신부입장 2분 전 사이드 라인으로 미리 이동할 것'),
  ('55555555-5555-5555-5555-555555555502', '11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444401', '민규', '2026-09-15', 'direct', 'team_routine', '축가 시 서브작가는 우측 계단 위에서 부모님 표정과 신랑신부 뒷모습을 와이드로 동시 포착하는 구도가 가장 반응이 좋음.', '서브작가 70-200mm 마운트 권장')
ON CONFLICT (id) DO NOTHING;

-- 5. 샘플 Job (김OO ♥ 박OO)
INSERT INTO public.jobs (
  id, workspace_id, title, shoot_date, arrival_time, ceremony_time, estimated_end_time,
  venue_id, venue_space_id, client_name, client_phone, notes,
  shoot_scope, special_requests, must_shoot_notes, deliverable_notes, status
)
VALUES (
  '66666666-6666-6666-6666-666666666601', '11111111-1111-1111-1111-111111111111',
  '김민수 ♥ 박지은', '2026-09-26', '12:30', '14:00', '16:00',
  '33333333-3333-3333-3333-333333333301', '44444444-4444-4444-4444-444444444401',
  '김민수 / 박지은', '010-1111-2222', '신랑 측 하객 많음',
  '["신부대기실", "본식", "원판"]'::jsonb,
  '신부 친할머니 거동이 불편하시니 대기실에서 가족 원판 사전 촬영 요청',
  '플라워샤워 시 양가 부모님 환호 표정 필수 캐치',
  '원본 전체 JPG + 대표 셀렉본 50장 우선 전달',
  'scheduled'
)
ON CONFLICT (id) DO NOTHING;

-- 6. 샘플 Job 배정 (대표작가: 메인, 준호: 서브)
INSERT INTO public.assignments (id, workspace_id, job_id, photographer_id, role, participation_start, participation_end, assignment_status, agreed_fee, additional_fee, notes)
VALUES
  ('77777777-7777-7777-7777-777777777701', '11111111-1111-1111-1111-111111111111', '66666666-6666-6666-6666-666666666601', '22222222-2222-2222-2222-222222222201', 'main', '12:30', '16:00', 'accepted', NULL, 0, '대표 메인 촬영'),
  ('77777777-7777-7777-7777-777777777702', '11111111-1111-1111-1111-111111111111', '66666666-6666-6666-6666-666666666601', '22222222-2222-2222-2222-222222222202', 'sub', '12:30', '16:00', 'proposed', 200000, 30000, '서브스냅 및 신랑 대기 집중')
ON CONFLICT (id) DO NOTHING;

-- 7. 샘플 배정에 대한 Handover 및 Settlement
INSERT INTO public.handovers (id, workspace_id, assignment_id, due_at, status, notes)
VALUES
  ('88888888-8888-8888-8888-888888888801', '11111111-1111-1111-1111-111111111111', '77777777-7777-7777-7777-777777777702', '2026-09-27 20:00:00+09', 'pending', '촬영 다음 날 20시까지 구글 드라이브 업로드')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.settlements (id, workspace_id, assignment_id, agreed_amount, additional_amount, adjustment_note, due_at, settlement_status)
VALUES
  ('99999999-9999-9999-9999-999999999901', '11111111-1111-1111-1111-111111111111', '77777777-7777-7777-7777-777777777702', 200000, 30000, '기본 외주비 20만 + 원거리 교통비 3만', '2026-09-30', 'unpaid')
ON CONFLICT (id) DO NOTHING;

-- 8. 최종 납품 레코드
INSERT INTO public.deliveries (id, workspace_id, job_id, delivery_due_at, delivery_status, notes)
VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', '66666666-6666-6666-6666-666666666601', '2026-10-26', 'pending', '예식 후 30일 이내 납품 예정')
ON CONFLICT (id) DO NOTHING;
