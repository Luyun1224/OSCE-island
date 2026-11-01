import { useEffect, useState } from 'react';

/**
 * AIRWAY QUEST 高擬真 3D 資產清單（medical-grade realistic simulation）
 *
 * 原則：病人／訓練模型與醫療器械「不得」以 sphere、cylinder、box 等基本幾何體拼湊。
 * 缺少資產時，3D 視角不顯示病人主體，而是改用 2D 教學示意圖並標示「3D 資產待補」。
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
    id: 'trainer',
    file: 'airway-trainer.glb',
    label: '成人氣道管理訓練模型（頭頸、上胸、可視雙肺與胃袋，含底板）',
    required: true,
    nodes: ['Head', 'Mouth_Socket', 'Lung_L', 'Lung_R', 'Stomach'],
    morphs: ['lung_inflate_L', 'lung_inflate_R', 'stomach_inflate'],
  },
  { id: 'room', file: 'skills-room.glb', label: '臨床技能中心／OSCE 考站場景（含診察台、牆面、地板、照明）', required: true, nodes: ['Trainer_Anchor', 'Cart_Anchor', 'Monitor_Anchor'] },
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

/** 必要資產齊全才啟用 3D 場景 */
export const realistic3DReady = (st: AssetStatus) => st.state === 'ready' && AIRWAY_ASSETS.filter((a) => a.required).every((a) => st.available.has(a.id));
