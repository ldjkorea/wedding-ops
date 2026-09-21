'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Database,
  Cloud,
  HardDrive,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  UploadCloud,
  ExternalLink,
  ShieldCheck,
  FileSpreadsheet,
} from 'lucide-react';
import { DataStore, StorageProviderType, StorageConfig, StorageConnectionTestResult } from '@/lib/storage';
import { Badge } from '@/components/ui/Badge';

export default function StorageSettingsPage() {
  const [config, setConfig] = useState<StorageConfig>({
    provider: 'local',
    googleSheetsUrl: '',
  });

  const [selectedProvider, setSelectedProvider] = useState<StorageProviderType>('local');
  const [inputUrl, setInputUrl] = useState('');

  // 연결 테스트 상태
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<StorageConnectionTestResult | null>(null);

  // 설정 저장 상태
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // 마이그레이션 상태
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationResult, setMigrationResult] = useState<{ success: boolean; message: string; count?: number } | null>(
    null
  );

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = () => {
    const currentConfig = DataStore.getStorageConfig();
    setConfig(currentConfig);
    setSelectedProvider(currentConfig.provider);
    setInputUrl(currentConfig.googleSheetsUrl || '');
  };

  // 1. 연결 테스트 실행
  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    setSaveMessage(null);

    try {
      if (selectedProvider === 'google_sheets') {
        if (!inputUrl.trim()) {
          setTestResult({
            success: false,
            message: 'Google Apps Script Web App URL을 입력해주세요.',
          });
          setIsTesting(false);
          return;
        }
        const res = await DataStore.testStorageConnection(inputUrl.trim());
        setTestResult(res);
      } else {
        const res = await DataStore.testStorageConnection();
        setTestResult(res);
      }
    } catch (e) {
      setTestResult({
        success: false,
        message: e instanceof Error ? e.message : '연결 테스트 중 오류가 발생했습니다.',
      });
    } finally {
      setIsTesting(false);
    }
  };

  // 2. 저장소 설정 저장 및 프로바이더 전환
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveMessage(null);

    try {
      const res = await DataStore.switchStorageProvider(selectedProvider, inputUrl.trim());
      if (res.success) {
        setSaveMessage({ type: 'success', text: res.message });
        loadSettings();
      } else {
        setSaveMessage({ type: 'error', text: res.message });
      }
    } catch (e) {
      setSaveMessage({
        type: 'error',
        text: e instanceof Error ? e.message : '설정 저장 중 오류가 발생했습니다.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // 3. 로컬 데이터 -> Google Sheets 일괄 이전 (Migration)
  const handleMigrate = async () => {
    if (!confirm('현재 브라우저 로컬 저장소의 모든 촬영·작가·정산 데이터를 Google Sheets로 전송하시겠습니까?\n기존 고유 ID가 그대로 보존됩니다.')) {
      return;
    }

    setIsMigrating(true);
    setMigrationResult(null);

    try {
      const res = await DataStore.migrateLocalToGoogleSheets();
      setMigrationResult(res);
    } catch (e) {
      setMigrationResult({
        success: false,
        message: e instanceof Error ? e.message : '데이터 이전 중 오류가 발생했습니다.',
      });
    } finally {
      setIsMigrating(false);
    }
  };

  const isCurrentProviderGoogle = config.provider === 'google_sheets';

  return (
    <div className="space-y-5 pb-10 max-w-xl mx-auto">
      {/* 상단 네비게이션 */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          대시보드로 돌아가기
        </Link>
        <div className="flex items-center gap-1.5">
          <Database className="w-4 h-4 text-indigo-600" />
          <span className="text-xs font-bold text-slate-700">스토리지 관리자</span>
        </div>
      </div>

      {/* 헤더 안내 */}
      <div>
        <h1 className="text-xl font-bold text-slate-900">데이터 저장소 설정</h1>
        <p className="text-xs text-slate-500 mt-1">
          업무 데이터의 영속성 저장소를 로컬 브라우저 또는 Google Sheets 중앙 데이터베이스로 전환합니다.
        </p>
      </div>

      {/* 현재 활성 상태 배너 */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              isCurrentProviderGoogle
                ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                : 'bg-indigo-50 text-indigo-600 border border-indigo-200'
            }`}
          >
            {isCurrentProviderGoogle ? <Cloud className="w-5 h-5" /> : <HardDrive className="w-5 h-5" />}
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 block">현재 활성 저장소</span>
            <span className="text-sm font-bold text-slate-900">
              {isCurrentProviderGoogle ? 'Google Sheets 중앙 저장소' : '로컬 스토리지 (Demo / 브라우저)'}
            </span>
          </div>
        </div>
        <Badge variant={isCurrentProviderGoogle ? 'emerald' : 'indigo'}>
          {isCurrentProviderGoogle ? '중앙 클라우드' : '로컬 모드'}
        </Badge>
      </div>

      {/* 설정 변경 폼 */}
      <form onSubmit={handleSaveSettings} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-5">
        <div>
          <label className="block text-xs font-bold text-slate-800 mb-2">저장소 프로바이더 선택</label>
          <div className="grid grid-cols-2 gap-2.5">
            {/* 로컬 모드 옵션 */}
            <label
              className={`p-3.5 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                selectedProvider === 'local'
                  ? 'bg-indigo-50/50 border-indigo-500 ring-2 ring-indigo-500/20'
                  : 'bg-slate-50 border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <HardDrive className={`w-4 h-4 ${selectedProvider === 'local' ? 'text-indigo-600' : 'text-slate-400'}`} />
                <input
                  type="radio"
                  name="provider"
                  value="local"
                  checked={selectedProvider === 'local'}
                  onChange={() => setSelectedProvider('local')}
                  className="text-indigo-600 focus:ring-indigo-500"
                />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 block">Local / Demo</span>
                <span className="text-[10.5px] text-slate-500 leading-tight block mt-0.5">
                  브라우저 내부 저장 (개발, 오프라인 시연용)
                </span>
              </div>
            </label>

            {/* Google Sheets 옵션 */}
            <label
              className={`p-3.5 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                selectedProvider === 'google_sheets'
                  ? 'bg-emerald-50/50 border-emerald-500 ring-2 ring-emerald-500/20'
                  : 'bg-slate-50 border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <FileSpreadsheet
                  className={`w-4 h-4 ${selectedProvider === 'google_sheets' ? 'text-emerald-600' : 'text-slate-400'}`}
                />
                <input
                  type="radio"
                  name="provider"
                  value="google_sheets"
                  checked={selectedProvider === 'google_sheets'}
                  onChange={() => setSelectedProvider('google_sheets')}
                  className="text-emerald-600 focus:ring-emerald-500"
                />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 block">Google Sheets</span>
                <span className="text-[10.5px] text-slate-500 leading-tight block mt-0.5">
                  Apps Script Web App 중앙 클라우드 연동
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Google Sheets 선택 시 URL 입력 및 연결 테스트 */}
        {selectedProvider === 'google_sheets' && (
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">
                  Google Apps Script Web App URL <span className="text-rose-500">*</span>
                </label>
                <a
                  href="https://script.google.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5"
                >
                  Apps Script 콘솔
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <input
                type="url"
                required
                placeholder="https://script.google.com/macros/s/.../exec"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                스프레드시트에 바인딩된 Apps Script를 웹 앱으로 배포한 후 발급받은 URL을 입력하세요.
              </p>
            </div>

            {/* 연결 테스트 버튼 */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting || !inputUrl.trim()}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 disabled:opacity-50 transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                {isTesting ? '연결 테스트 중...' : '연결 테스트'}
              </button>
              {config.lastConnectedAt && (
                <span className="text-[10px] text-slate-400">
                  마지막 정상 연결: {new Date(config.lastConnectedAt).toLocaleString('ko-KR')}
                </span>
              )}
            </div>

            {/* 연결 테스트 결과 피드백 배너 */}
            {testResult && (
              <div
                className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
                  testResult.success
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div className="space-y-0.5">
                  <span className="font-bold block">
                    {testResult.success ? 'Google Sheets 연결 성공' : '연결 실패'}
                  </span>
                  <p className="text-[11px] leading-relaxed">{testResult.message}</p>
                  {testResult.version && (
                    <span className="inline-block text-[10px] bg-white/80 px-1.5 py-0.2 rounded font-mono text-slate-600 mt-1">
                      API Version: {testResult.version}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 저장 메시지 피드백 */}
        {saveMessage && (
          <div
            className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
              saveMessage.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}
          >
            {saveMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span className="font-semibold">{saveMessage.text}</span>
          </div>
        )}

        {/* 저장 버튼 */}
        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm transition disabled:opacity-50"
          >
            <ShieldCheck className="w-4 h-4" />
            {isSaving ? '저장 중...' : '저장소 설정 적용'}
          </button>
        </div>
      </form>

      {/* 데이터 마이그레이션 섹션 (Local -> Google Sheets) */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <UploadCloud className="w-5 h-5 text-indigo-600" />
          <h2 className="text-sm font-bold text-slate-900">로컬 데이터 ➜ Google Sheets 이전 (Migration)</h2>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">
          현재 브라우저에 저장되어 있는 촬영 일정, 작가, 웨딩홀, 정산 데이터를 Google Sheets 중앙 저장소로 한 번에 전송합니다.
          기존의 모든 고유 식별자(ID)와 연결 관계가 완벽히 보존됩니다.
        </p>

        {migrationResult && (
          <div
            className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
              migrationResult.success
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}
          >
            {migrationResult.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div>
              <span className="font-bold block">
                {migrationResult.success ? '데이터 이전 완료' : '이전 실패'}
              </span>
              <p className="text-[11px] mt-0.5">{migrationResult.message}</p>
            </div>
          </div>
        )}

        <div className="pt-1">
          <button
            type="button"
            onClick={handleMigrate}
            disabled={isMigrating || !config.googleSheetsUrl}
            className="w-full inline-flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold py-2.5 rounded-xl transition disabled:opacity-50 shadow-xs"
          >
            <UploadCloud className={`w-4 h-4 ${isMigrating ? 'animate-bounce' : ''}`} />
            {isMigrating ? '데이터 이전 진행 중...' : '현재 로컬 데이터를 Google Sheets로 이전'}
          </button>
          {!config.googleSheetsUrl && (
            <span className="block text-[10.5px] text-slate-400 text-center mt-1.5">
              ※ Google Sheets Web App URL 설정 및 연결이 완료된 후 이전할 수 있습니다.
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
