// PREVENT simplified enhanced equations from the supplied supplementary workbook (Tables S12E and S12J).
// These are simplified regression equations, not the licensed official AHA source-code implementation.
import { PREVENT_COEFFICIENTS } from './prevent-coefficients.js';

export const PREVENT_OUTCOMES = [
  { key: 'cvd', label: 'Total cardiovascular disease', offset: 0 },
  { key: 'ascvd', label: 'Atherosclerotic cardiovascular disease (ASCVD)', offset: 2 },
  { key: 'hf', label: 'Heart failure', offset: 4 },
  { key: 'chd', label: 'Coronary heart disease', offset: 6 },
  { key: 'stroke', label: 'Stroke', offset: 8 },
];

const isProvided = value => value !== null && value !== undefined && value !== '';
const yes = value => value === true || value === 1 || value === '1';

function validate(x, horizon) {
  if (!['female', 'male'].includes(x.sex)) throw new Error('Sex must be female or male.');
  const ranges = {
    age: [30, 79], sbp: [90, 200], totalCholesterol: [130, 320],
    hdl: [20, 100], egfr: [15, 150], bmi: [18.5, 39.9],
  };
  for (const [key, [min, max]] of Object.entries(ranges)) {
    const value = Number(x[key]);
    if (!isProvided(x[key]) || !Number.isFinite(value) || value < min || value > max) {
      throw new Error(`${key} must be between ${min} and ${max}.`);
    }
  }
  for (const key of ['diabetes', 'smoking', 'antiHTN', 'statin']) {
    if (![true, false, 0, 1, '0', '1'].includes(x[key])) throw new Error(`Invalid value for ${key}.`);
  }
  const optionalRanges = { uacr: [0.1, 25000], hba1c: [3, 15], sdi: [1, 10] };
  for (const [key, [min, max]] of Object.entries(optionalRanges)) {
    if (!isProvided(x[key])) continue;
    const value = Number(x[key]);
    if (!Number.isFinite(value) || value < min || value > max) {
      throw new Error(`${key} must be between ${min} and ${max}.`);
    }
    if (key === 'sdi' && !Number.isInteger(value)) throw new Error('sdi must be an integer from 1 to 10.');
  }
  if (horizon === 30 && Number(x.age) > 59) {
    throw new Error('30-year risk is available only for ages 30–59.');
  }
}

function featureMap(x) {
  const age = (Number(x.age) - 55) / 10;
  const nonHdl = (Number(x.totalCholesterol) - Number(x.hdl)) * 0.02586 - 3.5;
  const hdl = (Number(x.hdl) * 0.02586 - 1.3) / 0.3;
  const sbp = Number(x.sbp);
  const bmi = Number(x.bmi);
  const egfr = Number(x.egfr);
  const diabetes = +yes(x.diabetes);
  const smoking = +yes(x.smoking);
  const antiHTN = +yes(x.antiHTN);
  const statin = +yes(x.statin);
  const hasUacr = isProvided(x.uacr);
  const hasHba1c = isProvided(x.hba1c);
  const hasSdi = isProvided(x.sdi);
  const hba1c = hasHba1c ? Number(x.hba1c) : 5.3;
  const sdi = hasSdi ? Number(x.sdi) : null;

  return {
    age,
    age2: age * age,
    nonHdl,
    hdl,
    sbpLow: (Math.min(sbp, 110) - 110) / 20,
    sbpHigh: (Math.max(sbp, 110) - 130) / 20,
    diabetes,
    smoking,
    bmiLow: (Math.min(bmi, 30) - 25) / 5,
    bmiHigh: (Math.max(bmi, 30) - 30) / 5,
    egfrLow: (Math.min(egfr, 60) - 60) / -15,
    egfrHigh: (Math.max(egfr, 60) - 90) / -15,
    antiHTN,
    statin,
    treatedSBP: ((Math.max(sbp, 110) - 130) / 20) * antiHTN,
    treatedNonHdl: nonHdl * statin,
    ageNonHdl: age * nonHdl,
    ageHdl: age * hdl,
    ageSbp: age * ((Math.max(sbp, 110) - 130) / 20),
    ageDiabetes: age * diabetes,
    ageSmoking: age * smoking,
    ageBmiHigh: age * ((Math.max(bmi, 30) - 30) / 5),
    ageEgfrLow: age * ((Math.min(egfr, 60) - 60) / -15),
    logUacr: hasUacr ? Math.log(Number(x.uacr)) : 0,
    missingUacr: hasUacr ? 0 : 1,
    hba1cNoDiabetes: hasHba1c ? (hba1c - 5.3) * (1 - diabetes) : 0,
    hba1cDiabetes: hasHba1c ? (hba1c - 5.3) * diabetes : 0,
    missingHba1c: hasHba1c ? 0 : 1,
    sdiMid: hasSdi && sdi >= 4 && sdi <= 6 ? 1 : 0,
    sdiHigh: hasSdi && sdi >= 7 && sdi <= 10 ? 1 : 0,
    missingSdi: hasSdi ? 0 : 1,
    constant: 1,
  };
}

function score(coefficients, features, sex, outcome) {
  const sexOffset = sex === 'male' ? 1 : 0;
  const column = outcome.offset + sexOffset;
  const logit = coefficients.reduce((sum, [feature, values]) => {
    return sum + (features[feature] ?? 0) * values[column];
  }, 0);
  return 100 / (1 + Math.exp(-logit));
}

function calculateHorizon(input, horizon) {
  validate(input, horizon);
  const features = featureMap(input);
  const coefficients = PREVENT_COEFFICIENTS[horizon === 10 ? 'full10' : 'full30'];
  return Object.fromEntries(PREVENT_OUTCOMES.map(outcome => [
    outcome.key,
    score(coefficients, features, input.sex, outcome),
  ]));
}

export function calculatePrevent(input) {
  const x = { ...input };
  validate(x, 10);
  const tenYear = calculateHorizon(x, 10);
  const thirtyYear = Number(x.age) <= 59 ? calculateHorizon(x, 30) : null;
  return {
    tenYear,
    thirtyYear,
    model: 'enhanced-simplified',
    predictors: {
      uacr: isProvided(x.uacr),
      hba1c: isProvided(x.hba1c),
      sdi: isProvided(x.sdi),
    },
    warnings: [
      'Uses enhanced simplified equations from the supplied supplementary workbook, including missing-predictor indicators.',
      'Not independently validated against the official AHA calculator; do not use as the sole basis for clinical decisions.',
    ],
  };
}
