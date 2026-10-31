/** CATHETER QUEST 器材圖示（SVG，每件器材外型不同，小尺寸也能辨識） */
const ICONS: Record<string, JSX.Element> = {
  kit: (
    <>
      <rect x="8" y="16" width="48" height="34" rx="4" fill="#e0f2fe" stroke="#0369a1" strokeWidth="2" />
      <path d="M8 24 h48" stroke="#0369a1" strokeWidth="1.5" />
      <rect x="14" y="30" width="16" height="12" rx="3" fill="#fde68a" stroke="#b45309" />
      <path d="M36 30 h14 M36 35 h14 M36 40 h10" stroke="#0369a1" strokeWidth="1.5" />
      <text x="32" y="22" textAnchor="middle" fontSize="6" fontWeight="700" fill="#0369a1">STERILE</text>
    </>
  ),
  catheter: (
    <>
      <path d="M10 52 C 10 30, 26 26, 34 20 S 50 10, 54 8" fill="none" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" />
      <path d="M10 52 l-3 6 M10 52 l4 5" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
      <circle cx="54" cy="8" r="3" fill="#fbbf24" stroke="#b45309" />
      <rect x="4" y="44" width="56" height="16" rx="3" fill="none" stroke="#94a3b8" strokeDasharray="3 2" />
    </>
  ),
  gloves: (
    <>
      <path d="M18 56 V34 l-4 -14 a3 3 0 0 1 6 -1 l4 12 V12 a3 3 0 0 1 6 0 v18 V9 a3 3 0 0 1 6 0 v21 V12 a3 3 0 0 1 6 0 v24 l4 -7 a3 3 0 0 1 5 3 l-7 16 v8 z" fill="#fef9c3" stroke="#a16207" strokeWidth="1.6" />
      <text x="32" y="50" textAnchor="middle" fontSize="7" fontWeight="800" fill="#a16207">無菌</text>
    </>
  ),
  examGloves: (
    <>
      <path d="M18 56 V34 l-4 -14 a3 3 0 0 1 6 -1 l4 12 V12 a3 3 0 0 1 6 0 v18 V9 a3 3 0 0 1 6 0 v21 V12 a3 3 0 0 1 6 0 v24 l4 -7 a3 3 0 0 1 5 3 l-7 16 v8 z" fill="#c7d2fe" stroke="#4338ca" strokeWidth="1.6" />
      <text x="32" y="50" textAnchor="middle" fontSize="7" fontWeight="800" fill="#4338ca">檢診</text>
    </>
  ),
  mask: (
    <>
      <path d="M12 24 Q32 16 52 24 V40 Q32 52 12 40 Z" fill="#bae6fd" stroke="#0369a1" strokeWidth="1.6" />
      <path d="M14 30 h36 M14 36 h36" stroke="#0369a1" strokeWidth="1" opacity="0.6" />
      <path d="M12 26 Q4 30 12 38 M52 26 Q60 30 52 38" fill="none" stroke="#64748b" strokeWidth="1.5" />
    </>
  ),
  iodine: (
    <>
      <rect x="22" y="6" width="20" height="8" rx="2" fill="#78350f" />
      <path d="M18 18 h28 v36 a4 4 0 0 1 -4 4 h-20 a4 4 0 0 1 -4 -4 z" fill="#b45309" stroke="#78350f" strokeWidth="1.5" />
      <rect x="22" y="28" width="20" height="14" rx="2" fill="#fef3c7" />
      <text x="32" y="38" textAnchor="middle" fontSize="7" fontWeight="800" fill="#78350f">PVI</text>
    </>
  ),
  saline: (
    <>
      <rect x="24" y="6" width="16" height="8" rx="2" fill="#0284c7" />
      <path d="M18 16 h28 v38 a4 4 0 0 1 -4 4 h-20 a4 4 0 0 1 -4 -4 z" fill="#e0f2fe" stroke="#0284c7" strokeWidth="1.5" />
      <text x="32" y="40" textAnchor="middle" fontSize="7" fontWeight="800" fill="#0369a1">N/S</text>
    </>
  ),
  water: (
    <>
      <path d="M26 6 h12 l-2 10 h-8 z" fill="#cbd5e1" stroke="#64748b" />
      <path d="M22 16 h20 v38 a6 6 0 0 1 -6 6 h-8 a6 6 0 0 1 -6 -6 z" fill="#f1f5f9" stroke="#64748b" strokeWidth="1.5" />
      <text x="32" y="40" textAnchor="middle" fontSize="6.5" fontWeight="800" fill="#475569">D/W</text>
    </>
  ),
  syringe: (
    <>
      <rect x="8" y="26" width="38" height="12" rx="2" fill="#e0f2fe" stroke="#0369a1" strokeWidth="1.5" />
      <rect x="10" y="28" width="26" height="8" fill="#93c5fd" opacity="0.7" />
      <path d="M46 32 h10 M4 22 v20 M4 32 h6" stroke="#0369a1" strokeWidth="2" />
      {[14, 20, 26, 32, 38].map((x) => (
        <path key={x} d={`M${x} 26 v4`} stroke="#0369a1" />
      ))}
    </>
  ),
  jelly: (
    <>
      <path d="M14 20 L48 14 L52 46 L18 52 Z" fill="#dcfce7" stroke="#15803d" strokeWidth="1.5" />
      <path d="M48 14 l8 -2 l2 10 l-8 2" fill="#86efac" stroke="#15803d" />
      <text x="33" y="37" textAnchor="middle" fontSize="7" fontWeight="800" fill="#15803d" transform="rotate(-9 33 37)">JELLY</text>
    </>
  ),
  gauze: (
    <>
      <rect x="12" y="12" width="40" height="40" rx="3" fill="#fff" stroke="#64748b" strokeWidth="1.5" />
      <path d="M12 22 h40 M12 32 h40 M12 42 h40 M22 12 v40 M32 12 v40 M42 12 v40" stroke="#cbd5e1" />
      <text x="32" y="58" textAnchor="middle" fontSize="6" fill="#475569">4×4</text>
    </>
  ),
  bag: (
    <>
      <path d="M16 18 h32 v30 a8 8 0 0 1 -8 8 h-16 a8 8 0 0 1 -8 -8 z" fill="#fefce8" stroke="#a16207" strokeWidth="1.5" />
      <path d="M20 30 h24 M20 38 h24 M20 46 h24" stroke="#ca8a04" opacity="0.5" />
      <path d="M32 18 C 32 8, 46 6, 52 4" fill="none" stroke="#94a3b8" strokeWidth="3" />
      <rect x="50" y="1" width="8" height="6" rx="1" fill="#ef4444" />
    </>
  ),
  tape: (
    <>
      <circle cx="32" cy="32" r="20" fill="#f8fafc" stroke="#64748b" strokeWidth="2" />
      <circle cx="32" cy="32" r="9" fill="#e2e8f0" stroke="#64748b" />
      <path d="M44 46 l14 8 v6 l-16 -8" fill="#f1f5f9" stroke="#64748b" />
      <text x="32" y="22" textAnchor="middle" fontSize="6" fontWeight="800" fill="#475569">3M</text>
    </>
  ),
  swab: (
    <>
      <path d="M12 52 L46 18" stroke="#e2e8f0" strokeWidth="4" strokeLinecap="round" />
      <path d="M12 52 L46 18" stroke="#cbd5e1" strokeWidth="1" />
      <ellipse cx="49" cy="15" rx="7" ry="5" transform="rotate(-45 49 15)" fill="#b45309" />
    </>
  ),
  drape: (
    <>
      <rect x="8" y="8" width="48" height="48" rx="3" fill="#86efac" stroke="#15803d" strokeWidth="1.5" />
      <circle cx="32" cy="32" r="9" fill="#f8fafc" stroke="#15803d" />
    </>
  ),
  tray: (
    <>
      <ellipse cx="32" cy="38" rx="24" ry="12" fill="#e2e8f0" stroke="#475569" strokeWidth="1.5" />
      <ellipse cx="32" cy="34" rx="18" ry="7" fill="#f8fafc" stroke="#94a3b8" />
    </>
  ),
  handRub: (
    <>
      <path d="M22 10 h14 v6 h8" fill="none" stroke="#475569" strokeWidth="3" />
      <rect x="20" y="16" width="20" height="8" fill="#94a3b8" />
      <path d="M16 24 h28 v30 a4 4 0 0 1 -4 4 h-20 a4 4 0 0 1 -4 -4 z" fill="#dbeafe" stroke="#1d4ed8" strokeWidth="1.5" />
      <path d="M22 36 q8 -8 16 0 q-8 8 -16 0" fill="#93c5fd" />
    </>
  ),
  infectious: (
    <>
      <path d="M14 18 h36 l-4 40 h-28 z" fill="#ef4444" stroke="#991b1b" strokeWidth="1.5" />
      <rect x="10" y="12" width="44" height="8" rx="2" fill="#dc2626" stroke="#991b1b" />
      <text x="32" y="44" textAnchor="middle" fontSize="16" fill="#fff">☣</text>
    </>
  ),
  general: (
    <>
      <path d="M14 18 h36 l-4 40 h-28 z" fill="#cbd5e1" stroke="#475569" strokeWidth="1.5" />
      <rect x="10" y="12" width="44" height="8" rx="2" fill="#94a3b8" stroke="#475569" />
      <path d="M26 28 v22 M32 28 v22 M38 28 v22" stroke="#64748b" strokeWidth="2" />
    </>
  ),
};

export function CTIcon({ id, size = 40 }: { id: string; size?: number }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden>
      {ICONS[id] ?? <circle cx="32" cy="32" r="20" fill="#e2e8f0" />}
    </svg>
  );
}
