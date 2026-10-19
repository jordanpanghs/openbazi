const assert = require('assert');
const fs = require('fs');
const path = require('path');
const {
  calculateFromSolar,
  calculateFromLunar,
  calculateFromPillars,
} = require('./src/astrologyEngine');

function summarizeChart(result) {
  return {
    meta: result.meta,
    bazi: {
      fourPillarsString: result.bazi.fourPillarsString,
      dayMaster: result.bazi.dayMaster,
      year: result.bazi.year,
      month: result.bazi.month,
      day: result.bazi.day,
      hour: result.bazi.hour,
      taiYuan: result.bazi.taiYuan,
      mingGong: result.bazi.mingGong,
      shenGong: result.bazi.shenGong,
    },
    dayun: {
      direction: result.dayun.direction,
      isForward: result.dayun.isForward,
      calculationMethod: result.dayun.calculationMethod,
      exactStart: result.dayun.exactStart,
      preLiChunZeroAgeAdjustment: result.dayun.preLiChunZeroAgeAdjustment,
      pillars: result.dayun.pillars.map((p) => ({
        index: p.index,
        ganZhi: p.ganZhi,
        tenGod: p.tenGod,
        hiddenStems: p.hiddenStems,
        naYin: p.naYin,
        startAge: p.startAge,
        endAge: p.endAge,
        startYear: p.startYear,
        endYear: p.endYear,
        firstThreeLiuNian: p.liuNian.slice(0, 3).map((ln) => ({
          year: ln.year,
          age: ln.age,
          ganZhi: ln.ganZhi,
          tenGod: ln.tenGod,
        })),
      })),
    },
    ziwei: {
      available: result.ziwei.available,
      solarDate: result.ziwei.solarDate,
      lunarDate: result.ziwei.lunarDate,
      chineseDate: result.ziwei.chineseDate,
      time: result.ziwei.time,
      timeRange: result.ziwei.timeRange,
      fiveElementsClass: result.ziwei.fiveElementsClass,
      soulStar: result.ziwei.soulStar,
      bodyStar: result.ziwei.bodyStar,
      earthlyBranchOfSoulPalace: result.ziwei.earthlyBranchOfSoulPalace,
      earthlyBranchOfBodyPalace: result.ziwei.earthlyBranchOfBodyPalace,
      fourTransformations: result.ziwei.fourTransformations,
      palaces: result.ziwei.palaces.map((pal) => ({
        index: pal.index,
        name: pal.name,
        ganZhi: pal.ganZhi,
        isBodyPalace: pal.isBodyPalace,
        isOriginalPalace: pal.isOriginalPalace,
        majorStars: pal.majorStars.map(
          (s) => `${s.name}${s.brightness ? `(${s.brightness})` : ''}${s.transformationLabel ? `[${s.transformationLabel}]` : ''}`
        ),
        minorStars: pal.minorStars.map(
          (s) => `${s.name}${s.brightness ? `(${s.brightness})` : ''}${s.transformationLabel ? `[${s.transformationLabel}]` : ''}`
        ),
        starTransformations: pal.starTransformations,
        decadal: pal.decadal,
      })),
    },
  };
}

