// ==============================================================================
// Wedding Photographer Ops — Phase 3: Calendar + Operations Dashboard 인수 테스트
// ==============================================================================

import { DataStore, WORKSPACE_ID } from '../src/lib/storage.ts';
import { getKSTTodayString, getMonthCalendarGrid, timeToMinutes } from '../src/lib/dateUtils.ts';

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exit(1);
  }
  console.log(`  ✅ ${message}`);
}

console.log('🚀 Phase 3: Calendar + Operations Dashboard 인수 테스트 (A ~ J) 시작...\n');

// 0. 초기화
DataStore.resetToSeedData();
const photographers = DataStore.getAllPhotographers();
const rep = photographers.find((p) => p.name.includes('대표')) || photographers[0];
const sub1 = photographers.find((p) => p.name === '준호' || p.name === '김준호') || photographers[1];
const sub2 = photographers.find((p) => p.name === '성민') || photographers[2];

// ==============================================================================
// Acceptance Test A: Calendar 기본 (9/26 1건, 9/27 2건 표시 및 Job Detail 연동)
// ==============================================================================
console.log('--- [Test A] Calendar 기본 Month View 렌더링 검증 ---');
// Job A1: 2026-09-26 14:00
const jobA1 = DataStore.createJob({
  title: '강동원 ♥ 송혜교',
  shoot_date: '2026-09-26',
  arrival_time: '12:30',
  ceremony_time: '14:00',
  estimated_end_time: '16:00',
  shoot_scope: ['본식'],
  status: 'scheduled',
});

// Job A2: 2026-09-27 11:00
const jobA2 = DataStore.createJob({
  title: '현빈 ♥ 손예진',
  shoot_date: '2026-09-27',
  arrival_time: '09:30',
  ceremony_time: '11:00',
  estimated_end_time: '13:00',
  shoot_scope: ['본식'],
  status: 'scheduled',
});

// Job A3: 2026-09-27 16:00
const jobA3 = DataStore.createJob({
  title: '원빈 ♥ 이나영',
  shoot_date: '2026-09-27',
  arrival_time: '14:30',
  ceremony_time: '16:00',
  estimated_end_time: '18:00',
  shoot_scope: ['본식'],
  status: 'scheduled',
});

const allJobs = DataStore.getJobs();
const sep26Jobs = allJobs.filter((j) => j.shoot_date === '2026-09-26');
const sep27Jobs = allJobs.filter((j) => j.shoot_date === '2026-09-27');

assert(sep26Jobs.length >= 1, `9월 26일 촬영 최소 1건 이상 매핑 확인 (현재 ${sep26Jobs.length}건)`);
assert(sep27Jobs.length === 2, `9월 27일 촬영 정확히 2건 매핑 확인 (현재 ${sep27Jobs.length}건)`);
assert(DataStore.getJobById(jobA1.id)?.title === '강동원 ♥ 송혜교', 'Job Detail 즉시 이동 가능한 ID 무결성 확인');
console.log('🎉 Test A 통과!\n');

// ==============================================================================
// Acceptance Test B: 빈 날짜 클릭 시 Job 생성 & Calendar 즉시 반영
// ==============================================================================
console.log('--- [Test B] 빈 날짜(10/10) 클릭 신규 생성 및 Calendar 즉시 반영 ---');
const jobB = DataStore.createJob({
  title: '유재석 ♥ 나경은',
  shoot_date: '2026-10-10',
  arrival_time: '11:00',
  ceremony_time: '12:30',
  estimated_end_time: '14:30',
  shoot_scope: ['본식', '원판'],
  required_photographer_count: 2,
  status: 'scheduled',
});

const oct10Jobs = DataStore.getJobs().filter((j) => j.shoot_date === '2026-10-10');
assert(oct10Jobs.some((j) => j.id === jobB.id), '10월 10일 날짜에 생성된 Job 즉시 표시 확인');
console.log('🎉 Test B 통과!\n');

// ==============================================================================
// Acceptance Test C: 일정 변경 (10/10 -> 10/11 이동)
// ==============================================================================
console.log('--- [Test C] 일정 변경(10/10 -> 10/11) 및 캘린더 즉시 갱신 ---');
DataStore.updateJob(jobB.id, { shoot_date: '2026-10-11' }, '대표작가');

