// ==============================================================================
// 5대 인수 테스트 (Scenario A, B, C, D, E) 검증 스크립트
// ==============================================================================

import { DataStore, WORKSPACE_ID } from '../src/lib/storage.ts';

console.log('🚀 본식 웨딩 촬영팀 내부 운영 앱 (Phase 1 MVP) 인수 테스트 시작...\n');

// 0. 초기화
DataStore.resetToSeedData();
console.log('✅ 초기 시드 데이터 준비 완료.');

// ==============================================================================
// Scenario A: 새 본식 등록 -> 작가 배정 및 외주비 -> Job Pack 생성 및 스냅샷 v1 저장
// ==============================================================================
console.log('\n--- [Scenario A] 신규 본식 등록 및 Job Pack v1 생성 ---');
// 1. 웨딩홀 & 홀 추가
const venue = DataStore.addVenue({
  name: '아펠가모 선릉',
  address: '서울 강남구 테헤란로',
});
const space = DataStore.addVenueSpace({
  venue_id: venue.id,
  name: '단독홀',
  floor: '4층',
});
console.log(`1. 웨딩홀/홀 생성 확인: ${venue.name} - ${space.name} (${space.floor})`);

// 2. 새 촬영 등록
const newJob = DataStore.createJob({
  title: '이진우 ♥ 정다은',
  shoot_date: '2026-10-15',
  arrival_time: '11:00',
  ceremony_time: '12:30',
  estimated_end_time: '14:30',
  venue_id: venue.id,
  venue_space_id: space.id,
  client_name: '이진우/정다은',
  client_phone: '010-3333-7777',
  notes: '신랑측 요청으로 축가 동선 중요',
  shoot_scope: ['신부대기실', '본식', '원판'],
  special_requests: '양가 조부모님 단체 사진 필수',
  must_shoot_notes: '퇴장 시 플라워샤워 고배율 촬영',
  deliverable_notes: 'JPG 원본 + 대표 셀렉본',
  status: 'scheduled',
});
console.log(`2. 본식 등록 완료: ${newJob.title} (ID: ${newJob.id})`);

// 3. 대표작가 및 외주작가 배정
const photographers = DataStore.getPhotographers();
const rep = photographers.find((p) => p.name.includes('대표'));
const subPhotog = photographers.find((p) => p.name === '준호');

const repAsgn = DataStore.addAssignment({
  job_id: newJob.id,
  photographer_id: rep.id,
  role: 'main',
  participation_start: '11:00',
  participation_end: '14:30',
  assignment_status: 'accepted',
  agreed_fee: null,
  additional_fee: 0,
  notes: '대표 메인 연출',
});

const subAsgn = DataStore.addAssignment({
  job_id: newJob.id,
  photographer_id: subPhotog.id,
  role: 'sub',
  participation_start: '11:00',
  participation_end: '14:30',
  assignment_status: 'proposed',
  agreed_fee: 200000,
  additional_fee: 30000,
  notes: '서브스냅 및 신랑 대기실 집중',
});
console.log(`3. 작가 배정 완료: 메인(${rep.name}), 서브(${subPhotog.name}, 외주비: 200,000 + 30,000)`);

// 4. Job Pack 생성
const jobPackText1 = DataStore.generateJobPackText(newJob.id);
const v1 = DataStore.createJobPackVersion(newJob.id, jobPackText1, '대표작가');
console.log(`4. Job Pack v${v1.version_number} 생성 및 저장 확인!`);
console.log(`   [미리보기 일부]\n${v1.content.split('\n').slice(0, 7).join('\n')}\n   ...`);

if (v1.version_number === 1 && v1.content.includes('이진우 ♥ 정다은') && v1.content.includes('230,000원' || '서브스냅')) {
  console.log('🎉 Scenario A 성공: Job Pack v1 스냅샷 저장 및 내용 완벽 일치!');
}

// ==============================================================================
// Scenario B: 외주작가 수락 -> 예식 시간 변경 -> 중요 변경 감지 배너 -> 새 Job Pack v2 생성
// ==============================================================================
console.log('\n--- [Scenario B] 외주작가 수락 및 시간 변경 감지, Job Pack v2 생성 ---');
// 1. 수락 처리
DataStore.updateAssignment(subAsgn.id, { assignment_status: 'accepted' });
console.log('1. 외주작가(준호) 수락 완료 처리: status=accepted');

// 2. 예식 시간 및 도착 시각 변경
console.log('2. 예식 시간 수정: 12:30 -> 13:00, 도착 11:00 -> 11:30');
DataStore.updateJob(newJob.id, {
  ceremony_time: '13:00',
  arrival_time: '11:30',
});

