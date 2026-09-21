import { AppState, IStorageAdapter, StorageConnectionTestResult } from './types';

// ==============================================================================
// GoogleSheetsAdapter: Google Apps Script Web App API 통신 어댑터
// ==============================================================================

export interface GoogleSheetsApiRequest {
  action: 'health' | 'loadState' | 'saveState' | 'importAll' | 'initSheets';
  payload?: unknown;
  workspaceId?: string;
}

export interface GoogleSheetsApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  version?: string;
  spreadsheetTitle?: string;
  sheetStatus?: Record<string, boolean>;
  count?: number;
  error?: string;
}

export class GoogleSheetsAdapter implements IStorageAdapter {
  readonly providerType = 'google_sheets' as const;

  private webAppUrl: string;
  private workspaceId?: string;

  constructor(webAppUrl: string, workspaceId?: string) {
    this.webAppUrl = webAppUrl ? webAppUrl.trim() : '';
    this.workspaceId = workspaceId;
  }

  setWebAppUrl(url: string) {
    this.webAppUrl = url ? url.trim() : '';
  }

  getWebAppUrl(): string {
    return this.webAppUrl;
  }

  async init(): Promise<void> {
    // URL이 설정되어 있다면 연결 상태 확인
    if (this.webAppUrl) {
      const res = await this.testConnection();
      if (!res.success) {
        console.warn('GoogleSheetsAdapter init connection check warning:', res.message);
      }
    }
  }

  /**
   * Google Apps Script Web App으로 RPC 요청 전송
   * CORS 호환성을 위해 text/plain Content-Type으로 JSON 페이로드를 전달합니다.
   */
  private async sendRequest<T = unknown>(req: GoogleSheetsApiRequest): Promise<GoogleSheetsApiResponse<T>> {
    if (!this.webAppUrl) {
      throw new Error('Google Apps Script Web App URL이 설정되지 않았습니다. [설정 > 데이터 저장소]에서 URL을 입력하세요.');
    }

    try {
      const bodyPayload = JSON.stringify({
        ...req,
        workspaceId: req.workspaceId || this.workspaceId,
      });

      const response = await fetch(this.webAppUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: bodyPayload,
      });

      if (!response.ok) {
        throw new Error(`Google Sheets HTTP 오류: ${response.status} ${response.statusText}`);
      }

      const result: GoogleSheetsApiResponse<T> = await response.json();
      if (!result.success) {
        throw new Error(result.error || result.message || 'Google Sheets API 처리 중 오류가 발생했습니다.');
      }

      return result;
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      throw new Error(`Google Sheets 통신 실패: ${errMsg}`);
    }
  }

  /**
   * 연결 및 시트 탭 상태 테스트 (Health Check)
   */
  async testConnection(): Promise<StorageConnectionTestResult> {
    if (!this.webAppUrl) {
      return {
        success: false,
        message: 'Google Apps Script Web App URL이 입력되지 않았습니다.',
      };
    }

    try {
      const res = await this.sendRequest({ action: 'health' });
      return {
        success: true,
        message: res.message || 'Google Sheets와 성공적으로 연결되었습니다.',
        version: res.version,
        spreadsheetTitle: res.spreadsheetTitle,
        sheetStatus: res.sheetStatus,
      };
    } catch (e) {
      return {
        success: false,
        message: e instanceof Error ? e.message : String(e),
      };
    }
  }

  /**
   * 전체 업무 데이터 로드
   */
  async loadState(): Promise<AppState> {
    const res = await this.sendRequest<AppState>({ action: 'loadState' });
    if (!res.data) {
      throw new Error('Google Sheets로부터 유효한 업무 데이터를 수신하지 못했습니다.');
    }
    return res.data;
  }

  /**
   * 전체 업무 데이터 저장 (Google Sheets = Single Source of Truth)
   */
  async saveState(state: AppState): Promise<void> {
    await this.sendRequest({
      action: 'saveState',
      payload: state,
    });
  }

  /**
   * 전체 데이터 내보내기
   */
  async exportAllData(): Promise<AppState> {
    return this.loadState();
  }

  /**
   * 로컬 데이터 등 외부 데이터 일괄 이전 (ID 및 관계 보존)
   */
  async importAllData(data: AppState): Promise<{ success: boolean; count: number }> {
    const res = await this.sendRequest<{ count: number }>({
      action: 'importAll',
      payload: data,
    });

    return {
      success: true,
      count: res.count || 0,
    };
  }
}