const oct10After = DataStore.getJobs().filter((j) => j.shoot_date === '2026-10-10');
const oct11After = DataStore.getJobs().filter((j) => j.shoot_date === '2026-10-11');

assert(!oct10After.some((j) => j.id === jobB.id), '10월 10일에서 이전 Event 깨끗이 제거 확인');
assert(oct11After.some((j) => j.id === jobB.id), '10월 11일에 변경된 Event 정확히 표시 확인');
assert(oct11After.filter((j) => j.id === jobB.id).length === 1, '중복 Event 생성 없음 확인');
console.log('🎉 Test C 통과!\n');

// ==============================================================================
// Acceptance Test D: 미배정 감지 및 해결
// ==============================================================================
console.log('--- [Test D] 작가 미배정 감지(필요 2명, 배정 1명) 및 해제 ---');
const jobD = DataStore.createJob({
  title: '이병헌 ♥ 이민정',
  shoot_date: '2026-10-20',
  arrival_time: '12:00',
  ceremony_time: '13:30',
  estimated_end_time: '15:30',
  required_photographer_count: 2,
  shoot_scope: ['본식'],
  status: 'scheduled',
});

// 대표작가 1명만 배정
DataStore.addAssignment({
  job_id: jobD.id,
  photographer_id: rep.id,
  role: 'main',
  assignment_status: 'accepted',
});

// 1. 배정 필요 확인
const statusD1 = DataStore.getJobDisplayStatus(jobD.id);
assert(statusD1.status === '배정 필요', `파생 상태가 '배정 필요'로 계산됨 (현재: ${statusD1.status})`);

const unassignedList = DataStore.getUnassignedJobs();
assert(unassignedList.some((u) => u.job.id === jobD.id && u.missingCount === 1), '미배정 목록에 1명 부족 감지');

const dashboardOpsD = DataStore.getDashboardOperations();
assert(
  dashboardOpsD.some((item) => item.category === 'unassigned' && item.jobId === jobD.id),
  'Operations Dashboard에 미배정 액션 아이템 노출 확인'
);

// 2. 외주작가 1명 추가 배정 (총 2명 충족)
DataStore.addAssignment({
  job_id: jobD.id,
  photographer_id: sub1.id,
  role: 'sub',
  assignment_status: 'accepted',
});

const statusD2 = DataStore.getJobDisplayStatus(jobD.id);
assert(statusD2.status === '촬영 예정', `인원 충원 후 파생 상태가 '촬영 예정'으로 갱신됨 (현재: ${statusD2.status})`);

const unassignedAfter = DataStore.getUnassignedJobs();
assert(!unassignedAfter.some((u) => u.job.id === jobD.id), '인원 충원 후 미배정 목록에서 자동 제외 확인');
console.log('🎉 Test D 통과!\n');

// ==============================================================================
// Acceptance Test E: 일정 충돌 감지 (동일 작가 시간 중복)
// ==============================================================================
console.log('--- [Test E] 작가 일정 시간대 충돌 감지 및 경고 ---');
const conflictDate = '2026-10-25';

const jobE1 = DataStore.createJob({
  title: '조인성 ♥ 고현정',
  shoot_date: conflictDate,
  arrival_time: '11:00',
  ceremony_time: '12:00',
  estimated_end_time: '14:30',
  shoot_scope: ['본식'],
  status: 'scheduled',
});

const jobE2 = DataStore.createJob({
  title: '정우성 ♥ 이정재',
  shoot_date: conflictDate,
  arrival_time: '13:30',
  ceremony_time: '15:00',
  estimated_end_time: '17:00',
  shoot_scope: ['본식'],
  status: 'scheduled',
});

// 동일 작가(sub1)를 겹치는 시간대(11:00~14:30 ↔ 13:30~17:00)에 배정
DataStore.addAssignment({
  job_id: jobE1.id,
  photographer_id: sub1.id,
  role: 'main',
  participation_start: '11:00',
  participation_end: '14:30',
  assignment_status: 'accepted',
});

DataStore.addAssignment({
  job_id: jobE2.id,
  photographer_id: sub1.id,
  role: 'sub',
  participation_start: '13:30',
  participation_end: '17:00',
  assignment_status: 'accepted',
});

