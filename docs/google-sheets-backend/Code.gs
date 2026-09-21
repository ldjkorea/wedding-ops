/**
 * ==============================================================================
 * Dear Memory OS — Google Apps Script Backend Web App
 * ==============================================================================
 * 
 * 본 코드는 본식 웨딩 촬영팀 내부 운영 앱(Dear Memory OS)의 Google Sheets
 * 중앙 클라우드 저장소 백엔드 스크립트입니다.
 * 
 * [배포 방법]
 * 1. 구글 드라이브에서 새 Google 스프레드시트 생성 (예: "디어메모리_운영_DB")
 * 2. 상단 메뉴: [확장 프로그램] > [Apps Script] 클릭
 * 3. 기존 코드를 지우고 본 파일(Code.gs) 전체를 복사하여 붙여넣기 후 저장(Ctrl+S)
 * 4. 상단 우측 [배포] > [새 배포] 클릭
 * 5. 유형: [웹 앱] 선택
 *    - 설명: "Dear Memory OS v1.0"
 *    - 다음 사용자로 실행: "나(내 계정)"
 *    - 액세스 권한이 있는 사용자: "모든 사용자(Anyone)" (필수)
 * 6. [배포] 클릭 후 승인 절차 진행 -> 발급된 "웹 앱 URL" 복사
 * 7. Dear Memory OS의 [설정] > [데이터 저장소]에서 URL 입력 후 [연결 테스트] 및 [저장]
 */

const API_VERSION = '1.0.0';

// 12개 필수 시트 탭 목록
const REQUIRED_SHEETS = [
  'Jobs',
  'Photographers',
  'Venues',
  'VenueSpaces',
  'Assignments',
  'JobPackVersions',
  'ChangeEvents',
  'Handovers',
  'Settlements',
  'PaymentEntries',
  'Deliveries',
  'HallObservations',
];

/**
 * GET 요청 핸들러 (브라우저 직접 접속 또는 상태 점검)
 */
function doGet(e) {
  return handleHealthCheck();
}

/**
 * POST 요청 핸들러 (Dear Memory OS API 통신 메인 진입점)
 */
function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    // 동시 쓰기 요청 충돌 방지를 위한 최대 30초 대기 락
    lock.waitLock(30000);

    const postData = e.postData && e.postData.contents ? JSON.parse(e.postData.contents) : {};
    const action = postData.action || 'health';
    const payload = postData.payload;

    let result;
    switch (action) {
      case 'health':
        result = handleHealthCheck();
        break;
      case 'initSheets':
        result = handleInitSheets();
        break;
      case 'loadState':
        result = handleLoadState();
        break;
      case 'saveState':
        result = handleSaveState(payload);
        break;
      case 'importAll':
        result = handleImportAll(payload);
        break;
      default:
        result = createJsonResponse({
          success: false,
          error: '알 수 없는 action 요청입니다: ' + action,
        });
    }
    return result;
  } catch (err) {
    return createJsonResponse({
      success: false,
      error: 'Apps Script 실행 중 오류 발생: ' + err.toString(),
    });
  } finally {
    lock.releaseLock();
  }
}

/**
 * JSON 응답 생성 헬퍼
 */
function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * 1. 헬스체크 및 시트 상태 점검
 */
function handleHealthCheck() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = ss.getSheets();
  const sheetNames = sheets.map(s => s.getName());

  const sheetStatus = {};
  REQUIRED_SHEETS.forEach(name => {
    sheetStatus[name] = sheetNames.includes(name);
  });

  const allAvailable = REQUIRED_SHEETS.every(name => sheetStatus[name]);

  return createJsonResponse({
    success: true,
    version: API_VERSION,
    spreadsheetTitle: ss.getName(),
    spreadsheetAvailable: true,
    allSheetsAvailable: allAvailable,
    sheetStatus: sheetStatus,
    message: allAvailable
      ? 'Google Sheets와 완벽히 연결되었습니다. (모든 시트 탭 준비됨)'
      : 'Google Sheets와 연결되었으나 일부 시트 탭 초기화가 필요합니다.',
  });
}

/**
 * 2. 필수 시트 탭 자동 초기화
 */
function handleInitSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  REQUIRED_SHEETS.forEach(name => {
    let sheet = ss.getSheetByName(name);
    if (!sheet) {
      sheet = ss.insertSheet(name);
    }
    // 첫 행에 'id', 'data_json', 'updated_at' 헤더 설정
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['id', 'data_json', 'updated_at']);
      sheet.getRange('1:1').setFontWeight('bold').setBackground('#f3f4f6');
    }
  });

  return createJsonResponse({
    success: true,
    message: '12개 필수 시트 탭이 성공적으로 초기화되었습니다.',
  });
}

