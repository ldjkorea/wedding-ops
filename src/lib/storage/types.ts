import {
  Workspace,
  Photographer,
  Venue,
  VenueSpace,
  Job,
  Assignment,
  JobPackVersion,
  ChangeEvent,
  Handover,
  Settlement,
  PaymentEntry,
  Delivery,
  HallObservation,
} from '@/types/database';

// ==============================================================================
// Dear Memory OS 전체 애플리케이션 상태 (AppState)
// ==============================================================================
export interface AppState {
  workspace: Workspace;
  photographers: Photographer[];
  venues: Venue[];
  venue_spaces: VenueSpace[];
  jobs: Job[];
  assignments: Assignment[];
  job_pack_versions: JobPackVersion[];
  change_events: ChangeEvent[];
  handovers: Handover[];
  settlements: Settlement[];
  payment_entries: PaymentEntry[];
  deliveries: Delivery[];
  hall_observations: HallObservation[];
}

// ==============================================================================
// Storage Provider 및 연결 설정 타입
// ==============================================================================
export type StorageProviderType = 'local' | 'google_sheets';

export interface StorageConfig {
  provider: StorageProviderType;
  googleSheetsUrl?: string; // Google Apps Script Web App 배포 URL
  lastConnectedAt?: string;
  workspaceId?: string;
}

export interface StorageConnectionTestResult {
  success: boolean;
  message: string;
  version?: string;
  spreadsheetTitle?: string;
  sheetStatus?: Record<string, boolean>;
  details?: Record<string, unknown>;
}

// ==============================================================================
// Storage Adapter 공통 인터페이스 (IStorageAdapter)
// ==============================================================================
export interface IStorageAdapter {
  readonly providerType: StorageProviderType;

  /**
   * 스토리지 어댑터 초기화
   */
  init(): Promise<void>;

  /**
   * 저장소 연결 테스트 (헬스체크)
   */
  testConnection(): Promise<StorageConnectionTestResult>;

  /**
   * 전체 업무 상태 로드
   */
  loadState(): Promise<AppState>;

  /**
   * 전체 업무 상태 저장
   */
  saveState(state: AppState): Promise<void>;

  /**
   * 마이그레이션 등을 위한 전체 데이터 덤프 내보내기
   */
  exportAllData(): Promise<AppState>;

  /**
   * 외부 데이터 일괄 적재 (ID 유지)
   */
  importAllData(data: AppState): Promise<{ success: boolean; count: number }>;
}
