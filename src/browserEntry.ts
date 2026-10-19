import * as AstrologyEngine from './astrologyEngine';
import { Solar, Lunar } from 'lunar-javascript';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

(globalThis as any).AstrologyEngine = {
  ...AstrologyEngine,
  Solar,
  Lunar,
  html2canvas,
  jsPDF,
};
