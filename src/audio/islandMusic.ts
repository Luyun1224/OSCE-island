/**
 * 群島背景音樂（Web Audio API 即時合成，原創旋律，不需外部音檔）
 * - 白天：輕快的撥弦琶音＋貝斯＋輕沙鈴，約 112 BPM
 * - 深夜：放慢的音樂盒＋柔和和聲墊，約 76 BPM
 * 瀏覽器規定需使用者操作後才能播放聲音，因此由「音樂」按鈕啟動。
 */
export type MusicTheme = 'day' | 'night';

const midi = (n: number) => 440 * Math.pow(2, (n - 69) / 12);

/** 和弦（MIDI 音高）：C – Am – F – G */
const CHORDS: Record<MusicTheme, number[][]> = {
  day: [
    [60, 64, 67],
    [57, 60, 64],
    [53, 57, 60],
    [55, 59, 62],
  ],
  night: [
    [57, 60, 64],
    [53, 57, 60],
    [60, 64, 67],
    [55, 59, 62],
  ],
};

/** 每小節 8 個八分音符的旋律（相對於 C 大調音階的 MIDI，0 為休止） */
const MELODY: Record<MusicTheme, number[][]> = {
  day: [
    [76, 0, 79, 76, 74, 0, 72, 0],
    [72, 0, 76, 0, 74, 72, 69, 0],
    [69, 0, 72, 74, 76, 0, 77, 76],
    [74, 0, 71, 0, 74, 76, 74, 0],
    [76, 79, 0, 81, 79, 0, 76, 0],
    [72, 0, 74, 76, 0, 72, 69, 0],
    [77, 0, 76, 74, 72, 0, 74, 0],
    [74, 76, 74, 0, 71, 0, 72, 0],
  ],
  night: [
    [76, 0, 0, 0, 72, 0, 0, 0],
    [72, 0, 0, 0, 69, 0, 0, 0],
    [67, 0, 0, 72, 0, 0, 76, 0],
    [74, 0, 0, 0, 71, 0, 0, 0],
    [81, 0, 0, 0, 76, 0, 0, 0],
    [77, 0, 0, 0, 72, 0, 0, 0],
    [76, 0, 0, 79, 0, 0, 76, 0],
    [74, 0, 0, 0, 0, 0, 0, 0],
  ],
};

const TEMPO: Record<MusicTheme, number> = { day: 112, night: 76 };

export class IslandMusic {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private filter: BiquadFilterNode | null = null;
  private noise: AudioBuffer | null = null;
  private timer: number | null = null;
  private nextTime = 0;
  private step = 0;
  private theme: MusicTheme = 'day';
  private volume = 0.5;
  playing = false;

  static supported() {
    return typeof window !== 'undefined' && ('AudioContext' in window || 'webkitAudioContext' in window);
  }

  private ensure() {
    if (this.ctx) return this.ctx;
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctor();
    this.filter = ctx.createBiquadFilter();
    this.filter.type = 'lowpass';
    this.filter.frequency.value = this.theme === 'day' ? 6000 : 2200;
    this.master = ctx.createGain();
    this.master.gain.value = 0;
    this.filter.connect(this.master).connect(ctx.destination);
    // 沙鈴用的白噪音
    const len = ctx.sampleRate * 0.2;
    this.noise = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = this.noise.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    this.ctx = ctx;
    return ctx;
  }

  async start() {
    const ctx = this.ensure();
    if (ctx.state === 'suspended') await ctx.resume();
    if (this.playing) return;
    this.playing = true;
    this.nextTime = ctx.currentTime + 0.1;
    this.step = 0;
    this.fadeTo(this.volume * 0.8, 1.2);
    this.timer = window.setInterval(() => this.schedule(), 25);
  }

  stop(fade = 0.6) {
    if (!this.ctx || !this.playing) return;
    this.playing = false;
    this.fadeTo(0, fade);
    const t = this.timer;
    window.setTimeout(() => {
      if (!this.playing && t !== null) window.clearInterval(t);
    }, fade * 1000 + 50);
    this.timer = null;
  }

  dispose() {
    this.stop(0.3);
    const ctx = this.ctx;
    window.setTimeout(() => ctx?.close(), 500);
    this.ctx = null;
  }

  setTheme(theme: MusicTheme) {
    this.theme = theme;
    if (this.filter && this.ctx) this.filter.frequency.setTargetAtTime(theme === 'day' ? 6000 : 2200, this.ctx.currentTime, 0.5);
  }