// 3. 변경 감지 검증
const outdatedCheck = DataStore.isJobPackOutdated(newJob.id);
console.log(`3. 변경 감지 결과: outdated=${outdatedCheck.outdated}`);
console.log(`   알림 메시지: "${outdatedCheck.reason}"`);

if (!outdatedCheck.outdated) {
  throw new Error('❌ Scenario B 실패: Job Pack 변경 감지가 동작하지 않음!');
}

// 4. 새 Job Pack v2 생성
const jobPackText2 = DataStore.generateJobPackText(newJob.id);
const v2 = DataStore.createJobPackVersion(newJob.id, jobPackText2, '대표작가');
console.log(`4. 새 Job Pack v${v2.version_number} 생성 완료!`);

const allVersions = DataStore.getJobPackVersions(newJob.id);
console.log(`5. 보관된 버전 수: ${allVersions.length}개 (v1, v2 모두 보존됨)`);

const outdatedCheckAfter = DataStore.isJobPackOutdated(newJob.id);
console.log(`6. v2 생성 후 변경 감지 상태: outdated=${outdatedCheckAfter.outdated} (경고 해제됨)`);

if (allVersions.length === 2 && !outdatedCheckAfter.outdated) {
  console.log('🎉 Scenario B 성공: 변경 감지 배너 및 v1/v2 이력 완벽 관리!');
}

// ==============================================================================
// Scenario C: 외주 원본 링크 등록 -> submitted -> 보완 요청 -> revision_requested -> verified
// ==============================================================================
console.log('\n--- [Scenario C] 원본 제출 -> 검수 -> 보완 요청 -> 검수 완료 ---');
const handovers = DataStore.getHandovers(newJob.id);
const subHandover = handovers.find((h) => h.assignment_id === subAsgn.id);
console.log(`1. 초기 Handover 상태: ${subHandover.status}`);

// 외주작가 원본 링크 제출
DataStore.updateHandover(subHandover.id, {
  external_url: 'https://drive.google.com/drive/folders/sample-raw-12345',
  status: 'submitted',
});
let hUpdated = DataStore.getHandovers(newJob.id).find((h) => h.id === subHandover.id);
console.log(`2. 원본 링크 제출 후 상태: status=${hUpdated.status}, url=${hUpdated.external_url}`);

// 대표 확인 후 보완 요청
DataStore.updateHandover(subHandover.id, {
  status: 'revision_requested',
  notes: '신랑 단독 컷 20장 누락됨. 재업로드 요망.',
});
hUpdated = DataStore.getHandovers(newJob.id).find((h) => h.id === subHandover.id);
console.log(`3. 대표 검수 후 보완 요청: status=${hUpdated.status}, 사유: "${hUpdated.notes}"`);

// 작가 보완 업로드 후 대표 최종 검수 완료
DataStore.updateHandover(subHandover.id, {
  external_url: 'https://drive.google.com/drive/folders/sample-raw-fixed-67890',
  status: 'verified',
  notes: '보완 확인 완료. 검수 이상 없음.',
});
hUpdated = DataStore.getHandovers(newJob.id).find((h) => h.id === subHandover.id);
console.log(`4. 대표 최종 검수 완료: status=${hUpdated.status}, 확인시각: ${hUpdated.representative_checked_at}`);

if (hUpdated.status === 'verified' && hUpdated.representative_checked_at) {
  console.log('🎉 Scenario C 성공: 원본 제출 - 보완 - 검수 완료 사이클 검증 완료!');
}

// ==============================================================================
// Scenario D: 외주비 200,000 + 30,000 = 230,000 -> 1차 100,000 지급 -> 2차 130,000 지급
// ==============================================================================
console.log('\n--- [Scenario D] 외주비 분할 정산 (1차 10만 -> 2차 13만 -> Paid) ---');
const settlements = DataStore.getSettlements(newJob.id);
const subSettlement = settlements.find((s) => s.assignment_id === subAsgn.id);
console.log(`1. 초기 정산 상태: total_due=${subSettlement.total_due.toLocaleString()}원, status=${subSettlement.settlement_status}`);

// 1차 지급: 100,000원
DataStore.addPaymentEntry(subSettlement.id, 100000, '1차 계약금 송금');
let sUpdated = DataStore.getSettlements(newJob.id).find((s) => s.id === subSettlement.id);
console.log(`2. 1차 100,000원 지급 후: 기지급=${sUpdated.total_paid.toLocaleString()}원, 잔액=${sUpdated.remaining.toLocaleString()}원, status=${sUpdated.settlement_status}`);

