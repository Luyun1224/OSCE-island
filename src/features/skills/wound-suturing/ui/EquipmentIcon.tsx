/** 器材圖示（彩色 SVG，強調實物辨識度） */
const ICONS: Record<string, JSX.Element> = {
  sterileWrap: (
    <>
      <rect x="8" y="12" width="32" height="26" rx="3" fill="#a7d7c5" stroke="#3f8f75" strokeWidth="1.5" />
      <path d="M8 12 L24 26 L40 12" fill="#c6e8da" stroke="#3f8f75" strokeWidth="1.5" />
      <rect x="20" y="22" width="8" height="5" rx="1" fill="#f8fafc" stroke="#64748b" />
      <path d="M12 34 h8" stroke="#1e3a8a" strokeWidth="1.5" strokeDasharray="2 2" />
    </>
  ),
  needleSuture: (
    <>
      <rect x="7" y="9" width="34" height="30" rx="3" fill="#e0f2fe" stroke="#0284c7" strokeWidth="1.5" />
      <path d="M14 30 a9 9 0 0 1 18 0" fill="none" stroke="#475569" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M32 30 C 36 22, 30 18, 36 14" fill="none" stroke="#1e40af" strokeWidth="1.4" />
      <path d="M7 15 h34" stroke="#0284c7" strokeDasharray="3 2" />
    </>
  ),
  swabs: (
    <>
      {[0, 6, 12].map((d) => (
        <g key={d} transform={`translate(${d} 0)`}>
          <line x1="14" y1="40" x2="14" y2="16" stroke="#e7c9a0" strokeWidth="2.5" strokeLinecap="round" />
          <ellipse cx="14" cy="13" rx="3.4" ry="5" fill="#fff" stroke="#94a3b8" />
        </g>
      ))}
    </>
  ),
  gauze: (
    <>
      <rect x="9" y="9" width="30" height="30" rx="2" fill="#ffffff" stroke="#94a3b8" strokeWidth="1.5" />
      {[15, 21, 27, 33].map((v) => (
        <g key={v}>
          <line x1={v} y1="10" x2={v} y2="38" stroke="#e2e8f0" />
          <line x1="10" y1={v} x2="38" y2={v} stroke="#e2e8f0" />
        </g>
      ))}
      <text x="24" y="28" textAnchor="middle" fontSize="8" fontWeight="700" fill="#64748b">4×4</text>
    </>
  ),
  antiseptic: (
    <>
      <rect x="14" y="16" width="20" height="26" rx="4" fill="#92400e" />
      <rect x="18" y="8" width="12" height="9" rx="2" fill="#f1f5f9" stroke="#94a3b8" />
      <rect x="16" y="24" width="16" height="10" rx="1.5" fill="#fef3c7" />
      <text x="24" y="31.5" textAnchor="middle" fontSize="6" fontWeight="800" fill="#92400e">消毒</text>
    </>
  ),
  sterileGloves: (
    <>
      <rect x="6" y="10" width="36" height="28" rx="3" fill="#fef9c3" stroke="#ca8a04" strokeWidth="1.5" />
      <path d="M15 33 v-10 l2 -6 2 6 1 -7 2 7 1 -6 2 6 1 -3 v13 z" fill="#fde68a" stroke="#a16207" />
      <path d="M27 33 v-10 l2 -6 2 6 1 -7 2 7 1 -6 2 6 1 -3 v13 z" fill="#fde68a" stroke="#a16207" />
      <text x="24" y="16" textAnchor="middle" fontSize="5" fontWeight="800" fill="#a16207">STERILE</text>
    </>
  ),
  examGloves: (
    <>
      <rect x="8" y="14" width="32" height="24" rx="3" fill="#dbeafe" stroke="#3b82f6" strokeWidth="1.5" />
      <ellipse cx="24" cy="18" rx="8" ry="3" fill="#93c5fd" />
      <path d="M21 18 l1 -6 2 5 2 -6 1 7" fill="#bfdbfe" stroke="#2563eb" />
      <text x="24" y="31" textAnchor="middle" fontSize="6" fontWeight="800" fill="#1d4ed8">檢診</text>
    </>
  ),
  tape: (
    <>
      <circle cx="22" cy="24" r="13" fill="#f8fafc" stroke="#94a3b8" strokeWidth="2" />
      <circle cx="22" cy="24" r="6" fill="#e2e8f0" stroke="#94a3b8" />
      <path d="M34 28 h9 v5 h-9" fill="#f8fafc" stroke="#94a3b8" />
    </>
  ),
  mask: (
    <>
      <rect x="11" y="16" width="26" height="16" rx="5" fill="#bae6fd" stroke="#0ea5e9" strokeWidth="1.5" />
      <path d="M13 21 h22 M13 25 h22" stroke="#7dd3fc" />
      <path d="M11 19 q-6 5 0 10 M37 19 q6 5 0 10" fill="none" stroke="#94a3b8" />
    </>
  ),
  holder: (
    <>
      <circle cx="12" cy="36" r="5" fill="none" stroke="#64748b" strokeWidth="2.4" />
      <circle cx="22" cy="40" r="5" fill="none" stroke="#64748b" strokeWidth="2.4" />
      <path d="M15 32 L36 10 M20 36 L38 12" stroke="#94a3b8" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M36 10 l4 -3" stroke="#475569" strokeWidth="3" strokeLinecap="round" />
    </>
  ),
  forceps: (
    <>
      <path d="M10 40 L38 8" stroke="#94a3b8" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M16 42 L38 8" stroke="#64748b" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M12 32 l3 2 M15 29 l3 2" stroke="#475569" />
    </>
  ),
  scissors: (
    <>
      <circle cx="13" cy="35" r="5" fill="none" stroke="#64748b" strokeWidth="2.4" />
      <circle cx="23" cy="39" r="5" fill="none" stroke="#64748b" strokeWidth="2.4" />
      <path d="M16 31 L38 13 M21 35 L36 9" stroke="#94a3b8" strokeWidth="2.4" strokeLinecap="round" />
    </>
  ),
  fingers: (
    <>
      <path d="M14 42 v-14 l0 -12 a3 3 0 0 1 6 0 v10 v-13 a3 3 0 0 1 6 0 v13 v-11 a3 3 0 0 1 6 0 v13 l3 -4 a3 3 0 0 1 5 3 l-7 13 v2 z" fill="#fde68a" stroke="#a16207" strokeWidth="1.4" />
    </>
  ),
  drape: (
    <>
      <rect x="6" y="8" width="36" height="32" rx="2" fill="#5eb39b" stroke="#2f7a64" strokeWidth="1.5" />
      <circle cx="24" cy="24" r="7" fill="#f3c9a8" stroke="#2f7a64" strokeWidth="1.5" />
    </>
  ),
  sharps: (
    <>
      <path d="M12 16 h24 l-3 26 h-18 z" fill="#facc15" stroke="#a16207" strokeWidth="1.5" />
      <rect x="10" y="10" width="28" height="7" rx="2" fill="#dc2626" />
      <path d="M20 26 l8 8 M28 26 l-8 8" stroke="#a16207" strokeWidth="2" />
    </>
  ),
  infectious: (
    <>
      <path d="M12 16 h24 l-3 26 h-18 z" fill="#ef4444" stroke="#991b1b" strokeWidth="1.5" />
      <rect x="10" y="10" width="28" height="7" rx="2" fill="#b91c1c" />
      <circle cx="24" cy="29" r="5" fill="none" stroke="#fff" strokeWidth="1.6" />
      <circle cx="24" cy="29" r="1.6" fill="#fff" />
    </>
  ),
  general: (
    <>
      <path d="M12 16 h24 l-3 26 h-18 z" fill="#94a3b8" stroke="#475569" strokeWidth="1.5" />
      <rect x="10" y="10" width="28" height="7" rx="2" fill="#64748b" />
      <path d="M20 22 v14 M24 22 v14 M28 22 v14" stroke="#e2e8f0" strokeWidth="1.5" />
    </>
  ),
};

export function EquipmentIcon({ id, size = 44 }: { id: string; size?: number }) {
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} aria-hidden>
      {ICONS[id] ?? <circle cx="24" cy="24" r="14" fill="#cbd5e1" />}
    </svg>
  );
}
