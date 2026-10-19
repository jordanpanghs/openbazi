"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeGender = normalizeGender;
exports.hourToShichenIndex = hourToShichenIndex;
exports.shichenIndexToName = shichenIndexToName;
exports.calculateTenGod = calculateTenGod;
exports.calculateDiShi = calculateDiShi;
exports.getXunAndKong = getXunAndKong;
exports.stepGanZhi = stepGanZhi;
exports.buildPillarDetail = buildPillarDetail;
exports.evaluateGanZhiFavorability = evaluateGanZhiFavorability;
exports.calculateBaZiStrength = calculateBaZiStrength;
exports.calculateFromSolar = calculateFromSolar;
exports.calculateFromLunar = calculateFromLunar;
exports.calculateFromPillars = calculateFromPillars;
const lunar_javascript_1 = require("lunar-javascript");
const iztro_1 = require("iztro");
// --- Constants & Lookup Tables for BaZi Calculations ---
const STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
const STEM_WUXING = {
    甲: '木', 乙: '木',
    丙: '火', 丁: '火',
    戊: '土', 己: '土',
    庚: '金', 辛: '金',
    壬: '水', 癸: '水',
};
const BRANCH_WUXING = {
    寅: '木', 卯: '木',
    巳: '火', 午: '火',
    辰: '土', 戌: '土', 丑: '土', 未: '土',
    申: '金', 酉: '金',
    亥: '水', 子: '水',
};
const STEM_YINYANG = {
    甲: '陽', 乙: '陰',
    丙: '陽', 丁: '陰',
    戊: '陽', 己: '陰',
    庚: '陽', 辛: '陰',
    壬: '陽', 癸: '陰',
};
const BRANCH_HIDDEN_STEMS = {
    子: ['癸'],
    丑: ['己', '癸', '辛'],
    寅: ['甲', '丙', '戊'],
    卯: ['乙'],
    辰: ['戊', '乙', '癸'],
    巳: ['丙', '庚', '戊'],
    午: ['丁', '己'],
    未: ['己', '丁', '乙'],
    申: ['庚', '壬', '戊'],
    酉: ['辛'],
    戌: ['戊', '辛', '丁'],
    亥: ['壬', '甲'],
};
const SIXTY_JIAZI = Array.from({ length: 60 }, (_, i) => {
    return `${STEMS[i % 10]}${BRANCHES[i % 12]}`;
});
const NAYIN_TRADITIONAL = {
    甲子: '海中金', 乙丑: '海中金',
    丙寅: '爐中火', 丁卯: '爐中火',
    戊辰: '大林木', 己巳: '大林木',
    庚午: '路旁土', 辛未: '路旁土',
    壬申: '劍鋒金', 癸酉: '劍鋒金',
    甲戌: '山頭火', 乙亥: '山頭火',
    丙子: '澗下水', 丁丑: '澗下水',
    戊寅: '城頭土', 己卯: '城頭土',
    庚辰: '白蠟金', 辛巳: '白蠟金',
    壬午: '楊柳木', 癸未: '楊柳木',
    甲申: '泉中水', 乙酉: '泉中水',
    丙戌: '屋上土', 丁亥: '屋上土',
    戊子: '霹靂火', 己丑: '霹靂火',
    庚寅: '松柏木', 辛卯: '松柏木',
    壬辰: '長流水', 癸巳: '長流水',
    甲午: '沙中金', 乙未: '沙中金',
    丙申: '山下火', 丁酉: '山下火',
    戊戌: '平地木', 己亥: '平地木',
    庚子: '壁上土', 辛丑: '壁上土',
    壬寅: '金箔金', 癸卯: '金箔金',
    甲辰: '覆燈火', 乙巳: '覆燈火',
    丙午: '天河水', 丁未: '天河水',
    戊申: '大驛土', 己酉: '大驛土',
    庚戌: '釵釧金', 辛亥: '釵釧金',
    壬子: '桑柘木', 癸丑: '桑柘木',
    甲寅: '大溪水', 乙卯: '大溪水',
    丙辰: '沙中土', 丁巳: '沙中土',
    戊午: '天上火', 己未: '天上火',
    庚申: '石榴木', 辛酉: '石榴木',
    壬戌: '大海水', 癸亥: '大海水',
};
const CHANGSHENG_LABELS = [
    '長生', '沐浴', '冠帶', '臨官', '帝旺', '衰', '病', '死', '墓', '絕', '胎', '養',
];
// Starting Earthly Branch index of '長生' for each Heavenly Stem
const CHANGSHENG_START_BRANCH = {
    甲: { startBranch: '亥', forward: true },
    丙: { startBranch: '寅', forward: true },
    戊: { startBranch: '寅', forward: true },
    庚: { startBranch: '巳', forward: true },
    壬: { startBranch: '申', forward: true },
    乙: { startBranch: '午', forward: false },
    丁: { startBranch: '酉', forward: false },
    己: { startBranch: '酉', forward: false },
    辛: { startBranch: '子', forward: false },
    癸: { startBranch: '卯', forward: false },
};
const S2T_MAP = {
    伤官: '傷官',
    食神: '食神',
    正财: '正財',
    偏财: '偏財',
    正官: '正官',
    七杀: '七殺',
    正印: '正印',
    偏印: '偏印',
    比肩: '比肩',
    劫财: '劫財',
    日主: '日主',
    长生: '長生',
    沐浴: '沐浴',
    冠带: '冠帶',
    临官: '臨官',
    帝旺: '帝旺',
    衰: '衰',
    病: '病',
    死: '死',
    墓: '墓',
    绝: '絕',
    胎: '胎',
    养: '養',
    惊蛰: '驚蟄',
    谷雨: '穀雨',
    小满: '小滿',
    芒种: '芒種',
    处暑: '處暑',
    白露: '白露',
    寒露: '寒露',
    霜降: '霜降',
    立冬: '立冬',
    小雪: '小雪',
    大雪: '大雪',
    冬至: '冬至',
    小寒: '小寒',
    大寒: '大寒',
    立春: '立春',
    雨水: '雨水',
    春分: '春分',
    清明: '清明',
    立夏: '立夏',
    夏至: '夏至',
    小暑: '小暑',
    大暑: '大暑',
    立秋: '立秋',
    秋分: '秋分',
};
function toTraditional(text) {
    if (!text)
        return text;
    if (S2T_MAP[text])
        return S2T_MAP[text];
    if (NAYIN_TRADITIONAL[text])
        return NAYIN_TRADITIONAL[text];
    return text
        .replace(/闰/g, '閏')
        .replace(/腊/g, '臘')
        .replace(/炉/g, '爐')
        .replace(/剑/g, '劍')
        .replace(/锋/g, '鋒')
        .replace(/头/g, '頭')
        .replace(/涧/g, '澗')
        .replace(/蜡/g, '蠟')
        .replace(/杨/g, '楊')
        .replace(/雳/g, '霹')
        .replace(/长/g, '長')
        .replace(/覆灯/g, '覆燈')
        .replace(/驿/g, '驛')
        .replace(/钗/g, '釵')
        .replace(/钏/g, '釧')
        .replace(/伤/g, '傷')
        .replace(/财/g, '財')
        .replace(/杀/g, '殺')
        .replace(/带/g, '帶')
        .replace(/临/g, '臨')
        .replace(/绝/g, '絕')
        .replace(/养/g, '養');
}
function normalizeGender(gender) {
    if (gender === '男' || gender === 'M' || gender === 'male' || gender === 1) {
        return '男';
    }
    return '女';
}
/**
 * Convert a 24-hour clock time (0..23) into iztro's 0..12 timeIndex:
 * - 0: Early Rat (早子時, 00:00~00:59)
 * - 1..11: Ox (丑時, 01:00~02:59) .. Pig (亥時, 21:00~22:59)
 * - 12: Late Rat (晚子時, 23:00~23:59)
 */
