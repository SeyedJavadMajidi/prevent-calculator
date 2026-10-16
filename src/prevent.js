// PREVENT simplified equations transcribed from the user's supplied supplementary workbook (Tables S12A and S12F).
// Coefficient columns below are female/male for CVD, ASCVD and HF, respectively.
const C10 = [
['age',.7939329,.7688528,.719883,.7099847,.8998235,.8972642],
['nonHdl',.0305239,.0736174,.1176967,.1658663,0,0],
['hdl',-.1606857,-.0954431,-.151185,-.1144285,0,0],
['sbpLow',-.2394003,-.4347345,-.0835358,-.2837212,-.4559771,-.6811466],
['sbpHigh',.3600781,.3362658,.3592852,.3239977,.3576505,.3634461],
['diabetes',.8667604,.7692857,.8348585,.7189597,1.038346,.923776],
['smoking',.5360739,.4386871,.4831078,.3956973,.583916,.5023736],
['bmiLow',0,0,0,0,-.0072294,-.0485841],
['bmiHigh',0,0,0,0,.2997706,.3726929],
['egfrLow',.6045917,.5378979,.4864619,.3690075,.7451638,.6926917],
['egfrHigh',.0433769,.0164827,.0397779,.0203619,.0557087,.0251827],
['antiHTN',.3151672,.288879,.2265309,.2036522,.3534442,.2980922],
['statin',-.1477655,-.1337349,-.0592374,-.0865581,0,0],
['treatedSBP',-.0663612,-.0475924,-.0395762,-.0322916,-.0981511,-.0497731],
['treatedNonHdl',.1197879,.150273,.0844423,.114563,0,0],
['ageNonHdl',-.0819715,-.0517874,-.0567839,-.0300005,0,0],
['ageHdl',.0306769,.0191169,.0325692,.0232747,0,0],
['ageSbp',-.0946348,-.1049477,-.1035985,-.0927024,-.0946663,-.1289201],
['ageDiabetes',-.27057,-.2251948,-.2417542,-.2018525,-.3581041,-.3040924],
['ageSmoking',-.078715,-.0895067,-.0791142,-.0970527,-.1159453,-.1401688],
['ageBmiHigh',0,0,0,0,-.003878,.0068126],
['ageEgfrLow',-.1637806,-.1543702,-.1671492,-.1217081,-.1884289,-.1797778],
['constant',-3.307728,-3.031168,-3.819975,-3.500655,-4.310409,-3.946391]
];
const C30 = [
['age',.5503079,.4627309,.4669202,.3994099,.6254374,.5681541],
['age2',-.0928369,-.0984281,-.0893118,-.0937484,-.0983038,-.1048388],
['nonHdl',.0409794,.0836088,.1256901,.1744643,0,0],
['hdl',-.1663306,-.1029824,-.1542255,-.120203,0,0],
['sbpLow',-.1628654,-.2140352,-.0018093,-.0665117,-.3919241,-.4761564],
['sbpHigh',.3299505,.2904325,.322949,.2753037,.3142295,.30324],
['diabetes',.6793894,.5331276,.6296707,.4790257,.8330787,.6840338],
['smoking',.3196112,.2141914,.268292,.1782635,.3438651,.2656273],
['bmiLow',0,0,0,0,.0594874,.0833107],
['bmiHigh',0,0,0,0,.2525536,.26999],
['egfrLow',.1857101,.1155556,.100106,-.0218789,.2981642,.2541805],
['egfrHigh',.0553528,.0603775,.0499663,.0602553,.0667159,.0638923],
['antiHTN',.2894,.232714,.1875292,.1421182,.333921,.2583631],
['statin',-.075688,-.0272112,.0152476,.0135996,0,0],
['treatedSBP',-.056367,-.0384488,-.0276123,-.0218265,-.0893177,-.0391938],
['treatedNonHdl',.1071019,.134192,.0736147,.1013148,0,0],
['ageNonHdl',-.0751438,-.0511759,-.0521962,-.0312619,0,0],
['ageHdl',.0301786,.0165865,.0316918,.020673,0,0],
['ageSbp',-.0998776,-.1101437,-.1046101,-.0920935,-.0974299,-.1269124],
['ageDiabetes',-.3206166,-.2585943,-.2727793,-.2159947,-.404855,-.3273572],
['ageSmoking',-.1607862,-.1566406,-.1530907,-.1548811,-.1982991,-.2043019],
['ageBmiHigh',0,0,0,0,-.0035619,-.0182831],
['ageEgfrLow',-.1450788,-.1166776,-.1299149,-.0712547,-.1564215,-.1342618],
['constant',-1.318827,-1.148204,-1.974074,-1.736444,-2.205379,-1.95751]
];
const OUTCOMES = [
 {key:'cvd',label:'Total cardiovascular disease',offset:0},
 {key:'ascvd',label:'Atherosclerotic CVD (ASCVD)',offset:2},
 {key:'hf',label:'Heart failure',offset:4}
];
const finite = (n) => Number.isFinite(Number(n));
function validate(x, horizon) {
  const ranges = {
    age:[30,79], sbp:[90,200], totalCholesterol:[130,320], hdl:[20,100],
    egfr:[15,140], bmi:[18.5,39.9]
  };
  for (const [key,[min,max]] of Object.entries(ranges)) {
    if (!finite(x[key]) || Number(x[key]) < min || Number(x[key]) > max) {
      throw new Error(`${key} must be between ${min} and ${max}.`);
    }
  }
  for (const key of ['diabetes','smoking','antiHTN','statin']) {
    if (![true,false,0,1,'0','1'].includes(x[key])) throw new Error(`Invalid value for ${key}.`);
  }
  if (horizon === 30 && Number(x.age) > 59) throw new Error('30-year risk is available only for ages 30–59.');
}
const yes = (v) => v === true || v === 1 || v === '1';
function featureMap(x, horizon) {
  const age = (Number(x.age)-55)/10;
  const nonHdl = (Number(x.totalCholesterol)-Number(x.hdl))*.02586-3.5;
  const hdl = (Number(x.hdl)*.02586-1.3)/.3;
  const sbpLow = (Math.min(Number(x.sbp),110)-110)/20;
  const sbpHigh = (Math.max(Number(x.sbp),110)-130)/20;
  const bmiLow = (Math.min(Number(x.bmi),30)-25)/5;
  const bmiHigh = (Math.max(Number(x.bmi),30)-30)/5;
  const egfrLow = (Math.min(Number(x.egfr),60)-60)/-15;
  const egfrHigh = (Math.max(Number(x.egfr),60)-90)/-15;
  const diabetes = +yes(x.diabetes), smoking = +yes(x.smoking), antiHTN = +yes(x.antiHTN), statin = +yes(x.statin);
  return {
    age, age2:age*age, nonHdl, hdl, sbpLow, sbpHigh, diabetes, smoking,
    bmiLow, bmiHigh, egfrLow, egfrHigh, antiHTN, statin,
    treatedSBP:sbpHigh*antiHTN, treatedNonHdl:nonHdl*statin,
    ageNonHdl:age*nonHdl, ageHdl:age*hdl, ageSbp:age*sbpHigh,
    ageDiabetes:age*diabetes, ageSmoking:age*smoking, ageBmiHigh:age*bmiHigh,
    ageEgfrLow:age*egfrLow
  };
}
export function calculatePrevent(input) {
  const x = {...input};
  validate(x,10);
  const tenFeatures = featureMap(x,10);
  const tenLogits = {};
  for (const outcome of OUTCOMES) {
    const sexOffset = x.sex === 'male' ? 1 : 0;
    const col = outcome.offset + sexOffset;
    tenLogits[outcome.key] = C10.reduce((sum,row) => sum + (tenFeatures[row[0]] ?? 1) * row[col+1], 0);
  }
  const tenYear = Object.fromEntries(OUTCOMES.map(o => [o.key, 100/(1+Math.exp(-tenLogits[o.key]))]));
  let thirtyYear = null;
  if (Number(x.age) <= 59) {
    const f30 = featureMap(x,30);
    thirtyYear = {};
    for (const outcome of OUTCOMES) {
      const sexOffset = x.sex === 'male' ? 1 : 0;
      const col = outcome.offset + sexOffset;
      const logit = C30.reduce((sum,row) => sum + (f30[row[0]] ?? 1) * row[col+1], 0);
      thirtyYear[outcome.key] = 100/(1+Math.exp(-logit));
    }
  }
  return {tenYear, thirtyYear, model:'simplified-base', warnings:[
    'This implementation uses the simplified base equations from the supplied supplementary workbook.',
    'Optional UACR, HbA1c and social deprivation index predictors are not yet included.'
  ]};
}
export const PREVENT_OUTCOMES = OUTCOMES;