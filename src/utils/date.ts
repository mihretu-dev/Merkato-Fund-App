/**
 * Merkato Fund — Real Date & Time Utility
 *
 * Provides mathematically accurate Ethiopian (Ge'ez) calendar conversion
 * using the astronomical Julian Day Number (JDN) algorithm, alongside standard
 * Gregorian calendar formatting and time-based greetings.
 */

export interface EthiopianDate {
  year: number;
  month: number; // 1..13
  day: number; // 1..30 (1..6 for Pagume)
  monthName: string;
  weekdayName: string;
}

export const ETHIOPIAN_MONTHS_AMHARIC = [
  '',
  'መስከረም', // 1: Meskerem
  'ጥቅምት', // 2: Tikimt
  'ኅዳር', // 3: Hidar
  'ታኅሣሥ', // 4: Tahsas
  'ጥር', // 5: Tir
  'የካቲት', // 6: Yakatit
  'መጋቢት', // 7: Megabit
  'ሚያዝያ', // 8: Miazia
  'ግንቦት', // 9: Ginbot
  'ሰኔ', // 10: Sene
  'ሐምሌ', // 11: Hamle
  'ነሐሴ', // 12: Nehase
  'ጳጉሜ', // 13: Pagume
];

export const WEEKDAYS_AMHARIC = [
  'እሑድ', // 0: Sunday
  'ሰኞ', // 1: Monday
  'ማክሰኞ', // 2: Tuesday
  'ረቡዕ', // 3: Wednesday
  'ሐሙስ', // 4: Thursday
  'ዓርብ', // 5: Friday
  'ቅዳሜ', // 6: Saturday
];

export const WEEKDAYS_ENGLISH = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export const MONTHS_ENGLISH_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

/**
 * Converts a Gregorian calendar date to Julian Day Number (JDN).
 */
export function gregorianToJDN(year: number, month: number, day: number): number {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return (
    day +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045
  );
}

/**
 * Converts a Julian Day Number (JDN) to the Ethiopian calendar date.
 */
export function jdnToEthiopian(jdn: number): { year: number; month: number; day: number } {
  const r = (jdn - 1723856) % 1461;
  const n = (r % 365) + 365 * Math.floor(r / 1460);
  const year = 4 * Math.floor((jdn - 1723856) / 1461) + Math.floor(r / 365) - Math.floor(r / 1460);
  const month = Math.floor(n / 30) + 1;
  const day = (n % 30) + 1;
  return { year, month, day };
}

/**
 * Converts a standard JavaScript Date to Ethiopian calendar structure.
 */
export function toEthiopianDate(date: Date = new Date()): EthiopianDate {
  const gYear = date.getFullYear();
  const gMonth = date.getMonth() + 1; // 1..12
  const gDay = date.getDate();
  const weekdayIndex = date.getDay(); // 0..6

  const jdn = gregorianToJDN(gYear, gMonth, gDay);
  const { year, month, day } = jdnToEthiopian(jdn);

  return {
    year,
    month,
    day,
    monthName: ETHIOPIAN_MONTHS_AMHARIC[month] || '',
    weekdayName: WEEKDAYS_AMHARIC[weekdayIndex],
  };
}

/**
 * Formats the real current date according to the active language:
 * - Amharic ('am'): Ethiopian Calendar (e.g. "ቅዳሜ፣ ጥቅምት 14፣ 2019")
 * - English ('en'): Gregorian Calendar (e.g. "Saturday, Oct 24, 2026")
 */
export function formatRealDate(date: Date = new Date(), language: 'en' | 'am' = 'en'): string {
  if (language === 'am') {
    const eth = toEthiopianDate(date);
    return `${eth.weekdayName}፣ ${eth.monthName} ${eth.day}፣ ${eth.year}`;
  }

  const weekday = WEEKDAYS_ENGLISH[date.getDay()];
  const month = MONTHS_ENGLISH_SHORT[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();

  return `${weekday}, ${month} ${day}, ${year}`;
}

/**
 * Returns a time-based greeting based on the current hour:
 * - Morning: 00:00 - 11:59 ("Good morning," / "እንደምን አደሩ፣")
 * - Afternoon: 12:00 - 17:59 ("Good afternoon," / "እንደምን ዋሉ፣")
 * - Evening: 18:00 - 23:59 ("Good evening," / "እንደምን አመሹ፣")
 */
export function getTimeBasedGreeting(date: Date = new Date(), language: 'en' | 'am' = 'en'): string {
  const hour = date.getHours();

  if (hour < 12) {
    return language === 'am' ? 'እንደምን አደሩ፣' : 'Good morning,';
  } else if (hour < 18) {
    return language === 'am' ? 'እንደምን ዋሉ፣' : 'Good afternoon,';
  } else {
    return language === 'am' ? 'እንደምን አመሹ፣' : 'Good evening,';
  }
}
