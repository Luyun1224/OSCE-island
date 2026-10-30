import { useEffect, useRef, useState } from 'react';
import { IslandMusic } from '../../audio/islandMusic';
import type { TimeOfDay } from '../scene/timeOfDay';

const KEY_TIME = 'osce-islands:time-of-day';
const KEY_MUSIC = 'osce-islands:music';

const read = <T,>(key: string, fallback: T): T => {
  try {
    const v = window.localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
};
const write = (key: string, v: unknown) => {
  try {
    window.localStorage.setItem(key, JSON.stringify(v));
  } catch {
    // 私密瀏覽等情況略過
  }
};

/** 白天 / 深夜設定（記住使用者上次的選擇） */
export function useTimeOfDayPreference() {
  const [time, setTime] = useState<TimeOfDay>(() => read<TimeOfDay>(KEY_TIME, 'day'));
  useEffect(() => write(KEY_TIME, time), [time]);
  return [time, setTime] as const;
}

/**
 * 群島背景音樂：預設開啟，只在群島頁播放，離開頁面即淡出停止。
 * 瀏覽器規定網頁需在使用者第一次互動後才能發聲：
 * 本次瀏覽已互動過（例如從技能中心返回）→ 立即播放；首次進站 → 在第一次點擊／觸控／按鍵時開始。
 */
function useIslandMusic(theme: TimeOfDay) {
  const music = useRef<IslandMusic | null>(null);
  const pref = read(KEY_MUSIC, { on: true, volume: 0.6 });
  const [on, setOn] = useState(false);
  const [waiting, setWaiting] = useState(pref.on);
  const [volume, setVolume] = useState(pref.volume);
  const wantsOn = useRef(pref.on);
  const latest = useRef({ theme, volume });
  latest.current = { theme, volume };

  const get = () => (music.current ??= new IslandMusic());

  useEffect(() => {
    const play = () => {
      if (!wantsOn.current || music.current?.playing) return;
      const m = get();
      m.setTheme(latest.current.theme);
      m.setVolume(latest.current.volume);
      m.start().then(() => {
        setOn(true);
        setWaiting(false);
      });
    };
    const onGesture = (e: Event) => {
      // 點的是音樂按鈕本身時交給按鈕處理，避免一開一關互相抵銷
      if ((e.target as Element | null)?.closest?.('[data-music-toggle]')) return;
      play();
      removeGesture();
    };
    const removeGesture = () => {
      window.removeEventListener('pointerdown', onGesture);
      window.removeEventListener('keydown', onGesture);
    };
    const activated = (navigator as Navigator & { userActivation?: { hasBeenActive: boolean } }).userActivation?.hasBeenActive;
    if (wantsOn.current && activated) play();
    else if (wantsOn.current) {
      window.addEventListener('pointerdown', onGesture);
      window.addEventListener('keydown', onGesture);
    }
    const vis = () => music.current?.suspend(document.hidden);
    document.addEventListener('visibilitychange', vis);
    return () => {
      removeGesture();
      document.removeEventListener('visibilitychange', vis);
      music.current?.dispose();
      music.current = null;
    };
  }, []);

  useEffect(() => music.current?.setTheme(theme), [theme]);
  useEffect(() => {
    music.current?.setVolume(volume);
    write(KEY_MUSIC, { on: wantsOn.current, volume });
  }, [volume]);

  const toggle = async () => {
    const m = get();
    if (m.playing) {
      m.stop();
      setOn(false);
      wantsOn.current = false;
    } else {
      m.setTheme(theme);
      m.setVolume(volume);
      await m.start();
      setOn(true);
      wantsOn.current = true;
    }
    setWaiting(false);
    write(KEY_MUSIC, { on: wantsOn.current, volume });
  };

  return { supported: IslandMusic.supported(), on, waiting, toggle, volume, setVolume };
}

export function SceneControls({ time, onTime }: { time: TimeOfDay; onTime: (t: TimeOfDay) => void }) {
  const music = useIslandMusic(time);
  const [showVol, setShowVol] = useState(false);
  const night = time === 'night';
  const panel = night ? 'bg-slate-900/70 text-slate-100 ring-white/10' : 'bg-white/75 text-slate-700 ring-white/60';

  return (
    <div className={`pointer-events-auto flex items-center gap-1 rounded-2xl p-1 shadow-glass ring-1 backdrop-blur-md ${panel}`}>
      <div className={`flex rounded-xl p-0.5 ${night ? 'bg-white/10' : 'bg-slate-100'}`} role="group" aria-label="時段">
        {(
          [
            ['day', '☀️', '白天'],
            ['night', '🌙', '深夜'],
          ] as const
        ).map(([t, icon, label]) => (
          <button
            key={t}
            type="button"
            onClick={() => onTime(t)}
            aria-pressed={time === t}
            className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[12px] font-bold transition ${
              time === t ? (night ? 'bg-indigo-500 text-white shadow' : 'bg-white text-amber-600 shadow') : 'opacity-70 hover:opacity-100'
            }`}
          >
            <span>{icon}</span>
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>
      {music.supported && (
        <>
          <button
            type="button"
            onClick={music.toggle}
            data-music-toggle
            aria-pressed={music.on}
            title={music.on ? '關閉背景音樂' : '播放背景音樂'}
            className={`flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-[12px] font-bold transition ${music.on ? (night ? 'bg-indigo-500 text-white' : 'bg-sky-500 text-white') : 'hover:bg-black/5'}`}
          >
            <span className={music.on ? 'animate-pulse' : ''}>{music.on ? '🎵' : '🔇'}</span>
            <span className="hidden sm:inline">{music.on ? '音樂開' : '音樂'}</span>
          </button>
          {music.waiting && !music.on && (
            <span className="hidden animate-pulse whitespace-nowrap px-1 text-[11px] font-bold sm:inline">點一下畫面即播放</span>
          )}
          <button type="button" onClick={() => setShowVol((v) => !v)} aria-label="音量" className="rounded-xl px-2 py-1.5 text-[12px] hover:bg-black/5">
            🔊
          </button>
          {showVol && (
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={music.volume}
              onChange={(e) => music.setVolume(Number(e.target.value))}
              aria-label="音樂音量"
              className="w-20 accent-sky-500 md:w-24"
            />
          )}
        </>
      )}
    </div>
  );
}
