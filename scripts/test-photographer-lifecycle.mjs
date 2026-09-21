// ==============================================================================
// 작가 관리(Photographer) 생애주기 및 Assignment 무결성 인수 테스트 (14단계)
// ==============================================================================
import { DataStore } from '../src/lib/storage.ts';

console.log('🧪 작가 관리(Photographer) Phase 1 인수 테스트 시작...\n');

// 0. 초기화
DataStore.resetToSeedData();
const initialPhotogs = DataStore.getAllPhotographers();
console.log(`0. 초기 작가 수: ${initialPhotogs.length}명`);

// Step 1~3: 준호 작가 생성 및 연락처/메모 입력 후 저장
const created = DataStore.addPhotographer({
  name: '준호',
  phone: '010-9999-8888',
  notes: '소니 A7M4 / 서브스냅 전문',
  is_active: true,
});
console.log(`1~3. 준호 작가 생성 완료: ID=${created.id}, name=${created.name}, phone=${created.phone}`);
if (!created.id || created.name !== '준호') {
  throw new Error('❌ Step 1~3 실패: 작가 생성 오류');
}

// Step 4: 목록에서 준호 확인
const listAfterAdd = DataStore.getAllPhotographers();
const foundJunho = listAfterAdd.find((p) => p.id === created.id);
console.log(`4. 목록에서 준호 확인: ${foundJunho?.name} (active: ${foundJunho?.is_active})`);
if (!foundJunho || foundJunho.name !== '준호') {
  throw new Error('❌ Step 4 실패: 목록에서 생성된 작가를 찾을 수 없음');
}

// Step 5: 과거 Job 생성 및 준호 작가 배정 (Assignment 무결성 검증용)
const sampleJob = DataStore.createJob({
  title: '테스트신랑 ♥ 테스트신부',
  shoot_date: '2026-11-01',
  arrival_time: '11:00',
  ceremony_time: '12:30',
  shoot_scope: ['본식', '원판'],
  status: 'scheduled',
});

const asgn = DataStore.addAssignment({
  job_id: sampleJob.id,
  photographer_id: created.id,
  role: 'sub',
  participation_start: '11:00',
  participation_end: '14:30',
  agreed_fee: 250000,
  additional_fee: 20000,
  notes: '서브스냅 집중',
});
console.log(`[사전준비] 과거 Job(ID: ${sampleJob.id})에 준호 작가 배정 완료 (Assignment ID: ${asgn.id})`);

// Step 6~8: 수정 진입 -> 이름을 '김준호'로 변경 -> 연락처 변경 -> 저장
const updated = DataStore.updatePhotographer(created.id, {
  name: '김준호',
  phone: '010-1234-5678',
  notes: '수석 서브스냅 작가로 승격',
});
console.log(`6~8. 수정 저장 완료: name=${updated.name}, phone=${updated.phone}`);
if (updated.name !== '김준호' || updated.phone !== '010-1234-5678') {
  throw new Error('❌ Step 6~8 실패: 작가 정보 수정 실패');
}

// Step 9: 기존 Photographer ID 유지 확인
console.log(`9. 기존 Photographer ID 유지 확인: 원래ID(${created.id}) === 수정후ID(${updated.id})`);
if (created.id !== updated.id) {
  throw new Error('❌ Step 9 실패: Photographer ID가 변경됨!');
}

// Step 10: 기존 Assignment 유지 확인
const jobAssignments = DataStore.getAssignments(sampleJob.id);
const targetAsgn = jobAssignments.find((a) => a.id === asgn.id);
console.log(`10. 기존 Assignment 유지 확인: assignment_id=${targetAsgn?.id}, photographer_id=${targetAsgn?.photographer_id}`);
if (!targetAsgn || targetAsgn.photographer_id !== created.id) {
  throw new Error('❌ Step 10 실패: Assignment의 photographer_id 연결이 손상됨!');
}

// Step 11: active = false 처리
const deactivated = DataStore.updatePhotographer(created.id, { is_active: false });
console.log(`11. active=false 처리 완료: is_active=${deactivated.is_active}`);
if (deactivated.is_active !== false) {
  throw new Error('❌ Step 11 실패: 비활성화 실패');
}

// Step 12: 신규 Assignment 선택 목록에서 숨겨짐 확인 (getPhotographers는 active만 반환)
const activePhotogs = DataStore.getPhotographers();
const isHiddenFromNew = !activePhotogs.some((p) => p.id === created.id);
console.log(`12. 신규 Assignment 선택 목록에서 숨겨짐 확인: hidden=${isHiddenFromNew}`);
if (!isHiddenFromNew) {
  throw new Error('❌ Step 12 실패: 비활성 작가가 신규 배정 가능 목록(active)에 노출됨!');
}

// Step 13: 과거 Job에서는 김준호 기록이 정상 표시됨 확인
const allPhotogs = DataStore.getAllPhotographers();
const pastPhotogRecord = allPhotogs.find((p) => p.id === targetAsgn.photographer_id);
console.log(`13. 과거 Job에서 김준호 기록 확인: 이름=${pastPhotogRecord?.name}, 연락처=${pastPhotogRecord?.phone}, 상태=${pastPhotogRecord?.is_active ? '활성' : '비활성'}`);
if (!pastPhotogRecord || pastPhotogRecord.name !== '김준호') {
  throw new Error('❌ Step 13 실패: 과거 Job에서 수정된 이름(김준호)으로 조회되지 않음!');
}

// Step 14: 다시 active=true로 복구 가능 확인
const reactivated = DataStore.updatePhotographer(created.id, { is_active: true });
const activePhotogsAfter = DataStore.getPhotographers();
const isRestored = activePhotogsAfter.some((p) => p.id === created.id && p.is_active === true);
console.log(`14. 다시 active=true 복구 확인: restored=${isRestored}, is_active=${reactivated.is_active}`);
if (!isRestored) {
  throw new Error('❌ Step 14 실패: 작가 재활성화 실패!');
}

console.log('\n===============================================================');
console.log('🏆 Photographer 생애주기 14단계 인수 테스트 100% 통과 (SUCCESS)');
console.log('===============================================================');