function hourToShichenIndex(hour) {
    if (hour === 0)
        return 0;
    if (hour === 23)
        return 12;
    return Math.floor((hour + 1) / 2);
}
function shichenIndexToName(shichenIndex) {
    if (shichenIndex === 0)
        return '早子時 (00:00-00:59)';
    if (shichenIndex === 12)
        return '晚子時 (23:00-23:59)';
    const branch = BRANCHES[shichenIndex];
    const startHour = shichenIndex * 2 - 1;
    const endHour = shichenIndex * 2 + 1;
    return `${branch}時 (${String(startHour).padStart(2, '0')}:00-${String(endHour).padStart(2, '0')}:00)`;
}
/**
 * Compute the Ten God (十神) relationship of targetStem relative to dayMasterStem.
 */
function calculateTenGod(dayMasterStem, targetStem) {
    const dmIdx = STEMS.indexOf(dayMasterStem);
    const tgIdx = STEMS.indexOf(targetStem);
    if (dmIdx < 0 || tgIdx < 0)
        return '';
    const dmElement = Math.floor(dmIdx / 2); // 0=Wood, 1=Fire, 2=Earth, 3=Metal, 4=Water
    const tgElement = Math.floor(tgIdx / 2);
    const samePolarity = (dmIdx % 2) === (tgIdx % 2);
    const diff = (tgElement - dmElement + 5) % 5;
    switch (diff) {
        case 0:
            return samePolarity ? '比肩' : '劫財';
        case 1:
            return samePolarity ? '食神' : '傷官';
        case 2:
            return samePolarity ? '偏財' : '正財';
        case 3:
            return samePolarity ? '七殺' : '正官';
        case 4:
            return samePolarity ? '偏印' : '正印';
        default:
            return '';
    }
}
function calculateDiShi(dayMasterStem, branch) {
    const cfg = CHANGSHENG_START_BRANCH[dayMasterStem];
    if (!cfg)
        return '';
    const startIdx = BRANCHES.indexOf(cfg.startBranch);
    const targetIdx = BRANCHES.indexOf(branch);
    if (startIdx < 0 || targetIdx < 0)
        return '';
    const offset = cfg.forward
        ? (targetIdx - startIdx + 12) % 12
        : (startIdx - targetIdx + 12) % 12;
    return CHANGSHENG_LABELS[offset];
}
function getXunAndKong(ganZhi) {
    const idx = SIXTY_JIAZI.indexOf(ganZhi);
    if (idx < 0)
        return { xun: '', xunKong: '' };
    const xunStartIdx = Math.floor(idx / 10) * 10;
    const xun = SIXTY_JIAZI[xunStartIdx];
    const kongBranchIdx = (BRANCHES.indexOf(xun[1]) + 10) % 12;
    const xunKong = `${BRANCHES[kongBranchIdx]}${BRANCHES[(kongBranchIdx + 1) % 12]}`;
    return { xun, xunKong };
}
function stepGanZhi(ganZhi, delta) {
    const idx = SIXTY_JIAZI.indexOf(ganZhi);
    if (idx < 0)
        return ganZhi;
    return SIXTY_JIAZI[((idx + delta) % 60 + 60) % 60];
}
function buildPillarDetail(ganZhi, dayMasterStem, isDayPillar = false) {
    const stem = ganZhi[0];
    const branch = ganZhi[1];
    const hidden = BRANCH_HIDDEN_STEMS[branch] || [];
    const { xun, xunKong } = getXunAndKong(ganZhi);
    const hiddenStems = hidden.map((hs) => ({
        stem: hs,
        tenGod: calculateTenGod(dayMasterStem, hs),
    }));
    return {
        ganZhi,
        stem,
        branch,
        tenGod: isDayPillar ? '日主' : calculateTenGod(dayMasterStem, stem),
        branchTenGod: hiddenStems[0]?.tenGod || '',
        hiddenStems,
        naYin: NAYIN_TRADITIONAL[ganZhi] || '',
        wuXing: `${STEM_WUXING[stem] || ''}${BRANCH_WUXING[branch] || ''}`,
        diShi: calculateDiShi(dayMasterStem, branch),
        xun,
        xunKong,
    };
}
const WUXING_ORDER = ['木', '火', '土', '金', '水'];
/**
 * Evaluate whether a GanZhi pillar (DaYun or LiuNian) is Favorable ('喜'), Unfavorable ('忌'), or Mixed ('平').
 */
function evaluateGanZhiFavorability(stem, branch, favorableElements, unfavorableElements) {
    const sEl = STEM_WUXING[stem] || '';
    const mainHiddenStem = (BRANCH_HIDDEN_STEMS[branch] || [])[0] || '';
    const bEl = STEM_WUXING[mainHiddenStem] || BRANCH_WUXING[branch] || '';
    const sFav = favorableElements.includes(sEl);
    const bFav = favorableElements.includes(bEl);
    const sUnfav = unfavorableElements.includes(sEl);
    const bUnfav = unfavorableElements.includes(bEl);
    if (sFav && bFav)
        return '喜';
    if (sUnfav && bUnfav)
        return '忌';
    return '平';
}
/**
 * Calculate Day Master Strength (旺弱), 6-tier Structure (格局: 身旺 / 身弱 / 專旺 / 假專旺 / 從格 / 假從格),
 * Five-Element power weights, and Favorable / Unfavorable Gods (喜用神 / 忌神).
 */