  setVolume(v: number) {
    this.volume = v;
    if (this.playing) this.fadeTo(v * 0.8, 0.15);
  }

  /** 分頁切到背景時暫停，回來時繼續 */
  suspend(hidden: boolean) {
    if (!this.ctx) return;
    if (hidden) this.ctx.suspend();
    else if (this.playing) this.ctx.resume();
  }

  private fadeTo(v: number, sec: number) {
    if (!this.master || !this.ctx) return;
    const g = this.master.gain;
    g.cancelScheduledValues(this.ctx.currentTime);
    g.setValueAtTime(g.value, this.ctx.currentTime);
    g.linearRampToValueAtTime(v, this.ctx.currentTime + sec);
  }

  private schedule() {
    const ctx = this.ctx;
    if (!ctx || !this.playing) return;
    while (this.nextTime < ctx.currentTime + 0.12) {
      this.playStep(this.step, this.nextTime);
      this.nextTime += 60 / TEMPO[this.theme] / 2; // 八分音符
      this.step = (this.step + 1) % 64;
    }
  }

  private playStep(step: number, t: number) {
    const theme = this.theme;
    const bar = Math.floor(step / 8);
    const beat = step % 8;
    const chord = CHORDS[theme][bar % 4];
    const mel = MELODY[theme][bar][beat];

    if (theme === 'day') {
      // 撥弦琶音：根、五、三、八度循環
      const arp = [chord[0], chord[2], chord[1], chord[2] + 0, chord[0] + 12, chord[2], chord[1], chord[2]];
      this.pluck(midi(arp[beat]), t, 0.11, 0.35);
      if (beat === 0 || beat === 4) this.bass(midi(chord[0] - 12), t, 0.28);
      if (beat === 6) this.bass(midi(chord[0] - 12 + 7), t, 0.14);
      if (beat % 2 === 1) this.shaker(t, 0.05);
      if (mel) this.bell(midi(mel), t, 0.12, 0.6);
    } else {
      if (beat === 0) chord.forEach((n) => this.pad(midi(n), t, 0.05, (60 / TEMPO.night) * 4));
      if (beat % 2 === 0) this.bell(midi(chord[(beat / 2) % 3] + 12), t, 0.05, 1.2);
      if (mel) this.bell(midi(mel), t, 0.1, 1.8);
      if (beat === 0) this.bass(midi(chord[0] - 12), t, 0.16, 1.6);
    }
  }

  private envGain(t: number, peak: number, attack: number, decay: number) {
    const g = this.ctx!.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
    g.connect(this.filter!);
    return g;
  }

  private osc(type: OscillatorType, f: number, t: number, dur: number, out: AudioNode, detune = 0) {
    const o = this.ctx!.createOscillator();
    o.type = type;
    o.frequency.value = f;
    o.detune.value = detune;
    o.connect(out);
    o.start(t);
    o.stop(t + dur + 0.05);
  }

  private pluck(f: number, t: number, vol: number, decay: number) {
    const g = this.envGain(t, vol, 0.005, decay);
    this.osc('triangle', f, t, decay, g);
    this.osc('sine', f * 2, t, decay * 0.6, this.envGain(t, vol * 0.25, 0.004, decay * 0.5));
  }

  private bell(f: number, t: number, vol: number, decay: number) {
    const g = this.envGain(t, vol, 0.004, decay);
    this.osc('sine', f, t, decay, g);
    this.osc('sine', f * 2.76, t, decay * 0.4, this.envGain(t, vol * 0.18, 0.003, decay * 0.35));
  }

  private bass(f: number, t: number, vol: number, decay = 0.4) {
    const g = this.envGain(t, vol, 0.01, decay);
    this.osc('sine', f, t, decay, g);
  }

  private pad(f: number, t: number, vol: number, dur: number) {
    const g = this.envGain(t, vol, dur * 0.35, dur * 0.65);
    this.osc('sine', f, t, dur, g, -6);
    this.osc('sine', f, t, dur, g, 6);
  }

  private shaker(t: number, vol: number) {
    const ctx = this.ctx!;
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 7000;
    const g = this.envGain(t, vol, 0.003, 0.06);
    src.connect(hp).connect(g);
    src.start(t);
    src.stop(t + 0.1);
  }
}
