# Dear Memory OS — Google Sheets 백엔드 연동 가이드

본 문서는 **Dear Memory OS**를 Google Sheets 및 Google Apps Script와 연결하여 중앙 클라우드 데이터베이스로 사용하는 절차를 설명합니다.

---

## 1. 개요 및 아키텍처

- **Client**: Next.js 모바일 웹 애플리케이션 (Dear Memory OS)
- **Backend**: Google Apps Script Web App (`Code.gs`)
- **Database**: Google Spreadsheet (12개 탭: Jobs, Photographers, Venues 등)
- **통신 방식**: HTTPS POST RPC (`{ action: 'health' | 'loadState' | 'saveState' | 'importAll' }`)

---

## 2. 5분 연동 절차

### 1단계: Google 스프레드시트 생성
1. [Google 드라이브](https://drive.google.com)에 로그인합니다.
2. `[+ 새로 만들기]` > `[Google 스프레드시트]`를 생성합니다.
3. 문서 제목을 설정합니다 (예: `디어메모리_본식스냅_운영DB`).

### 2단계: Apps Script 코드 등록
1. 스프레드시트 상단 메뉴에서 **[확장 프로그램]** > **[Apps Script]**를 클릭합니다.
2. 기본 `myFunction()` 코드를 지우고, [`Code.gs`](./Code.gs)의 전체 내용을 복사하여 붙여넣습니다.
3. 상단의 저장(디스켓 아이콘 또는 `Ctrl + S`)을 누릅니다.

### 3단계: 웹 앱(Web App) 배포
1. 상단 우측의 파란색 **[배포]** > **[새 배포]** 버튼을 누릅니다.
2. 좌측 톱니바퀴 아이콘을 눌러 **[웹 앱]**을 선택합니다.
3. 다음 설정을 정확히 입력합니다:
   - **설명**: `Dear Memory OS v1.0`
   - **다음 사용자로 실행**: `나(내 이메일 계정)`
   - **액세스 권한이 있는 사용자**: **`모든 사용자(Anyone)`** *(중요: 외주작가 및 모바일 브라우저 접근을 위해 필수)*
4. **[배포]** 버튼을 클릭하고, 구글 계정 권한 승인 창이 뜨면 권한을 부여합니다.
5. 배포 완료 화면에서 **[웹 앱 URL]**을 복사합니다. (예: `https://script.google.com/macros/s/AKfycb.../exec`)

### 4단계: Dear Memory OS에서 연동 설정
1. Dear Memory OS 앱에 접속합니다.
2. 상단 헤더 우측의 **⚙️ (설정 아이콘)**을 클릭하거나 `/settings/storage`로 이동합니다.
3. **[저장소 프로바이더 선택]**에서 **`Google Sheets`**를 선택합니다.
4. 복사한 Web App URL을 입력창에 붙여넣습니다.
5. **[연결 테스트]** 버튼을 클릭하여 `Google Sheets 연결 성공` 배너가 표시되는지 확인합니다.
6. **[저장소 설정 적용]** 버튼을 누릅니다.

### 5단계: 기존 로컬 데이터 이전 (Migration)
1. 설정 화면 하단의 **[현재 로컬 데이터를 Google Sheets로 이전]** 버튼을 클릭합니다.
2. 브라우저에 저장되어 있던 모든 촬영 일정, 작가, 웨딩홀, 정산 데이터가 구글 시트로 일괄 전송됩니다.
3. 구글 시트 탭을 확인하면 각 시트에 데이터가 안전하게 기록된 것을 볼 수 있습니다.

---

## 3. API Contract 명세

모든 요청은 `POST` 메서드로 전달되며, 본문(Body)은 JSON 문자열입니다:

```json
{
  "action": "health" | "loadState" | "saveState" | "importAll" | "initSheets",
  "payload": { ... },
  "workspaceId": "11111111-1111-1111-1111-111111111111"
}
```

### 1) 헬스체크 (`action: "health"`)
- **응답 예시**:
```json
{
  "success": true,
  "version": "1.0.0",
  "spreadsheetTitle": "디어메모리_본식스냅_운영DB",
  "spreadsheetAvailable": true,
  "allSheetsAvailable": true,
  "sheetStatus": {
    "Jobs": true,
    "Photographers": true,
    "Venues": true
  },
  "message": "Google Sheets와 완벽히 연결되었습니다."
}
```

### 2) 전체 데이터 조회 (`action: "loadState"`)
- **응답**: `AppState` 전체 JSON 객체 (`jobs`, `photographers`, `handovers`, `settlements` 등)

### 3) 전체 데이터 저장 (`action: "saveState"`)
- **페이로드**: `AppState`
- **응답**: `{ "success": true, "message": "Google Sheets에 전체 상태가 성공적으로 저장되었습니다." }`

### 4) 로컬 마이그레이션 (`action: "importAll"`)
- **페이로드**: 로컬 스토리지에서 추출한 `AppState`
- **응답**: `{ "success": true, "count": 18, "message": "로컬 데이터가 Google Sheets로 성공적으로 마이그레이션되었습니다." }`

---

## 4. 시트 탭(Sheet Tabs) 구조

각 탭은 행 번호와 무관하게 엔티티의 고유 ID를 보존하기 위해 다음 3개 열로 구성됩니다:

| 열 A (`id`) | 열 B (`data_json`) | 열 C (`updated_at`) |
|---|---|---|
| `66666666-6666-...` | `{"id":"...","title":"김민수♥박지은", ...}` | `2026-09-22T08:45:00Z` |

- **장점**:
  - 구글 시트에서 사용자가 수동으로 행을 추가/정렬/삭제해도 관계 무결성이 깨지지 않음.
  - 열이 수십 개로 늘어나더라도 JSON 직렬화 덕분에 스키마 확장이 자유로움.
  - 향후 Supabase나 RDBMS로 이전할 때도 데이터 유실 없이 그대로 변환 가능.
