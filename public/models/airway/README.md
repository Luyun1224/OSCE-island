# AIRWAY QUEST 高擬真 3D 資產放置處

把符合規格的 GLB 檔放在這個資料夾，推送到 main 後，網站會自動偵測並放進 3D 病房。
病人資產沒有放入之前，病床上只顯示明確標示的位置標記，HUD 會註明「病人 3D 模型待補」。
病人與器械都不會以幾何體拼湊。

完整說明見 `docs/airway-3d-realism-plan.md`。

## 病人主體（二擇一；都沒有時，病床上只顯示位置標記）

病房與病床已由程式建模（PBR）。病人主體只能使用以下其中一個資產：

| 檔名 | 內容 | 必備節點／morph |
| --- | --- | --- |
| `patient-adult.glb` | 成人病人：真實比例頭頸、肩胸、軀幹、四肢、關節，穿病人服；原點為床墊面中心，頭朝 −Z | 節點 `Head`、`Mouth_Socket`、`Chest`；morph `breath`、`stomach_inflate` |
| `airway-trainer.glb` | 成人氣道管理訓練模型：頭頸、上胸、可視雙肺與胃袋，含底板；原點為床墊面中心 | 節點 `Head`、`Mouth_Socket`、`Lung_L`、`Lung_R`、`Stomach`；morph `lung_inflate_L`、`lung_inflate_R`、`stomach_inflate` |

選用：`hospital-bed.glb`（取代程式建模病床）。

目前已放入「照片浮雕 2.5D」訓練模型（`trainer-photo*.webp/png`），是上表兩個模型都沒有時的替代呈現。
它由使用者提供並確認使用權的訓練模型照片製作，已移除品牌字樣與標誌。

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
