declare module 'lunar-javascript' {
  export class Solar {
    static fromYmdHms(
      year: number,
      month: number,
      day: number,
      hour: number,
      minute: number,
      second: number
    ): Solar;
    static fromBaZi(
      yearGanZhi: string,
      monthGanZhi: string,
      dayGanZhi: string,
      timeGanZhi: string,
      sect?: number,
      baseYear?: number
    ): Solar[];
    getYear(): number;
    getMonth(): number;
    getDay(): number;
    getHour(): number;
    getMinute(): number;
    getSecond(): number;
    getLunar(): Lunar;
    toYmdHms(): string;
    toYmd(): string;
  }

  export class Lunar {
    static fromYmdHms(
      lunarYear: number,
      lunarMonth: number,
      lunarDay: number,
      hour: number,
      minute: number,
      second: number
    ): Lunar;
    getYear(): number;
    getMonth(): number;
    getDay(): number;
    getSolar(): Solar;
    getEightChar(): EightChar;
    getPrevJie(): any;
    getNextJie(): any;
    toString(): string;
  }

  export class EightChar {
    setSect(sect: number): void;
    getSect(): number;
    getYear(): string;
    getMonth(): string;
    getDay(): string;
    getTime(): string;
    getDayGan(): string;
    getTaiYuan(): string;
    getTaiYuanNaYin(): string;
    getMingGong(): string;
    getMingGongNaYin(): string;
    getShenGong(): string;
    getShenGongNaYin(): string;
    getYun(gender: number, sect?: number): any;
  }
}
