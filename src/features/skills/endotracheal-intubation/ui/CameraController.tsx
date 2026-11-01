import { lazy, Suspense } from 'react';
import { realistic3DReady, useAirwayAssets } from '../scene/assets';
import type { AWState } from '../engine';
import type { Scene3DPreset } from '../scene/AirwayScene';
import { AirwayComparison, AuscultationMap, ChestView, LaryngoscopeView, TubePositionView } from './views';

const AirwayScene = lazy(() => import('../scene/AirwayScene'));

export type CameraPreset = Scene3DPreset | 'laryngoscope' | 'tube' | 'auscultation' | 'compare';

export const CAMERA_LABEL: Record<CameraPreset, string> = {
  panorama: '全景視角',
  airway: '呼吸道操作視角',
  laryngoscope: '喉頭鏡局部視角',
  tube: '氣管內管位置示意',
  chest: '胸廓觀察視角',
  auscultation: '聽診位置示意',
  compare: '位置比較圖',
};

/**
 * AirwayCameraController：切換 3D 鏡頭與 2D 教學示意視角
 * 3D：全景、呼吸道操作、胸廓；2D：喉頭鏡視野、管路位置、聽診位置（皆標示為教學示意）。
 */
export function AirwayCameraController({ state, preset, onPreset, highlight, revealTube, className }: { state: AWState; preset: CameraPreset; onPreset?: (p: CameraPreset) => void; highlight?: string[]; revealTube: boolean; className?: string }) {
  const assets = useAirwayAssets();
  const ready = realistic3DReady(assets);
  const want3D = preset === 'panorama' || preset === 'airway' || preset === 'chest';
  const is3D = want3D;
  const shown: CameraPreset = preset;
  const a = state.attempt;
  return (
    <div className={`overflow-hidden rounded-3xl bg-white/80 ring-1 ring-indigo-200 ${className ?? ''}`}>
      {onPreset && (
        <div className="flex gap-1 overflow-x-auto border-b border-indigo-100 bg-white/90 p-1.5">
          {(Object.keys(CAMERA_LABEL) as CameraPreset[]).map((p) => (
            <button key={p} type="button" onClick={() => onPreset(p)} className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${p === preset ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              {p === 'panorama' || p === 'airway' || p === 'chest' ? '🎥 ' : '🖼️ '}
              {CAMERA_LABEL[p]}
            </button>
          ))}
        </div>
      )}
      <div className="relative h-64 lg:h-80">
        {is3D ? (
          <Suspense fallback={<div className="h-full animate-pulse bg-indigo-50" />}>
            <AirwayScene state={state} preset={preset as Scene3DPreset} highlight={highlight} available={assets.state === 'ready' ? assets.available : new Set()} className="h-full" />
          </Suspense>
        ) : (
          <div className={`mx-auto h-full p-2 ${shown === 'compare' ? 'max-w-4xl overflow-y-auto' : shown === 'tube' ? 'max-w-xl' : 'max-w-md'}`}>
            {shown === 'laryngoscope' && <LaryngoscopeView state={state} showTube />}
            {shown === 'tube' && <TubePositionView attempt={a} reveal={revealTube} />}
            {shown === 'auscultation' && <AuscultationMap checked={a.ausc} wrong={a.wrongAusc} labels />}
            {shown === 'compare' && <AirwayComparison compact />}
          </div>
        )}
        {want3D && !ready && assets.state === 'ready' && (
          <span className="pointer-events-none absolute right-2 top-2 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-900 ring-1 ring-amber-300">病人 3D 模型待補</span>
        )}
        {preset === 'chest' && is3D && (
          <div className="pointer-events-none absolute bottom-2 right-2 h-24 w-32 rounded-xl bg-white/90 p-1 shadow">
            <ChestView attempt={a.location !== 'none' ? a : undefined} preRise={state.preRise > 0} animate={false} />
          </div>
        )}
        <span className="pointer-events-none absolute left-2 top-2 rounded-full bg-slate-900/70 px-2 py-0.5 text-[10px] font-bold text-white">{CAMERA_LABEL[preset]}</span>
      </div>
    </div>
  );
}
