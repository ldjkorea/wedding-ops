// ==============================================================================
// Dear Memory OS — Storage Provider & Google Sheets Adapter 단위/통합 테스트
// ==============================================================================

import { DataStore, localAdapter, sheetsAdapter, WORKSPACE_ID } from '../src/lib/storage.ts';
import { LocalStorageAdapter, STORAGE_KEY_V2 } from '../src/lib/storage/LocalStorageAdapter.ts';
import { GoogleSheetsAdapter } from '../src/lib/storage/GoogleSheetsAdapter.ts';
import { getStorageConfig, saveStorageConfig, STORAGE_CONFIG_KEY } from '../src/lib/storage/config.ts';

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exit(1);
  }
  console.log(`  ✅ ${message}`);
}

console.log('🚀 Storage Provider & Google Sheets Adapter 테스트 시작...\n');

// ==============================================================================
// 1. LocalStorageAdapter 검증
// ==============================================================================
console.log('--- [1. LocalStorageAdapter 검증] ---');

const testInitialState = () => ({
  workspace: { id: WORKSPACE_ID, name: '테스트 스튜디오', created_at: '', updated_at: '' },
  photographers: [],
  venues: [],
  venue_spaces: [],
  jobs: [
    {
      id: 'job-test-001',
      workspace_id: WORKSPACE_ID,
      title: '테스트 신랑 ♥ 테스트 신부',
      shoot_date: '2026-10-15',
      arrival_time: '11:00',
      ceremony_time: '12:30',
      shoot_scope: ['본식'],
      status: 'scheduled',
      created_at: '',
      updated_at: '',
    },
  ],
  assignments: [],
  job_pack_versions: [],
  change_events: [],
  handovers: [],
  settlements: [],
  payment_entries: [],
  deliveries: [],
  hall_observations: [],
});

const customLocalAdapter = new LocalStorageAdapter(testInitialState);
assert(customLocalAdapter.providerType === 'local', 'LocalStorageAdapter providerType은 local임');

const testConn = await customLocalAdapter.testConnection();
assert(testConn.success, `로컬 연결 테스트 성공: ${testConn.message}`);

const loadedState = await customLocalAdapter.loadState();
assert(loadedState.jobs.length === 1, `초기 상태 로드 완료 (Job 수: ${loadedState.jobs.length})`);
assert(loadedState.jobs[0].id === 'job-test-001', 'Job ID 보존 확인');

// 데이터 수정 저장
loadedState.jobs[0].title = '수정된 신랑 ♥ 수정된 신부';
await customLocalAdapter.saveState(loadedState);

const reloadedState = await customLocalAdapter.loadState();
assert(reloadedState.jobs[0].title === '수정된 신랑 ♥ 수정된 신부', '로컬 저장 후 재로드 무결성 확인');

const exported = await customLocalAdapter.exportAllData();
assert(exported.jobs[0].id === 'job-test-001', 'exportAllData 정상 작동 확인');
console.log('🎉 LocalStorageAdapter 검증 통과!\n');

// ==============================================================================
// 2. Storage Config 분리 저장 검증
// ==============================================================================
console.log('--- [2. Storage Config 설정 분리 보관 검증] ---');
assert(STORAGE_CONFIG_KEY === 'dear_memory_storage_config', '설정 키는 업무 데이터와 엄격히 분리된 별도 키 사용');

saveStorageConfig({
  provider: 'local',
  googleSheetsUrl: 'https://script.google.com/macros/s/sample-test/exec',
});

const cfg = getStorageConfig();
assert(cfg.provider === 'local', '기본 프로바이더 local 유지');
assert(cfg.googleSheetsUrl.includes('sample-test'), 'Google Sheets URL 별도 저장 확인');
console.log('🎉 Storage Config 검증 통과!\n');

// ==============================================================================
// 3. GoogleSheetsAdapter 계약(Contract) 및 통신 검증
// ==============================================================================
console.log('--- [3. GoogleSheetsAdapter 계약(Contract) 검증] ---');