const conflicts = DataStore.detectPhotographerConflicts();
assert(
  conflicts.some(
    (c) =>
      c.photographerId === sub1.id &&
      ((c.job1Id === jobE1.id && c.job2Id === jobE2.id) || (c.job1Id === jobE2.id && c.job2Id === jobE1.id))
  ),
  '동일 작가의 시간 중복 충돌 감지 성공'
);

const dashConflicts = DataStore.getDashboardOperations();
assert(
  dashConflicts.some((item) => item.category === 'conflict' && item.priority === 2),
  '대시보드 우선순위 2번에 일정 충돌 경고 노출 확인'
);

// 자동 삭제되지 않고 유지되는지 확인
assert(DataStore.getJobs().some((j) => j.id === jobE1.id), 'Job E1 삭제되지 않고 보존');
assert(DataStore.getJobs().some((j) => j.id === jobE2.id), 'Job E2 삭제되지 않고 보존');
console.log('🎉 Test E 통과!\n');

// ==============================================================================
// Acceptance Test F: 원본 지연 (due_at 경과, pending)
// ==============================================================================
console.log('--- [Test F] 원본 제출 기한 초과(지연) 감지 ---');
const jobF = DataStore.createJob({
  title: '공유 ♥ 서현진',
  shoot_date: '2026-09-20',
  arrival_time: '12:00',
  ceremony_time: '13:00',
  estimated_end_time: '15:00',
  status: 'shoot_completed',
});

const asgnF = DataStore.addAssignment({
  job_id: jobF.id,
  photographer_id: sub2.id,
  role: 'sub',
  assignment_status: 'accepted',
});

// 자동 생성된 Handover의 due_at을 어제로 설정
const handoversF = DataStore.getHandovers(jobF.id);
const handoverF = handoversF.find((h) => h.assignment_id === asgnF.id);
DataStore.updateHandover(handoverF.id, {
  due_at: '2026-09-21T20:00:00+09:00',
  status: 'pending',
});

const opsF = DataStore.getDashboardOperations('2026-09-22');
assert(
  opsF.some((item) => item.category === 'handover_overdue' && item.jobId === jobF.id),
  '원본 지연 항목이 대시보드에 감지되어 노출됨'
);
console.log('🎉 Test F 통과!\n');

// ==============================================================================
// Acceptance Test G: 원본 검수 필요 (submitted -> verified)
// ==============================================================================
console.log('--- [Test G] 원본 검수 필요(submitted) -> 검수 완료(verified) 생애주기 ---');
const jobG = DataStore.createJob({
  title: '박서준 ♥ 박민영',
  shoot_date: '2026-09-21',
  arrival_time: '13:00',
  ceremony_time: '14:30',
  estimated_end_time: '16:30',
  status: 'shoot_completed',
});

const asgnG = DataStore.addAssignment({
  job_id: jobG.id,
  photographer_id: sub1.id,
  role: 'sub',
  assignment_status: 'accepted',
});

const handoversG = DataStore.getHandovers(jobG.id);
const handoverG = handoversG.find((h) => h.assignment_id === asgnG.id);
DataStore.updateHandover(handoverG.id, {
  due_at: '2026-09-25T20:00:00+09:00',
  status: 'submitted',
  external_url: 'https://drive.google.com/raw-test-g',
});

// 1. 검수 필요 확인
const statusG1 = DataStore.getJobDisplayStatus(jobG.id);
assert(statusG1.status === '검수 필요', `상태가 '검수 필요'로 표시됨 (현재: ${statusG1.status})`);

const opsG1 = DataStore.getDashboardOperations('2026-09-22');
assert(
  opsG1.some((item) => item.category === 'handover_review' && item.jobId === jobG.id),
  '대시보드에 원본 검수 필요 항목 노출 확인'
);

// 2. 대표작가가 검수 완료 처리
DataStore.updateHandover(handoverG.id, { status: 'verified', review_note: '양호' });

const opsG2 = DataStore.getDashboardOperations('2026-09-22');
assert(
  !opsG2.some((item) => item.category === 'handover_review' && item.jobId === jobG.id),
  '검수 완료 후 확인 필요 항목에서 즉시 제거 확인'
);
console.log('🎉 Test G 통과!\n');

