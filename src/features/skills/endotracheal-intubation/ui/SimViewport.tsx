import { lazy, Suspense, useState, type CSSProperties, type ReactNode } from 'react';
import { AUSC_LABEL, REQUIRED_AUSC, type StepId } from '../caseData';
import { breathRate, capnoFinding, type AWState } from '../engine';
import { realistic3DReady, useAirwayAssets } from '../scene/assets';
import type { Scene3DPreset } from '../scene/AirwayScene';
import { AirwayComparison, LaryngoscopeView, TubePositionView } from './views';

const AirwayScene = lazy(() => import('../scene/AirwayScene'));

/**
 * SimViewport：以 3D 臨床場景為核心，疊上 2D／2.5D 醫療資訊介面（HUD）
 * - 3D：病房、病床、病人（資產）、呼吸起伏
 * - 2D HUD：生命徵象、檢驗與影像、呼吸道狀態、確認紀錄、示意圖、功能選單
 * HUD 面板以 CSS 3D（perspective＋些微旋轉）、多層陰影與緩慢漂浮呈現空間感。
 * 教案未提供生命徵象與血液氣體數值，HUD 不顯示任何編造的生理數據。
 */
type Diagram = null | 'tube' | 'scope' | 'compare';

const panel = 'rounded-2xl border border-white/40 bg-slate-900/70 text-white shadow-[0_18px_40px_-12px_rgba(2,6,23,0.65),0_4px_12px_rgba(2,6,23,0.35)] backdrop-blur-md';
const card = 'rounded-2xl border border-white/70 bg-white/90 text-slate-800 shadow-[0_22px_45px_-14px_rgba(15,23,42,0.55),0_6px_14px_rgba(15,23,42,0.25)] backdrop-blur';

function Tilt({ children, style, className }: { children: ReactNode; style?: CSSProperties; className?: string }) {
  return (
    <div className={`pointer-events-auto [transform-style:preserve-3d] ${className ?? ''}`} style={style}>
      {children}
    </div>
  );
}

function Vital({ label, value, unit, color }: { label: string; value: string; unit?: string; color: string }) {
  return (
    <div className="flex items-baseline justify-between gap-2 border-b border-white/10 py-1 last:border-0">
      <span className="text-[10px] font-bold leading-tight" style={{ color }}>
        {label}
      </span>
      <span className="font-mono text-xl font-black tabular-nums" style={{ color }}>
        {value}
        {unit && <span className="ml-0.5 text-[9px] font-medium text-white/50">{unit}</span>}
      </span>
    </div>
  );
}

function Dock({ icon, label, onClick, active }: { icon: string; label: string; onClick: () => void; active?: boolean }) {
  return (
    <button type="button" onClick={onClick} className="pointer-events-auto flex shrink-0 flex-col items-center gap-1">
      <span className={`flex h-11 w-11 items-center justify-center rounded-full text-lg shadow-[0_8px_18px_-6px_rgba(2,6,23,0.6)] ring-2 transition hover:-translate-y-0.5 md:h-12 md:w-12 ${active ? 'bg-indigo-600 text-white ring-indigo-300' : 'bg-white/95 text-slate-700 ring-white/70'}`}>{icon}</span>
      <span className="text-[10px] font-bold text-white drop-shadow md:text-[11px]">{label}</span>
    </button>
  );
}

