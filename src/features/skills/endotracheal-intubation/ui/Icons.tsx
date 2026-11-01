/** AIRWAY QUEST 器材圖示（每件器材外型不同，小尺寸也能辨識） */
const tube = (label: string, color: string) => (
  <>
    <path d="M10 54 C 14 30, 30 14, 54 10" fill="none" stroke="#e2e8f0" strokeWidth="7" strokeLinecap="round" />
    <path d="M10 54 C 14 30, 30 14, 54 10" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.7" />
    <ellipse cx="14" cy="44" rx="6" ry="4" fill="#bae6fd" opacity="0.8" transform="rotate(-60 14 44)" />
    <rect x="48" y="4" width="10" height="10" rx="2" fill="#94a3b8" />
    <text x="40" y="46" fontSize="11" fontWeight="800" fill="#0f172a">{label}</text>
  </>
);

const ICONS: Record<string, JSX.Element> = {
  handle: (
    <>
      <rect x="22" y="14" width="18" height="44" rx="6" fill="#94a3b8" stroke="#334155" strokeWidth="1.5" />
      {[22, 28, 34, 40, 46].map((y) => (
        <path key={y} d={`M24 ${y} h14`} stroke="#64748b" />
      ))}
      <rect x="24" y="6" width="14" height="10" rx="2" fill="#475569" />
    </>
  ),
  blade: (
    <>
      <path d="M10 18 h14 v8 h-4 C 24 40, 40 52, 56 52 v6 C 34 58, 16 44, 14 26 h-4 z" fill="#cbd5e1" stroke="#334155" strokeWidth="1.5" />
      <circle cx="44" cy="50" r="3" fill="#fde047" />
    </>
  ),
  ett65: tube('6.5', '#64748b'),
  ett70: tube('7.0', '#0ea5e9'),
  ett75: tube('7.5', '#0284c7'),
  ett80: tube('8.0', '#1e3a8a'),
  stylet: (
    <>
      <path d="M8 56 C 14 34, 30 18, 50 12" fill="none" stroke="#a3a3a3" strokeWidth="3" strokeLinecap="round" />
      <circle cx="52" cy="11" r="4" fill="none" stroke="#525252" strokeWidth="2" />
    </>
  ),
  syringe: (
    <>
      <rect x="8" y="26" width="38" height="12" rx="2" fill="#e0f2fe" stroke="#0369a1" strokeWidth="1.5" />
      <path d="M46 32 h10 M4 22 v20 M4 32 h6" stroke="#0369a1" strokeWidth="2" />
      {[14, 20, 26, 32, 38].map((x) => (
        <path key={x} d={`M${x} 26 v4`} stroke="#0369a1" />
      ))}
      <text x="26" y="52" textAnchor="middle" fontSize="9" fontWeight="800" fill="#0369a1">10mL</text>
    </>
  ),
  bite: (
    <>
      <rect x="14" y="20" width="36" height="24" rx="8" fill="#fde68a" stroke="#a16207" strokeWidth="1.5" />
      <rect x="24" y="26" width="16" height="12" rx="4" fill="#fff" stroke="#a16207" />
    </>
  ),
  ties: (
    <>
      <path d="M6 30 C 20 18, 44 42, 58 30" fill="none" stroke="#f8fafc" strokeWidth="8" strokeLinecap="round" />
      <path d="M6 30 C 20 18, 44 42, 58 30" fill="none" stroke="#94a3b8" strokeWidth="1.5" />
      <path d="M6 44 C 20 32, 44 56, 58 44" fill="none" stroke="#e2e8f0" strokeWidth="6" strokeLinecap="round" />
    </>
  ),
  bvm: (
    <>
      <ellipse cx="38" cy="24" rx="20" ry="13" fill="#bfdbfe" stroke="#1d4ed8" strokeWidth="1.5" />
      <rect x="14" y="20" width="8" height="8" rx="2" fill="#1d4ed8" />
      <path d="M10 24 h4 M10 24 v18" stroke="#1d4ed8" strokeWidth="3" />
      <path d="M2 42 L18 42 L14 56 L6 56 Z" fill="#e0f2fe" stroke="#1d4ed8" strokeWidth="1.5" />
    </>
  ),
  oralAirway: (
    <>
      <path d="M14 14 h18 v6 h-4 C 28 34, 40 46, 52 48 l-2 6 C 34 52, 22 38, 22 20 h-8 z" fill="#fef9c3" stroke="#a16207" strokeWidth="1.5" />
    </>
  ),
  towel: (
    <>
      <rect x="8" y="24" width="48" height="18" rx="9" fill="#a7f3d0" stroke="#047857" strokeWidth="1.5" />
      <ellipse cx="17" cy="33" rx="5" ry="8" fill="#6ee7b7" stroke="#047857" />
    </>
  ),
  stethoscope: (
    <>
      <path d="M18 8 v16 a12 12 0 0 0 24 0 v-16" fill="none" stroke="#334155" strokeWidth="3" />
      <path d="M30 36 v8 a8 8 0 0 0 16 0" fill="none" stroke="#334155" strokeWidth="3" />
      <circle cx="46" cy="44" r="7" fill="#94a3b8" stroke="#334155" strokeWidth="2" />
    </>
  ),
  drapeCloth: (
    <>
      <rect x="8" y="12" width="48" height="40" rx="3" fill="#4ade80" stroke="#15803d" strokeWidth="1.5" />
      <path d="M8 32 h48 M32 12 v40" stroke="#22c55e" />
    </>
  ),
  lube: (
    <>
      <path d="M14 20 L48 14 L52 46 L18 52 Z" fill="#dcfce7" stroke="#15803d" strokeWidth="1.5" />
      <path d="M48 14 l8 -2 l2 10 l-8 2" fill="#86efac" stroke="#15803d" />
      <text x="33" y="37" textAnchor="middle" fontSize="7" fontWeight="800" fill="#15803d" transform="rotate(-9 33 37)">LUBE</text>
    </>
  ),
  gloves: (
    <path d="M18 56 V34 l-4 -14 a3 3 0 0 1 6 -1 l4 12 V12 a3 3 0 0 1 6 0 v18 V9 a3 3 0 0 1 6 0 v21 V12 a3 3 0 0 1 6 0 v24 l4 -7 a3 3 0 0 1 5 3 l-7 16 v8 z" fill="#c7d2fe" stroke="#4338ca" strokeWidth="1.6" />
  ),
  handRub: (
    <>
      <path d="M22 10 h14 v6 h8" fill="none" stroke="#475569" strokeWidth="3" />
      <rect x="20" y="16" width="20" height="8" fill="#94a3b8" />
      <path d="M16 24 h28 v30 a4 4 0 0 1 -4 4 h-20 a4 4 0 0 1 -4 -4 z" fill="#dbeafe" stroke="#1d4ed8" strokeWidth="1.5" />
    </>
  ),
  capno: (
    <>
      <rect x="6" y="12" width="52" height="40" rx="4" fill="#0f172a" />
      <path d="M10 42 h6 v-18 h12 v18 h6 v-18 h12 v18 h6" fill="none" stroke="#facc15" strokeWidth="2" />
    </>
  ),
};

export function AWIcon({ id, size = 40 }: { id: string; size?: number }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden>
      {ICONS[id] ?? <circle cx="32" cy="32" r="20" fill="#e2e8f0" />}
    </svg>
  );
}