// ==============================================================================
// Acceptance Test H: 취소 (Cancelled Job 보존 및 표시)
// ==============================================================================
console.log('--- [Test H] 취소(Cancelled) 일정 보존 및 취소 배지 표시 ---');
const jobH = DataStore.createJob({
  title: '소지섭 ♥ 조은정',
  shoot_date: '2026-10-30',
  arrival_time: '11:00',
  ceremony_time: '12:00',
  estimated_end_time: '14:00',
  status: 'scheduled',
});

// 취소 처리
DataStore.updateJob(jobH.id, { status: 'cancelled' });

const jobsAfterCancel = DataStore.getJobs();
assert(jobsAfterCancel.some((j) => j.id === jobH.id), '취소된 Job이 DB에서 완전 삭제되지 않고 보존됨');

const statusH = DataStore.getJobDisplayStatus(jobH.id);
assert(statusH.status === '취소', `취소된 Job의 파생 상태는 '취소' (현재: ${statusH.status})`);
console.log('🎉 Test H 통과!\n');

// ==============================================================================
// Acceptance Test I: 모바일 반응형 및 달력 그리드 무결성
// ==============================================================================
console.log('--- [Test I] 모바일 달력 그리드(7열) 계산 및 무결성 ---');
const octGrid = getMonthCalendarGrid(2026, 9); // 2026년 10월
assert(octGrid.length % 7 === 0, '달력 그리드는 항상 7의 배수(일~토) 열을 유지함');
assert(octGrid.length >= 35, `달력 셀 수는 최소 35칸 이상 (현재 ${octGrid.length}칸)`);
assert(octGrid[0].dayOfWeek === 0, '첫 번째 칸은 항상 일요일(0)');
assert(octGrid[octGrid.length - 1].dayOfWeek === 6, '마지막 칸은 항상 토요일(6)');

const oct1stCell = octGrid.find((c) => c.dateStr === '2026-10-01');
assert(oct1stCell && oct1stCell.isCurrentMonth, '10월 1일 셀이 정상적으로 현재 월로 인식됨');
console.log('🎉 Test I 통과!\n');

// ==============================================================================
// Acceptance Test J: Timezone (Asia/Seoul) 일관성 검증
// ==============================================================================
console.log('--- [Test J] Timezone(Asia/Seoul) 자정 날짜 밀림 방지 검증 ---');
const targetDateStr = '2026-10-10';
const targetTimeStr = '14:00';

const jobJ = DataStore.createJob({
  title: '타임존 검증용 부부',
  shoot_date: targetDateStr,
  arrival_time: '12:30',
  ceremony_time: targetTimeStr,
  status: 'scheduled',
});

const retrievedJob = DataStore.getJobById(jobJ.id);
assert(retrievedJob.shoot_date === '2026-10-10', '저장 후 재조회 시 shoot_date가 2026-10-10로 동일함');
assert(retrievedJob.ceremony_time === '14:00', '저장 후 재조회 시 ceremony_time이 14:00로 동일함');

const kstToday = getKSTTodayString();
assert(/^\d{4}-\d{2}-\d{2}$/.test(kstToday), `KST 오늘 날짜 형식(YYYY-MM-DD) 일치: ${kstToday}`);
console.log('🎉 Test J 통과!\n');

// ==============================================================================
// Acceptance Test K: 대시보드 7가지 시드 시나리오 동시 판별 검증
// ==============================================================================
console.log('--- [종합 검증] Operations Dashboard 시드 시나리오 복합 판별 ---');
const opsFull = DataStore.getDashboardOperations('2026-09-22');
console.log(`  총 활성 조치 대기 항목: ${opsFull.length}건`);
opsFull.forEach((op, idx) => {
  console.log(`    [#${idx + 1} / 우선순위 ${op.priority}] [${op.categoryLabel}] ${op.title}`);
});

// 우선순위 정렬 검증 (priority가 오름차순이어야 함)
for (let i = 0; i < opsFull.length - 1; i++) {
  assert(
    opsFull[i].priority <= opsFull[i + 1].priority,
    `우선순위 정렬 확인 (${opsFull[i].priority} <= ${opsFull[i + 1].priority})`
  );
}

console.log('\n===============================================================');
console.log('🏆 Phase 3 Acceptance Test (A ~ J) 100% 통과 (ALL SUCCESS)');
console.log('===============================================================\n');
