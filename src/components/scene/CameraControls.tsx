import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import type { IslandConfig } from '../../types/island';
import { DEFAULT_FOCUS_OFFSET, OVERVIEW_CAMERA } from '../../data/islandData';

/** 鏡頭可平移的最大範圍（避免使用者把視角拖離群島） */
const MAX_TARGET_RADIUS = 42;

/**
 * CameraControls
 * - OrbitControls：拖曳旋轉、滾輪 / 雙指縮放、右鍵 / 雙指平移
 * - focus 變更時以指數阻尼平滑飛行到目標島嶼或全景
 * - 使用者開始操作時立即中止自動飛行，避免搶奪控制權
 */
export function CameraControls({ focus }: { focus: IslandConfig | null }) {
  const controls = useRef<OrbitControlsImpl>(null);
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  const aspect = size.width / size.height;
  const isPortrait = aspect < 1;
  const isNarrow = size.width < 768;
  // 全景依畫面比例自動拉遠，確保直式手機也能看到五座島
  const overviewZoom = Math.max(1, (1.6 / aspect) * 0.58);

  const goal = useMemo(() => ({ pos: new THREE.Vector3(), target: new THREE.Vector3() }), []);
  const animating = useRef(true);

  useEffect(() => {
    if (focus) {
      const [x, y, z] = focus.position;
      const [ox, oy, oz] = focus.cameraOffset ?? DEFAULT_FOCUS_OFFSET;
      const zoom = isPortrait ? 1.3 : 1;
      goal.target.set(x, y + 1.5, z);
      // 預留資訊面板空間：桌機面板在右側 → 目標右移；手機面板在下方 → 目標往鏡頭方向移
      if (isNarrow) goal.target.z += 4.5;
      else goal.target.x += 4;
      goal.pos.set(goal.target.x + ox * zoom, goal.target.y + oy * zoom, goal.target.z + oz * zoom);
    } else {
      goal.target.set(...OVERVIEW_CAMERA.target);
      // 桌機左側有導航選單 → 目標左移，讓群島視覺置中於剩餘空間
      if (!isNarrow) goal.target.x -= 4;
      const [px, py, pz] = OVERVIEW_CAMERA.position;
      goal.pos.set(goal.target.x + px * overviewZoom, py * overviewZoom, pz * overviewZoom);
    }
    animating.current = true;
  }, [focus, isPortrait, isNarrow, overviewZoom, goal]);

  // 使用者手動操作時中止動畫
  useEffect(() => {
    const c = controls.current;
    if (!c) return;
    const stop = () => {
      animating.current = false;
    };
    c.addEventListener('start', stop);
    return () => c.removeEventListener('start', stop);
  }, []);

  useFrame((_, dt) => {
    const c = controls.current;
    if (!c) return;
    if (animating.current) {
      const k = 1 - Math.exp(-dt * 2.6);
      camera.position.lerp(goal.pos, k);
      c.target.lerp(goal.target, k);
      if (camera.position.distanceToSquared(goal.pos) < 0.004 && c.target.distanceToSquared(goal.target) < 0.004) {
        animating.current = false;
      }
    }
    // 限制平移範圍
    if (c.target.length() > MAX_TARGET_RADIUS) c.target.setLength(MAX_TARGET_RADIUS);
    if (c.target.y < -1) c.target.y = -1;
    c.update();
  });

  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enableDamping
      dampingFactor={0.08}
      minDistance={9}
      maxDistance={200}
      minPolarAngle={0.15}
      maxPolarAngle={Math.PI / 2.3}
      rotateSpeed={0.7}
      zoomSpeed={0.9}
      panSpeed={0.8}
    />
  );
}