function calculateBaZiStrength(yearPillar, monthPillar, dayPillar, hourPillar, manualStructure) {
    const dmStem = dayPillar.stem;
    const dmEl = (STEM_WUXING[dmStem] || '木');
    const dmIdx = WUXING_ORDER.indexOf(dmEl);
    const sameEl = dmEl; // 比劫
    const resourceEl = WUXING_ORDER[(dmIdx + 4) % 5]; // 印星 (生我)
    const outputEl = WUXING_ORDER[(dmIdx + 1) % 5]; // 食傷 (我生)
    const wealthEl = WUXING_ORDER[(dmIdx + 2) % 5]; // 財星 (我剋)
    const officerEl = WUXING_ORDER[(dmIdx + 3) % 5]; // 官殺 (剋我)
    const rawScores = {
        木: 0,
        火: 0,
        土: 0,
        金: 0,
        水: 0,
    };
    // Weighted scoring across the Eight Characters (total = 100 pts):
    // Day Master baseline = 8, Year Stem = 7, Month Stem = 11, Hour Stem = 10
    // Year Branch = 8, Month Branch (月令) = 36, Day Branch (日支) = 12, Hour Branch = 8
    rawScores[dmEl] += 8;
    rawScores[(STEM_WUXING[yearPillar.stem] || '木')] += 7;
    rawScores[(STEM_WUXING[monthPillar.stem] || '木')] += 11;
    rawScores[(STEM_WUXING[hourPillar.stem] || '木')] += 10;
    const branchConfigs = [
        { branch: yearPillar.branch, weight: 8 },
        { branch: monthPillar.branch, weight: 36 },
        { branch: dayPillar.branch, weight: 12 },
        { branch: hourPillar.branch, weight: 8 },
    ];
    const hiddenRatios = {
        1: [1.0],
        2: [0.7, 0.3],
        3: [0.6, 0.25, 0.15],
    };
    let rootCount = 0;
    let strongRootCount = 0;
    for (const { branch, weight } of branchConfigs) {
        const hsList = BRANCH_HIDDEN_STEMS[branch] || [];
        const ratios = hiddenRatios[hsList.length] || [1.0];
        hsList.forEach((hs, idx) => {
            const el = (STEM_WUXING[hs] || '木');
            const share = weight * (ratios[idx] ?? 0);
            rawScores[el] += share;
            if (el === sameEl || el === resourceEl) {
                rootCount += 1;
                if (idx === 0)
                    strongRootCount += 1;
            }
        });
    }
    // Seasonal multiplier on Month Branch (月令旺相休囚死)
    const monthMainHidden = (BRANCH_HIDDEN_STEMS[monthPillar.branch] || [])[0] || '';
    const monthEl = (STEM_WUXING[monthMainHidden] || BRANCH_WUXING[monthPillar.branch] || '木');
    let monthCommandStatus = '失令（休）';
    let isDeLing = false;
    if (monthEl === sameEl) {
        monthCommandStatus = '得令（旺）';
        isDeLing = true;
    }
    else if (monthEl === resourceEl) {
        monthCommandStatus = '得令（相）';
        isDeLing = true;
    }
    else if (monthEl === outputEl) {
        monthCommandStatus = '失令（休）';
    }
    else if (monthEl === wealthEl) {
        monthCommandStatus = '失令（囚）';
    }
    else if (monthEl === officerEl) {
        monthCommandStatus = '失令（死）';
    }
    // Check 得地 (Day Branch or >=2 strong roots) and 得勢 (at least 2 supporting stems)
    const dayMainHidden = (BRANCH_HIDDEN_STEMS[dayPillar.branch] || [])[0] || '';
    const dayBranchEl = (STEM_WUXING[dayMainHidden] || '木');
    const isDeDi = dayBranchEl === sameEl || dayBranchEl === resourceEl || strongRootCount >= 2;
    const otherStems = [yearPillar.stem, monthPillar.stem, hourPillar.stem];
    const supportingStemsCount = otherStems.filter((s) => {
        const el = STEM_WUXING[s];
        return el === sameEl || el === resourceEl;
    }).length;
    const isDeShi = supportingStemsCount >= 2;
    const totalScore = rawScores.木 + rawScores.火 + rawScores.土 + rawScores.金 + rawScores.水 || 100;
    const relationLabelMap = {
        [sameEl]: '比劫（同我）',
        [resourceEl]: '印星（生我）',
        [outputEl]: '食傷（我生）',
        [wealthEl]: '財星（我剋）',
        [officerEl]: '官殺（剋我）',
    };
    const elementScores = {};
    for (const el of WUXING_ORDER) {
        const s = Math.round(rawScores[el] * 10) / 10;
        const pct = Math.round((rawScores[el] / totalScore) * 1000) / 10;
        elementScores[el] = {
            score: s,
            percent: pct,
            relation: relationLabelMap[el],
        };
    }
    const selfScore = rawScores[sameEl] + rawScores[resourceEl];
    const selfPartyPercent = Math.round((selfScore / totalScore) * 1000) / 10;
    const otherPartyPercent = Math.round((100 - selfPartyPercent) * 10) / 10;
    // Auto-detect 6-tier Structure (身旺 / 身弱 / 專旺 / 假專旺 / 從格 / 假從格)
    const hasOfficerOrWealthStem = otherStems.some((s) => {
        const el = STEM_WUXING[s];
        return el === officerEl || el === wealthEl;
    });
    let autoStructure = '身弱';
    if (selfPartyPercent >= 82 && isDeLing && !hasOfficerOrWealthStem) {
        autoStructure = '專旺';
    }
    else if (selfPartyPercent >= 74 && isDeLing) {
        autoStructure = '假專旺';
    }
    else if (selfPartyPercent <= 15 && !isDeLing && strongRootCount === 0 && supportingStemsCount === 0) {
        autoStructure = '從格';
    }
    else if (selfPartyPercent <= 24 && !isDeLing && strongRootCount === 0) {
        autoStructure = '假從格';
    }
    else if (selfPartyPercent >= 50 || (selfPartyPercent >= 46 && isDeLing && isDeDi)) {
        autoStructure = '身旺';
    }
    else {
        autoStructure = '身弱';
    }
    const activeStructure = manualStructure || autoStructure;
    const isManualOverride = Boolean(manualStructure && manualStructure !== autoStructure);
    // Determine Favorable (喜用神) and Unfavorable (忌神) Elements & Ten Gods
    let favorableElements = [];
    let favorableTenGods = [];
    let unfavorableElements = [];
    let unfavorableTenGods = [];
    let detailedLabel = activeStructure;
    let strengthSummary = activeStructure;
    const ZHUANWANG_NAMES = {
        木: '專旺（曲直仁壽格）',
        火: '專旺（炎上格）',
        土: '專旺（稼穡格）',
        金: '專旺（從革格）',
        水: '專旺（潤下格）',
    };
    if (activeStructure === '身旺') {
        strengthSummary = '身旺（日主強）';
        detailedLabel = isDeLing && isDeDi ? '身旺（得令得地）' : isDeLing ? '身旺（得令身強）' : '身旺（得地得勢）';
        // 身旺喜克洩耗（官殺、食傷、財星），忌印比生扶
        favorableElements = [officerEl, wealthEl, outputEl];
        favorableTenGods = ['官殺（正官/七殺）', '財星（正財/偏財）', '食傷（食神/傷官）'];
        unfavorableElements = [sameEl, resourceEl];
        unfavorableTenGods = ['比劫（比肩/劫財）', '印星（正印/偏印）'];
    }
    else if (activeStructure === '身弱') {
        strengthSummary = '身弱（日主弱）';
        detailedLabel = !isDeLing && !isDeDi ? '身弱（失令失地）' : !isDeLing ? '身弱（失令偏弱）' : '身弱（得令少助）';
        // 身弱喜印比生扶（印星、比劫），忌官殺財食克洩耗
        favorableElements = [resourceEl, sameEl];
        favorableTenGods = ['印星（正印/偏印）', '比劫（比肩/劫財）'];
        unfavorableElements = [officerEl, wealthEl, outputEl];
        unfavorableTenGods = ['官殺（正官/七殺）', '財星（正財/偏財）', '食傷（食神/傷官）'];
    }
    else if (activeStructure === '專旺' || activeStructure === '假專旺') {
        strengthSummary = activeStructure === '專旺' ? '專旺格（極強）' : '假專旺格（強極順勢）';
        detailedLabel = activeStructure === '專旺' ? ZHUANWANG_NAMES[dmEl] : `假${ZHUANWANG_NAMES[dmEl]}`;
        // 專旺順其氣勢，喜比劫、印星、食傷洩秀；最忌官殺逆勢、財星壞印
        favorableElements = [sameEl, resourceEl, outputEl];
        favorableTenGods = ['比劫（順勢）', '印星（生助）', '食傷（洩秀）'];
        unfavorableElements = [officerEl, wealthEl];
        unfavorableTenGods = ['官殺（犯旺）', '財星（群比爭財）'];
    }
    else {
        // 從格 / 假從格
        const dominantOther = [
            { el: wealthEl, name: '從財格', score: rawScores[wealthEl] },
            { el: officerEl, name: '從殺格', score: rawScores[officerEl] },
            { el: outputEl, name: '從兒格（從食傷）', score: rawScores[outputEl] },
        ].sort((a, b) => b.score - a.score)[0];
        strengthSummary = activeStructure === '從格' ? '從格（極弱順勢）' : '假從格（弱極棄命）';
        detailedLabel = activeStructure === '從格' ? dominantOther.name : `假${dominantOther.name}`;
        favorableElements = [wealthEl, officerEl, outputEl];
        favorableTenGods = ['財星（正財/偏財）', '官殺（正官/七殺）', '食傷（食神/傷官）'];
        unfavorableElements = [resourceEl, sameEl];
        unfavorableTenGods = ['印星（扶身破格）', '比劫（幫身破格）'];
    }
    const explanation = `日元【${dmStem}${dmEl}】生於【${monthPillar.branch}】月（${monthCommandStatus}），地支藏干通根共 ${rootCount} 處（強根 ${strongRootCount} 處），天干透出幫扶 ${supportingStemsCount} 處。同黨（印比）力量佔 ${selfPartyPercent}%，異黨（食財官）力量佔 ${otherPartyPercent}%，判定為【${detailedLabel}】。喜用神五行：${favorableElements.join('、')}；忌神五行：${unfavorableElements.join('、')}。`;
    return {
        autoStructure,
        structure: activeStructure,
        isManualOverride,
        detailedLabel,
        strengthSummary,
        monthCommandStatus,
        isDeLing,
        isDeDi,
        isDeShi,
        rootCount,
        selfPartyPercent,
        otherPartyPercent,
        elementScores,
        favorableElements,
        favorableTenGods,
        unfavorableElements,
        unfavorableTenGods,
        explanation,
    };
}
function parseSolarToTimestampMs(solar) {
    return Date.UTC(solar.getYear(), solar.getMonth() - 1, solar.getDay(), solar.getHour(), solar.getMinute(), solar.getSecond());
}
/**
 * Determine whether a given Solar date/time falls between Jan 1 and LiChun (立春) of that Gregorian year.
 */
