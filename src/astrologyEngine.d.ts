export type GenderInput = '男' | '女' | 'M' | 'F' | 'male' | 'female' | 1 | 0;
export type StructureType = '身旺' | '身弱' | '專旺' | '假專旺' | '從格' | '假從格';
export interface CalculationOptions {
    /**
     * EightChar Sect for Zi Hour (子時) Day Pillar boundary:
     * - 2 (default, Lunar Sect 2): Late Zi (23:00-23:59) retains current day's Day Pillar;
     *   00:00-00:59 (Early Zi) advances to next day's Day Pillar.
     * - 1: 23:00-23:59 already advances to next day's Day Pillar.
     */
    sect?: 1 | 2;
    /**
     * Optional manual override for Major Luck starting age ('起運').
     */
    manualStartAge?: number;
    /**
     * Optional manual override for Chart Structure / Strength ('指定格局').
     */
    manualStructure?: StructureType;
    /**
     * Base year for Solar.fromBaZi lookup in manual Four Pillars mode (default 1901).
     */
    baseYear?: number;
    /**
     * Optional reference Gregorian birth year when calling calculateFromPillars.
     */
    referenceYear?: number;
}
export interface HiddenStemInfo {
    stem: string;
    tenGod: string;
}
export interface PillarDetail {
    ganZhi: string;
    stem: string;
    branch: string;
    tenGod: string;
    branchTenGod: string;
    hiddenStems: HiddenStemInfo[];
    naYin: string;
    wuXing: string;
    diShi: string;
    xun: string;
    xunKong: string;
}
export interface LiuNianItem {
    year: number | null;
    age: number;
    ganZhi: string;
    stem: string;
    branch: string;
    tenGod: string;
    branchTenGod: string;
    hiddenStems: HiddenStemInfo[];
    naYin: string;
    favorability?: '喜' | '忌' | '平';
}
export interface DaYunPillar {
    index: number;
    ganZhi: string;
    stem: string;
    branch: string;
    tenGod: string;
    branchTenGod: string;
    hiddenStems: HiddenStemInfo[];
    naYin: string;
    startAge: number;
    endAge: number;
    startYear: number | null;
    endYear: number | null;
    favorability?: '喜' | '忌' | '平';
    liuNian: LiuNianItem[];
}
export interface BaZiStrengthAnalysis {
    /** Auto-detected 6-tier structure */
    autoStructure: StructureType;
    /** Active structure (either manualStructure override or autoStructure) */
    structure: StructureType;
    isManualOverride: boolean;
    /** Detailed sub-pattern label, e.g. '身旺（得令得地）' or '從財格' */
    detailedLabel: string;
    /** Broad strength category: '強（旺）' | '弱' | '專旺' | '從格' */
    strengthSummary: string;
    /** Month command status: '得令（旺）' | '得令（相）' | '失令（休）' | '失令（囚）' | '失令（死）' */
    monthCommandStatus: string;
    isDeLing: boolean;
    isDeDi: boolean;
    isDeShi: boolean;
    rootCount: number;
    /** Self-party (比劫 + 印星) percentage (0..100) */
    selfPartyPercent: number;
    /** Other-party (食傷 + 財星 + 官殺) percentage (0..100) */
    otherPartyPercent: number;
    /** Five-Element weighted scores & percentages */
    elementScores: Record<'木' | '火' | '土' | '金' | '水', {
        score: number;
        percent: number;
        relation: string;
    }>;
    /** Favorable elements (喜用神五行) */
    favorableElements: string[];
    /** Favorable Ten Gods (喜用十神) */
    favorableTenGods: string[];
    /** Unfavorable elements (忌神五行) */
    unfavorableElements: string[];
    /** Unfavorable Ten Gods (忌神十神) */
    unfavorableTenGods: string[];
    /** Concise explanation of how 旺弱 & 喜忌 were determined */
    explanation: string;
}
export interface ZeroAgeAdjustment {
    applies: boolean;
    isPreLiChun: boolean;
    zeroAgePillar: {
        age: 0;
        gregorianYear: number | null;
        ganZhi: string;
        description: string;
    } | null;
    firstAgePillar: {
        age: 1;
        gregorianYear: number | null;
        ganZhi: string;
    };
    explanation: string;
}
export interface ZiWeiStarInfo {
    name: string;
    type: string;
    scope: string;
    brightness: string;
    mutagen: string;
    transformationLabel: string | null;
}
export interface ZiWeiPalaceInfo {
    index: number;
    name: string;
    heavenlyStem: string;
    earthlyBranch: string;
    ganZhi: string;
    isBodyPalace: boolean;
    isOriginalPalace: boolean;
    majorStars: ZiWeiStarInfo[];
    minorStars: ZiWeiStarInfo[];
    adjectiveStars: {
        name: string;
        type: string;
        scope: string;
    }[];
    starTransformations: {
        starName: string;
        starCategory: 'major' | 'minor';
        mutagen: string;
        label: string;
    }[];
    decadal: {
        startAge: number;
        endAge: number;
        range: [number, number];
        heavenlyStem: string;
        earthlyBranch: string;
        ganZhi: string;
    };
    ages: number[];
    changsheng12: string;
    boshi12: string;
    jiangqian12: string;
    suiqian12: string;
}
export interface AstrologyCalculationResult {
    meta: {
        mode: 'solar' | 'lunar' | 'pillars';
        gender: '男' | '女';
        sect: 1 | 2;
        inBuiltInCalendarRange: boolean;
        builtInRange: [1901, 2043];
        solar: {
            year: number;
            month: number;
            day: number;
            hour: number;
            minute: number;
            formatted: string;
            shichenIndex: number;
            shichenName: string;
        } | null;
        lunar: {
            year: number;
            month: number;
            day: number;
            isLeapMonth: boolean;
            yearGanZhi: string;
            formatted: string;
        } | null;
        solarTerms: {
            prevJie: {
                name: string;
                dateTime: string;
            };
            nextJie: {
                name: string;
                dateTime: string;
            };
            isBeforeLiChunInGregorianYear: boolean;
        } | null;
        matchedSolarCandidates?: string[];
    };
    bazi: {
        fourPillarsString: string;
        dayMaster: {
            stem: string;
            wuXing: string;
            yinYang: '陽' | '陰';
        };
        strength: BaZiStrengthAnalysis;
        year: PillarDetail;
        month: PillarDetail;
        day: PillarDetail;
        hour: PillarDetail;
        taiYuan: {
            ganZhi: string;
            naYin: string;
        };
        mingGong: {
            ganZhi: string;
            naYin: string;
        };
        shenGong: {
            ganZhi: string;
            naYin: string;
        };
    };
    dayun: {
        direction: '順排' | '逆排';
        isForward: boolean;
        calculationMethod: string;
        exactStart: {
            startAge: number;
            years: number;
            months: number;
            days: number;
            hours: number;
            startSolarDateTime: string | null;
            targetJieName: string | null;
            targetJieDateTime: string | null;
            elapsedDays: number | null;
            elapsedHours: number | null;
            elapsedMinutes: number | null;
            totalElapsedMinutes: number | null;
        };
        preLiChunZeroAgeAdjustment: ZeroAgeAdjustment;
        preDaYunLiuNian: LiuNianItem[];
        pillars: DaYunPillar[];
    };
    ziwei: {
        available: boolean;
        reason?: string;
        solarDate?: string;
        lunarDate?: string;
        chineseDate?: string;
        time?: string;
        timeRange?: string;
        zodiac?: string;
        sign?: string;
        fiveElementsClass?: string;
        soulStar?: string;
        bodyStar?: string;
        earthlyBranchOfSoulPalace?: string;
        earthlyBranchOfBodyPalace?: string;
        fourTransformations?: {
            化祿: string | null;
            化權: string | null;
            化科: string | null;
            化忌: string | null;
        };
        palaces: ZiWeiPalaceInfo[];
    };
}
export declare function normalizeGender(gender: GenderInput): '男' | '女';
/**
 * Convert a 24-hour clock time (0..23) into iztro's 0..12 timeIndex:
 * - 0: Early Rat (早子時, 00:00~00:59)
 * - 1..11: Ox (丑時, 01:00~02:59) .. Pig (亥時, 21:00~22:59)
 * - 12: Late Rat (晚子時, 23:00~23:59)
 */
