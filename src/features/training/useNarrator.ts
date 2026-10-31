import { useCallback, useMemo } from 'react';

/** 語音旁白（瀏覽器內建 Web Speech API；不支援時自動略過）：各技能示範共用 */
export function useNarrator() {
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;
  const speak = useCallback(
    (text: string, rate: number) =>
      new Promise<void>((resolve) => {
        if (!supported) return resolve();
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text.replace(/[「」（）]/g, ''));
        u.lang = 'zh-TW';
        u.rate = Math.min(2, 0.95 * rate);
        const voices = window.speechSynthesis.getVoices();
        const voice = voices.find((v) => v.lang.toLowerCase().startsWith('zh-tw')) ?? voices.find((v) => v.lang.toLowerCase().startsWith('zh'));
        if (voice) u.voice = voice;
        u.onend = () => resolve();
        u.onerror = () => resolve();
        window.speechSynthesis.speak(u);
      }),
    [supported],
  );
  const stop = useCallback(() => {
    if (supported) window.speechSynthesis.cancel();
  }, [supported]);
  return useMemo(() => ({ supported, speak, stop }), [supported, speak, stop]);
}
