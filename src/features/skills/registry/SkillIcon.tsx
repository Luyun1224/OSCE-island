/** 八項技能的線條圖示（SVG，小尺寸也清楚可辨識） */
const ICONS: Record<string, JSX.Element> = {
  suture: (
    <>
      <path d="M10 44 C 18 30, 30 30, 38 22" />
      <path d="M38 22 C 44 16, 50 16, 54 20" strokeDasharray="0" />
      <path d="M12 52 l 6 -6 M20 54 l 6 -6 M28 56 l 6 -6" />
      <path d="M8 40 Q 30 62 56 30" className="opacity-40" />
      <path d="M46 10 a 10 10 0 0 1 10 10" />
      <circle cx="46" cy="10" r="2" fill="currentColor" />
    </>
  ),
  catheter: (
    <>
      <path d="M14 8 v 22 c 0 12 10 16 18 16 h 6" />
      <circle cx="14" cy="8" r="3" />
      <path d="M38 40 h 10 a 6 6 0 0 1 0 12 h -10 z" />
      <path d="M44 52 v 6" />
    </>
  ),
  speculum: (
    <>
      <path d="M10 22 h 30 l 12 -6" />
      <path d="M10 30 h 30 l 12 6" />
      <path d="M18 30 v 20 h 8 v -20" />
      <circle cx="22" cy="46" r="2" fill="currentColor" />
    </>
  ),
  laryngoscope: (
    <>
      <rect x="10" y="10" width="10" height="30" rx="4" />
      <path d="M20 14 h 8 c 14 0 22 12 24 30" />
      <circle cx="50" cy="46" r="3" fill="currentColor" />
      <path d="M12 46 h 6" />
    </>
  ),
  abg: (
    <>
      <path d="M14 50 l 26 -26" />
      <rect x="22" y="22" width="22" height="10" rx="2" transform="rotate(-45 33 27)" />
      <path d="M40 24 l 12 -12" />
      <path d="M6 54 c 6 -4 12 -4 18 0" />
      <circle cx="14" cy="50" r="2" fill="currentColor" />
    </>
  ),
  iv: (
    <>
      <path d="M8 44 h 24" />
      <rect x="32" y="38" width="14" height="12" rx="3" />
      <path d="M46 44 h 10 M24 38 v -16 M20 22 h 8" />
      <path d="M8 54 c 12 -6 30 -6 48 0" className="opacity-40" />
    </>
  ),
  ecg: (
    <>
      <path d="M4 34 h 12 l 4 -10 l 6 22 l 6 -32 l 6 26 l 4 -6 h 18" />
      <circle cx="14" cy="14" r="3" />
      <circle cx="50" cy="14" r="3" />
    </>
  ),
  ngtube: (
    <>
      <path d="M22 10 c -10 6 -12 18 -8 26 c 3 6 8 8 10 14" />
      <path d="M30 14 c 8 6 8 18 4 28 c -2 6 -2 10 2 14 h 14" />
      <circle cx="52" cy="56" r="3" />
    </>
  ),
};

export function SkillIcon({ name, className = 'h-10 w-10' }: { name: string; className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      {ICONS[name] ?? <circle cx="32" cy="32" r="20" />}
    </svg>
  );
}