function checkIsPreLiChunInGregorianYear(solar, yearGanZhi) {
    // On July 1 of the same Gregorian year, the sexagenary year is always the post-LiChun pillar for that year.
    const midYearYearGanZhi = lunar_javascript_1.Solar.fromYmdHms(solar.getYear(), 7, 1, 12, 0, 0)
        .getLunar()
        .getEightChar()
        .getYear();
    return yearGanZhi !== midYearYearGanZhi && solar.getMonth() <= 2;
}
/**
 * Build the Zi Wei Dou Shu 12-palace grid using iztro (Traditional Chinese zh-TW).
 */
function buildZiWeiChart(solarYear, solarMonth, solarDay, solarHour, gender) {
    try {
        const solarDateStr = `${solarYear}-${solarMonth}-${solarDay}`;
        const timeIndex = hourToShichenIndex(solarHour);
        const astrolabe = iztro_1.astro.bySolar(solarDateStr, timeIndex, gender, true, 'zh-TW');
        const fourTransformations = {
            化祿: null,
            化權: null,
            化科: null,
            化忌: null,
        };
        const palaces = astrolabe.palaces.map((p) => {
            const starTransformations = [];
            const majorStars = (p.majorStars || []).map((s) => {
                const mutagen = s.mutagen || '';
                const label = mutagen ? `化${mutagen}` : null;
                if (label && label in fourTransformations) {
                    fourTransformations[label] = s.name;
                    starTransformations.push({
                        starName: s.name,
                        starCategory: 'major',
                        mutagen,
                        label,
                    });
                }
                return {
                    name: s.name,
                    type: s.type,
                    scope: s.scope,
                    brightness: s.brightness || '',
                    mutagen,
                    transformationLabel: label,
                };
            });
            const minorStars = (p.minorStars || []).map((s) => {
                const mutagen = s.mutagen || '';
                const label = mutagen ? `化${mutagen}` : null;
                if (label && label in fourTransformations) {
                    fourTransformations[label] = s.name;
                    starTransformations.push({
                        starName: s.name,
                        starCategory: 'minor',
                        mutagen,
                        label,
                    });
                }
                return {
                    name: s.name,
                    type: s.type,
                    scope: s.scope,
                    brightness: s.brightness || '',
                    mutagen,
                    transformationLabel: label,
                };
            });
            const adjectiveStars = (p.adjectiveStars || []).map((s) => ({
                name: s.name,
                type: s.type,
                scope: s.scope,
            }));
            const decadalRange = p.decadal?.range || [0, 0];
            return {
                index: p.index,
                name: p.name,
                heavenlyStem: p.heavenlyStem,
                earthlyBranch: p.earthlyBranch,
                ganZhi: `${p.heavenlyStem}${p.earthlyBranch}`,
                isBodyPalace: Boolean(p.isBodyPalace),
                isOriginalPalace: Boolean(p.isOriginalPalace),
                majorStars,
                minorStars,
                adjectiveStars,
                starTransformations,
                decadal: {
                    startAge: decadalRange[0],
                    endAge: decadalRange[1],
                    range: decadalRange,
                    heavenlyStem: p.decadal?.heavenlyStem || p.heavenlyStem,
                    earthlyBranch: p.decadal?.earthlyBranch || p.earthlyBranch,
                    ganZhi: `${p.decadal?.heavenlyStem || p.heavenlyStem}${p.decadal?.earthlyBranch || p.earthlyBranch}`,
                },
                ages: p.ages || [],
                changsheng12: p.changsheng12 || '',
                boshi12: p.boshi12 || '',
                jiangqian12: p.jiangqian12 || '',
                suiqian12: p.suiqian12 || '',
            };
        });
        return {
            available: true,
            solarDate: astrolabe.solarDate,
            lunarDate: astrolabe.lunarDate,
            chineseDate: astrolabe.chineseDate,
            time: astrolabe.time,
            timeRange: astrolabe.timeRange,
            zodiac: astrolabe.zodiac,
            sign: astrolabe.sign,
            fiveElementsClass: astrolabe.fiveElementsClass,
            soulStar: astrolabe.soul,
            bodyStar: astrolabe.body,
            earthlyBranchOfSoulPalace: astrolabe.earthlyBranchOfSoulPalace,
            earthlyBranchOfBodyPalace: astrolabe.earthlyBranchOfBodyPalace,
            fourTransformations,
            palaces,
        };
    }
    catch (err) {
        return {
            available: false,
            reason: err?.message || String(err),
            palaces: [],
        };
    }
}
/**
 * Shared internal pipeline for Solar / Lunar calculation once a Solar instance is constructed.
 */
