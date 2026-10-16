import { useState } from 'react';
import { Activity, ArrowDownToLine, BadgeCheck, Calculator, HeartPulse, Info, RotateCcw, ShieldCheck, Stethoscope } from 'lucide-react';
import { calculatePrevent, PREVENT_OUTCOMES } from './prevent.js';

const initial = {
  sex: 'female', age: '50', sbp: '120', totalCholesterol: '200', hdl: '45',
  egfr: '90', bmi: '25', diabetes: false, smoking: false, antiHTN: false,
  statin: false, uacr: '', hba1c: '', sdi: '',
};
const fields = [
  ['age', 'سن', 'سال', '۳۰ تا ۷۹', 'number'],
  ['sbp', 'فشار سیستولیک', 'mmHg', '۹۰ تا ۲۰۰', 'number'],
  ['totalCholesterol', 'کلسترول تام', 'mg/dL', '۱۳۰ تا ۳۲۰', 'number'],
  ['hdl', 'HDL-C', 'mg/dL', '۲۰ تا ۱۰۰', 'number'],
  ['egfr', 'eGFR', 'mL/min/1.73m²', '۱۵ تا ۱۵۰', 'number'],
  ['bmi', 'شاخص توده بدنی (BMI)', 'kg/m²', '۱۸٫۵ تا ۳۹٫۹', 'number'],
];
const switches = [
  ['diabetes', 'دیابت', 'سابقه تشخیص دیابت'],
  ['smoking', 'سیگار فعلی', 'مصرف سیگار در ۳۰ روز گذشته'],
  ['antiHTN', 'داروی فشار خون', 'مصرف فعلی داروی ضد فشار خون'],
  ['statin', 'استاتین', 'مصرف فعلی داروی استاتین'],
];
const optionalFields = [
  ['uacr', 'نسبت آلبومین به کراتینین ادرار (UACR)', 'mg/g', '۰٫۱ تا ۲۵٬۰۰۰'],
  ['hba1c', 'هموگلوبین A1c (HbA1c)', '%', '۳ تا ۱۵'],
  ['sdi', 'شاخص محرومیت اجتماعی (SDI)', 'دهک ۱ تا ۱۰', 'عدد صحیح'],
];

function Field({ name, label, unit, hint, value, onChange, optional = false }) {
  return <label className="block">
    <span className="mb-2 flex items-center justify-between gap-2 text-sm font-semibold text-slate-700">
      <span>{label}</span><span className="text-xs font-normal text-slate-400" dir="ltr">{unit}</span>
    </span>
    <input
      className="field"
      name={name}
      type="number"
      inputMode="decimal"
      step={name === 'sdi' ? '1' : 'any'}
      min={name === 'bmi' ? 18.5 : undefined}
      max={name === 'bmi' ? 39.9 : undefined}
      value={value}
      onChange={e => onChange(name, e.target.value)}
      required={!optional}
    />
    <span className="mt-1 block text-xs text-slate-400">{hint}</span>
  </label>;
}
function RiskCard({ title, value, accent }) {
  const n = Number(value);
  const riskClass = n < 5 ? 'text-emerald-700' : n < 10 ? 'text-amber-700' : 'text-rose-700';
  return <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
    <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-500">
      <span className={`h-2 w-2 rounded-full ${accent}`} />{title}
    </div>
    <div className={`text-4xl font-bold tracking-tight ${riskClass}`}>
      {n.toFixed(1)}<span className="mr-1 text-xl">٪</span>
    </div>
    <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
      <div className={`h-full rounded-full ${accent}`} style={{ width: `${Math.min(100, n)}%` }} />
    </div>
    <p className="mt-2 text-xs text-slate-400">برآورد احتمال طی دوره زمانی؛ نه تشخیص قطعی</p>
  </div>;
}