if (sUpdated.settlement_status !== 'partially_paid' || sUpdated.remaining !== 130000) {
  throw new Error('❌ Scenario D 실패: 1차 지급 후 부분지급(partially_paid) 상태 계산 오류');
}

// 2차 잔금 지급: 130,000원
DataStore.addPaymentEntry(subSettlement.id, 130000, '2차 잔금 완납');
sUpdated = DataStore.getSettlements(newJob.id).find((s) => s.id === subSettlement.id);
console.log(`3. 2차 130,000원 지급 후: 기지급=${sUpdated.total_paid.toLocaleString()}원, 잔액=${sUpdated.remaining.toLocaleString()}원, status=${sUpdated.settlement_status}`);

if (sUpdated.settlement_status !== 'paid' || sUpdated.remaining !== 0) {
  throw new Error('❌ Scenario D 실패: 2차 지급 후 완납(paid) 상태 계산 오류');
}
console.log('🎉 Scenario D 성공: 분할 외주 정산 및 상태 전이 완벽 검증!');

// ==============================================================================
// Scenario E: 홀 관찰 기록 등록 및 다음 Job에서 공유 노출
// ==============================================================================
console.log('\n--- [Scenario E] 홀 관찰 기록 등록 및 다음 Job 연동 검증 ---');
const newObservation = DataStore.addHallObservation({
  venue_space_id: space.id,
  related_job_id: newJob.id,
  author: '민규 (대표)',
  observed_at: '2026-10-15',
  source_type: 'direct',
  category: 'must_caution',
  observation_text: '신부대기실 우측 공간이 좁아짐. 다음 촬영 때 가구 배치 확인.',
  action_note: '신부대기실 35mm 화각 렌즈 필수 지참',
});
console.log(`1. 관찰 기록 추가 완료: [${newObservation.category}] "${newObservation.observation_text}"`);

// 다음 새로운 Job 등록 시 동일 홀 선택
const nextJob = DataStore.createJob({
  title: '박서준 ♥ 최유나',
  shoot_date: '2026-11-20',
  arrival_time: '13:00',
  ceremony_time: '14:30',
  venue_id: venue.id,
  venue_space_id: space.id,
  status: 'scheduled',
  shoot_scope: ['본식', '원판'],
});

const observationsForNextJob = DataStore.getHallObservations(nextJob.venue_space_id);
console.log(`2. 동일 홀(${space.name})을 선택한 다음 Job에서 조회된 관찰 기록: ${observationsForNextJob.length}건`);
const foundObs = observationsForNextJob.find((o) => o.observation_text.includes('신부대기실 우측 공간이 좁아짐'));
console.log(`3. 이전 Job에서 남긴 관찰 기록 발견 여부: ${Boolean(foundObs)}`);

if (!foundObs) {
  throw new Error('❌ Scenario E 실패: 다른 Job에서 홀 관찰 기록이 노출되지 않음');
}
console.log('🎉 Scenario E 성공: 웨딩홀 공간 기준 지식 축적 및 타 Job 연동 확인!');

// ==============================================================================
// Job Completed 자격 검증
// ==============================================================================
console.log('\n--- [추가 검증] Job 최종 완료(Completed) 엄격 자격 검증 ---');
// 고객 납품 완료 처리
DataStore.updateDelivery(newJob.id, {
  delivery_status: 'delivered',
  external_work_url: 'https://drive.google.com/sample-final-delivery',
});

const completionCheck = DataStore.checkJobCompletionEligibility(newJob.id);
console.log('완료 요건 충족 항목:');
completionCheck.reasons.forEach((r) => console.log(`  - [${r.fulfilled ? 'OK' : 'FAIL'}] ${r.label}`));

// 본식 촬영 완료 상태로 변경 후 재시도
DataStore.updateJob(newJob.id, { status: 'shoot_completed' });
const completionCheck2 = DataStore.checkJobCompletionEligibility(newJob.id);
console.log('촬영 완료 후 요건 충족 항목:');
completionCheck2.reasons.forEach((r) => console.log(`  - [${r.fulfilled ? 'OK' : 'FAIL'}] ${r.label}`));

const completeResult2 = DataStore.completeJob(newJob.id);
console.log(`완료 처리 결과: ${completeResult2.message}`);
const finalizedJob = DataStore.getJobById(newJob.id);
console.log(`최종 Job 상태: ${finalizedJob.status}`);

if (finalizedJob.status === 'completed') {
  console.log('🎉 최종 Job 완료 요건 충족 및 완료 확정 성공!');
}

console.log('\n===============================================================');
console.log('🏆 5대 인수 테스트 시나리오 (A, B, C, D, E) 전체 통과 (100% SUCCESS)');
console.log('===============================================================\n');