export function SimViewport({
  state,
  showHints,
  stepTitle,
  onStep,
  onVerbal,
  onDemo,
  className,
}: {
  state: AWState;
  showHints: boolean;
  stepTitle: string;
  onStep: (s: StepId) => void;
  onVerbal: () => void;
  onDemo?: () => void;
  className?: string;
}) {
  const [preset, setPreset] = useState<Scene3DPreset>('panorama');
  const [diagram, setDiagram] = useState<Diagram>(null);
  const assets = useAirwayAssets();
  const [lowPower] = useState(() => window.matchMedia('(max-width: 767px)').matches);
  const a = state.attempt;
  const rate = breathRate(state.preBreaths);
  const reveal = a.confirmed || !!state.final?.confirmed;
  const presets: Scene3DPreset[] = ['panorama', 'airway', 'chest'];

  return (
    <div className={`relative overflow-hidden rounded-3xl bg-slate-300 [perspective:1400px] ${className ?? ''}`}>
      <Suspense fallback={<div className="absolute inset-0 animate-pulse bg-slate-200" />}>
        <AirwayScene state={state} preset={preset} available={assets.state === 'ready' ? assets.available : new Set()} quality={lowPower ? 'low' : 'high'} className="absolute inset-0" />
      </Suspense>
      {/* 邊緣暈影，讓 HUD 與場景分層 */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(15,23,42,0.35)_100%)]" />

      <div className="pointer-events-none absolute inset-0">
        {/* 上方：視角切換與目前階段 */}
        <div className="absolute inset-x-0 top-3 flex justify-center">
          <div className="pointer-events-auto flex items-center gap-1 rounded-full bg-slate-900/70 p-1 shadow-lg backdrop-blur">
            {presets.map((p) => (
              <button key={p} type="button" onClick={() => setPreset(p)} className={`rounded-full px-3 py-1 text-[11px] font-bold ${preset === p ? 'bg-white text-slate-900' : 'text-white/80 hover:text-white'}`}>
                {{ panorama: '全景', airway: '呼吸道', chest: '胸廓' }[p]}
              </button>
            ))}
            <span className="hidden px-2 text-[11px] font-bold text-cyan-200 sm:inline">｜{stepTitle}</span>
          </div>
        </div>

        {assets.state === 'ready' && !realistic3DReady(assets) && (
          <div className="absolute inset-x-0 bottom-[5.6rem] flex justify-center px-3">
            <span className="rounded-full border border-cyan-300/80 bg-slate-900/75 px-3 py-1 text-[11px] font-bold text-cyan-100 shadow-lg backdrop-blur">
              ⏳ 病人 3D 模型待補（patient-adult.glb／airway-trainer.glb）・床上虛線僅為位置與呼吸起伏標記
            </span>
          </div>
        )}

        {/* 左：生命徵象監視器與呼吸道狀態（2.5D 漂浮） */}
        <div className="absolute left-3 top-14 hidden w-48 space-y-3 sm:block md:w-52">
          <Tilt className="animate-float" style={{ transform: 'rotateY(14deg) rotateX(2deg)', transformOrigin: 'left center' }}>
            <div className={`${panel} p-3`}>
              <p className="text-[10px] font-bold tracking-wider text-white/60">生命徵象監視器</p>
              <Vital label="心跳 HR" value="—" unit="/min" color="#4ade80" />
              <Vital label="血壓 BP" value="—/—" unit="mmHg" color="#f87171" />
              <Vital label="SpO₂" value="—" unit="%" color="#38bdf8" />
              <Vital label="通氣速率（你的操作）" value={rate ? rate.toFixed(0) : '—'} unit="/min" color="#fde047" />
              <div className="mt-1 rounded-lg bg-black/40 p-1">
                <p className="text-[9px] font-bold text-cyan-200">ETCO₂ 波形 {a.capno ? '' : '・未連接'}</p>
                <svg viewBox="0 0 160 36" className="h-8 w-full">
                  {a.capno ? (
                    <path d={a.location === 'trachea' ? 'M0 30 h10 l3 -22 h22 l4 22 h12 l3 -22 h22 l4 22 h12 l3 -22 h22 l4 22 h39' : 'M0 30 h40 l4 -6 h8 l4 6 h104'} stroke="#facc15" strokeWidth="2" fill="none" />
                  ) : (
                    <path d="M0 30 H160" stroke="#334155" strokeWidth="1.5" />
                  )}
                </svg>
                {a.capno && <p className="text-[9px] text-amber-200">{capnoFinding(a)}（案例規則・補充）</p>}
              </div>
              <p className="mt-1 text-[9px] leading-snug text-white/50">教案未提供生命徵象數值，不顯示模擬生理數據。</p>
            </div>
          </Tilt>
          <Tilt className="animate-float-slow" style={{ transform: 'rotateY(12deg) translateZ(-20px)', transformOrigin: 'left center' }}>
            <div className={`${panel} space-y-0.5 p-3 text-[11px]`}>
              <p className="text-[10px] font-bold tracking-wider text-white/60">呼吸道狀態</p>
              <p>面罩：{state.mask.placed ? '已放置' : '未放置'}</p>
              <p>喉頭鏡：{state.scopeUse.inserted ? '已置入' : '未置入'}</p>
              <p>氣管內管：{a.location === 'none' ? `未置入（嘗試 ${state.attempts} 次）` : `已置入・第 ${state.attempts} 次`}</p>
              <p>嘴角刻度：{a.depthRead && a.depth !== null ? `${a.depth} cm` : '未確認'}</p>
              <p>cuff：{a.cuffInflated ? '已充氣' : '未充氣'}・固定：{state.secured.tied ? '是' : '否'}</p>
            </div>
          </Tilt>
        </div>

        {/* 右：檢驗與影像、確認紀錄（疊放卡片） */}
        <div className="absolute right-3 top-14 hidden w-56 lg:block">
          <Tilt className="animate-float-slow" style={{ transform: 'rotateY(-14deg) rotateZ(1deg)', transformOrigin: 'right center' }}>
            <div className={`${card} overflow-hidden`}>
              <p className="bg-cyan-600 px-3 py-1.5 text-center text-[12px] font-black text-white">檢驗與影像</p>
              <div className="space-y-1.5 p-3 text-[11px]">
                <p>
                  <b>病人</b>：60 歲男性・165 cm・70 kg
                </p>
                <p>
                  <b>血液氣體分析</b>：報告符合插管條件
                  <span className="block text-[10px] text-slate-500">（教案未提供數值，不另編造）</span>
                </p>
                <p>
                  <b>影像檢查</b>：教案未提供
                </p>
              </div>
            </div>
          </Tilt>
          <Tilt className="-mt-3 ml-6 animate-float" style={{ transform: 'rotateY(-10deg) rotateZ(-2deg) translateZ(30px)', transformOrigin: 'right center' }}>
            <div className={`${card} p-3 text-[11px]`}>
              <p className="text-[10px] font-black tracking-wider text-slate-500">插管後確認紀錄</p>
              <p>胸廓：{a.chestObserved ? '已觀察' : '未觀察'}</p>
              <p>
                五點聽診：{REQUIRED_AUSC.filter((p) => a.ausc.includes(p)).length}/5
                {showHints && a.ausc.length > 0 && <span className="block text-[10px] text-slate-500">{a.ausc.map((p) => AUSC_LABEL[p]).join('、')}</span>}
              </p>
              <p>ETCO₂（補充）：{a.capno ? '已連接' : '未連接'}</p>
            </div>
          </Tilt>
        </div>

        {/* 示意圖浮動卡 */}
        {diagram && (
          <div className="absolute inset-x-3 bottom-24 flex justify-center md:inset-x-auto md:right-64 md:top-14 md:bottom-auto md:w-[26rem]">
            <Tilt className="w-full" style={{ transform: 'rotateY(-8deg) translateZ(40px)' }}>
              <div className={`${card} overflow-hidden`}>
                <div className="flex items-center gap-1 border-b border-slate-200 bg-white/90 p-1.5">
                  {(
                    [
                      ['tube', '矢狀切面'],
                      ['scope', '喉頭鏡視野'],
                      ['compare', '位置比較'],
                    ] as [Diagram, string][]
                  ).map(([d, l]) => (
                    <button key={d} type="button" onClick={() => setDiagram(d)} className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${diagram === d ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                      {l}
                    </button>
                  ))}
                  <button type="button" onClick={() => setDiagram(null)} className="ml-auto px-2 text-lg leading-none text-slate-400">
                    ×
                  </button>
                </div>
                <div className={diagram === 'compare' ? 'max-h-64 overflow-y-auto p-2' : 'aspect-[58/43] p-1'}>
                  {diagram === 'tube' && <TubePositionView attempt={a} reveal={reveal} />}
                  {diagram === 'scope' && (
                    <div className="mx-auto aspect-square h-full">
                      <LaryngoscopeView state={state} showTube />
                    </div>
                  )}
                  {diagram === 'compare' && <AirwayComparison compact />}
                </div>
              </div>
            </Tilt>
          </div>
        )}

        {/* 下：功能選單 */}
        <div className="absolute inset-x-0 bottom-3 flex justify-center px-2">
          <div className="flex max-w-full gap-3 overflow-x-auto rounded-3xl bg-slate-900/35 px-3 py-2 backdrop-blur-sm md:gap-5 md:px-5">
            <Dock icon="🛏️" label="擺位" onClick={() => onStep('position')} />
            <Dock icon="👁️" label="視角" onClick={() => setPreset(presets[(presets.indexOf(preset) + 1) % presets.length])} />
            <Dock icon="🧰" label="器材" onClick={() => onStep('prep')} />
            <Dock icon="🫁" label="通氣" onClick={() => onStep('bvm')} />
            <Dock icon="🔦" label="喉頭鏡" onClick={() => onStep('laryngoscopy')} />
            <Dock icon="🩺" label="確認" onClick={() => onStep('confirm')} />
            <Dock icon="🗣️" label="口述" onClick={onVerbal} />
            <Dock icon="🖼️" label="示意圖" active={!!diagram} onClick={() => setDiagram(diagram ? null : 'tube')} />
            {onDemo && <Dock icon="🎬" label="示範" onClick={onDemo} />}
          </div>
        </div>
      </div>
    </div>
  );
}
