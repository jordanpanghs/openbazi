(function () {
  'use strict';

  const SYNC_ENDPOINT =
    'https://script.google.com/macros/s/AKfycbxMNvBv1jlY5x67CDQIfSMiHTQtDJZ_uDvywriLbZggA3ftJjjyL_WIMA8zSws2ifappA/exec';
  const SYNC_KEY = 'obz_k9x2m7q4';
  const ENTRY_IDLE_DEBOUNCE_MS = 8000;

  const Engine = window.AstrologyEngine;
  if (!Engine) {
    console.error('AstrologyEngine bundle not loaded.');
    return;
  }

  const STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
  const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

  const ELEMENT_BY_CHAR = {
    甲: '木', 乙: '木', 寅: '木', 卯: '木',
    丙: '火', 丁: '火', 巳: '火', 午: '火',
    戊: '土', 己: '土', 辰: '土', 戌: '土', 丑: '土', 未: '土',
    庚: '金', 辛: '金', 申: '金', 酉: '金',
    壬: '水', 癸: '水', 亥: '水', 子: '水',
  };

  const ELEMENT_CLASS = {
    木: 'el-wood',
    火: 'el-fire',
    土: 'el-earth',
    金: 'el-metal',
    水: 'el-water',
  };

  const MUTAGEN_CLASS = {
    祿: 'mut-lu',
    權: 'mut-quan',
    科: 'mut-ke',
    忌: 'mut-ji',
  };

  const MALEFIC_STARS = new Set(['擎羊', '陀羅', '火星', '鈴星', '地空', '地劫', '天刑', '陰煞']);

  // 13 Shichen options (0..12) mapped to representative clock hour and Pinyin
  const SHICHEN_OPTIONS = [
    { index: 0, hour: 0, pinyin: 'ZaoZiShi', label: '早子時 (00:00-00:59)' },
    { index: 1, hour: 2, pinyin: 'ChouShi', label: '丑時 (01:00-02:59)' },
    { index: 2, hour: 4, pinyin: 'YinShi', label: '寅時 (03:00-04:59)' },
    { index: 3, hour: 6, pinyin: 'MaoShi', label: '卯時 (05:00-06:59)' },
    { index: 4, hour: 8, pinyin: 'ChenShi', label: '辰時 (07:00-08:59)' },
    { index: 5, hour: 10, pinyin: 'SiShi', label: '巳時 (09:00-10:59)' },
    { index: 6, hour: 12, pinyin: 'WuShi', label: '午時 (11:00-12:59)' },
    { index: 7, hour: 14, pinyin: 'WeiShi', label: '未時 (13:00-14:59)' },
    { index: 8, hour: 16, pinyin: 'ShenShi', label: '申時 (15:00-16:59)' },
    { index: 9, hour: 18, pinyin: 'YouShi', label: '酉時 (17:00-18:59)' },
    { index: 10, hour: 19, pinyin: 'XuShi', label: '戌時 (19:00-20:59)' },
    { index: 11, hour: 22, pinyin: 'HaiShi', label: '亥時 (21:00-22:59)' },
    { index: 12, hour: 23, pinyin: 'WanZiShi', label: '晚子時 (23:00-23:59)' },
  ];

  const BRANCH_PINYIN = {
    子: 'ZiShi',
    丑: 'ChouShi',
    寅: 'YinShi',
    卯: 'MaoShi',
    辰: 'ChenShi',
    巳: 'SiShi',
    午: 'WuShi',
    未: 'WeiShi',
    申: 'ShenShi',
    酉: 'YouShi',
    戌: 'XuShi',
    亥: 'HaiShi',
  };

  // Traditional 4x4 grid coordinates (1-indexed row, col) for each Earthly Branch
  const BRANCH_GRID_POS = {
    巳: { row: 1, col: 1 },
    午: { row: 1, col: 2 },
    未: { row: 1, col: 3 },
    申: { row: 1, col: 4 },
    酉: { row: 2, col: 4 },
    戌: { row: 3, col: 4 },
    亥: { row: 4, col: 4 },
    子: { row: 4, col: 3 },
    丑: { row: 4, col: 2 },
    寅: { row: 4, col: 1 },
    卯: { row: 3, col: 1 },
    辰: { row: 2, col: 1 },
  };

  // Historical Daylight Saving Time database (香港 / 台灣 / 中國大陸 / 澳門)
  const HK_DST_TABLE = {
    1946: '4月20日00:00 至 12月1日03:30',
    1947: '4月13日03:30 至 11月30日03:30',
    1948: '5月2日03:30 至 10月31日03:30',
    1949: '4月3日03:30 至 10月30日03:30',
    1950: '4月2日03:30 至 10月29日03:30',
    1951: '4月1日03:30 至 10月28日03:30',
    1952: '4月6日03:30 至 11月2日03:30',
    1953: '4月5日03:30 至 11月1日03:30',
    1954: '3月21日03:30 至 10月31日03:30',
    1955: '3月20日03:30 至 11月6日03:30',
    1956: '3月18日03:30 至 11月4日03:30',
    1957: '3月24日03:30 至 11月3日03:30',
    1958: '3月23日03:30 至 11月2日03:30',
    1959: '3月22日03:30 至 11月1日03:30',
    1960: '3月20日03:30 至 11月6日03:30',
    1961: '3月19日03:30 至 11月5日03:30',
    1962: '3月18日03:30 至 11月4日03:30',
    1963: '3月24日03:30 至 11月3日03:30',
    1964: '3月22日03:30 至 11月1日03:30',
    1965: '4月18日03:30 至 10月17日03:30',
    1966: '4月17日03:30 至 10月16日03:30',
    1967: '4月16日03:30 至 10月22日03:30',
    1968: '4月21日03:30 至 10月20日03:30',
    1969: '4月20日03:30 至 10月19日03:30',
    1970: '4月19日03:30 至 10月18日03:30',
    1971: '4月18日03:30 至 10月17日03:30',
    1972: '4月16日03:30 至 10月22日03:30',
    1973: '4月22日03:30 至 10月21日03:30',
    1973.5: '12月30日03:30 起實施冬季夏令時間',
    1974: '1月1日00:00 至 10月20日03:30',
    1975: '4月20日03:30 至 10月19日03:30',
    1976: '4月18日03:30 至 10月17日03:30',
    1979: '5月13日03:30 至 10月21日03:30',
  };

  let currentChartResult = null;
  let selectedDaYunIndex = 1;
  let selectedPalaceIndex = null;
  let lastTriggerSource = 'solar'; // 'solar' | 'lunar' | 'pillars'

  // DOM References
  const els = {
    inputName: document.getElementById('inputName'),
    genderMale: document.getElementById('genderMale'),
    genderFemale: document.getElementById('genderFemale'),
    solarYear: document.getElementById('solarYear'),
    solarMonth: document.getElementById('solarMonth'),
    solarDay: document.getElementById('solarDay'),
    solarHour: document.getElementById('solarHour'),
    solarMinute: document.getElementById('solarMinute'),
    btnSolarToLunar: document.getElementById('btnSolarToLunar'),
    lunarYear: document.getElementById('lunarYear'),
    lunarMonth: document.getElementById('lunarMonth'),
    lunarLeap: document.getElementById('lunarLeap'),
    lunarDay: document.getElementById('lunarDay'),
    lunarHour: document.getElementById('lunarHour'),
    btnLunarToSolar: document.getElementById('btnLunarToSolar'),
    yearStem: document.getElementById('yearStem'),
    yearBranch: document.getElementById('yearBranch'),
    monthStem: document.getElementById('monthStem'),
    monthBranch: document.getElementById('monthBranch'),
    dayStem: document.getElementById('dayStem'),
    dayBranch: document.getElementById('dayBranch'),
    hourStem: document.getElementById('hourStem'),
    hourBranch: document.getElementById('hourBranch'),
    preLiChun: document.getElementById('preLiChun'),
    manualStartAge: document.getElementById('manualStartAge'),
    btnApplyPillars: document.getElementById('btnApplyPillars'),
    modeAuto: document.getElementById('modeAuto'),
    modeManual: document.getElementById('modeManual'),
    btnCalculate: document.getElementById('btnCalculate'),
    baziMetaBanner: document.getElementById('baziMetaBanner'),
    fourPillarsBody: document.getElementById('fourPillarsBody'),
    extraPillarsBar: document.getElementById('extraPillarsBar'),
    manualStructureSelect: document.getElementById('manualStructureSelect'),
    strengthBadgeWrap: document.getElementById('strengthBadgeWrap'),
    baziStrengthBody: document.getElementById('baziStrengthBody'),
    dayunHeader: document.getElementById('dayunHeader'),
    zeroAgeBanner: document.getElementById('zeroAgeBanner'),
    dayunFullTableWrap: document.getElementById('dayunFullTableWrap'),
    ziweiGrid: document.getElementById('ziweiGrid'),
    baziPane: document.getElementById('baziPane'),
    ziweiPane: document.getElementById('ziweiPane'),
    dstYear: document.getElementById('dstYear'),
    dstRegion: document.getElementById('dstRegion'),
    dstResult: document.getElementById('dstResult'),
  };

  const TENGOD_SHORT = {
    比肩: '比',
    劫財: '劫',
    食神: '食',
    傷官: '傷',
    偏財: '才',
    正財: '財',
    七殺: '殺',
    正官: '官',
    偏印: '梟',
    正印: '印',
    日主: '日',
  };

  function getSelectedGender() {
    return els.genderFemale.checked ? '女' : '男';
  }

  function isAutoMode() {
    return els.modeAuto.checked;
  }

  function getElementCharBadge(char, cssClass) {
    const el = ELEMENT_BY_CHAR[char] || '';
    const elCls = ELEMENT_CLASS[el] || '';
    return `
      <div>
        <span class="${cssClass} ${elCls}">${char}</span>
        <span class="char-sub-el ${elCls}" style="border:none;background:none;">${el}</span>
      </div>
    `;
  }

  function populateDropdowns() {
    // Years 1901..2043
    const yearHtml = [];
    for (let y = 1901; y <= 2043; y++) {
      yearHtml.push(`<option value="${y}">${y}</option>`);
    }
    els.solarYear.innerHTML = yearHtml.join('');
    els.lunarYear.innerHTML = yearHtml.join('');
    els.dstYear.innerHTML = yearHtml.join('');

    // Months 1..12
    const monthHtml = [];
    for (let m = 1; m <= 12; m++) {
      monthHtml.push(`<option value="${m}">${m}</option>`);
    }
    els.solarMonth.innerHTML = monthHtml.join('');
    els.lunarMonth.innerHTML = monthHtml.join('');

    // Solar Days 1..31 & Lunar Days 1..30
    updateSolarDaysDropdown(1984, 6, 15);
    const lunarDayHtml = [];
    for (let d = 1; d <= 30; d++) {
      lunarDayHtml.push(`<option value="${d}">${d}</option>`);
    }
    els.lunarDay.innerHTML = lunarDayHtml.join('');

    // Shichen Hours
    const hourHtml = SHICHEN_OPTIONS.map(
      (opt) => `<option value="${opt.hour}" data-shichen="${opt.index}">${opt.label}</option>`
    ).join('');
    els.solarHour.innerHTML = hourHtml;
    els.lunarHour.innerHTML = hourHtml;

    // Minutes 00..59
    const minHtml = [];
    for (let min = 0; min < 60; min++) {
      minHtml.push(`<option value="${min}">${String(min).padStart(2, '0')}</option>`);
    }
    els.solarMinute.innerHTML = minHtml.join('');

    // Stems & Branches for Four Pillars
    const stemHtml = STEMS.map((s) => `<option value="${s}">${s}</option>`).join('');
    const branchHtml = BRANCHES.map((b) => `<option value="${b}">${b}</option>`).join('');

    [els.yearStem, els.monthStem, els.dayStem, els.hourStem].forEach((sel) => {
      sel.innerHTML = stemHtml;
    });
    [els.yearBranch, els.monthBranch, els.dayBranch, els.hourBranch].forEach((sel) => {
      sel.innerHTML = branchHtml;
    });
  }

  function updateSolarDaysDropdown(year, month, preferredDay) {
    const maxDays = new Date(year, month, 0).getDate();
    const currentDay = preferredDay || Number(els.solarDay.value) || 1;
    const html = [];
    for (let d = 1; d <= maxDays; d++) {
      html.push(`<option value="${d}">${d}</option>`);
    }
    els.solarDay.innerHTML = html.join('');
    els.solarDay.value = String(Math.min(currentDay, maxDays));
  }

  /**
   * Ensure Stem and Branch have matching Yin/Yang polarity (60 JiaZi constraint)
   */
  function enforceStemBranchPolarity(stemSelect, branchSelect) {
    const sIdx = STEMS.indexOf(stemSelect.value);
    const bIdx = BRANCHES.indexOf(branchSelect.value);
    if (sIdx >= 0 && bIdx >= 0 && (sIdx % 2) !== (bIdx % 2)) {
      branchSelect.value = BRANCHES[(bIdx + 1) % 12];
    }
  }

  function syncControlsFromResult(result) {
    if (result.meta.solar) {
      const s = result.meta.solar;
      els.solarYear.value = String(s.year);
      els.solarMonth.value = String(s.month);
      updateSolarDaysDropdown(s.year, s.month, s.day);
      // Map shichenIndex to representative option hour
      const shichenOpt = SHICHEN_OPTIONS.find((o) => o.index === s.shichenIndex) || SHICHEN_OPTIONS[0];
      els.solarHour.value = String(shichenOpt.hour);
      els.solarMinute.value = String(s.minute);
    }

    if (result.meta.lunar) {
      const l = result.meta.lunar;
      if (l.year >= 1901 && l.year <= 2043) {
        els.lunarYear.value = String(l.year);
      }
      els.lunarMonth.value = String(l.month);
      els.lunarLeap.checked = Boolean(l.isLeapMonth);
      els.lunarDay.value = String(Math.min(l.day, 30));
      if (result.meta.solar) {
        const shichenOpt =
          SHICHEN_OPTIONS.find((o) => o.index === result.meta.solar.shichenIndex) ||
          SHICHEN_OPTIONS[0];
        els.lunarHour.value = String(shichenOpt.hour);
      }
    }

    // Sync 4 Pillars dropdowns
    els.yearStem.value = result.bazi.year.stem;
    els.yearBranch.value = result.bazi.year.branch;
    els.monthStem.value = result.bazi.month.stem;
    els.monthBranch.value = result.bazi.month.branch;
    els.dayStem.value = result.bazi.day.stem;
    els.dayBranch.value = result.bazi.day.branch;
    els.hourStem.value = result.bazi.hour.stem;
    els.hourBranch.value = result.bazi.hour.branch;

    els.preLiChun.checked = Boolean(result.dayun.preLiChunZeroAgeAdjustment.isPreLiChun);
  }

  function getCalculationOptions() {
    const manualStartVal = els.manualStartAge.value;
    const manualStructVal = els.manualStructureSelect ? els.manualStructureSelect.value : 'auto';
    return {
      sect: 2,
      manualStartAge: manualStartVal === 'auto' ? undefined : Number(manualStartVal),
      manualStructure: manualStructVal === 'auto' ? undefined : manualStructVal,
      referenceYear: Number(els.solarYear.value) || 2004,
    };
  }

  function calculateAndRender(source) {
    lastTriggerSource = source || lastTriggerSource;
    const gender = getSelectedGender();
    const opts = getCalculationOptions();

    try {
      let result;
      if (lastTriggerSource === 'solar') {
        const y = Number(els.solarYear.value);
        const m = Number(els.solarMonth.value);
        updateSolarDaysDropdown(y, m);
        const d = Number(els.solarDay.value);
        const h = Number(els.solarHour.value);
        const min = Number(els.solarMinute.value);
        result = Engine.calculateFromSolar(y, m, d, h, min, gender, opts);
      } else if (lastTriggerSource === 'lunar') {
        const ly = Number(els.lunarYear.value);
        const lm = Number(els.lunarMonth.value);
        const ld = Number(els.lunarDay.value);
        const lh = Number(els.lunarHour.value);
        const isLeap = els.lunarLeap.checked;
        result = Engine.calculateFromLunar(ly, lm, ld, lh, isLeap, gender, opts);
      } else {
        const yGZ = `${els.yearStem.value}${els.yearBranch.value}`;
        const mGZ = `${els.monthStem.value}${els.monthBranch.value}`;
        const dGZ = `${els.dayStem.value}${els.dayBranch.value}`;
        const hGZ = `${els.hourStem.value}${els.hourBranch.value}`;
        const isPre = els.preLiChun.checked;
        result = Engine.calculateFromPillars(yGZ, mGZ, dGZ, hGZ, isPre, gender, opts);
      }

      currentChartResult = result;
      syncControlsFromResult(result);

      renderBaZiPane(result);
      renderZiWeiPane(result);
      persistStateToUrlAndStorage();
      if (hasUserInteracted) {
        scheduleVisitorEntryLog();
      }
    } catch (err) {
      console.error('Calculation error:', err);
    }
  }

  function renderBaZiPane(result) {
    const ownerName = els.inputName.value.trim() || '命主';
    const genderLabel = result.meta.gender === '男' ? '乾造（男）' : '坤造（女）';
    const dm = result.bazi.dayMaster;
    const dmElClass = ELEMENT_CLASS[dm.wuXing] || '';
    const st = result.bazi.strength;

    // 1. Meta Banner
    const solarStr = result.meta.solar
      ? `${result.meta.solar.formatted} (${result.meta.solar.shichenName})`
      : '手動四柱排盤';
    const lunarStr = result.meta.lunar ? result.meta.lunar.formatted : '—';
    const jieStr = result.meta.solarTerms
      ? `上一節：${result.meta.solarTerms.prevJie.name} (${result.meta.solarTerms.prevJie.dateTime}) ｜ 下一節：${result.meta.solarTerms.nextJie.name} (${result.meta.solarTerms.nextJie.dateTime})`
      : '手動指定四柱模式';

    els.baziMetaBanner.innerHTML = `
      <span class="bazi-meta-item"><strong>命主：</strong>${ownerName} · ${genderLabel}</span>
      <span class="bazi-meta-item"><strong>日元（日主）：</strong><span class="el-chip ${dmElClass}">${dm.stem}${dm.wuXing}（${dm.yinYang}）</span></span>
      <span class="bazi-meta-item"><strong>旺弱格局：</strong><span class="strength-inline-tag ${st.structure.includes('旺') ? 'is-strong' : 'is-weak'}">${st.detailedLabel}</span></span>
      <span class="bazi-meta-item"><strong>陽曆：</strong>${solarStr}</span>
      <span class="bazi-meta-item"><strong>農曆：</strong>${lunarStr}</span>
      <span class="bazi-meta-item"><strong>節氣交節：</strong>${jieStr}</span>
    `;

    // 2. Four Pillars Table (Columns ordered Right-to-Left: 時柱 | 日柱(日元) | 月柱 | 年柱)
    const cols = [
      { key: 'hour', p: result.bazi.hour, isDay: false },
      { key: 'day', p: result.bazi.day, isDay: true },
      { key: 'month', p: result.bazi.month, isDay: false },
      { key: 'year', p: result.bazi.year, isDay: false },
    ];

    const rowTenGod = cols
      .map((c) => {
        const cls = c.isDay ? 'day-master-cell' : '';
        const content = c.isDay
          ? `<span class="day-master-badge">日元（${result.meta.gender === '男' ? '元男' : '元女'}）</span>`
          : `<span class="tengod-label">${c.p.tenGod}</span>`;
        return `<td class="${cls}">${content}</td>`;
      })
      .join('');

    const rowStem = cols
      .map((c) => {
        const cls = c.isDay ? 'day-master-cell' : '';
        return `<td class="${cls}">${getElementCharBadge(c.p.stem, 'stem-char')}</td>`;
      })
      .join('');

    const rowBranch = cols
      .map((c) => {
        const cls = c.isDay ? 'day-master-cell' : '';
        return `<td class="${cls}">${getElementCharBadge(c.p.branch, 'branch-char')}</td>`;
      })
      .join('');

    const rowHidden = cols
      .map((c) => {
        const cls = c.isDay ? 'day-master-cell' : '';
        const items = c.p.hiddenStems
          .map((hs) => {
            const el = ELEMENT_BY_CHAR[hs.stem] || '';
            const elCls = ELEMENT_CLASS[el] || '';
            return `<span class="hs-item"><strong class="${elCls}" style="padding:0 3px;border-radius:2px;">${hs.stem}${el}</strong><span class="hs-god">(${hs.tenGod})</span></span>`;
          })
          .join('');
        return `<td class="${cls}"><div class="hidden-stems-list">${items}</div></td>`;
      })
      .join('');

    const rowNaYin = cols
      .map((c) => `<td class="${c.isDay ? 'day-master-cell' : ''}"><span class="nayin-text">${c.p.naYin}</span></td>`)
      .join('');

    const rowDiShi = cols
      .map((c) => `<td class="${c.isDay ? 'day-master-cell' : ''}"><strong>${c.p.diShi}</strong></td>`)
      .join('');

    const rowXunKong = cols
      .map((c) => `<td class="${c.isDay ? 'day-master-cell' : ''}">${c.p.xun}旬（空亡：<strong>${c.p.xunKong}</strong>）</td>`)
      .join('');

    els.fourPillarsBody.innerHTML = `
      <tr><td class="row-label-col">十神</td>${rowTenGod}</tr>
      <tr><td class="row-label-col">天干</td>${rowStem}</tr>
      <tr><td class="row-label-col">地支</td>${rowBranch}</tr>
      <tr><td class="row-label-col">藏干與十神</td>${rowHidden}</tr>
      <tr><td class="row-label-col">納音五行</td>${rowNaYin}</tr>
      <tr><td class="row-label-col">十二長生</td>${rowDiShi}</tr>
      <tr><td class="row-label-col">旬空</td>${rowXunKong}</tr>
    `;

    // 3. Extra Pillars Bar (胎元 / 命宮 / 身宮)
    els.extraPillarsBar.innerHTML = `
      <span><strong>四柱八字：</strong>${result.bazi.fourPillarsString}</span>
      <span><strong>胎元：</strong>${result.bazi.taiYuan.ganZhi}（${result.bazi.taiYuan.naYin || '—'}）</span>
      <span><strong>命宮：</strong>${result.bazi.mingGong.ganZhi || '—'}（${result.bazi.mingGong.naYin || '—'}）</span>
      <span><strong>身宮：</strong>${result.bazi.shenGong.ganZhi || '—'}（${result.bazi.shenGong.naYin || '—'}）</span>
    `;

    // 4. Day Master Strength & Structure Analysis Panel (日主旺弱與格局喜忌)
    renderStrengthPanel(result);

    // 5. Major Luck (大運) Header & Pre-LiChun 0歲 Banner
    const ex = result.dayun.exactStart;
    const elapsedText =
      ex.elapsedDays !== null
        ? `距離交節【${ex.targetJieName} ${ex.targetJieDateTime}】共 <strong>${ex.elapsedDays}日 ${ex.elapsedHours}小時 ${ex.elapsedMinutes}分</strong>`
        : '手動四柱起運模式';
    const exactStartText = ex.startSolarDateTime
      ? `出生後 <strong>${ex.years}年 ${ex.months}個月 ${ex.days}日 ${ex.hours}小時</strong> 上運（精確交運公曆：<strong>${ex.startSolarDateTime}</strong>）`
      : `起運歲數：<strong>${ex.startAge}歲</strong>`;

    els.dayunHeader.innerHTML = `
      <div>
        <strong>八柱大運與流年全排（${result.dayun.direction} · 由右至左排列）：</strong>${exactStartText}
      </div>
      <div>
        <strong>扣實日時依據：</strong>${elapsedText}
      </div>
    `;

    const zeroAdj = result.dayun.preLiChunZeroAgeAdjustment;
    if (zeroAdj.applies && zeroAdj.zeroAgePillar) {
      els.zeroAgeBanner.classList.remove('hidden');
      els.zeroAgeBanner.innerHTML = `
        <strong>【立春前出生「0歲」年歲差修正已啟用】</strong>
        ${zeroAdj.zeroAgePillar.description}；第一柱「1歲」流年為 <strong>${zeroAdj.firstAgePillar.gregorianYear || ''}年 ${zeroAdj.firstAgePillar.ganZhi}</strong>。
      `;
    } else {
      els.zeroAgeBanner.classList.add('hidden');
    }

    // 6. Full 8-Pillar DaYun + 10-Row LiuNian Matrix (All laid out at once without clicking)
    renderFullDaYunTable(result);
  }

  function renderStrengthPanel(result) {
    const st = result.bazi.strength;
    if (!st) return;

    const isStrongType = st.structure === '身旺' || st.structure === '專旺' || st.structure === '假專旺';
    els.strengthBadgeWrap.innerHTML = `
      <span class="strength-main-badge ${isStrongType ? 'badge-strong' : 'badge-weak'}">
        ${st.detailedLabel}
      </span>
      <span class="strength-sub-badge">${st.monthCommandStatus}</span>
      <span class="strength-sub-badge">${st.isDeDi ? '得地（通根有力）' : '失地（通根較弱）'}</span>
      <span class="strength-sub-badge">同黨 ${st.selfPartyPercent}% : 異黨 ${st.otherPartyPercent}%</span>
      ${st.isManualOverride ? `<span class="strength-override-note">（手動指定，原自動推算為：${st.autoStructure}）</span>` : ''}
    `;

    const favElChips = st.favorableElements
      .map((el) => `<span class="el-chip ${ELEMENT_CLASS[el] || ''}">${el}</span>`)
      .join(' ');
    const unfavElChips = st.unfavorableElements
      .map((el) => `<span class="el-chip ${ELEMENT_CLASS[el] || ''}">${el}</span>`)
      .join(' ');

    const wuxingBarItems = ['木', '火', '土', '金', '水']
      .map((el) => {
        const info = st.elementScores[el];
        const elCls = ELEMENT_CLASS[el] || '';
        const isFav = st.favorableElements.includes(el);
        return `
          <div class="wx-score-card ${isFav ? 'wx-is-fav' : 'wx-is-unfav'}">
            <div class="wx-score-top">
              <span class="el-chip ${elCls}">${el}</span>
              <span class="wx-rel">${info.relation}</span>
              <span class="wx-fav-tag ${isFav ? 'fav-red' : 'unfav-blue'}">${isFav ? '喜' : '忌'}</span>
            </div>
            <div class="wx-bar-track">
              <div class="wx-bar-fill ${elCls}-fill" style="width: ${Math.min(100, info.percent)}%;"></div>
            </div>
            <div class="wx-pct">${info.percent}%（${info.score}分）</div>
          </div>
        `;
      })
      .join('');

    els.baziStrengthBody.innerHTML = `
      <div class="strength-favorable-row">
        <div class="fav-box fav-good">
          <span class="fav-tag-red">喜用神（紅）</span>
          <span>五行：${favElChips}</span>
          <span class="fav-gods-text">十神：${st.favorableTenGods.join('、')}</span>
        </div>
        <div class="fav-box fav-bad">
          <span class="fav-tag-blue">忌神（藍）</span>
          <span>五行：${unfavElChips}</span>
          <span class="fav-gods-text">十神：${st.unfavorableTenGods.join('、')}</span>
        </div>
      </div>
      <div class="wx-scores-grid">${wuxingBarItems}</div>
      <div class="strength-explanation">${st.explanation}</div>
    `;
  }

  function renderFullDaYunTable(result) {
    const currentCalendarYear = new Date().getFullYear();
    // Take the first 8 DaYun pillars (第1運..第8運) and order Right-to-Left (第8運 on left -> 第1運 on right)
    // matching traditional Chinese BaZi layout
    const eightPillars = result.dayun.pillars.slice(0, 8);
    const rtlPillars = [...eightPillars].reverse();
    const preList = result.dayun.preDaYunLiuNian || [];
    const hasPreColumn = preList.length > 0;

    // Header Row 1: Column Title (第8運 ... 第1運 | 童限)
    const colHeaderCells = rtlPillars
      .map((p) => {
        const isCurrent =
          p.startYear && p.endYear && currentCalendarYear >= p.startYear && currentCalendarYear <= p.endYear;
        const favCls =
          p.favorability === '喜' ? 'fav-pill-red' : p.favorability === '忌' ? 'fav-pill-blue' : 'fav-pill-green';
        return `
          <th class="dy-col-th ${isCurrent ? 'dy-col-current' : ''}">
            <div class="dy-th-top">
              <span>第${p.index}運</span>
              <span class="dy-fav-badge ${favCls}">${p.favorability || '平'}</span>
            </div>
            ${isCurrent ? '<div class="dy-current-tag">當前大運</div>' : ''}
          </th>
        `;
      })
      .join('');

    const preHeaderTh = hasPreColumn
      ? `<th class="dy-col-th dy-pre-th"><div class="dy-th-top"><span>起運前</span></div><div class="dy-sub-note">童限流年</div></th>`
      : '';

    // Row 2: Starting Age & Gregorian Year Range
    const ageYearCells = rtlPillars
      .map((p) => {
        const isCurrent =
          p.startYear && p.endYear && currentCalendarYear >= p.startYear && currentCalendarYear <= p.endYear;
        const yrText = p.startYear && p.endYear ? `${p.startYear}–${p.endYear}` : '—';
        return `
          <td class="dy-age-cell ${isCurrent ? 'dy-col-current' : ''}">
            <div class="dy-age-num">${p.startAge}–${p.endAge}歲</div>
            <div class="dy-yr-range">${yrText}</div>
          </td>
        `;
      })
      .join('');

    const preAgeRange = hasPreColumn
      ? `${preList[0].age}–${preList[preList.length - 1].age}歲`
      : '';
    const preYearRange =
      hasPreColumn && preList[0].year
        ? `${preList[0].year}–${preList[preList.length - 1].year}`
        : '';
    const preAgeTd = hasPreColumn
      ? `<td class="dy-age-cell dy-pre-cell"><div class="dy-age-num">${preAgeRange}</div><div class="dy-yr-range">${preYearRange}</div></td>`
      : '';

    // Row 3: DaYun GanZhi, Stem/Branch Ten Gods, NaYin
    const dyGanZhiCells = rtlPillars
      .map((p) => {
        const isCurrent =
          p.startYear && p.endYear && currentCalendarYear >= p.startYear && currentCalendarYear <= p.endYear;
        const sEl = ELEMENT_CLASS[ELEMENT_BY_CHAR[p.stem]] || '';
        const bEl = ELEMENT_CLASS[ELEMENT_BY_CHAR[p.branch]] || '';
        const sGodShort = TENGOD_SHORT[p.tenGod] || p.tenGod;
        const bGodShort = TENGOD_SHORT[p.branchTenGod] || p.branchTenGod;
        return `
          <td class="dy-gz-cell ${isCurrent ? 'dy-col-current' : ''}">
            <div class="dy-main-gz">
              <span class="dy-char ${sEl}">${p.stem}</span>
              <span class="dy-char ${bEl}">${p.branch}</span>
            </div>
            <div class="dy-god-pair">${p.tenGod} / ${p.branchTenGod}（${sGodShort}${bGodShort}）</div>
            <div class="dy-nayin-sub">${p.naYin}</div>
          </td>
        `;
      })
      .join('');

    const preGanZhiTd = hasPreColumn
      ? `<td class="dy-gz-cell dy-pre-cell"><div class="dy-pre-title">未上大運</div><div class="dy-nayin-sub">以月柱/流年論命</div></td>`
      : '';

    // Rows 4..13: All 10 years of LiuNian (流年) expanded simultaneously across all 8 DaYun columns!
    const liuNianRowsHtml = [];
    for (let rowIdx = 0; rowIdx < 10; rowIdx++) {
      const rowCells = rtlPillars
        .map((p) => {
          const ln = p.liuNian[rowIdx];
          if (!ln) return '<td>—</td>';
          const isThisYear = ln.year === currentCalendarYear;
          const isCurrentDaYun =
            p.startYear && p.endYear && currentCalendarYear >= p.startYear && currentCalendarYear <= p.endYear;
          const sEl = ELEMENT_CLASS[ELEMENT_BY_CHAR[ln.stem]] || '';
          const bEl = ELEMENT_CLASS[ELEMENT_BY_CHAR[ln.branch]] || '';
          const sGod = TENGOD_SHORT[ln.tenGod] || ln.tenGod;
          const bGod = TENGOD_SHORT[ln.branchTenGod] || ln.branchTenGod;
          const favDotCls =
            ln.favorability === '喜'
              ? 'ln-fav-red'
              : ln.favorability === '忌'
                ? 'ln-fav-blue'
                : 'ln-fav-green';

          return `
            <td class="ln-matrix-cell ${isCurrentDaYun ? 'dy-col-current-ln' : ''} ${isThisYear ? 'ln-is-current-year' : ''}" title="${ln.year || ''}年 (${ln.age}歲) ${ln.ganZhi} · 天干:${ln.tenGod} / 地支:${ln.branchTenGod} · 納音:${ln.naYin} · 喜忌:${ln.favorability}">
              <div class="ln-cell-top">
                <span class="ln-cell-age">${ln.age}歲</span>
                <span class="ln-cell-yr">${ln.year || ''}</span>
              </div>
              <div class="ln-cell-main">
                <span class="ln-cell-gz">
                  <span class="${sEl}">${ln.stem}</span><span class="${bEl}">${ln.branch}</span>
                </span>
                <span class="ln-cell-gods">${sGod}${bGod}</span>
                <span class="ln-fav-dot ${favDotCls}">${ln.favorability || '平'}</span>
              </div>
            </td>
          `;
        })
        .join('');

      let preCellHtml = '';
      if (hasPreColumn) {
        const preLn = preList[rowIdx];
        if (preLn) {
          const isThisYear = preLn.year === currentCalendarYear;
          const isZeroAge = preLn.age === 0;
          const sEl = ELEMENT_CLASS[ELEMENT_BY_CHAR[preLn.stem]] || '';
          const bEl = ELEMENT_CLASS[ELEMENT_BY_CHAR[preLn.branch]] || '';
          const sGod = TENGOD_SHORT[preLn.tenGod] || preLn.tenGod;
          const bGod = TENGOD_SHORT[preLn.branchTenGod] || preLn.branchTenGod;
          preCellHtml = `
            <td class="ln-matrix-cell dy-pre-cell ${isZeroAge ? 'ln-zero-age-cell' : ''} ${isThisYear ? 'ln-is-current-year' : ''}" title="${preLn.year || ''}年 (${preLn.age}歲) ${preLn.ganZhi}">
              <div class="ln-cell-top">
                <span class="ln-cell-age">${preLn.age}歲${isZeroAge ? '(立春前)' : ''}</span>
                <span class="ln-cell-yr">${preLn.year || ''}</span>
              </div>
              <div class="ln-cell-main">
                <span class="ln-cell-gz">
                  <span class="${sEl}">${preLn.stem}</span><span class="${bEl}">${preLn.branch}</span>
                </span>
                <span class="ln-cell-gods">${sGod}${bGod}</span>
              </div>
            </td>
          `;
        } else {
          preCellHtml = `<td class="ln-matrix-cell dy-pre-cell ln-empty-cell"></td>`;
        }
      }

      liuNianRowsHtml.push(`
        <tr>
          <td class="dy-row-label">流年${rowIdx + 1}</td>
          ${rowCells}
          ${preCellHtml}
        </tr>
      `);
    }

    els.dayunFullTableWrap.innerHTML = `
      <table class="dayun-full-table" aria-label="八柱大運與八十流年全排總表">
        <thead>
          <tr>
            <th class="dy-row-label">運柱</th>
            ${colHeaderCells}
            ${preHeaderTh}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="dy-row-label">歲數 / 年份</td>
            ${ageYearCells}
            ${preAgeTd}
          </tr>
          <tr>
            <td class="dy-row-label">大運干支</td>
            ${dyGanZhiCells}
            ${preGanZhiTd}
          </tr>
          ${liuNianRowsHtml.join('')}
        </tbody>
      </table>
    `;
  }

  function renderZiWeiPane(result) {
    const zw = result.ziwei;
    if (!zw || !zw.available || !zw.palaces || zw.palaces.length === 0) {
      els.ziweiGrid.innerHTML = `
        <div class="zw-center-court" style="grid-column: 1 / -1; grid-row: 1 / -1;">
          <h3>紫微斗數命盤提示</h3>
          <p>${zw?.reason || '請選擇有效之陽曆或農曆日期以排紫微斗數十二宮命盤。'}</p>
        </div>
      `;
      return;
    }

    // Default selected palace to 命宮 if none selected
    if (selectedPalaceIndex === null) {
      const mingPalace = zw.palaces.find((p) => p.name === '命宮');
      selectedPalaceIndex = mingPalace ? mingPalace.index : 0;
    }

    // Compute Three Harmonies and Four的正 (三方四正: self, opposite +6, trines +4 and +8)
    const trineIndices = new Set([
      (selectedPalaceIndex + 4) % 12,
      (selectedPalaceIndex + 6) % 12,
      (selectedPalaceIndex + 8) % 12,
    ]);

    const palaceCellsHtml = zw.palaces
      .map((pal) => {
        const pos = BRANCH_GRID_POS[pal.earthlyBranch] || { row: 1, col: 1 };
        const isMing = pal.name === '命宮';
        const isSelected = pal.index === selectedPalaceIndex;
        const isTrine = trineIndices.has(pal.index);

        const majorHtml =
          pal.majorStars.length > 0
            ? pal.majorStars
                .map((s) => {
                  const mutBadge = s.mutagen
                    ? `<span class="mut-badge ${MUTAGEN_CLASS[s.mutagen] || ''}">${s.mutagen}</span>`
                    : '';
                  return `<span class="zw-major-star">${s.name}${s.brightness ? `<span class="star-bright">(${s.brightness})</span>` : ''}${mutBadge}</span>`;
                })
                .join('')
            : '<span class="star-bright">（命無正曜）</span>';

        const minorHtml = pal.minorStars
          .map((s) => {
            const isMalefic = MALEFIC_STARS.has(s.name);
            const mutBadge = s.mutagen
              ? `<span class="mut-badge ${MUTAGEN_CLASS[s.mutagen] || ''}">${s.mutagen}</span>`
              : '';
            return `<span class="zw-minor-star ${isMalefic ? 'malefic-star' : ''}">${s.name}${s.brightness ? `<span class="star-bright">(${s.brightness})</span>` : ''}${mutBadge}</span>`;
          })
          .join('');

        const adjHtml = pal.adjectiveStars.map((s) => `<span>${s.name}</span>`).join('');

        return `
          <div
            class="zw-palace ${isMing ? 'is-ming' : ''} ${isSelected ? 'selected-palace' : ''} ${isTrine ? 'trine-palace' : ''}"
            style="grid-row: ${pos.row}; grid-column: ${pos.col};"
            data-palace-index="${pal.index}"
          >
            <div class="zw-palace-header">
              <div>
                <span class="zw-palace-title">${pal.name}</span>
                <span class="zw-badges">
                  ${pal.isBodyPalace ? '<span class="zw-tag tag-body">身宮</span>' : ''}
                  ${pal.isOriginalPalace ? '<span class="zw-tag tag-origin">來因</span>' : ''}
                </span>
              </div>
              <span class="zw-gz">${pal.ganZhi}</span>
            </div>

            <div class="zw-stars-body">
              <div class="zw-major-stars">${majorHtml}</div>
              <div class="zw-minor-stars">${minorHtml}</div>
              <div class="zw-adj-stars">${adjHtml}</div>
            </div>

            <div class="zw-palace-footer">
              <div class="zw-decadal-row">
                <span>大限：${pal.decadal.startAge}–${pal.decadal.endAge}歲</span>
                <span>${pal.changsheng12} · ${pal.boshi12}</span>
              </div>
              <div class="zw-ages-row" title="小限歲數：${pal.ages.join(', ')}">
                小限：${pal.ages.slice(0, 7).join(' · ')}
              </div>
            </div>
          </div>
        `;
      })
      .join('');

    const ownerName = els.inputName.value.trim() || '示範命主';
    const selectedPal = zw.palaces.find((p) => p.index === selectedPalaceIndex) || zw.palaces[0];
    const tf = zw.fourTransformations || {};

    const centerCourtHtml = `
      <div class="zw-center-court">
        <div>
          <div class="zw-center-header">
            <span class="zw-owner-title">${ownerName}（${result.meta.gender === '男' ? '乾造 · 陽男/陰男' : '坤造 · 陽女/陰女'}）</span>
            <span class="zw-bureau-badge">${zw.fiveElementsClass}</span>
          </div>

          <div class="zw-center-grid">
            <div class="zw-center-item"><strong>陽曆：</strong>${zw.solarDate} (${zw.time})</div>
            <div class="zw-center-item"><strong>農曆：</strong>${zw.lunarDate}</div>
            <div class="zw-center-item"><strong>四柱：</strong>${result.bazi.fourPillarsString}</div>
            <div class="zw-center-item"><strong>生肖 / 星座：</strong>${zw.zodiac} / ${zw.sign}</div>
            <div class="zw-center-item"><strong>命宮 / 身宮：</strong>${zw.earthlyBranchOfSoulPalace}宮 / ${zw.earthlyBranchOfBodyPalace}宮</div>
            <div class="zw-center-item"><strong>命主 / 身主：</strong>${zw.soulStar} / ${zw.bodyStar}</div>
          </div>
        </div>

        <div class="zw-sihua-box">
          <div class="zw-sihua-title">生年四化星曜（年干 ${result.bazi.year.stem} 四化）：</div>
          <div class="zw-sihua-row">
            <span><span class="mut-badge mut-lu">化祿</span> ${tf['化祿'] || '—'}</span>
            <span><span class="mut-badge mut-quan">化權</span> ${tf['化權'] || '—'}</span>
            <span><span class="mut-badge mut-ke">化科</span> ${tf['化科'] || '—'}</span>
            <span><span class="mut-badge mut-ji">化忌</span> ${tf['化忌'] || '—'}</span>
          </div>
        </div>

        <div class="zw-selected-palace-info">
          <strong>焦點宮位【${selectedPal.name} · ${selectedPal.ganZhi}】</strong>
          （大限 ${selectedPal.decadal.startAge}–${selectedPal.decadal.endAge}歲，綠框標示三方四正宮位）<br/>
          主星：${selectedPal.majorStars.map((s) => `${s.name}${s.brightness ? `(${s.brightness})` : ''}${s.transformationLabel ? `[${s.transformationLabel}]` : ''}`).join('、') || '無主星（借對宮安星）'}
          ｜ 輔佐煞曜：${selectedPal.minorStars.map((s) => s.name).join('、') || '無'}
        </div>
      </div>
    `;

    els.ziweiGrid.innerHTML = palaceCellsHtml + centerCourtHtml;

    els.ziweiGrid.querySelectorAll('.zw-palace').forEach((cell) => {
      cell.addEventListener('click', () => {
        selectedPalaceIndex = Number(cell.getAttribute('data-palace-index'));
        renderZiWeiPane(currentChartResult);
        if (hasUserInteracted && hasPendingUnloggedChange) {
          flushVisitorEntryLog(false);
        }
      });
    });
  }

  function updateDstQuery() {
    const y = Number(els.dstYear.value);
    const region = els.dstRegion.value;
    let text = '該年份無實施夏令時間';
    if (region === '香港' || region === '澳門') {
      if (HK_DST_TABLE[y]) {
        text = `${y}年 ${region}夏令時間：${HK_DST_TABLE[y]}（撥快1小時）`;
      }
    } else if (region === '台灣') {
      if ((y >= 1945 && y <= 1961) || (y >= 1974 && y <= 1975) || y === 1979) {
        text = `${y}年 台灣實施日光節約時間（夏令時間，撥快1小時）`;
      }
    } else if (region === '中國大陸') {
      if (y >= 1986 && y <= 1991) {
        text = `${y}年 中國大陸實施夏令時間（4月中旬至9月中旬，撥快1小時）`;
      }
    }
    els.dstResult.value = text;
  }

  const STORAGE_KEY = 'openbazi_saved_state_v2';

  const DEFAULT_EASTER_EGG_STATE = {
    mode: 'solar',
    name: '無名氏',
    gender: '男',
    y: 1955,
    m: 2,
    d: 24,
    h: 19,
    min: 15,
    startAge: 'auto',
    struct: 'auto',
  };

  function getCurrentStateObject() {
    return {
      mode: lastTriggerSource || 'solar',
      name: els.inputName.value.trim(),
      gender: getSelectedGender(),
      y: Number(els.solarYear.value) || 1955,
      m: Number(els.solarMonth.value) || 2,
      d: Number(els.solarDay.value) || 24,
      h: Number(els.solarHour.value) || 0,
      min: Number(els.solarMinute.value) || 0,
      ly: Number(els.lunarYear.value) || 1955,
      lm: Number(els.lunarMonth.value) || 2,
      ld: Number(els.lunarDay.value) || 3,
      lh: Number(els.lunarHour.value) || 0,
      leap: els.lunarLeap.checked ? 1 : 0,
      gz: `${els.yearStem.value}${els.yearBranch.value}-${els.monthStem.value}${els.monthBranch.value}-${els.dayStem.value}${els.dayBranch.value}-${els.hourStem.value}${els.hourBranch.value}`,
      pre: els.preLiChun.checked ? 1 : 0,
      startAge: els.manualStartAge.value || 'auto',
      struct: els.manualStructureSelect ? els.manualStructureSelect.value : 'auto',
    };
  }

  function persistStateToUrlAndStorage() {
    const state = getCurrentStateObject();

    // 1. Save full state to localStorage
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      // Ignore storage quota or private browsing errors
    }

    // 2. Sync core settings to URL query parameters
    try {
      const params = new URLSearchParams();
      params.set('mode', state.mode);
      if (state.name) params.set('name', state.name);
      params.set('gender', state.gender);

      if (state.mode === 'solar') {
        params.set('y', String(state.y));
        params.set('m', String(state.m));
        params.set('d', String(state.d));
        params.set('h', String(state.h));
        params.set('min', String(state.min));
      } else if (state.mode === 'lunar') {
        params.set('ly', String(state.ly));
        params.set('lm', String(state.lm));
        params.set('ld', String(state.ld));
        params.set('lh', String(state.lh));
        if (state.leap) params.set('leap', '1');
        params.set('y', String(state.y));
      } else if (state.mode === 'pillars') {
        params.set('gz', state.gz);
        if (state.pre) params.set('pre', '1');
        params.set('y', String(state.y));
      }

      if (state.startAge && state.startAge !== 'auto') {
        params.set('startAge', String(state.startAge));
      }
      if (state.struct && state.struct !== 'auto') {
        params.set('struct', String(state.struct));
      }

      const newUrl = `${window.location.pathname}?${params.toString()}${window.location.hash || ''}`;
      window.history.replaceState(null, '', newUrl);
    } catch (e) {
      // Ignore history API errors in restricted environments
    }
  }

  function parseStateFromUrl() {
    try {
      const params = new URLSearchParams(window.location.search);
      if (!params.has('y') && !params.has('ly') && !params.has('gz') && !params.has('mode')) {
        return null;
      }
      const mode = params.get('mode') || (params.has('gz') ? 'pillars' : params.has('ly') ? 'lunar' : 'solar');
      return {
        mode,
        name: params.has('name') ? params.get('name') : DEFAULT_EASTER_EGG_STATE.name,
        gender: params.get('gender') === '女' ? '女' : '男',
        y: Number(params.get('y')) || 1955,
        m: Number(params.get('m')) || 2,
        d: Number(params.get('d')) || 24,
        h: params.has('h') ? Number(params.get('h')) : 19,
        min: params.has('min') ? Number(params.get('min')) : 15,
        ly: Number(params.get('ly')) || 1955,
        lm: Number(params.get('lm')) || 2,
        ld: Number(params.get('ld')) || 3,
        lh: params.has('lh') ? Number(params.get('lh')) : 19,
        leap: params.get('leap') === '1' ? 1 : 0,
        gz: params.get('gz') || '',
        pre: params.get('pre') === '1' ? 1 : 0,
        startAge: params.get('startAge') || 'auto',
        struct: params.get('struct') || 'auto',
      };
    } catch (e) {
      return null;
    }
  }

  function parseStateFromStorage() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return null;
      return parsed;
    } catch (e) {
      return null;
    }
  }

  function mapHourToValidSelectOption(hourValue) {
    const num = Number(hourValue);
    const exact = SHICHEN_OPTIONS.find((o) => o.hour === num);
    if (exact) return String(exact.hour);
    // Map any 0..23 clock hour to its corresponding shichen option
    if (num === 23) return '23';
    if (num === 0) return '0';
    const shichenIndex = Math.floor((num + 1) / 2);
    const matched = SHICHEN_OPTIONS.find((o) => o.index === shichenIndex) || SHICHEN_OPTIONS[0];
    return String(matched.hour);
  }

  function applyStateAndRender(state) {
    const s = { ...DEFAULT_EASTER_EGG_STATE, ...state };

    els.inputName.value = s.name !== undefined ? s.name : DEFAULT_EASTER_EGG_STATE.name;
    if (s.gender === '女') {
      els.genderFemale.checked = true;
    } else {
      els.genderMale.checked = true;
    }

    els.manualStartAge.value = s.startAge || 'auto';
    if (els.manualStructureSelect) {
      els.manualStructureSelect.value = s.struct || 'auto';
    }

    const safeYear = Math.min(2043, Math.max(1901, Number(s.y) || 1955));
    const safeMonth = Math.min(12, Math.max(1, Number(s.m) || 2));
    const safeDay = Math.min(31, Math.max(1, Number(s.d) || 24));
    const safeMin = Math.min(59, Math.max(0, Number(s.min) || 0));

    els.solarYear.value = String(safeYear);
    els.solarMonth.value = String(safeMonth);
    updateSolarDaysDropdown(safeYear, safeMonth, safeDay);
    els.solarHour.value = mapHourToValidSelectOption(s.h);
    els.solarMinute.value = String(safeMin);

    if (s.ly) {
      const safeLunarYear = Math.min(2043, Math.max(1901, Number(s.ly) || 1955));
      els.lunarYear.value = String(safeLunarYear);
    }
    if (s.lm) {
      els.lunarMonth.value = String(Math.min(12, Math.max(1, Number(s.lm) || 1)));
    }
    if (s.ld) {
      els.lunarDay.value = String(Math.min(30, Math.max(1, Number(s.ld) || 1)));
    }
    if (s.lh !== undefined) {
      els.lunarHour.value = mapHourToValidSelectOption(s.lh);
    }
    els.lunarLeap.checked = Boolean(s.leap);

    if (s.gz && typeof s.gz === 'string') {
      const parts = s.gz.split('-');
      if (parts.length === 4 && parts.every((p) => p.length === 2)) {
        els.yearStem.value = parts[0][0];
        els.yearBranch.value = parts[0][1];
        els.monthStem.value = parts[1][0];
        els.monthBranch.value = parts[1][1];
        els.dayStem.value = parts[2][0];
        els.dayBranch.value = parts[2][1];
        els.hourStem.value = parts[3][0];
        els.hourBranch.value = parts[3][1];
      }
    }
    els.preLiChun.checked = Boolean(s.pre);

    const targetMode = ['solar', 'lunar', 'pillars'].includes(s.mode) ? s.mode : 'solar';
    calculateAndRender(targetMode);
  }

  function initStartupChart() {
    // Priority 1: URL query parameters (for shared links)
    const urlState = parseStateFromUrl();
    if (urlState) {
      applyStateAndRender(urlState);
      return;
    }

    // Priority 2: Previously selected state in localStorage
    const savedState = parseStateFromStorage();
    if (savedState) {
      applyStateAndRender(savedState);
      return;
    }

    // Priority 3: Default Mystery Chart (1955-02-24 19:15 男)
    applyStateAndRender(DEFAULT_EASTER_EGG_STATE);
  }

  function buildPdfFileName() {
    if (currentChartResult && currentChartResult.meta && currentChartResult.meta.solar) {
      const s = currentChartResult.meta.solar;
      const yyyy = String(s.year).padStart(4, '0');
      const mm = String(s.month).padStart(2, '0');
      const dd = String(s.day).padStart(2, '0');
      const shichenOpt =
        SHICHEN_OPTIONS.find((o) => o.index === s.shichenIndex) || SHICHEN_OPTIONS[0];
      return `${yyyy}-${mm}-${dd}_${shichenOpt.pinyin}.pdf`;
    }

    const yyyy = String(Number(els.solarYear.value) || 1955).padStart(4, '0');
    const mm = String(Number(els.solarMonth.value) || 2).padStart(2, '0');
    const dd = String(Number(els.solarDay.value) || 24).padStart(2, '0');
    const branchPinyin = BRANCH_PINYIN[els.hourBranch.value] || 'XuShi';
    return `${yyyy}-${mm}-${dd}_${branchPinyin}.pdf`;
  }

  async function exportPageToPdf(btnEl) {
    const fileName = buildPdfFileName();
    const origText = btnEl ? btnEl.textContent : '📄 下載 PDF';
    if (btnEl) {
      btnEl.disabled = true;
      btnEl.textContent = '⏳ 正在產生 PDF...';
    }

    // Temporarily ensure both panes are visible (in case mobile single-pane tab is active)
    const baziWasHidden = els.baziPane.classList.contains('hidden');
    const ziweiWasHidden = els.ziweiPane.classList.contains('hidden');
    els.baziPane.classList.remove('hidden');
    els.ziweiPane.classList.remove('hidden');

    try {
      const targetEl = document.querySelector('.dual-chart-workspace') || document.body;
      if (Engine.html2canvas && Engine.jsPDF) {
        const canvas = await Engine.html2canvas(targetEl, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#dfdcca',
          logging: false,
          windowWidth: Math.max(document.documentElement.scrollWidth, 1440),
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        const orientation = canvas.width >= canvas.height ? 'landscape' : 'portrait';
        const pdf = new Engine.jsPDF({
          orientation,
          unit: 'px',
          format: [canvas.width, canvas.height],
          compress: true,
        });

        pdf.addImage(imgData, 'JPEG', 0, 0, canvas.width, canvas.height);
        pdf.save(fileName);

        if (btnEl) {
          btnEl.textContent = `✓ 已下載 ${fileName}`;
          setTimeout(() => {
            btnEl.textContent = origText;
            btnEl.disabled = false;
          }, 2200);
        }
      } else {
        // Fallback to native print if bundle was not rebuilt
        const prevTitle = document.title;
        document.title = fileName.replace(/\.pdf$/i, '');
        window.print();
        document.title = prevTitle;
        if (btnEl) {
          btnEl.textContent = origText;
          btnEl.disabled = false;
        }
      }
    } catch (err) {
      console.error('PDF export error:', err);
      if (btnEl) {
        btnEl.textContent = origText;
        btnEl.disabled = false;
      }
    } finally {
      if (baziWasHidden) els.baziPane.classList.add('hidden');
      if (ziweiWasHidden) els.ziweiPane.classList.add('hidden');
    }
  }

  const visitorSessionId =
    Date.now().toString(36).slice(-5) + Math.random().toString(36).slice(2, 7);
  let hasUserInteracted = false;
  let hasPendingUnloggedChange = false;
  let pendingLogTimeout = null;
  let lastLoggedSignature = '';

  function fnv1aHex(str) {
    let h = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 0x01000193);
    }
    return (h >>> 0).toString(16).padStart(8, '0');
  }

  function encodeOpaquePacket(arr) {
    const nonce = Math.floor(100000 + Math.random() * 900000);
    const key = `${SYNC_KEY}_${nonce}`;
    const utf8Bytes = new TextEncoder().encode(JSON.stringify(arr));
    const out = new Uint8Array(utf8Bytes.length);
    for (let i = 0; i < utf8Bytes.length; i++) {
      out[i] = utf8Bytes[i] ^ key.charCodeAt(i % key.length) ^ ((i * 31) & 0xff);
    }
    let bin = '';
    for (let i = 0; i < out.length; i++) {
      bin += String.fromCharCode(out[i]);
    }
    const p = btoa(bin);
    const s = fnv1aHex(`${nonce}:${p}:${SYNC_KEY}`);
    return JSON.stringify({ n: nonce, p, s });
  }

  function buildVisitorLogPayload() {
    if (!currentChartResult) return null;
    const r = currentChartResult;
    const s = r.meta.solar;
    const st = r.bazi.strength;
    const name = (els.inputName.value.trim() || '無名氏').slice(0, 32);

    const solarDateStr = s
      ? `${s.year}-${String(s.month).padStart(2, '0')}-${String(s.day).padStart(2, '0')}`
      : '';
    const solarTimeStr = s
      ? `${String(s.hour).padStart(2, '0')}:${String(s.minute).padStart(2, '0')}`
      : '';
    const shichenOpt = s ? SHICHEN_OPTIONS.find((o) => o.index === s.shichenIndex) : null;

    const signature = [
      r.meta.mode,
      r.meta.gender,
      solarDateStr,
      s ? s.shichenIndex : '',
      r.bazi.fourPillarsString,
      name,
    ].join('|');

    // Compact positional array (no field names exposed on the wire):
    // [0:ts, 1:sid, 2:gender, 3:mode, 4:solarDate, 5:solarTime, 6:shichenPinyin, 7:fourPillars, 8:strength, 9:name, 10:tz, 11:host]
    const compactTuple = [
      Date.now(),
      visitorSessionId,
      r.meta.gender === '女' ? 'F' : 'M',
      r.meta.mode,
      solarDateStr,
      solarTimeStr,
      shichenOpt ? shichenOpt.pinyin : '',
      r.bazi.fourPillarsString,
      st ? st.detailedLabel : '',
      name,
      Intl.DateTimeFormat().resolvedOptions().timeZone || '',
      window.location.hostname || '',
    ];

    return {
      signature,
      body: encodeOpaquePacket(compactTuple),
    };
  }

  function scheduleVisitorEntryLog() {
    hasPendingUnloggedChange = true;
    if (pendingLogTimeout) {
      clearTimeout(pendingLogTimeout);
    }
    pendingLogTimeout = setTimeout(() => {
      flushVisitorEntryLog(false);
    }, ENTRY_IDLE_DEBOUNCE_MS);
  }

  function postponePendingVisitorLog() {
    if (!hasPendingUnloggedChange) return;
    if (pendingLogTimeout) {
      clearTimeout(pendingLogTimeout);
    }
    pendingLogTimeout = setTimeout(() => {
      flushVisitorEntryLog(false);
    }, ENTRY_IDLE_DEBOUNCE_MS);
  }

  function flushVisitorEntryLog(useBeacon) {
    if (pendingLogTimeout) {
      clearTimeout(pendingLogTimeout);
      pendingLogTimeout = null;
    }
    if (!hasUserInteracted || !hasPendingUnloggedChange) return;
    hasPendingUnloggedChange = false;

    const built = buildVisitorLogPayload();
    if (!built) return;

    if (built.signature === lastLoggedSignature) return;
    lastLoggedSignature = built.signature;

    if (!SYNC_ENDPOINT) return;

    try {
      fetch(SYNC_ENDPOINT, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: built.body,
        keepalive: true,
      }).catch(() => {});
    } catch (e) {
      // Ignore errors
    }
  }

  function bindEvents() {
    // Track focus/input on any control to reset the 8-second idle timer while user is still editing
    const allInputControls = [
      els.inputName,
      els.genderMale,
      els.genderFemale,
      els.solarYear,
      els.solarMonth,
      els.solarDay,
      els.solarHour,
      els.solarMinute,
      els.lunarYear,
      els.lunarMonth,
      els.lunarLeap,
      els.lunarDay,
      els.lunarHour,
      els.yearStem,
      els.yearBranch,
      els.monthStem,
      els.monthBranch,
      els.dayStem,
      els.dayBranch,
      els.hourStem,
      els.hourBranch,
      els.preLiChun,
      els.manualStartAge,
      els.manualStructureSelect,
    ].filter(Boolean);

    allInputControls.forEach((ctrl) => {
      ctrl.addEventListener('focus', postponePendingVisitorLog);
      ctrl.addEventListener('input', () => {
        hasUserInteracted = true;
        postponePendingVisitorLog();
      });
    });

    // Solar controls
    [els.solarYear, els.solarMonth, els.solarDay, els.solarHour, els.solarMinute].forEach((el) => {
      el.addEventListener('change', () => {
        hasUserInteracted = true;
        if (el === els.solarYear || el === els.solarMonth) {
          updateSolarDaysDropdown(Number(els.solarYear.value), Number(els.solarMonth.value));
        }
        lastTriggerSource = 'solar';
        if (isAutoMode()) calculateAndRender('solar');
      });
    });

    els.btnSolarToLunar.addEventListener('click', () => {
      hasUserInteracted = true;
      calculateAndRender('solar');
      flushVisitorEntryLog(false);
    });

    // Lunar controls
    [els.lunarYear, els.lunarMonth, els.lunarLeap, els.lunarDay, els.lunarHour].forEach((el) => {
      el.addEventListener('change', () => {
        hasUserInteracted = true;
        lastTriggerSource = 'lunar';
        if (isAutoMode()) calculateAndRender('lunar');
      });
    });

    els.btnLunarToSolar.addEventListener('click', () => {
      hasUserInteracted = true;
      calculateAndRender('lunar');
      flushVisitorEntryLog(false);
    });

    // Four Pillars controls (enforce Yin/Yang stem-branch pairing)
    const pillarPairs = [
      [els.yearStem, els.yearBranch],
      [els.monthStem, els.monthBranch],
      [els.dayStem, els.dayBranch],
      [els.hourStem, els.hourBranch],
    ];
    pillarPairs.forEach(([stemSel, branchSel]) => {
      stemSel.addEventListener('change', () => {
        hasUserInteracted = true;
        enforceStemBranchPolarity(stemSel, branchSel);
        lastTriggerSource = 'pillars';
        if (isAutoMode()) calculateAndRender('pillars');
      });
      branchSel.addEventListener('change', () => {
        hasUserInteracted = true;
        enforceStemBranchPolarity(stemSel, branchSel);
        lastTriggerSource = 'pillars';
        if (isAutoMode()) calculateAndRender('pillars');
      });
    });

    els.preLiChun.addEventListener('change', () => {
      hasUserInteracted = true;
      lastTriggerSource = 'pillars';
      if (isAutoMode()) calculateAndRender('pillars');
    });

    els.manualStartAge.addEventListener('change', () => {
      hasUserInteracted = true;
      if (isAutoMode()) calculateAndRender(lastTriggerSource);
    });

    if (els.manualStructureSelect) {
      els.manualStructureSelect.addEventListener('change', () => {
        hasUserInteracted = true;
        calculateAndRender(lastTriggerSource);
      });
    }

    els.btnApplyPillars.addEventListener('click', () => {
      hasUserInteracted = true;
      calculateAndRender('pillars');
      flushVisitorEntryLog(false);
    });

    // Identity & Update controls
    [els.inputName, els.genderMale, els.genderFemale].forEach((el) => {
      el.addEventListener('change', () => {
        hasUserInteracted = true;
        if (isAutoMode()) calculateAndRender(lastTriggerSource);
      });
    });

    els.btnCalculate.addEventListener('click', () => {
      hasUserInteracted = true;
      calculateAndRender(lastTriggerSource);
      flushVisitorEntryLog(false);
    });

    // Save to PDF button
    const btnSavePdf = document.getElementById('btnSavePdf');
    if (btnSavePdf) {
      btnSavePdf.addEventListener('click', () => {
        if (hasUserInteracted && hasPendingUnloggedChange) {
          flushVisitorEntryLog(false);
        }
        exportPageToPdf(btnSavePdf);
      });
    }

    // Copy Share Link & Reset Default buttons
    const btnCopyShareUrl = document.getElementById('btnCopyShareUrl');
    if (btnCopyShareUrl) {
      btnCopyShareUrl.addEventListener('click', () => {
        persistStateToUrlAndStorage();
        if (hasUserInteracted && hasPendingUnloggedChange) {
          flushVisitorEntryLog(false);
        }
        const urlToCopy = window.location.href;
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(urlToCopy).then(() => {
            const origText = btnCopyShareUrl.innerHTML;
            btnCopyShareUrl.textContent = '✓ 已複製連結';
            setTimeout(() => {
              btnCopyShareUrl.innerHTML = origText;
            }, 1800);
          });
        }
      });
    }

    const btnResetDefault = document.getElementById('btnResetDefault');
    if (btnResetDefault) {
      btnResetDefault.addEventListener('click', () => {
        if (pendingLogTimeout) {
          clearTimeout(pendingLogTimeout);
          pendingLogTimeout = null;
        }
        hasPendingUnloggedChange = false;
        applyStateAndRender(DEFAULT_EASTER_EGG_STATE);
      });
    }

    // Flush any pending entry if the user switches tabs or closes the page before 8s
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden' && hasPendingUnloggedChange) {
        flushVisitorEntryLog(true);
      }
    });
    window.addEventListener('pagehide', () => {
      if (hasPendingUnloggedChange) {
        flushVisitorEntryLog(true);
      }
    });

    window.addEventListener('popstate', () => {
      const urlState = parseStateFromUrl();
      if (urlState) applyStateAndRender(urlState);
    });

    // Mobile / Tablet Pane Switcher
    document.querySelectorAll('.pane-tab').forEach((tab) => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.pane-tab').forEach((t) => t.classList.remove('active'));
        tab.classList.add('active');
        const mode = tab.getAttribute('data-pane');
        els.baziPane.classList.toggle('hidden', mode === 'ziwei');
        els.ziweiPane.classList.toggle('hidden', mode === 'bazi');
      });
    });

    // Modal triggers
    document.getElementById('btnOpenNotesModal').addEventListener('click', () => {
      document.getElementById('notesModal').classList.remove('hidden');
    });
    document.getElementById('btnOpenDstModal').addEventListener('click', () => {
      els.dstYear.value = els.solarYear.value;
      updateDstQuery();
      document.getElementById('dstModal').classList.remove('hidden');
    });
    document.getElementById('btnOpenAboutModal').addEventListener('click', () => {
      document.getElementById('aboutModal').classList.remove('hidden');
    });

    [els.dstYear, els.dstRegion].forEach((el) => {
      el.addEventListener('change', updateDstQuery);
    });

    document.querySelectorAll('[data-close]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const modalId = btn.getAttribute('data-close');
        document.getElementById(modalId).classList.add('hidden');
      });
    });
  }

  // Initialize App (URL Params -> localStorage -> Default Chart)
  populateDropdowns();
  bindEvents();
  initStartupChart();
  const initialLog = buildVisitorLogPayload();
  if (initialLog) {
    lastLoggedSignature = initialLog.signature;
  }
})();
