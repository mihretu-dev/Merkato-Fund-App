import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  toEthiopianDate,
  formatRealDate,
  getTimeBasedGreeting,
  gregorianToJDN,
  jdnToEthiopian,
} from '../date';

describe('Ethiopian & Gregorian Date Utility', () => {
  it('converts known Gregorian dates to accurate Ethiopian calendar dates', () => {
    // 2024-09-11 (Enkutatash 2017)
    const d1 = new Date(2024, 8, 11);
    const eth1 = toEthiopianDate(d1);
    assert.equal(eth1.year, 2017);
    assert.equal(eth1.month, 1);
    assert.equal(eth1.day, 1);
    assert.equal(eth1.monthName, 'መስከረም');
    assert.equal(eth1.weekdayName, 'ረቡዕ');

    // 2026-10-24
    const d2 = new Date(2026, 9, 24);
    const eth2 = toEthiopianDate(d2);
    assert.equal(eth2.year, 2019);
    assert.equal(eth2.month, 2);
    assert.equal(eth2.day, 14);
    assert.equal(eth2.monthName, 'ጥቅምት');
    assert.equal(eth2.weekdayName, 'ቅዳሜ');

    // 2023-09-12 (Enkutatash after leap year)
    const d3 = new Date(2023, 8, 12);
    const eth3 = toEthiopianDate(d3);
    assert.equal(eth3.year, 2016);
    assert.equal(eth3.month, 1);
    assert.equal(eth3.day, 1);
  });

  it('formats real date in Amharic using Ethiopian calendar', () => {
    const d = new Date(2026, 9, 24); // Oct 24, 2026
    const formattedAm = formatRealDate(d, 'am');
    assert.equal(formattedAm, 'ቅዳሜ፣ ጥቅምት 14፣ 2019');
  });

  it('formats real date in English using Gregorian calendar', () => {
    const d = new Date(2026, 9, 24); // Oct 24, 2026
    const formattedEn = formatRealDate(d, 'en');
    assert.equal(formattedEn, 'Saturday, Oct 24, 2026');
  });

  it('provides time-based greetings across morning, afternoon, and evening', () => {
    // Morning (9 AM)
    const morning = new Date(2026, 9, 24, 9, 0, 0);
    assert.equal(getTimeBasedGreeting(morning, 'en'), 'Good morning,');
    assert.equal(getTimeBasedGreeting(morning, 'am'), 'እንደምን አደሩ፣');

    // Afternoon (2 PM)
    const afternoon = new Date(2026, 9, 24, 14, 0, 0);
    assert.equal(getTimeBasedGreeting(afternoon, 'en'), 'Good afternoon,');
    assert.equal(getTimeBasedGreeting(afternoon, 'am'), 'እንደምን ዋሉ፣');

    // Evening (8 PM)
    const evening = new Date(2026, 9, 24, 20, 0, 0);
    assert.equal(getTimeBasedGreeting(evening, 'en'), 'Good evening,');
    assert.equal(getTimeBasedGreeting(evening, 'am'), 'እንደምን አመሹ፣');
  });
});
