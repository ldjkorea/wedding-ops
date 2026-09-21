# 스냅오피스 (SnapOps) — 본식 웨딩 촬영팀 내부 운영 시스템 (Phase 1 MVP)

> **대표작가 1명이 다음 본식 촬영부터 실제 현업에서 즉시 사용하는 실전형 운영 웹 애플리케이션**

본식 한 건의 **[등록 ➜ 작가 배정 ➜ 촬영 안내문(Job Pack) 생성 ➜ 촬영 ➜ 원본 인수/검수 ➜ 외주비 분할 정산 ➜ 최종 완료]**까지의 전체 사이클을 카카오톡과 메모장을 반복해 뒤질 필요 없이 하나의 화면(Job Detail) 안에서 관리합니다.

---

## 1. 주요 기능

- **확인 필요 중심 대시보드 (Action Required)**: 통계 대신 지금 당장 처리해야 할 5대 핵심 작업(미수락 작가, 원본 마감 초과, 원본 검수 대기, 외주비 미지급/부분지급 잔액, 고객 납품 기한) 우선 노출.
- **Job 중심 올인원 화면**: 촬영 식별명, 시간, 베뉴/홀, 촬영 범위, 작가 배정, 정산, 검수, 관찰을 한 화면에서 처리.
- **Job Pack 자동 생성 및 스냅샷 보관**:
  - 대표작가가 버튼 하나로 카카오톡 전송용 안내문 자동 조합 및 클립보드 복사.
  - 생성된 안내문은 `job_pack_versions`에 스냅샷으로 영구 저장되어 이전 버전 이력 조회 가능.
  - **핵심 정보 변경 감지 배너**: Job Pack 생성 이후 예식 시간, 장소, 작가 등 중요 정보가 수정되면 *"촬영 안내가 생성된 이후 정보가 변경되었습니다"* 경고 배너가 즉시 노출되고 새 버전(v2, v3...)으로 갱신 유도.
- **원본 Handover 검수 사이클**: 외부 링크(Google Drive, Dropbox 등) 등록 ➜ 대표 확인 ➜ 보완 요청(`revision_requested`) ➜ 검수 완료(`verified`) 상태 전이.
- **외주비 분할 정산 (Settlement)**: 약정 외주비 + 추가 교통비 합산 및 1차 계약금/2차 잔금 분할 지급(`payment_entries`) 자동 계산 (`unpaid` ➜ `partially_paid` ➜ `paid`).
- **웨딩홀 관찰 지식 축적 (Hall Observation)**: 홀(Venue Space)별로 주의사항, 팀 루틴, 확인사항을 기록하여 다른 Job에서도 해당 홀 선택 시 이전 지식 자동 공유.
- **엄격한 본식 완료 요건 검증**: 단순 체크박스가 아닌 [촬영일 도래, 모든 외주 원본 verified, 모든 외주비 paid/waived, 고객 납품 완료] 조건을 만족해야만 최종 완료(Completed) 가능.

---

## 2. 하이브리드 데이터 계층 (Dual-Engine)

- **로컬 Fallback 모드 (기본 탑재)**: Supabase 환경변수가 없어도 브라우저 LocalStorage 및 메모리 기반으로 5대 인수 시나리오 및 모든 기능을 100% 즉시 테스트 가능.
- **Supabase PostgreSQL + RLS 연동**: `.env.local`에 Supabase 프로젝트 URL과 Anon Key를 입력하면 클라우드 PostgreSQL과 RLS 정책으로 즉시 동작.

---

## 3. 시작하기

### 3.1 로컬 개발 서버 실행

```bash
# 의존성 설치 (기본 완료됨)
npm install

# 개발 서버 구동 (기본 포트 3000)
npm run dev
```

브라우저에서 `http://localhost:3000`에 접속하여 사용합니다.

### 3.2 인수 테스트 실행 (Acceptance Test Scenarios A~E)

```bash
npm run test:acceptance
```

- **Scenario A**: 신규 본식 등록 및 Job Pack v1 스냅샷 생성
- **Scenario B**: 외주작가 수락 처리, 예식 시간 수정에 따른 실시간 변경 감지 배너 및 Job Pack v2 생성
- **Scenario C**: 원본 링크 제출(`submitted`) ➜ 보완 요청(`revision_requested`) ➜ 대표 최종 검수 완료(`verified`)
- **Scenario D**: 외주비 20만 + 추가비 3만 = 23만 분할 지급 (1차 10만 `partially_paid` ➜ 2차 13만 `paid`)
- **Scenario E**: 홀 관찰 지식 등록 및 다른 본식 촬영에서 해당 홀 선택 시 자동 노출
- **추가 검증**: 4대 필수 요건 미충족 시 완료 차단 및 충족 시 완료(Completed) 확정

### 3.3 프로덕션 빌드

```bash
npm run build
npm run start
```

---

## 4. Supabase 데이터베이스 설정 (선택 사항)

실제 Supabase 프로젝트와 연결하려면:

1. [Supabase 대시보드](https://supabase.com)에서 새 프로젝트 생성
2. **SQL Editor**로 이동하여 아래 두 파일을 순서대로 실행:
   - `supabase/migrations/01_schema.sql` (14개 테이블 및 RLS 설정)
   - `supabase/migrations/02_seed.sql` (스튜디오 민규 및 샘플 본식 데이터)
3. `.env.local` 파일 생성:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

---

## 5. 프로젝트 디렉토리 구조

```
wedding-ops/
├── src/
│   ├── app/
│   │   ├── page.tsx            # 대시보드 (확인 필요 5대 작업 / 이번 주 / 최근)
│   │   ├── layout.tsx          # 모바일 우선 반응형 레이아웃 셸
│   │   ├── globals.css         # 테마 및 모바일 터치 최적화 스타일
│   │   ├── jobs/
│   │   │   ├── page.tsx        # 본식 촬영 목록 (상태별 필터)
│   │   │   ├── new/page.tsx    # 새 본식 촬영 등록 및 홀 퀵 추가 모달
│   │   │   └── [id]/page.tsx   # Job Detail 올인원 종합 운영 화면
│   │   ├── photographers/      # 작가 마스터 관리
│   │   └── venues/             # 웨딩홀 및 홀 공간 / 관찰 기록 관리
│   ├── components/
│   │   ├── layout/             # Header, BottomNav
│   │   └── ui/                 # Badge, Modal
│   ├── lib/
│   │   ├── storage.ts          # 하이브리드 DataStore (비즈니스 로직 & Fallback)
│   │   └── supabase.ts         # Supabase 클라이언트 팩토리
│   └── types/
│       └── database.ts         # TypeScript 데이터베이스 타입 정의
├── supabase/
│   └── migrations/
│       ├── 01_schema.sql       # PostgreSQL 전체 DDL
│       └── 02_seed.sql         # 초기 시드 데이터
└── scripts/
    └── acceptance-test.mjs     # 5대 인수 테스트 자동화 스크립트
```
