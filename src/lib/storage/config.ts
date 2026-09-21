import { StorageConfig } from './types';

// ==============================================================================
// 스토리지 설정 영속성 관리 (업무 데이터와 철저히 분리된 키 사용)
// ==============================================================================

export const STORAGE_CONFIG_KEY = 'dear_memory_storage_config';

const DEFAULT_CONFIG: StorageConfig = {
  provider: 'local',
  googleSheetsUrl: '',
};

let inMemoryConfig: StorageConfig = { ...DEFAULT_CONFIG };

/**
 * 현재 저장소 설정 조회 (기본값: local)
 */
export function getStorageConfig(): StorageConfig {
  if (typeof window === 'undefined') {
    return inMemoryConfig;
  }
  try {
    const raw = localStorage.getItem(STORAGE_CONFIG_KEY);
    if (!raw) {
      return { ...DEFAULT_CONFIG };
    }
    const parsed = JSON.parse(raw);
    inMemoryConfig = {
      ...DEFAULT_CONFIG,
      ...parsed,
    };
    return inMemoryConfig;
  } catch (e) {
    console.error('Failed to parse storage config, fallback to default:', e);
    return { ...DEFAULT_CONFIG };
  }
}

/**
 * 저장소 설정 저장
 */
export function saveStorageConfig(config: Partial<StorageConfig>): StorageConfig {
  const current = getStorageConfig();
  const updated: StorageConfig = {
    ...current,
    ...config,
  };
  inMemoryConfig = updated;

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_CONFIG_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save storage config:', e);
    }
  }

  return updated;
}
