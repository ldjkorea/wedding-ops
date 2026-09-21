// ==============================================================================
// 본식 웨딩 촬영 일정 날짜 및 타임존 (Asia/Seoul) 유틸리티
// ==============================================================================

/**
 * 한국 표준시(Asia/Seoul, UTC+9) 기준의 오늘 날짜를 YYYY-MM-DD 형태로 반환합니다.
 * 타임존 오프셋으로 인해 자정 전후에 날짜가 밀리는 현상을 원천 방지합니다.
 */
export function getKSTTodayString(date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

/**
 * YYYY-MM-DD 문자열을 로컬 타임존 왜곡 없이 연/월/일로 파싱합니다.
 */
export function parseDateString(dateStr: string): { year: number; month: number; day: number } {
  const [y, m, d] = dateStr.split('-').map((n) => parseInt(n, 10));
  return { year: y, month: m, day: d };
}

/**
 * 월간 달력에 표시할 7열 그리드 셀 배열을 생성합니다.
 * @param year 연도 (예: 2026)
 * @param month 0-indexed 월 (0: 1월, 9: 10월)
 */
export type CalendarDayCell = {
  year: number;
  month: number; // 0-indexed
  date: number;
  dateStr: string; // YYYY-MM-DD
  isCurrentMonth: boolean;
  dayOfWeek: number; // 0(Sun) ~ 6(Sat)
};

export function getMonthCalendarGrid(year: number, month: number): CalendarDayCell[] {
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 ~ 6
  const lastDate = new Date(year, month + 1, 0).getDate();
  const prevMonthLastDate = new Date(year, month, 0).getDate();

  const cells: CalendarDayCell[] = [];

  // 이전 달 패딩
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const d = prevMonthLastDate - i;
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    const mStr = String(prevMonth + 1).padStart(2, '0');
    const dStr = String(d).padStart(2, '0');
    cells.push({
      year: prevYear,
      month: prevMonth,
      date: d,
      dateStr: `${prevYear}-${mStr}-${dStr}`,
      isCurrentMonth: false,
      dayOfWeek: cells.length % 7,
    });
  }

  // 이번 달 일자
  for (let d = 1; d <= lastDate; d++) {
    const mStr = String(month + 1).padStart(2, '0');
    const dStr = String(d).padStart(2, '0');
    cells.push({
      year,
      month,
      date: d,
      dateStr: `${year}-${mStr}-${dStr}`,
      isCurrentMonth: true,
      dayOfWeek: cells.length % 7,
    });
  }

  // 다음 달 패딩 (7의 배수 및 최소 35~42칸 정렬)
  const remaining = (7 - (cells.length % 7)) % 7;
  for (let i = 1; i <= remaining; i++) {
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;
    const mStr = String(nextMonth + 1).padStart(2, '0');
    const dStr = String(i).padStart(2, '0');
    cells.push({
      year: nextYear,
      month: nextMonth,
      date: i,
      dateStr: `${nextYear}-${mStr}-${dStr}`,
      isCurrentMonth: false,
      dayOfWeek: cells.length % 7,
    });
  }

  return cells;
}

/**
 * 시/분 문자열(HH:mm)을 분 단위 정수로 변환
 */
export function timeToMinutes(timeStr?: string | null, fallback = '12:00'): number {
  const val = (timeStr || fallback).trim();
  const [hh, mm] = val.split(':').map((x) => parseInt(x, 10) || 0);
  return hh * 60 + mm;
}
