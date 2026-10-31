import { navigate } from '../../../router';
import { HQShell } from '../components/Shell';

const FEATURES = [
  ['自由選擇問診方向', '開場、主訴、現病史、相關病史、病情說明之間自由切換，不強迫固定順序。'],
  ['分支式追問', '依病人的回答解鎖下一個追問，例如問了週期才會出現持續天數。'],
  ['動態 SP 提問', '病人會在合適的時機提出疑問，例如聽到治療建議後詢問副作用。'],
  ['病歷資料板', '自動記錄：已取得、回答不完整、尚未詢問、教案未提供明確答案。'],
  ['檢驗報告面板', '可點擊各項檢驗查看基本意義；挑戰模式不提前揭露診斷。'],
  ['三種模式與個別化回饋', '引導式、自主問診、8 分鐘 OSCE 模擬挑戰，共用同一份案例資料。'],
];

/** 03 虛擬病人診間（Phase 4 起建置） */
export function ClinicPage() {
  return (
    <HQShell crumbs={[{ label: 'HISTORY QUEST', to: '/history' }, { label: '03 虛擬病人診間' }]}>
      <header className="rounded-[2rem] bg-gradient-to-br from-blue-700 to-sky-500 p-6 text-white shadow-glass md:p-8">
        <p className="text-[12px] font-black tracking-[0.25em] text-sky-100">03｜VIRTUAL PATIENT CLINIC</p>
        <h1 className="mt-1 text-3xl font-black">虛擬病人診間</h1>
        <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-sky-50">選擇病例，與虛擬標準化病人進行問診、判讀檢驗、說明病情並回應病人的疑問。</p>
        <span className="mt-3 inline-block rounded-full bg-white/20 px-3 py-1 text-[12px] font-bold">🚧 建置中：預計 Phase 4–7 開放</span>
      </header>

      <section className="mt-5">
        <h2 className="text-lg font-black text-slate-800">病例清單</h2>
        <div className="mt-3 grid gap-4 md:grid-cols-2">
          <article className="rounded-3xl bg-white/90 p-5 shadow-sm ring-1 ring-slate-100">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[11px] font-black tracking-widest text-blue-600">CASE 001</p>
                <h3 className="text-xl font-black text-slate-800">頭暈與呼吸喘</h3>
                <p className="text-[13px] text-slate-500">門診・8 分鐘・病史詢問 ＋ 病情解釋</p>
              </div>
              <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-500">🚧 尚未開放</span>
            </div>
            <ul className="mt-3 space-y-1 text-[13px] text-slate-600">
              <li>• 教案資料架構與匯入流程設計完成，案例內容建置中</li>
              <li>• 正式教案含考官指引與 SP 劇本，需經管理者確認公開授權範圍後才會上線</li>
              <li>• 評分規準與題目對應需經教師審核</li>
            </ul>
          </article>
          <article className="flex flex-col justify-center rounded-3xl border-2 border-dashed border-slate-200 p-5 text-center text-slate-400">
            <p className="text-3xl">＋</p>
            <p className="mt-1 text-sm font-bold">更多病例規劃中</p>
            <p className="text-[12px]">胸痛、腹痛、呼吸困難……新增病例只需新增案例資料包，不需重新開發問診引擎。</p>
          </article>
        </div>
      </section>

      <section className="mt-6 rounded-3xl bg-white/90 p-5 shadow-sm ring-1 ring-slate-100">
        <h2 className="text-lg font-black text-slate-800">診間將提供的功能</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {FEATURES.map(([t, d]) => (
            <div key={t} className="rounded-2xl bg-slate-50 p-3">
              <p className="text-[14px] font-bold text-slate-800">{t}</p>
              <p className="text-[13px] text-slate-600">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-3xl bg-teal-700 p-5 text-white">
        <p className="text-[14px] font-bold">在診間開放之前，建議先完成 SOP 學院與訓練場，打好問診基礎。</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" onClick={() => navigate('/history/academy')} className="rounded-2xl bg-white px-4 py-2 text-sm font-bold text-teal-800">
            前往 SOP 學院 →
          </button>
          <button type="button" onClick={() => navigate('/history/lab')} className="rounded-2xl bg-white/15 px-4 py-2 text-sm font-bold">
            前往訓練場 →
          </button>
        </div>
      </section>
    </HQShell>
  );
}