export declare function hourToShichenIndex(hour: number): number;
export declare function shichenIndexToName(shichenIndex: number): string;
/**
 * Compute the Ten God (十神) relationship of targetStem relative to dayMasterStem.
 */
export declare function calculateTenGod(dayMasterStem: string, targetStem: string): string;
export declare function calculateDiShi(dayMasterStem: string, branch: string): string;
export declare function getXunAndKong(ganZhi: string): {
    xun: string;
    xunKong: string;
};
export declare function stepGanZhi(ganZhi: string, delta: number): string;
export declare function buildPillarDetail(ganZhi: string, dayMasterStem: string, isDayPillar?: boolean): PillarDetail;
/**
 * Evaluate whether a GanZhi pillar (DaYun or LiuNian) is Favorable ('喜'), Unfavorable ('忌'), or Mixed ('平').
 */
export declare function evaluateGanZhiFavorability(stem: string, branch: string, favorableElements: string[], unfavorableElements: string[]): '喜' | '忌' | '平';
/**
 * Calculate Day Master Strength (旺弱), 6-tier Structure (格局: 身旺 / 身弱 / 專旺 / 假專旺 / 從格 / 假從格),
 * Five-Element power weights, and Favorable / Unfavorable Gods (喜用神 / 忌神).
 */
export declare function calculateBaZiStrength(yearPillar: PillarDetail, monthPillar: PillarDetail, dayPillar: PillarDetail, hourPillar: PillarDetail, manualStructure?: StructureType): BaZiStrengthAnalysis;
/**
 * 1. calculateFromSolar:
 * Converts Gregorian date/time to Lunar date, exact Four Pillars (Sect 2), exact Major Luck (扣實日時數),
 * and complete 12-palace Zi Wei Dou Shu chart.
 */
export declare function calculateFromSolar(solarYear: number, solarMonth: number, solarDay: number, solarHour: number, solarMinute?: number, gender?: GenderInput, options?: CalculationOptions): AstrologyCalculationResult;
/**
 * 2. calculateFromLunar:
 * Maps a Lunar date/time (including leap month flag) to its Solar date and runs the full calculation pipeline.
 */
export declare function calculateFromLunar(lunarYear: number, lunarMonth: number, lunarDay: number, lunarHour?: number, isLeapMonth?: boolean, gender?: GenderInput, options?: CalculationOptions): AstrologyCalculationResult;
/**
 * 3. calculateFromPillars:
 * Implements manual Four Pillars input mode with optional pre-LiChun 0-age alignment and starting age override.
 */
export declare function calculateFromPillars(yearPillarGZ: string, monthPillarGZ: string, dayPillarGZ: string, hourPillarGZ: string, isPreLiChun?: boolean, genderInput?: GenderInput, options?: CalculationOptions): AstrologyCalculationResult;
