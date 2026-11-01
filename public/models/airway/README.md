# AIRWAY QUEST 高擬真 3D 資產放置處

把符合規格的 GLB 檔放在這個資料夾，推送到 main 後，網站會自動偵測並啟用 3D 場景。
資產沒有放齊之前，3D 視角會自動改用 2D 教學示意圖，並標示「3D 資產待補」。
病人與器械都不會以幾何體拼湊。

完整說明見 `docs/airway-3d-realism-plan.md`。

## 必要（缺一不啟用 3D）

| 檔名 | 內容 | 必備節點／morph |
| --- | --- | --- |
| `airway-trainer.glb` | 成人氣道管理訓練模型：頭頸、上胸、可視雙肺與胃袋，含底板 | 節點 `Head`、`Mouth_Socket`、`Lung_L`、`Lung_R`、`Stomach`；morph `lung_inflate_L`、`lung_inflate_R`、`stomach_inflate` |
| `skills-room.glb` | 臨床技能中心或 OSCE 考站場景：診察台、牆面、地板、櫃體、照明造型 | 診察台檯面中心放在原點；選用錨點 `Cart_Anchor`、`Monitor_Anchor` |

## 選用（有就顯示，沒有就不顯示）

- **呼吸道器材**：
  - `laryngoscope-mac3.glb`：節點 `Handle`、`Blade`、`Light_Socket`
  - `ett-7_5.glb`：morph `cuff_inflate`
  - `stylet.glb`
  - `bvm-adult.glb`：morph `bag_squeeze`
  - `bite-block.glb`
  - `tube-ties.glb`
- **其他耗材與設備**：
  - `syringe-10ml.glb`
  - `stethoscope.glb`
  - `monitor-etco2.glb`：節點 `Screen`
  - `procedure-cart.glb`

## 共同規格

- **格式與座標**：glTF 2.0 二進位（.glb），單位為公尺，Y 軸朝上。
  - 訓練模型的臉朝 +Y、頭頂朝 −Z。
  - 器械的原點放在掛到 `Mouth_Socket` 時應對齊的位置。
- **材質**：PBR Metallic-Roughness，需含 baseColor、normal、roughness/metallic、AO 貼圖。
  - 皮膚與矽膠要有次表面感的顏色變化與細微毛孔或模具紋理，不可為單一平塗色。
- **貼圖**：以 KTX2（Basis）壓縮；網格以 Meshopt 或 Draco 壓縮。
- **容量預算**：
  - 訓練模型 ≤ 60k 三角面、≤ 4 MB。
  - 單一器械 ≤ 15k 三角面、≤ 1 MB。
  - 場景 ≤ 150k 三角面、≤ 8 MB。
- **授權**：需有可公開於網站的使用授權。
  - 不可含未授權的品牌標誌，例如不可直接使用 Laerdal 商標。
