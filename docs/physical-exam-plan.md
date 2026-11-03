# PHYSICAL EXAM QUEST（身體檢查島）

> PE-7 是本平台整理的身體檢查教學架構，**不是國考官方 SOP**；各系統操作順序不同（例：腹部常採視 → 聽 → 叩 → 觸，心肺常採視 → 觸 → 叩 → 聽）。
> 六個系統為平台教學分類，不代表國考固定題目。所有教學內容、體表標記與案例**待臨床教師審核**；示範案例標示 DEMO。
> 網頁可練習流程、位置與判讀觀念；正確點擊模型位置**不等同**具備實際身體檢查操作能力。觸診／叩診的力道、手感與流暢度保留教師實體評核。

## 已完成：Phase 1–4

| 建築 | 路由 | 狀態 |
| --- | --- | --- |
| 01 身體檢查 SOP 學院 | `#/exam/academy`、`/academy/pe7`、`/academy/:technique` | PE-7 七階段（標示網頁可記錄／需教師觀察）＋視觸叩聽四手法（目的、情境、操作概念、常見錯誤、注意事項、小遊戲） |
| 02 3D 人體解剖探索館 | `#/exam/anatomy`、`/anatomy/locate` | 可旋轉、縮放、點擊的 3D 人體；正面／側面／背面；腹部四象限、九分區、胸前與背側區域、體表參考線、體表標記；Game 2 人體定位挑戰 |
| 03 身體檢查實作館 | `#/exam/practice`、`/practice/:system`、`/practice/sequence/:id` | 六系統入口（腹部建置中，其餘規劃中）；Game 1 檢查流程排序（拖曳或 ▲▼） |
| 04 異常徵象辨識館 | `#/exam/signs` | 規劃中（列出建置前需要的授權素材與審核） |
| 05 Virtual SP 模擬診間 | `#/exam/vsp` | 規劃中（腹部 DEMO 關卡，Phase 5） |
| 06 OSCE 身體檢查挑戰館 | `#/exam/challenge` | 規劃中；已列出示範評量構面與可觀察性 |

3D 島嶼：六棟建築皆可點擊進入（`PhysicalExamBuildings.tsx`，共用 `LinkedBuilding`）。

## 3D 人體與體表定位

- `anatomy/body.ts`：以「體型剖面表」產生連續曲面的教學示意人體（非 sphere／capsule 拼湊；非解剖精確模型），身高約 1.70 m。
- 座標：公尺、y 向上、模型面向 +z、**x < 0 為病人右側**。
- `data/anatomyModel.ts`：AnatomicalLandmark（定義、判定半徑、相關檢查、參考來源、審核狀態）、AnatomicalRegion、SurfaceLine。
- `anatomy/identify.ts`：點擊 → 部位、前／背側、左右側、所在區域、最近體表標記；`checkTask` 判定定位題（含左右側提示：正面與背面的說明不同）。
- 若改用授權的 3D 人體模型（GLB），需依新模型重新校正所有標記座標並經教師確認。

## 資料架構（`src/features/exam/`）

PhysicalExamRegistry（`data/systems.ts`）、PhysicalExamSOP（`data/pe7.ts`）、TechniqueLesson（`data/techniques.ts`）、AnatomyModel／AnatomicalLandmark（`data/anatomyModel.ts`）、ExaminationTool／AuscultationSound／PhysicalExamRubric／PhysicalExamCase（`data/misc.ts`）、ExaminationAction／ExaminationSequence（`data/sequences.ts`）、PhysicalFinding、VirtualPatientResponse、FeedbackReport、DemonstrationTimeline（`types.ts`）。

新增系統：在 `EXAM_SYSTEMS` 註冊，補上 `ExaminationSequence`、定位題、必要的體表標記與案例；不需修改引擎。

## 聲音素材

`SOUNDS` 目前為空：尚未取得經授權並經臨床教師確認的心音／呼吸音／腸音素材，因此不提供聲音，也不以生成聲音冒充真實病理聲音。

## 待辦

- Phase 5：腹部 DEMO 關卡（檢查前準備 → 視診 → 聽診 → 叩診 → 觸診 → 結果整理），需教師確認檢查發現。
- Phase 6：虛擬聽診（授權素材）、叩診與觸診模擬（明確標示網頁無法評估手法品質）。
- Phase 7–9：四種訓練模式與示範播放器、個別化回饋與事件回放、手機與部署測試。
