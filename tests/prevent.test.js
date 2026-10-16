import { describe, expect, it } from 'vitest';
import { calculatePrevent, PREVENT_OUTCOMES } from '../src/prevent.js';

const workbookExample = {
  sex: 'female',
  age: 50,
  sbp: 160,
  totalCholesterol: 200,
  hdl: 45,
  egfr: 90,
  bmi: 35,
  diabetes: true,
  smoking: false,
  antiHTN: true,
  statin: false,
  uacr: 40,
  hba1c: 7.5,
  sdi: 8,
};

const baseSample = {
  ...workbookExample,
  age: 50,
  sbp: 120,
  bmi: 25,
  diabetes: false,
  antiHTN: false,
  uacr: null,
  hba1c: null,
  sdi: null,
};

describe('PREVENT enhanced simplified equations', () => {
  it('calculates all five 10-year outcomes against the supplied workbook example', () => {
    const result = calculatePrevent(workbookExample);
    expect(PREVENT_OUTCOMES).toHaveLength(5);
    expect(result.tenYear.cvd).toBeCloseTo(15.9308, 3);
    expect(result.tenYear.ascvd).toBeCloseTo(9.9867, 3);
    expect(result.tenYear.hf).toBeCloseTo(8.9884, 3);
    expect(result.tenYear.chd).toBeCloseTo(4.6672, 3);
    expect(result.tenYear.stroke).toBeCloseTo(5.9041, 3);
  });

  it('calculates 30-year outcomes for ages 30–59 against the workbook example', () => {
    const result = calculatePrevent(workbookExample);
    expect(result.thirtyYear.cvd).toBeCloseTo(52.2417, 3);
    expect(result.thirtyYear.ascvd).toBeCloseTo(35.4104, 3);
    expect(result.thirtyYear.hf).toBeCloseTo(39.2391, 3);
    expect(result.thirtyYear.chd).toBeCloseTo(19.6815, 3);
    expect(result.thirtyYear.stroke).toBeCloseTo(22.5346, 3);
  });

  it('handles missing optional predictors using missingness indicators', () => {
    const result = calculatePrevent(baseSample);
    expect(result.predictors).toEqual({ uacr: false, hba1c: false, sdi: false });
    expect(Number.isFinite(result.tenYear.cvd)).toBe(true);
    expect(Number.isFinite(result.tenYear.stroke)).toBe(true);
  });

  it('omits 30-year estimates for people older than 59', () => {
    expect(calculatePrevent({ ...baseSample, age: 60 }).thirtyYear).toBeNull();
  });

  it('rejects out-of-range required and optional values', () => {
    expect(() => calculatePrevent({ ...baseSample, age: 29 })).toThrow();
    expect(() => calculatePrevent({ ...baseSample, sbp: 201 })).toThrow();
    expect(() => calculatePrevent({ ...baseSample, uacr: 0 })).toThrow();
    expect(() => calculatePrevent({ ...baseSample, hba1c: 16 })).toThrow();
    expect(() => calculatePrevent({ ...baseSample, sdi: 2.5 })).toThrow();
  });
});