function executeFromSolarInstance(solar, genderInput, mode, options = {}) {
    const gender = normalizeGender(genderInput);
    const sect = options.sect ?? 2;
    const lunar = solar.getLunar();
    const ec = lunar.getEightChar();
    ec.setSect(sect);
    const yearGZ = ec.getYear();
    const monthGZ = ec.getMonth();
    const dayGZ = ec.getDay();
    const hourGZ = ec.getTime();
    const dayMasterStem = ec.getDayGan();
    const yearPillar = buildPillarDetail(yearGZ, dayMasterStem, false);
    const monthPillar = buildPillarDetail(monthGZ, dayMasterStem, false);
    const dayPillar = buildPillarDetail(dayGZ, dayMasterStem, true);
    const hourPillar = buildPillarDetail(hourGZ, dayMasterStem, false);
    const strength = calculateBaZiStrength(yearPillar, monthPillar, dayPillar, hourPillar, options.manualStructure);
    // Exact Major Luck (起大運) using Sect 2 (exact elapsed days, hours, and minutes to the Jie solar term)
    const genderCode = gender === '男' ? 1 : 0;
    const yun = ec.getYun(genderCode, 2);
    const isForward = yun.isForward();
    const prevJie = lunar.getPrevJie();
    const nextJie = lunar.getNextJie();
    const targetJie = isForward ? nextJie : prevJie;
    const targetJieSolar = targetJie.getSolar();
    const diffMs = Math.abs(parseSolarToTimestampMs(targetJieSolar) - parseSolarToTimestampMs(solar));
    const totalElapsedMinutes = Math.floor(diffMs / 60000);
    const elapsedDays = Math.floor(totalElapsedMinutes / (60 * 24));
    const elapsedHours = Math.floor((totalElapsedMinutes % (60 * 24)) / 60);
    const elapsedMinutes = totalElapsedMinutes % 60;
    // Pre-LiChun "0歲" check:
    // If born between Jan 1 and LiChun, the BaZi Year Pillar belongs to the previous Gregorian year.
    const isBeforeLiChun = checkIsPreLiChunInGregorianYear(solar, yearGZ);
    const birthGregorianYear = solar.getYear();
    const postLiChunYearGZ = isBeforeLiChun ? stepGanZhi(yearGZ, 1) : yearGZ;
    const zeroAgeAdjustment = {
        applies: isBeforeLiChun,
        isPreLiChun: isBeforeLiChun,
        zeroAgePillar: isBeforeLiChun
            ? {
                age: 0,
                gregorianYear: birthGregorianYear - 1,
                ganZhi: yearGZ,
                description: `元旦後立春前出生（公元${birthGregorianYear}年，年柱為${yearGZ}），標示${yearGZ}（${birthGregorianYear - 1}年）為「0歲」以修正年歲差`,
            }
            : null,
        firstAgePillar: {
            age: 1,
            gregorianYear: birthGregorianYear,
            ganZhi: postLiChunYearGZ,
        },
        explanation: isBeforeLiChun
            ? '依立春前「0歲」修正規則：元旦後立春前出生者，將年柱干支年標示為「0歲」，出生公元年標示為「1歲」，避免虛歲偏大一歲。'
            : '立春後出生，年柱干支與公元年一致，第一柱流年直接由1歲起算。',
    };
    // Extract the ten 10-year DaYun pillars (indices 1..10 from getDaYun(11))
    const rawDaYunList = yun.getDaYun(11);
    const rawFirstDaYun = rawDaYunList[1];
    const baseStartAge = options.manualStartAge !== undefined
        ? options.manualStartAge
        : Math.max(1, rawFirstDaYun.getStartYear() - birthGregorianYear + 1);
    // Build pre-DaYun LiuNian (0歲 if pre-LiChun, plus 1歲 .. baseStartAge - 1)
    const preDaYunLiuNian = [];
    if (isBeforeLiChun) {
        const zDetail = buildPillarDetail(yearGZ, dayMasterStem, false);
        preDaYunLiuNian.push({
            year: birthGregorianYear - 1,
            age: 0,
            ganZhi: yearGZ,
            stem: zDetail.stem,
            branch: zDetail.branch,
            tenGod: zDetail.tenGod,
            branchTenGod: zDetail.branchTenGod,
            hiddenStems: zDetail.hiddenStems,
            naYin: zDetail.naYin,
            favorability: evaluateGanZhiFavorability(zDetail.stem, zDetail.branch, strength.favorableElements, strength.unfavorableElements),
        });
    }
    for (let age = 1; age < baseStartAge; age++) {
        const lnYear = birthGregorianYear + age - 1;
        const lnGZ = stepGanZhi(postLiChunYearGZ, age - 1);
        const lnDetail = buildPillarDetail(lnGZ, dayMasterStem, false);
        preDaYunLiuNian.push({
            year: lnYear,
            age,
            ganZhi: lnGZ,
            stem: lnDetail.stem,
            branch: lnDetail.branch,
            tenGod: lnDetail.tenGod,
            branchTenGod: lnDetail.branchTenGod,
            hiddenStems: lnDetail.hiddenStems,
            naYin: lnDetail.naYin,
            favorability: evaluateGanZhiFavorability(lnDetail.stem, lnDetail.branch, strength.favorableElements, strength.unfavorableElements),
        });
    }
    const daYunPillars = [];
    for (let i = 1; i <= 10; i++) {
        const d = rawDaYunList[i];
        const gz = d.getGanZhi();
        const pDetail = buildPillarDetail(gz, dayMasterStem, false);
        const startAge = baseStartAge + (i - 1) * 10;
        const endAge = startAge + 9;
        const startYear = birthGregorianYear + startAge - 1;
        const endYear = startYear + 9;
        const liuNian = [];
        for (let offset = 0; offset < 10; offset++) {
            const lnYear = startYear + offset;
            const lnAge = startAge + offset;
            const lnGZ = stepGanZhi(postLiChunYearGZ, lnAge - 1);
            const lnDetail = buildPillarDetail(lnGZ, dayMasterStem, false);
            liuNian.push({
                year: lnYear,
                age: lnAge,
                ganZhi: lnGZ,
                stem: lnDetail.stem,
                branch: lnDetail.branch,
                tenGod: lnDetail.tenGod,
                branchTenGod: lnDetail.branchTenGod,
                hiddenStems: lnDetail.hiddenStems,
                naYin: lnDetail.naYin,
                favorability: evaluateGanZhiFavorability(lnDetail.stem, lnDetail.branch, strength.favorableElements, strength.unfavorableElements),
            });
        }
        daYunPillars.push({
            index: i,
            ganZhi: gz,
            stem: pDetail.stem,
            branch: pDetail.branch,
            tenGod: pDetail.tenGod,
            branchTenGod: pDetail.branchTenGod,
            hiddenStems: pDetail.hiddenStems,
            naYin: pDetail.naYin,
            startAge,
            endAge,
            startYear,
            endYear,
            favorability: evaluateGanZhiFavorability(pDetail.stem, pDetail.branch, strength.favorableElements, strength.unfavorableElements),
            liuNian,
        });
    }
    const ziwei = buildZiWeiChart(solar.getYear(), solar.getMonth(), solar.getDay(), solar.getHour(), gender);
    const rawLunarMonth = lunar.getMonth();
    const isLeapMonth = rawLunarMonth < 0;
    return {
        meta: {
            mode,
            gender,
            sect,
            inBuiltInCalendarRange: solar.getYear() >= 1901 && solar.getYear() <= 2043,
            builtInRange: [1901, 2043],
            solar: {
                year: solar.getYear(),
                month: solar.getMonth(),
                day: solar.getDay(),
                hour: solar.getHour(),
                minute: solar.getMinute(),
                formatted: solar.toYmdHms(),
                shichenIndex: hourToShichenIndex(solar.getHour()),
                shichenName: shichenIndexToName(hourToShichenIndex(solar.getHour())),
            },
            lunar: {
                year: lunar.getYear(),
                month: Math.abs(rawLunarMonth),
                day: lunar.getDay(),
                isLeapMonth,
                yearGanZhi: yearGZ,
                formatted: toTraditional(lunar.toString()),
            },
            solarTerms: {
                prevJie: {
                    name: toTraditional(prevJie.getName()),
                    dateTime: prevJie.getSolar().toYmdHms(),
                },
                nextJie: {
                    name: toTraditional(nextJie.getName()),
                    dateTime: nextJie.getSolar().toYmdHms(),
                },
                isBeforeLiChunInGregorianYear: isBeforeLiChun,
            },
        },
        bazi: {
            fourPillarsString: `${yearGZ} ${monthGZ} ${dayGZ} ${hourGZ}`,
            dayMaster: {
                stem: dayMasterStem,
                wuXing: STEM_WUXING[dayMasterStem] || '',
                yinYang: STEM_YINYANG[dayMasterStem] || '陽',
            },
            strength,
            year: yearPillar,
            month: monthPillar,
            day: dayPillar,
            hour: hourPillar,
            taiYuan: {
                ganZhi: ec.getTaiYuan(),
                naYin: toTraditional(ec.getTaiYuanNaYin()),
            },
            mingGong: {
                ganZhi: ec.getMingGong(),
                naYin: toTraditional(ec.getMingGongNaYin()),
            },
            shenGong: {
                ganZhi: ec.getShenGong(),
                naYin: toTraditional(ec.getShenGongNaYin()),
            },
        },
        dayun: {
            direction: isForward ? '順排' : '逆排',
            isForward,
            calculationMethod: '扣實日時數（3日=1年，1日=4月，1時辰=10日，1小時=5日，1分鐘=2小時）',
            exactStart: {
                startAge: daYunPillars[0].startAge,
                years: yun.getStartYear(),
                months: yun.getStartMonth(),
                days: yun.getStartDay(),
                hours: yun.getStartHour(),
                startSolarDateTime: yun.getStartSolar().toYmdHms(),
                targetJieName: toTraditional(targetJie.getName()),
                targetJieDateTime: targetJieSolar.toYmdHms(),
                elapsedDays,
                elapsedHours,
                elapsedMinutes,
                totalElapsedMinutes,
            },
            preLiChunZeroAgeAdjustment: zeroAgeAdjustment,
            preDaYunLiuNian,
            pillars: daYunPillars,
        },
        ziwei,
    };
}
/**
 * 1. calculateFromSolar:
 * Converts Gregorian date/time to Lunar date, exact Four Pillars (Sect 2), exact Major Luck (扣實日時數),
 * and complete 12-palace Zi Wei Dou Shu chart.
 */
