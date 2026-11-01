import { useTexture } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import { SRGBColorSpace, type MeshStandardMaterial, type WebGLProgramParametersWithUniforms } from 'three';
import { assetUrl } from './assets';

/**
 * 照片浮雕（2.5D）訓練模型
 * 以使用者提供的氣道管理訓練模型照片（已移除品牌字樣與標誌）為表面貼圖，
 * 搭配依頭、頸、胸殼、雙肺位置繪製的高度圖（displacement）與法線圖。
 * 俯視時接近照片，斜看時有基本立體感；這不是完整 3D 模型，畫面上會明確標示。
 * 呼吸：肺部遮罩（R＝病人右肺、G＝病人左肺、B＝胃袋）在 shader 中依案例規則鼓起。
 */
export const RELIEF_SIZE = { length: 0.95, width: 0.95 * (747 / 1448) };

export function PhotoRelief({ position, breath }: { position: [number, number, number]; breath: () => { r: number; l: number; s: number } }) {
  const [map, height, normal, lungs, shadow] = useTexture([assetUrl('trainer-photo.webp'), assetUrl('trainer-photo-height.png'), assetUrl('trainer-photo-normal.png'), assetUrl('trainer-photo-lungs.png'), assetUrl('trainer-photo-shadow.png')]);
  map.colorSpace = SRGBColorSpace;
  map.anisotropy = 8;
  const uniforms = useRef({ lungMap: { value: lungs }, lungR: { value: 0 }, lungL: { value: 0 }, stomach: { value: 0 }, lungScale: { value: 0.035 } });
  const onBeforeCompile = useMemo(
    () => (shader: WebGLProgramParametersWithUniforms) => {
      Object.assign(shader.uniforms, uniforms.current);
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', '#include <common>\nuniform sampler2D lungMap;\nuniform float lungR;\nuniform float lungL;\nuniform float stomach;\nuniform float lungScale;')
        .replace(
          '#include <displacementmap_vertex>',
          '#include <displacementmap_vertex>\n#ifdef USE_DISPLACEMENTMAP\n vec3 lm = texture2D( lungMap, vDisplacementMapUv ).rgb;\n transformed += normalize( objectNormal ) * ( lm.r * lungR + lm.g * lungL + lm.b * stomach ) * lungScale;\n#endif',
        );
    },
    [],
  );
  const mat = useRef<MeshStandardMaterial>(null);
  useFrame(() => {
    const b = breath();
    uniforms.current.lungR.value = b.r;
    uniforms.current.lungL.value = b.l;
    uniforms.current.stomach.value = b.s;
  });
  return (
    // 照片左側（頭）朝床頭 −Z；照片下方（病人右側）朝 −X
    <group position={position} rotation={[0, -Math.PI / 2, 0]}>
      {/* 接觸陰影（由照片輪廓模糊產生） */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.012, -0.002, 0.012]}>
        <planeGeometry args={[RELIEF_SIZE.length * (1568 / 1448), RELIEF_SIZE.width * (867 / 747)]} />
        <meshBasicMaterial map={shadow} transparent depthWrite={false} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[RELIEF_SIZE.length, RELIEF_SIZE.width, 360, 190]} />
        <meshStandardMaterial
          ref={mat}
          map={map}
          displacementMap={height}
          displacementScale={0.14}
          normalMap={normal}
          normalScale-x={0.35}
          normalScale-y={0.35}
          roughness={0.62}
          envMapIntensity={0.55}
          transparent
          alphaTest={0.5}
          onBeforeCompile={onBeforeCompile}
        />
      </mesh>
    </group>
  );
}
