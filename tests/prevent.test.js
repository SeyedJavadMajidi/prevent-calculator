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
    expect(result.model).toBe('enhanced-simplified');
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

  it('selects the male-specific coefficients from the same workbook example', () => {
    const result = calculatePrevent({ ...workbookExample, sex: 'male' });
    expect(result.tenYear.cvd).toBeCloseTo(17.6988, 3);
    expect(result.tenYear.ascvd).toBeCloseTo(11.1768, 3);
    expect(result.tenYear.hf).toBeCloseTo(11.4929, 3);
    expect(result.tenYear.chd).toBeCloseTo(6.0490, 3);
    expect(result.tenYear.stroke).toBeCloseTo(5.8149, 3);
    expect(result.thirtyYear.cvd).toBeCloseTo(51.0710, 3);
    expect(result.thirtyYear.ascvd).toBeCloseTo(34.8664, 3);
    expect(result.thirtyYear.hf).toBeCloseTo(42.1568, 3);
    expect(result.thirtyYear.chd).toBeCloseTo(21.3161, 3);
    expect(result.thirtyYear.stroke).toBeCloseTo(20.0888, 3);
  });

  it('handles missing optional predictors using missingness indicators', () => {
    const result = calculatePrevent(baseSample);
    expect(result.model).toBe('base-simplified');
    expect(result.predictors).toEqual({ uacr: false, hba1c: false, sdi: false });
    expect(result.tenYear.cvd).toBeCloseTo(2.2052, 3);
    expect(result.tenYear.ascvd).toBeCloseTo(1.4272, 3);
    expect(result.tenYear.hf).toBeCloseTo(0.6945, 3);
    expect(result.tenYear.chd).toBeCloseTo(0.6854, 3);
    expect(result.tenYear.stroke).toBeCloseTo(0.7553, 3);
    expect(result.thirtyYear.cvd).toBeCloseTo(15.6463, 3);
    expect(result.thirtyYear.ascvd).toBeCloseTo(9.4228, 3);
    expect(result.thirtyYear.hf).toBeCloseTo(6.1564, 3);
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
