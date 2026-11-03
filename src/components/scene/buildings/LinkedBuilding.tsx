import { useState, type ReactNode } from 'react';
import { Html } from '@react-three/drei';
import { navigate } from '../../../router';

/** 可點擊進入的建築（島嶼選取後顯示名稱標籤）；各島共用 */
export function LinkedBuilding({ route, label, color, position, rotation = 0, labelY, interactive, children }: { route: string; label: string; color: string; position: [number, number, number]; rotation?: number; labelY: number; interactive?: boolean; children: ReactNode }) {
  const [hover, setHover] = useState(false);
  return (
    <group
      position={position}
      onClick={(e) => {
        if (!interactive) return;
        e.stopPropagation();
        if (e.delta > 6) return;
        navigate(route);
      }}
      onPointerOver={(e) => {
        if (!interactive) return;
        e.stopPropagation();
        setHover(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHover(false);
        if (interactive) document.body.style.cursor = 'auto';
      }}
    >
      <group rotation={[0, rotation, 0]} scale={hover ? 1.07 : 1} position={[0, hover ? 0.15 : 0, 0]}>
        {children}
      </group>
      {interactive && (
        <Html position={[0, labelY, 0]} center zIndexRange={[12, 0]}>
          <button
            type="button"
            onClick={() => navigate(route)}
            className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-black shadow-lg ring-2 transition md:text-xs ${hover ? 'scale-110' : 'bg-white/95'}`}
            style={{ background: hover ? color : undefined, color: hover ? '#fff' : color, boxShadow: `0 0 0 2px ${color}55` }}
          >
            {label}
          </button>
        </Html>
      )}
    </group>
  );
}