export default function App() {
  const [form, setForm] = useState(initial);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('cvd');
  const [showInfo, setShowInfo] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const update = (key, value) => setForm(current => ({ ...current, [key]: value }));
  const activeOutcome = PREVENT_OUTCOMES.find(outcome => outcome.key === tab) || PREVENT_OUTCOMES[0];

  const doCalculate = event => {
    event.preventDefault();
    setError('');
    try {
      const numericKeys = ['age', 'sbp', 'totalCholesterol', 'hdl', 'egfr', 'bmi'];
      const input = { ...form };
      numericKeys.forEach(key => { input[key] = Number(form[key]); });
      ['uacr', 'hba1c', 'sdi'].forEach(key => {
        input[key] = form[key] === '' ? null : Number(form[key]);
      });
      setResult(calculatePrevent(input));
    } catch (err) {
      setResult(null);
      setError(err.message || 'لطفاً ورودی‌ها را بررسی کنید.');
    }
  };
  const reset = () => {
    setForm(initial);
    setResult(null);
    setError('');
    setTab('cvd');
  };
  const exportCsv = () => {
    if (!result) return;
    const rows = [
      ['Outcome', '10-year risk (%)', '30-year risk (%)'],
      ...PREVENT_OUTCOMES.map(outcome => [
        outcome.label,
        result.tenYear[outcome.key]?.toFixed(3) ?? '',
        result.thirtyYear?.[outcome.key]?.toFixed(3) ?? '',
      ]),
    ];
    const csv = '\uFEFF' + rows.map(row => row.map(value => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'prevent-risk-results.csv';
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return <div className="min-h-screen bg-[#f5f7fb] text-slate-900">
    <header className="border-b border-slate-200/80 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-rose-600 text-white shadow-lg shadow-rose-200"><HeartPulse size={23} /></div>
          <div><div className="text-lg font-extrabold tracking-tight">PREVENT <span className="text-rose-600">Calculator</span></div><div className="text-xs text-slate-500">ارزیابی خطر قلبی‌عروقی</div></div>
        </div>
        <div className="hidden items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 sm:flex"><ShieldCheck size={15} /> محاسبه محلی در مرورگر</div>
      </div>
    </header>

    <main className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,.95fr)] lg:px-8 lg:py-9">
      <section className="space-y-5">
        <div className="flex items-start gap-3">
          <div className="mt-1 rounded-xl bg-rose-100 p-2.5 text-rose-700"><Stethoscope size={21} /></div>
          <div><h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">محاسبه ریسک PREVENT</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">برآورد خطر ۱۰ ساله و برای افراد ۳۰ تا ۵۹ سال، خطر ۳۰ ساله؛ برای پنج پیامد قلبی‌عروقی.</p></div>
        </div>

        <form onSubmit={doCalculate} className="space-y-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-soft sm:p-7">
          <div>
            <div className="mb-3 text-sm font-bold text-slate-800">اطلاعات پایه</div>
            <div className="grid grid-cols-2 gap-3">
              {['female', 'male'].map(value => <button type="button" key={value} onClick={() => update('sex', value)} className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${form.sex === value ? 'border-rose-500 bg-rose-50 text-rose-700 ring-2 ring-rose-100' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'}`}>{value === 'female' ? 'زن' : 'مرد'}</button>)}
            </div>
          </div>
          <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2">
            {fields.map(([name, label, unit, hint]) => <Field key={name} name={name} label={label} unit={unit} hint={hint} value={form[name]} onChange={update} />)}
          </div>

          <div className="border-t border-slate-100 pt-5">
            <div className="mb-3 text-sm font-bold text-slate-800">سابقه و درمان</div>
            <div className="grid gap-3 sm:grid-cols-2">
              {switches.map(([name, label, description]) => <label key={name} className="flex cursor-pointer items-start justify-between gap-3 rounded-2xl border border-slate-200 p-4 transition hover:border-slate-300">
                <span><span className="block text-sm font-semibold">{label}</span><span className="mt-1 block text-xs leading-5 text-slate-400">{description}</span></span>
                <input className="mt-1 h-4 w-4 accent-rose-600" type="checkbox" checked={form[name]} onChange={event => update(name, event.target.checked)} />
              </label>)}
            </div>
          </div>

          <button type="button" onClick={() => setShowAdvanced(value => !value)} className="flex w-full items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-100">
            <span>پیش‌بین‌های تکمیلی (اختیاری): UACR، HbA1c و SDI</span><span>{showAdvanced ? '−' : '+'}</span>
          </button>
          {showAdvanced && <div className="space-y-4 rounded-2xl border border-slate-200 p-4">
            <p className="text-xs leading-5 text-slate-500">هر موردی که در دسترس نیست خالی بماند. مدل دارای شاخص‌های مفقود بودن، ورودی‌های واردنشده را جداگانه مدیریت می‌کند.</p>
            <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2">
              {optionalFields.map(([name, label, unit, hint]) => <Field key={name} name={name} label={label} unit={unit} hint={hint} value={form[name]} onChange={update} optional />)}
            </div>
          </div>}

          {error && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
          <div className="flex flex-col gap-3 pt-1 sm:flex-row">
            <button className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-rose-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-rose-200 transition hover:bg-rose-700" type="submit"><Calculator size={18} /> محاسبه ریسک</button>
            <button className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3.5 text-sm font-semibold text-slate-600 hover:bg-slate-50" type="button" onClick={reset}><RotateCcw size={16} /> پاک‌کردن</button>
          </div>
        </form>
      </section>

      <aside className="space-y-5">
        <div className="rounded-3xl bg-slate-900 p-6 text-white shadow-soft sm:p-7">
          <div className="flex items-center justify-between gap-3">
            <div><div className="text-sm font-semibold text-slate-300">گزارش برآورد خطر</div><h2 className="mt-1 text-xl font-extrabold">نتایج بیمار</h2></div>
            <div className="rounded-2xl bg-white/10 p-3 text-rose-300"><Activity size={23} /></div>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {PREVENT_OUTCOMES.map(outcome => <button type="button" key={outcome.key} onClick={() => setTab(outcome.key)} className={`rounded-full px-3 py-2 text-xs font-semibold transition ${tab === outcome.key ? 'bg-white text-slate-900' : 'bg-white/10 text-slate-300 hover:bg-white/15'}`}>{({ cvd: 'CVD', ascvd: 'ASCVD', hf: 'HF', chd: 'CHD', stroke: 'Stroke' })[outcome.key]}</button>)}
          </div>
          <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="text-sm text-slate-300">{activeOutcome.label}</div>
            {result ? <div className="mt-2 text-4xl font-extrabold">{result.tenYear[tab].toFixed(1)}<span className="mr-1 text-xl">٪</span></div> : <div className="mt-2 text-2xl font-bold text-slate-400">—</div>}
            <div className="mt-2 text-sm text-slate-400">ریسک تخمینی ۱۰ ساله</div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-white/10 p-4"><div className="text-xs text-slate-300">۱۰ ساله</div><div className="mt-2 text-2xl font-bold">{result ? result.tenYear[tab].toFixed(1) + '٪' : '—'}</div></div>
            <div className="rounded-2xl bg-white/10 p-4"><div className="text-xs text-slate-300">۳۰ ساله</div><div className="mt-2 text-2xl font-bold">{result?.thirtyYear ? result.thirtyYear[tab].toFixed(1) + '٪' : '—'}</div></div>
          </div>
          {result && <button type="button" onClick={exportCsv} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-slate-900 hover:bg-slate-100"><ArrowDownToLine size={17} /> دریافت نتایج CSV</button>}
        </div>

        {result && <div className="grid gap-3 sm:grid-cols-2">
          {PREVENT_OUTCOMES.map(outcome => <RiskCard key={outcome.key} title={outcome.label} value={result.tenYear[outcome.key]} accent={({ cvd: 'bg-rose-500', ascvd: 'bg-amber-500', hf: 'bg-sky-500', chd: 'bg-violet-500', stroke: 'bg-indigo-500' })[outcome.key]} />)}
        </div>}

        <div className="rounded-2xl border border-sky-100 bg-sky-50 p-5">
          <div className="flex items-center gap-2 font-bold text-sky-900"><Info size={18} /> نکته بالینی</div>
          <p className="mt-2 text-sm leading-6 text-sky-900/80">مدل PREVENT برای ارزیابی خطر در بزرگسالان ۳۰ تا ۷۹ ساله بدون بیماری قلبی‌عروقی شناخته‌شده طراحی شده است. تفسیر نتیجه باید همراه با قضاوت بالینی انجام شود.</p>
          <button type="button" onClick={() => setShowInfo(value => !value)} className="mt-3 text-sm font-bold text-sky-800 underline underline-offset-4">{showInfo ? 'بستن توضیحات' : 'محدودیت‌ها و منبع'}</button>
          {showInfo && <p className="mt-3 border-t border-sky-200 pt-3 text-xs leading-6 text-sky-900/80">ضرایب از جداول مدل ساده‌شده در فایل تکمیلی ارائه‌شده استخراج شده‌اند. این نسخه هنوز با خروجی‌های مرجع رسمی AHA به‌طور مستقل تطبیق داده نشده است؛ برای تصمیم‌گیری درمانی به‌تنهایی استفاده نشود.</p>}
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-2 font-bold"><BadgeCheck size={18} className="text-emerald-600" /> حریم خصوصی</div>
          <p className="mt-2 text-sm leading-6 text-slate-500">اطلاعات واردشده به سرور ارسال نمی‌شود و محاسبه داخل مرورگر انجام می‌گیرد.</p>
        </div>
      </aside>
    </main>
    <footer className="border-t border-slate-200 bg-white"><div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-xs leading-5 text-slate-400 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8"><span>PREVENT Calculator · React + JSX + Tailwind CSS</span><span>ابزار پشتیبان تصمیم‌گیری؛ جایگزین قضاوت پزشک نیست.</span></div></footer>
  </div>;
}
