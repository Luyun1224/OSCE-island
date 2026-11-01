import { useEffect, useState } from 'react';

/**
 * AIRWAY QUEST 高擬真 3D 資產清單（medical-grade realistic simulation）
 *
 * 原則：病人／訓練模型與醫療器械「不得」以 sphere、cylinder、box 等基本幾何體拼湊。
 * 缺少病人資產時，3D 病房仍顯示（建築與病床依真實尺寸程式建模＋PBR），病人位置以明確標示的「模型待補」輪廓代替。
 * 檔案放在 public/models/airway/，規格見 docs/airway-3d-realism-plan.md 與 public/models/airway/README.md。
 */
export interface AssetSpec {
  id: string;
  file: string;
  label: string;
  /** 缺少時 3D 場景不可啟用 */
  required: boolean;
  /** GLB 內必須具備的節點名稱（掛載點、可動部位） */
  nodes?: string[];
  /** 選用的 morph target（依案例規則驅動） */
  morphs?: string[];
}

export const AIRWAY_ASSETS: AssetSpec[] = [
  {
    id: 'patient',
    file: 'patient-adult.glb',
    label: '成人病人（真實比例頭頸、肩胸、軀幹、四肢；穿病人服）',
    required: false,
    nodes: ['Head', 'Mouth_Socket', 'Chest'],
    morphs: ['breath', 'stomach_inflate'],
  },
  {
    id: 'trainer',
    file: 'airway-trainer.glb',
    label: '成人氣道管理訓練模型（頭頸、上胸、可視雙肺與胃袋，含底板）',
    required: false,
    nodes: ['Head', 'Mouth_Socket', 'Lung_L', 'Lung_R', 'Stomach'],
    morphs: ['lung_inflate_L', 'lung_inflate_R', 'stomach_inflate'],
  },
  {
    id: 'trainerPhoto',
    file: 'trainer-photo.webp',
    label: '氣道管理訓練模型照片浮雕（2.5D；照片＋高度圖＋法線圖＋肺部遮罩，已移除品牌字樣）',
    required: false,
  },
  { id: 'bed', file: 'hospital-bed.glb', label: '急診病床（可取代程式建模的病床）', required: false },
  { id: 'laryngoscope', file: 'laryngoscope-mac3.glb', label: 'Macintosh 喉頭鏡（握把＋葉片，可分離）', required: false, nodes: ['Handle', 'Blade', 'Light_Socket'] },
  { id: 'ett', file: 'ett-7_5.glb', label: '氣管內管 ID 7.5（含 15 mm 接頭、pilot balloon、cuff 可充氣）', required: false, morphs: ['cuff_inflate'] },
  { id: 'stylet', file: 'stylet.glb', label: '插管通條', required: false },
  { id: 'bvm', file: 'bvm-adult.glb', label: '成人袋瓣罩（面罩、袋體、儲氧袋）', required: false, morphs: ['bag_squeeze'] },
  { id: 'syringe', file: 'syringe-10ml.glb', label: '10 mL 空針', required: false },
  { id: 'bite', file: 'bite-block.glb', label: '咬口器', required: false },
  { id: 'ties', file: 'tube-ties.glb', label: '固定繩／固定膠帶', required: false },
  { id: 'stethoscope', file: 'stethoscope.glb', label: '聽診器', required: false },
  { id: 'monitor', file: 'monitor-etco2.glb', label: '生理監視器（含 ETCO₂ 波形螢幕材質）', required: false, nodes: ['Screen'] },
  { id: 'cart', file: 'procedure-cart.glb', label: '換藥車／器材車（含器材盤）', required: false },
];

export const assetUrl = (file: string) => `${import.meta.env.BASE_URL}models/airway/${file}`;

export type AssetStatus = { state: 'checking' } | { state: 'ready'; available: Set<string>; missing: AssetSpec[] };

let cache: Promise<Set<string>> | null = null;

/** 以 HEAD 請求檢查哪些資產已放入網站（結果快取） */
function probe(): Promise<Set<string>> {
  if (!cache)
    cache = Promise.all(
      AIRWAY_ASSETS.map((a) =>
        fetch(assetUrl(a.file), { method: 'HEAD' })
          .then((r) => (r.ok && !(r.headers.get('content-type') ?? '').includes('text/html') ? a.id : null))
          .catch(() => null),
      ),
    ).then((ids) => new Set(ids.filter((x): x is string => !!x)));
  return cache;
}

export function useAirwayAssets(): AssetStatus {
  const [st, setSt] = useState<AssetStatus>({ state: 'checking' });
  useEffect(() => {
    let alive = true;
    probe().then((available) => alive && setSt({ state: 'ready', available, missing: AIRWAY_ASSETS.filter((a) => !available.has(a.id)) }));
    return () => {
      alive = false;
    };
  }, []);
  return st;
}

/** 病人主體（真人模型或訓練模型）是否已提供；未提供時 3D 場景只顯示病房、病床與「模型待補」位置標記 */
export const realistic3DReady = (st: AssetStatus) => st.state === 'ready' && (st.available.has('patient') || st.available.has('trainer'));
