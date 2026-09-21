import { AppState, IStorageAdapter, StorageConnectionTestResult } from './types';

export const STORAGE_KEY_V2 = 'wedding_ops_data_v2';
export const STORAGE_KEY_V1 = 'wedding_ops_data_v1';

export class LocalStorageAdapter implements IStorageAdapter {
  readonly providerType = 'local' as const;

  private inMemoryFallback: AppState;
  private getInitialState: () => AppState;

  constructor(initialStateFactory: () => AppState) {
    this.getInitialState = initialStateFactory;
    this.inMemoryFallback = initialStateFactory();
  }

  async init(): Promise<void> {
    // 로컬 스토리지 초기 적재 확인
    await this.loadState();
  }

  async testConnection(): Promise<StorageConnectionTestResult> {
    if (typeof window === 'undefined') {
      return {
        success: true,
        message: '서버 환경(Node.js/인메모리 모드)에서 정상 작동 중입니다.',
      };
    }

    try {
      const testKey = '__dear_memory_test__';
      localStorage.setItem(testKey, '1');
      localStorage.removeItem(testKey);
      return {
        success: true,
        message: '브라우저 로컬 스토리지(LocalStorage)가 정상 작동 중입니다.',
      };
    } catch (e) {
      return {
        success: false,
        message: `로컬 스토리지 접근 실패: ${e instanceof Error ? e.message : String(e)}`,
      };
    }
  }

  async loadState(): Promise<AppState> {
    if (typeof window === 'undefined') {
      return this.inMemoryFallback;
    }

    try {
      const raw = localStorage.getItem(STORAGE_KEY_V2);
      if (!raw) {
        // v1 데이터 마이그레이션 확인
        const oldRaw = localStorage.getItem(STORAGE_KEY_V1);
        if (oldRaw) {
          try {
            const parsedOld = JSON.parse(oldRaw);
            const migrated: AppState = {
              ...this.getInitialState(),
              ...parsedOld,
            };
            localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(migrated));
            this.inMemoryFallback = migrated;
            return migrated;
          } catch (mErr) {
            console.error('Migration from v1 failed:', mErr);
          }
        }
        // 초기 시드 생성
        const init = this.getInitialState();
        localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(init));
        this.inMemoryFallback = init;
        return init;
      }

      const parsed: AppState = JSON.parse(raw);
      this.inMemoryFallback = parsed;
      return parsed;
    } catch (e) {
      console.error('LocalStorageAdapter loadState failed, using fallback:', e);
      return this.inMemoryFallback;
    }
  }

  async saveState(state: AppState): Promise<void> {
    this.inMemoryFallback = state;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(state));
      } catch (e) {
        console.error('LocalStorageAdapter saveState failed:', e);
        throw e;
      }
    }
  }

  async exportAllData(): Promise<AppState> {
    return this.loadState();
  }

  async importAllData(data: AppState): Promise<{ success: boolean; count: number }> {
    await this.saveState(data);
    const totalCount =
      (data.jobs?.length || 0) +
      (data.photographers?.length || 0) +
      (data.venues?.length || 0) +
      (data.assignments?.length || 0) +
      (data.handovers?.length || 0) +
      (data.settlements?.length || 0);
    return { success: true, count: totalCount };
  }
}