function calculateFromSolar(solarYear, solarMonth, solarDay, solarHour, solarMinute = 0, gender = '男', options = {}) {
    const solar = lunar_javascript_1.Solar.fromYmdHms(solarYear, solarMonth, solarDay, solarHour, solarMinute, 0);
    return executeFromSolarInstance(solar, gender, 'solar', options);
}
/**
 * 2. calculateFromLunar:
 * Maps a Lunar date/time (including leap month flag) to its Solar date and runs the full calculation pipeline.
 */
function calculateFromLunar(lunarYear, lunarMonth, lunarDay, lunarHour = 0, isLeapMonth = false, gender = '男', options = {}) {
    const signedMonth = isLeapMonth ? -Math.abs(lunarMonth) : Math.abs(lunarMonth);
    const lunar = lunar_javascript_1.Lunar.fromYmdHms(lunarYear, signedMonth, lunarDay, lunarHour, 0, 0);
    const solar = lunar.getSolar();
    return executeFromSolarInstance(solar, gender, 'lunar', options);
}
/**
 * 3. calculateFromPillars:
 * Implements manual Four Pillars input mode with optional pre-LiChun 0-age alignment and starting age override.
 */
function calculateFromPillars(yearPillarGZ, monthPillarGZ, dayPillarGZ, hourPillarGZ, isPreLiChun = false, genderInput = '男', options = {}) {
    const gender = normalizeGender(genderInput);
    const sect = options.sect ?? 2;
    for (const [label, gz] of [
        ['年柱', yearPillarGZ],
        ['月柱', monthPillarGZ],
        ['日柱', dayPillarGZ],
        ['時柱', hourPillarGZ],
    ]) {
        if (!SIXTY_JIAZI.includes(gz)) {
            throw new Error(`Invalid ${label} GanZhi '${gz}': must be one of the 60 JiaZi pillars.`);
        }
    }
    const dayMasterStem = dayPillarGZ[0];
    const yearPillar = buildPillarDetail(yearPillarGZ, dayMasterStem, false);
    const monthPillar = buildPillarDetail(monthPillarGZ, dayMasterStem, false);
    const dayPillar = buildPillarDetail(dayPillarGZ, dayMasterStem, true);
    const hourPillar = buildPillarDetail(hourPillarGZ, dayMasterStem, false);
    const strength = calculateBaZiStrength(yearPillar, monthPillar, dayPillar, hourPillar, options.manualStructure);
    // Determine Major Luck direction (順排 / 逆排):
    // Yang Year Stem + Male OR Yin Year Stem + Female => Forward (順排); otherwise Reverse (逆排)
    const isYangYearStem = STEM_YINYANG[yearPillar.stem] === '陽';
    const isForward = (isYangYearStem && gender === '男') || (!isYangYearStem && gender === '女');
    // Search matching Solar dates using Solar.fromBaZi
    const baseYear = options.baseYear ?? 1850;
    let matchedSolars = [];
    try {
        matchedSolars = lunar_javascript_1.Solar.fromBaZi(yearPillarGZ, monthPillarGZ, dayPillarGZ, hourPillarGZ, sect, baseYear);
    }
    catch {
        matchedSolars = [];
    }
    // Pick preferred candidate if any (preferring referenceYear or 1901..2043)
    let selectedSolar = null;
    if (matchedSolars.length > 0) {
        if (options.referenceYear !== undefined) {
            selectedSolar =
                matchedSolars.find((s) => s.getYear() === options.referenceYear) ||
                    matchedSolars[0];
        }
        else {
            selectedSolar =
                matchedSolars.find((s) => s.getYear() >= 1901 && s.getYear() <= 2043) || matchedSolars[0];
        }
    }
    // Determine exact start age or use manualStartAge (default 1 if outside calendar)
    let startAge = options.manualStartAge ?? 1;
    let exactYears = startAge;
    let exactMonths = 0;
    let exactDays = 0;
    let exactHours = 0;
    let startSolarDateTime = null;
    let targetJieName = null;
    let targetJieDateTime = null;
    let elapsedDays = null;
    let elapsedHours = null;
    let elapsedMinutes = null;
    let totalElapsedMinutes = null;
    let referenceGregorianYear = options.referenceYear ?? null;
    if (selectedSolar) {
        const l = selectedSolar.getLunar();
        const ec = l.getEightChar();
        ec.setSect(sect);
        const yun = ec.getYun(gender === '男' ? 1 : 0, 2);
        const prevJie = l.getPrevJie();
        const nextJie = l.getNextJie();
        const targetJie = isForward ? nextJie : prevJie;
        const targetJieSolar = targetJie.getSolar();
        const diffMs = Math.abs(parseSolarToTimestampMs(targetJieSolar) -
            parseSolarToTimestampMs(selectedSolar));
        totalElapsedMinutes = Math.floor(diffMs / 60000);
        elapsedDays = Math.floor(totalElapsedMinutes / (60 * 24));
        elapsedHours = Math.floor((totalElapsedMinutes % (60 * 24)) / 60);
        elapsedMinutes = totalElapsedMinutes % 60;
        exactYears = yun.getStartYear();
        exactMonths = yun.getStartMonth();
        exactDays = yun.getStartDay();
        exactHours = yun.getStartHour();
        startSolarDateTime = yun.getStartSolar().toYmdHms();
        targetJieName = toTraditional(targetJie.getName());
        targetJieDateTime = targetJieSolar.toYmdHms();
        if (referenceGregorianYear === null) {
            referenceGregorianYear = selectedSolar.getYear();
        }
        if (options.manualStartAge === undefined) {
            const d1 = yun.getDaYun(11)[1];
            startAge = Math.max(1, d1.getStartYear() - selectedSolar.getYear() + 1);
        }
    }
    // If isPreLiChun is checked ('立春前'), insert a '0歲' pillar for yearPillarGZ and advance age 1's
    // Annual Luck (流年) pillar to stepGanZhi(yearPillarGZ, +1) so nominal age aligns with the Gregorian year.
    const firstAgeGanZhi = isPreLiChun
        ? stepGanZhi(yearPillarGZ, 1)
        : yearPillarGZ;
    const zeroAgeAdjustment = {
        applies: isPreLiChun,
        isPreLiChun,
        zeroAgePillar: isPreLiChun
            ? {
                age: 0,
                gregorianYear: referenceGregorianYear !== null ? referenceGregorianYear - 1 : null,
                ganZhi: yearPillarGZ,
                description: `已勾選「立春前」：多排一柱「0歲」（${yearPillarGZ}）修正元旦後立春前出生之年歲差`,
            }
            : null,
        firstAgePillar: {
            age: 1,
            gregorianYear: referenceGregorianYear,
            ganZhi: firstAgeGanZhi,
        },
        explanation: isPreLiChun
            ? '依立春前「0歲」修正規則：多排一柱「0歲」（對應年柱干支），並以次一干支作為「1歲」流年，修正元旦後立春前出生之年歲差。'
            : '未勾選「立春前」，系統認定為立春後出生，直接以年柱干支作為「1歲」流年。',
    };
    const preDaYunLiuNian = [];
    if (isPreLiChun) {
        const zDetail = buildPillarDetail(yearPillarGZ, dayMasterStem, false);
        preDaYunLiuNian.push({
            year: referenceGregorianYear !== null ? referenceGregorianYear - 1 : null,
            age: 0,
            ganZhi: yearPillarGZ,
            stem: zDetail.stem,
            branch: zDetail.branch,
            tenGod: zDetail.tenGod,
            branchTenGod: zDetail.branchTenGod,
            hiddenStems: zDetail.hiddenStems,
            naYin: zDetail.naYin,
            favorability: evaluateGanZhiFavorability(zDetail.stem, zDetail.branch, strength.favorableElements, strength.unfavorableElements),
        });
    }
    for (let age = 1; age < startAge; age++) {
        const lnYear = referenceGregorianYear !== null ? referenceGregorianYear + age - 1 : null;
        const lnGZ = stepGanZhi(firstAgeGanZhi, age - 1);
        const lnDetail = buildPillarDetail(lnGZ, dayMasterStem, false);
        preDaYunLiuNian.push({
            year: lnYear,
            age,
            ganZhi: lnGZ,
            stem: lnDetail.stem,
            branch: lnDetail.branch,
            tenGod: lnDetail.tenGod,
            branchTenGod: lnDetail.branchTenGod,
            hiddenStems: lnDetail.hiddenStems,
            naYin: lnDetail.naYin,
            favorability: evaluateGanZhiFavorability(lnDetail.stem, lnDetail.branch, strength.favorableElements, strength.unfavorableElements),
        });
    }
    // Build the ten 10-year DaYun pillars stepping from monthPillarGZ
    const daYunPillars = [];
    for (let i = 1; i <= 10; i++) {
        const step = isForward ? i : -i;
        const gz = stepGanZhi(monthPillarGZ, step);
        const pDetail = buildPillarDetail(gz, dayMasterStem, false);
        const pStartAge = startAge + (i - 1) * 10;
        const pEndAge = pStartAge + 9;
        const pStartYear = referenceGregorianYear !== null
            ? referenceGregorianYear + pStartAge - 1
            : null;
        const pEndYear = pStartYear !== null ? pStartYear + 9 : null;
        const liuNian = [];
        for (let offset = 0; offset < 10; offset++) {
            const lnAge = pStartAge + offset;
            const lnYear = pStartYear !== null ? pStartYear + offset : null;
            const lnGZ = stepGanZhi(firstAgeGanZhi, lnAge - 1);
            const lnDetail = buildPillarDetail(lnGZ, dayMasterStem, false);
            liuNian.push({
                year: lnYear,
                age: lnAge,
                ganZhi: lnGZ,
                stem: lnDetail.stem,
                branch: lnDetail.branch,
                tenGod: lnDetail.tenGod,
                branchTenGod: lnDetail.branchTenGod,
                hiddenStems: lnDetail.hiddenStems,
                naYin: lnDetail.naYin,
                favorability: evaluateGanZhiFavorability(lnDetail.stem, lnDetail.branch, strength.favorableElements, strength.unfavorableElements),
            });
        }
        daYunPillars.push({
            index: i,
            ganZhi: gz,
            stem: pDetail.stem,
            branch: pDetail.branch,
            tenGod: pDetail.tenGod,
            branchTenGod: pDetail.branchTenGod,
            hiddenStems: pDetail.hiddenStems,
            naYin: pDetail.naYin,
            startAge: pStartAge,
            endAge: pEndAge,
            startYear: pStartYear,
            endYear: pEndYear,
            favorability: evaluateGanZhiFavorability(pDetail.stem, pDetail.branch, strength.favorableElements, strength.unfavorableElements),
            liuNian,
        });
    }
    // TaiYuan (胎元): Month Stem + 1, Month Branch + 3
    const taiYuanStem = STEMS[(STEMS.indexOf(monthPillar.stem) + 1) % 10];
    const taiYuanBranch = BRANCHES[(BRANCHES.indexOf(monthPillar.branch) + 3) % 12];
    const taiYuanGZ = `${taiYuanStem}${taiYuanBranch}`;
    const ziwei = selectedSolar
        ? buildZiWeiChart(selectedSolar.getYear(), selectedSolar.getMonth(), selectedSolar.getDay(), selectedSolar.getHour(), gender)
        : {
            available: false,
            reason: '四柱八字手動輸入模式下未匹配到對應西曆/農曆日期，紫微斗數需具體農曆月日方可安星。',
            palaces: [],
        };
    return {
        meta: {
            mode: 'pillars',
            gender,
            sect,
            inBuiltInCalendarRange: selectedSolar !== null &&
                selectedSolar.getYear() >= 1901 &&
                selectedSolar.getYear() <= 2043,
            builtInRange: [1901, 2043],
            solar: selectedSolar
                ? {
                    year: selectedSolar.getYear(),
                    month: selectedSolar.getMonth(),
                    day: selectedSolar.getDay(),
                    hour: selectedSolar.getHour(),
                    minute: selectedSolar.getMinute(),
                    formatted: selectedSolar.toYmdHms(),
                    shichenIndex: hourToShichenIndex(selectedSolar.getHour()),
                    shichenName: shichenIndexToName(hourToShichenIndex(selectedSolar.getHour())),
                }
                : null,
            lunar: selectedSolar
                ? {
                    year: selectedSolar.getLunar().getYear(),
                    month: Math.abs(selectedSolar.getLunar().getMonth()),
                    day: selectedSolar.getLunar().getDay(),
                    isLeapMonth: selectedSolar.getLunar().getMonth() < 0,
                    yearGanZhi: yearPillarGZ,
                    formatted: toTraditional(selectedSolar.getLunar().toString()),
                }
                : null,
            solarTerms: selectedSolar
                ? {
                    prevJie: {
                        name: toTraditional(selectedSolar.getLunar().getPrevJie().getName()),
                        dateTime: selectedSolar
                            .getLunar()
                            .getPrevJie()
                            .getSolar()
                            .toYmdHms(),
                    },
                    nextJie: {
                        name: toTraditional(selectedSolar.getLunar().getNextJie().getName()),
                        dateTime: selectedSolar
                            .getLunar()
                            .getNextJie()
                            .getSolar()
                            .toYmdHms(),
                    },
                    isBeforeLiChunInGregorianYear: isPreLiChun,
                }
                : null,
            matchedSolarCandidates: matchedSolars.map((s) => s.toYmdHms()),
        },
        bazi: {
            fourPillarsString: `${yearPillarGZ} ${monthPillarGZ} ${dayPillarGZ} ${hourPillarGZ}`,
            dayMaster: {
                stem: dayMasterStem,
                wuXing: STEM_WUXING[dayMasterStem] || '',
                yinYang: STEM_YINYANG[dayMasterStem] || '陽',
            },
            strength,
            year: yearPillar,
            month: monthPillar,
            day: dayPillar,
            hour: hourPillar,
            taiYuan: {
                ganZhi: taiYuanGZ,
                naYin: NAYIN_TRADITIONAL[taiYuanGZ] || '',
            },
            mingGong: {
                ganZhi: selectedSolar
                    ? selectedSolar.getLunar().getEightChar().getMingGong()
                    : '',
                naYin: selectedSolar
                    ? toTraditional(selectedSolar.getLunar().getEightChar().getMingGongNaYin())
                    : '',
            },
            shenGong: {
                ganZhi: selectedSolar
                    ? selectedSolar.getLunar().getEightChar().getShenGong()
                    : '',
                naYin: selectedSolar
                    ? toTraditional(selectedSolar.getLunar().getEightChar().getShenGongNaYin())
                    : '',
            },
        },
        dayun: {
            direction: isForward ? '順排' : '逆排',
            isForward,
            calculationMethod: selectedSolar
                ? '四柱反推節氣扣實日時數 + 「立春前」0歲修正'
                : '四柱直接排大運（依指定起運歲數及「立春前」0歲修正）',
            exactStart: {
                startAge,
                years: exactYears,
                months: exactMonths,
                days: exactDays,
                hours: exactHours,
                startSolarDateTime,
                targetJieName,
                targetJieDateTime,
                elapsedDays,
                elapsedHours,
                elapsedMinutes,
                totalElapsedMinutes,
            },
            preLiChunZeroAgeAdjustment: zeroAgeAdjustment,
            preDaYunLiuNian,
            pillars: daYunPillars,
        },
        ziwei,
    };
}