// URL 미설정 시 방어 로직 검증
const emptyAdapter = new GoogleSheetsAdapter('');
assert(emptyAdapter.providerType === 'google_sheets', 'providerType은 google_sheets임');
const emptyConn = await emptyAdapter.testConnection();
assert(!emptyConn.success, 'URL 없을 때 연결 실패를 정상 보고함');
assert(emptyConn.message.includes('입력되지 않았습니다'), '친절한 에러 메시지 확인');

// Mock fetch를 이용한 Google Apps Script Web App 응답 검증
const mockUrl = 'https://script.google.com/macros/s/mock-test/exec';
const mockSheetsAdapter = new GoogleSheetsAdapter(mockUrl, WORKSPACE_ID);

// fetch mock 주입
const originalFetch = globalThis.fetch;
globalThis.fetch = async (url, options) => {
  assert(url === mockUrl, `올바른 Apps Script URL로 요청 전송됨 (${url})`);
  assert(options.method === 'POST', 'POST 메서드로 전송');
  assert(options.headers['Content-Type'].includes('text/plain'), 'CORS 회피용 text/plain 헤더 준수');

  const body = JSON.parse(options.body);

  if (body.action === 'health') {
    return {
      ok: true,
      json: async () => ({
        success: true,
        version: '1.0.0',
        spreadsheetTitle: '디어메모리_운영_DB',
        message: 'Google Sheets와 완벽히 연결되었습니다.',
        sheetStatus: { Jobs: true, Photographers: true },
      }),
    };
  }

  if (body.action === 'loadState') {
    return {
      ok: true,
      json: async () => ({
        success: true,
        data: testInitialState(),
        message: '성공',
      }),
    };
  }

  if (body.action === 'saveState') {
    return {
      ok: true,
      json: async () => ({
        success: true,
        message: 'Google Sheets에 저장 완료',
      }),
    };
  }

  if (body.action === 'importAll') {
    return {
      ok: true,
      json: async () => ({
        success: true,
        count: (body.payload.jobs ? body.payload.jobs.length : 0),
        message: '마이그레이션 성공',
      }),
    };
  }

  return { ok: false, status: 400 };
};

try {
  // 1) Health Check
  const healthRes = await mockSheetsAdapter.testConnection();
  assert(healthRes.success, 'Mock Apps Script 연결 테스트 성공');
  assert(healthRes.version === '1.0.0', 'API Version 1.0.0 일치');
  assert(healthRes.spreadsheetTitle === '디어메모리_운영_DB', '스프레드시트 타이틀 수신 확인');

  // 2) loadState
  const remoteData = await mockSheetsAdapter.loadState();
  assert(remoteData.jobs[0].id === 'job-test-001', '원격 상태 조회 성공 및 ID 보존 확인');

  // 3) saveState
  await mockSheetsAdapter.saveState(remoteData);
  assert(true, '원격 saveState 호출 정상 완료');

  // 4) importAll (Migration)
  const importRes = await mockSheetsAdapter.importAllData(remoteData);
  assert(importRes.success, 'Mock Apps Script로 일괄 데이터 마이그레이션 성공');
  assert(importRes.count === 1, '마이그레이션된 레코드 건수 정확성 확인');
} finally {
  globalThis.fetch = originalFetch;
}

console.log('🎉 GoogleSheetsAdapter 계약 검증 통과!\n');

// ==============================================================================
// 4. DataStore 어댑터 전환 및 마이그레이션 서비스 검증
// ==============================================================================
console.log('--- [4. DataStore Provider 전환 및 마이그레이션 검증] ---');

assert(DataStore.getStorageProviderType() === 'local', '기본 활성 프로바이더는 local');

// Google Sheets 전환 시 URL 없으면 실패
const switchFail = await DataStore.switchStorageProvider('google_sheets', '');
assert(!switchFail.success, 'URL 누락 시 전환 거부 확인');

// 로컬 복귀
const switchLocal = await DataStore.switchStorageProvider('local');
assert(switchLocal.success, '로컬 모드 복귀 성공');
assert(DataStore.getStorageProviderType() === 'local', '활성 프로바이더 local 확인');

console.log('🎉 DataStore Provider 전환 검증 통과!\n');

console.log('===============================================================');
console.log('🏆 Storage Provider & Google Sheets Adapter 전체 통과 (ALL SUCCESS)');
console.log('===============================================================\n');