/**
 * 3. 전체 업무 상태 로드 (loadState)
 */
function handleLoadState() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const state = {
    workspace: {
      id: '11111111-1111-1111-1111-111111111111',
      name: '디어메모리 (Dear Memory)',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    photographers: readEntitiesFromSheet(ss, 'Photographers'),
    venues: readEntitiesFromSheet(ss, 'Venues'),
    venue_spaces: readEntitiesFromSheet(ss, 'VenueSpaces'),
    jobs: readEntitiesFromSheet(ss, 'Jobs'),
    assignments: readEntitiesFromSheet(ss, 'Assignments'),
    job_pack_versions: readEntitiesFromSheet(ss, 'JobPackVersions'),
    change_events: readEntitiesFromSheet(ss, 'ChangeEvents'),
    handovers: readEntitiesFromSheet(ss, 'Handovers'),
    settlements: readEntitiesFromSheet(ss, 'Settlements'),
    payment_entries: readEntitiesFromSheet(ss, 'PaymentEntries'),
    deliveries: readEntitiesFromSheet(ss, 'Deliveries'),
    hall_observations: readEntitiesFromSheet(ss, 'HallObservations'),
  };

  return createJsonResponse({
    success: true,
    data: state,
    message: 'Google Sheets로부터 전체 데이터를 성공적으로 조회했습니다.',
  });
}

/**
 * 4. 전체 업무 상태 저장 (saveState)
 */
function handleSaveState(state) {
  if (!state) {
    return createJsonResponse({ success: false, error: '저장할 state 페이로드가 없습니다.' });
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();

  writeEntitiesToSheet(ss, 'Photographers', state.photographers || []);
  writeEntitiesToSheet(ss, 'Venues', state.venues || []);
  writeEntitiesToSheet(ss, 'VenueSpaces', state.venue_spaces || []);
  writeEntitiesToSheet(ss, 'Jobs', state.jobs || []);
  writeEntitiesToSheet(ss, 'Assignments', state.assignments || []);
  writeEntitiesToSheet(ss, 'JobPackVersions', state.job_pack_versions || []);
  writeEntitiesToSheet(ss, 'ChangeEvents', state.change_events || []);
  writeEntitiesToSheet(ss, 'Handovers', state.handovers || []);
  writeEntitiesToSheet(ss, 'Settlements', state.settlements || []);
  writeEntitiesToSheet(ss, 'PaymentEntries', state.payment_entries || []);
  writeEntitiesToSheet(ss, 'Deliveries', state.deliveries || []);
  writeEntitiesToSheet(ss, 'HallObservations', state.hall_observations || []);

  return createJsonResponse({
    success: true,
    message: 'Google Sheets에 전체 상태가 성공적으로 저장되었습니다.',
  });
}

/**
 * 5. 로컬 데이터 일괄 마이그레이션 이전 (importAll)
 */
function handleImportAll(state) {
  handleInitSheets(); // 시트 없을 시 자동 생성
  const saveRes = handleSaveState(state);
  const totalCount =
    (state.jobs ? state.jobs.length : 0) +
    (state.photographers ? state.photographers.length : 0) +
    (state.venues ? state.venues.length : 0) +
    (state.assignments ? state.assignments.length : 0);

  return createJsonResponse({
    success: true,
    count: totalCount,
    message: '로컬 데이터가 Google Sheets로 성공적으로 마이그레이션되었습니다.',
  });
}

// ------------------------------------------------------------------------------
// 시트 읽기/쓰기 보조 유틸리티 (ID 유지 및 JSON 무결성 보장)
// ------------------------------------------------------------------------------

function readEntitiesFromSheet(ss, sheetName) {
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet || sheet.getLastRow() <= 1) {
    return [];
  }

  const values = sheet.getRange(2, 1, sheet.getLastRow() - 1, 2).getValues();
  const list = [];
  values.forEach(row => {
    const rawJson = row[1];
    if (rawJson) {
      try {
        const item = JSON.parse(rawJson);
        list.push(item);
      } catch (e) {
        // 파싱 실패 항목 무시
      }
    }
  });
  return list;
}

function writeEntitiesToSheet(ss, sheetName, items) {
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.appendRow(['id', 'data_json', 'updated_at']);
    sheet.getRange('1:1').setFontWeight('bold').setBackground('#f3f4f6');
  }

  // 기존 데이터 영역 초기화 (헤더 제외)
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, 3).clearContent();
  }

  if (items.length === 0) {
    return;
  }

  const nowStr = new Date().toISOString();
  const rows = items.map(item => [
    item.id || '',
    JSON.stringify(item),
    nowStr,
  ]);

  sheet.getRange(2, 1, rows.length, 3).setValues(rows);
}
