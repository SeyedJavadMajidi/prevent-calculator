import { describe, expect, it } from 'vitest';
import { calculatePrevent } from '../src/prevent.js';

const sample = {
  sex:'female', age:50, sbp:120, totalCholesterol:200, hdl:45, egfr:90, bmi:25,
  diabetes:false, smoking:false, antiHTN:false, statin:false
};

describe('PREVENT simplified base equations', () => {
  it('returns finite 10-year risks for all three outcomes', () => {
    const result = calculatePrevent(sample);
    expect(result.tenYear.cvd).toBeCloseTo(2.2052, 3);
    expect(result.tenYear.ascvd).toBeCloseTo(1.4272, 3);
    expect(result.tenYear.hf).toBeCloseTo(0.6945, 3);
  });
  it('returns 30-year estimates for ages 30–59', () => {
    const result = calculatePrevent(sample);
    expect(result.thirtyYear.cvd).toBeCloseTo(15.6463, 3);
    expect(result.thirtyYear.ascvd).toBeCloseTo(9.4228, 3);
    expect(result.thirtyYear.hf).toBeCloseTo(6.1564, 3);
  });
  it('omits 30-year estimate for people older than 59', () => {
    expect(calculatePrevent({...sample, age:60}).thirtyYear).toBeNull();
  });
  it('rejects out-of-range values', () => {
    expect(() => calculatePrevent({...sample, age:29})).toThrow();
    expect(() => calculatePrevent({...sample, sbp:201})).toThrow();
  });
});