function runTests() {
  // =========================================================================
  // Test Case 1: Standard birth date (1984-06-15 14:30, Male) + Lunar reverse check
  // =========================================================================
  const tc1Solar = calculateFromSolar(1984, 6, 15, 14, 30, '男');
  const tc1Lunar = calculateFromLunar(1984, 5, 16, 14, false, '男');

  assert.strictEqual(tc1Solar.bazi.fourPillarsString, '甲子 庚午 庚辰 癸未');
  assert.strictEqual(tc1Solar.bazi.dayMaster.stem, '庚');
  assert.strictEqual(tc1Solar.bazi.dayMaster.wuXing, '金');
  assert.strictEqual(tc1Solar.bazi.day.tenGod, '日主');
  assert.strictEqual(tc1Solar.bazi.year.naYin, '海中金');
  assert.strictEqual(tc1Solar.dayun.direction, '順排');
  assert.strictEqual(tc1Solar.dayun.pillars.length, 10);
  assert.strictEqual(tc1Solar.ziwei.palaces.length, 12);
  assert.strictEqual(tc1Lunar.bazi.fourPillarsString, tc1Solar.bazi.fourPillarsString);

  // =========================================================================
  // Test Case 2: Late Rat hour (1984-06-15 23:30 晚子時) vs Early Rat hour (1984-06-16 00:30 早子時)
  // =========================================================================
  const tc2LateRat = calculateFromSolar(1984, 6, 15, 23, 30, '男');
  const tc2EarlyRat = calculateFromSolar(1984, 6, 16, 0, 30, '男');

  // Under Sect 2 (晚子時保留當日日柱):
  // 1984-06-15 23:30 keeps Day Pillar 庚辰; 1984-06-16 00:30 advances Day Pillar to 辛巳.
  assert.strictEqual(tc2LateRat.bazi.day.ganZhi, '庚辰');
  assert.strictEqual(tc2LateRat.bazi.hour.ganZhi, '戊子');
  assert.strictEqual(tc2LateRat.meta.solar.shichenIndex, 12);
  assert.strictEqual(tc2LateRat.ziwei.time, '晚子時');

  assert.strictEqual(tc2EarlyRat.bazi.day.ganZhi, '辛巳');
  assert.strictEqual(tc2EarlyRat.bazi.hour.ganZhi, '戊子');
  assert.strictEqual(tc2EarlyRat.meta.solar.shichenIndex, 0);
  assert.strictEqual(tc2EarlyRat.ziwei.time, '早子時');

  // =========================================================================
  // Test Case 3: Jan 15 birth before LiChun (2004-01-15 10:00, Male)
  // Confirming previous year's Stem/Branch (癸未 instead of 甲申) & "0歲" alignment
  // =========================================================================
  const tc3PreLiChunSolar = calculateFromSolar(2004, 1, 15, 10, 0, '男');
  const tc3ManualPreLiChun = calculateFromPillars(
    '癸未',
    '乙丑',
    '癸巳',
    '丁巳',
    true,
    '男',
    { referenceYear: 2004 }
  );
  const tc3ManualPostLiChun = calculateFromPillars(
    '癸未',
    '乙丑',
    '癸巳',
    '丁巳',
    false,
    '男',
    { referenceYear: 2003 }
  );

  assert.strictEqual(tc3PreLiChunSolar.bazi.year.ganZhi, '癸未');
  assert.strictEqual(tc3PreLiChunSolar.meta.solarTerms.isBeforeLiChunInGregorianYear, true);
  assert.strictEqual(tc3PreLiChunSolar.dayun.preLiChunZeroAgeAdjustment.applies, true);
  assert.strictEqual(tc3PreLiChunSolar.dayun.preLiChunZeroAgeAdjustment.zeroAgePillar.age, 0);
  assert.strictEqual(tc3PreLiChunSolar.dayun.preLiChunZeroAgeAdjustment.zeroAgePillar.ganZhi, '癸未');
  assert.strictEqual(tc3PreLiChunSolar.dayun.preLiChunZeroAgeAdjustment.zeroAgePillar.gregorianYear, 2003);
  assert.strictEqual(tc3PreLiChunSolar.dayun.preLiChunZeroAgeAdjustment.firstAgePillar.age, 1);
  assert.strictEqual(tc3PreLiChunSolar.dayun.preLiChunZeroAgeAdjustment.firstAgePillar.ganZhi, '甲申');
  assert.strictEqual(tc3PreLiChunSolar.dayun.preLiChunZeroAgeAdjustment.firstAgePillar.gregorianYear, 2004);

  assert.strictEqual(tc3ManualPreLiChun.dayun.preLiChunZeroAgeAdjustment.applies, true);
  assert.strictEqual(tc3ManualPreLiChun.dayun.preLiChunZeroAgeAdjustment.zeroAgePillar.ganZhi, '癸未');
  assert.strictEqual(tc3ManualPreLiChun.dayun.preLiChunZeroAgeAdjustment.firstAgePillar.ganZhi, '甲申');
  assert.strictEqual(tc3ManualPostLiChun.dayun.preLiChunZeroAgeAdjustment.applies, false);
  assert.strictEqual(tc3ManualPostLiChun.dayun.preLiChunZeroAgeAdjustment.firstAgePillar.ganZhi, '癸未');

  const fullReport = {
    verificationStatus: 'ALL_ASSERTIONS_PASSED',
    testCase1_StandardSolarAndLunar_1984_06_15_14_30_Male: {
      solarResult: summarizeChart(tc1Solar),
      lunarReverseMatch: {
        lunarInput: '1984年五月十六日 未時 (isLeapMonth=false)',
        resolvedSolar: tc1Lunar.meta.solar.formatted,
        fourPillarsMatch: tc1Lunar.bazi.fourPillarsString === tc1Solar.bazi.fourPillarsString,
      },
    },
    testCase2_RatHourBoundary_Sect2_LateVsEarly: {
      lateRat_1984_06_15_23_30: {
        solar: tc2LateRat.meta.solar,
        fourPillars: tc2LateRat.bazi.fourPillarsString,
        dayPillar: tc2LateRat.bazi.day,
        hourPillar: tc2LateRat.bazi.hour,
        ziweiTime: tc2LateRat.ziwei.time,
        ziweiTimeRange: tc2LateRat.ziwei.timeRange,
        ziweiSoulAndBody: {
          soulBranch: tc2LateRat.ziwei.earthlyBranchOfSoulPalace,
          bodyBranch: tc2LateRat.ziwei.earthlyBranchOfBodyPalace,
          fiveElementsClass: tc2LateRat.ziwei.fiveElementsClass,
        },
      },
      earlyRat_1984_06_16_00_30: {
        solar: tc2EarlyRat.meta.solar,
        fourPillars: tc2EarlyRat.bazi.fourPillarsString,
        dayPillar: tc2EarlyRat.bazi.day,
        hourPillar: tc2EarlyRat.bazi.hour,
        ziweiTime: tc2EarlyRat.ziwei.time,
        ziweiTimeRange: tc2EarlyRat.ziwei.timeRange,
        ziweiSoulAndBody: {
          soulBranch: tc2EarlyRat.ziwei.earthlyBranchOfSoulPalace,
          bodyBranch: tc2EarlyRat.ziwei.earthlyBranchOfBodyPalace,
          fiveElementsClass: tc2EarlyRat.ziwei.fiveElementsClass,
        },
      },
    },
    testCase3_PreLiChun_2004_01_15_And_ZeroAgeAlignment: {
      solarPreLiChun_2004_01_15_10_00: summarizeChart(tc3PreLiChunSolar),
      manualPillars_isPreLiChun_True: {
        fourPillars: tc3ManualPreLiChun.bazi.fourPillarsString,
        preLiChunZeroAgeAdjustment: tc3ManualPreLiChun.dayun.preLiChunZeroAgeAdjustment,
        firstDaYun: tc3ManualPreLiChun.dayun.pillars[0],
      },
      manualPillars_isPreLiChun_False: {
        fourPillars: tc3ManualPostLiChun.bazi.fourPillarsString,
        preLiChunZeroAgeAdjustment: tc3ManualPostLiChun.dayun.preLiChunZeroAgeAdjustment,
        firstDaYun: tc3ManualPostLiChun.dayun.pillars[0],
      },
    },
  };

  console.log(JSON.stringify(fullReport, null, 2));
}

runTests();
