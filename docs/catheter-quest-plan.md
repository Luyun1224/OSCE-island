# CATHETER QUEST｜導尿管置入互動訓練

路徑：群島 → 技能操作島 → 技能訓練中心（`#/island/procedural-skills`）→ 導尿管置入（`#/skill/urinary-catheterization`）

依據《技術操作－導尿管置放.pdf》（告示牌、考生指引、評分表、考官指引、道具耗材、助手須知，共 8 頁）。
本工具是醫學生的模擬學習工具，不是臨床操作授權或臨床決策系統；正式教學內容仍需依院內 SOP、感染管制規範、產品說明與臨床教師審查。

## 1. 傷口縫合關卡可直接重用的模組

| 共用模組 | 位置 | 導尿關卡的用法 |
| --- | --- | --- |
| SkillRegistry | `skills/registry/skillRegistry.ts` | 啟用第二張技能卡，lazy load `CatheterSkill` |
| TrainingMode | `training/modes.ts` | 三種模式設定完全沿用（8 分鐘倒數） |
| InteractionEngine | `training/interactionEngine.ts` | 事件紀錄、計時、暫停、結束、重設 |
| HintSystem／HintPanel | `training/hintSystem.ts`、`components/HintPanel.tsx` | 每階段學習目標、三層提示、「為什麼？」 |
| ProcedureStep（SkillStep） | `training/types.ts` | 12 個階段的資料格式 |
| DragDrop | `components/DragDrop.tsx` | 滑鼠與觸控拖曳（器材、洞巾、導尿管、接頭、廢棄物） |
| AssessmentRubric | `training/assessment.ts` | 新增 `allowedScores`（0／2 項目） |
| FeedbackReport | `components/FeedbackReportView.tsx` | 改為通用：標題、來源、狀態卡、操作順序、比較欄位皆由報告提供 |
| 本機紀錄、Sheet 紀錄 | `training/storage.ts`、`lib/practiceLog.ts` | 開始／完成皆記錄 |

本次新增、可給後續技能共用：

| 新共用模組 | 位置 | 說明 |
| --- | --- | --- |
| SterileFieldManager／ContaminationEventTracker | `training/sterile.ts`、`components/SterileStatusCard.tsx` | 無菌狀態機（未開始→準備中→正常→污染→已辨識→已補救）、污染紀錄、閉合原則手套決策點 |
| HandHygiene | `components/HandHygiene.tsx` | 取乾洗手液＋按住各部位搓揉，由技能引擎判斷完整性 |
| PatientCommunication | `components/PatientCommunication.tsx` | 選項式溝通，可多句、無唯一正解，引導模式即時回饋 |
| PracticeReplay | `components/PracticeReplay.tsx` | 操作歷程回放（自動播放、只看錯誤、點錯誤看說明並重練該段）；傷口縫合報告也自動有此功能 |
| useIsMobile | `training/useIsMobile.ts` | 從傷口縫合抽出 |

沒有沿用：縫合的進針、穿針、打結引擎。導尿關卡有自己的專屬操作元件。

## 2. 導尿關卡專屬模組

```
src/features/skills/urinary-catheterization/
├── CatheterSkill.tsx          情境介紹 → 模式選擇 → 模擬診間 → 回饋報告
├── CatheterSession.tsx        版面：左提示／中操作／右器材車與無菌狀態／下溝通與補救
├── caseData.ts                教學資料：情境、12 階段、耗材表、溝通選項、廢棄物
├── rubricConfig.ts            教案專屬參數（潤滑範圍、水球容量、介面參數、審核狀態）
├── rubric.ts                  14 項評分規準（逐字取自考官指引）＋ evaluate()
├── engine.ts                  互動引擎（純函式 reducer）
├── report.ts                  形成性回饋、狀態卡、操作順序
├── scene/CatheterizationScene.tsx   低多邊形 3D 急診診間（React Three Fiber）
├── stages/                    12 個階段的操作元件
│   ├── InsertStage.tsx        CatheterInsertionSimulator
│   ├── BalloonStage.tsx       BalloonSafetyGate
│   └── ConnectStage.tsx       DrainageBagConnector
└── ui/                        器材圖示、男性導尿模型示意圖、器材工作車
```

- **教學資料與評分邏輯分離**：`caseData` 只有教學文字，`rubric` 只有規準與判分，`rubricConfig` 只有可調參數，`engine` 只有事件。
- **CatheterPositionState**：`none → at-meatus → inserting →（resistance → help）→ inserted`，另有 `urineReturned`、`positioned` 等旗標。皆為教學模擬狀態，由事件推進，不由 3D 位置或滑桿長度判斷。

## 3. 互動流程（12 階段，可自由切換）

| # | 階段 | 互動 | 規準 |
| --- | --- | --- | --- |
| 1 | 說明與安撫 | 選項式對話（來意、安撫、解釋、隱私、確認），病人依規則回應並顯示焦慮度；拉隔簾、戴口罩 | 1 |
| 2 | 操作前手部衛生 | 按壓乾洗手液 → 按住 6 個部位搓揉 → 完整性檢查；在接觸病人前才算 | 2 |
| 3 | 器材準備 | 從工作車拖曳到工作台或無菌區；導尿包四角依序打開；無菌物品選擇放入方式；潤滑劑與優碘選擇倒法；系統不代補 | 3 |
| 4 | 無菌手套 | 閉合原則 4 個決策點；戴上後可測試碰觸床欄、衣物、工作車等非無菌物 | 4 |
| 5 | 消毒 | 取棉枝（6 支）在模型上拖曳，判斷部位、起點、方向、是否回頭 | 5、7 |
| 6 | 鋪洞巾 | 拖曳洞巾對準尿道口；拿起重調會記錄；先後順序自動判斷 | 6、7 |
| 7 | 潤滑 | 沿導尿管拖曳塗抹，計算由尖端起的連續範圍 | 8 |
| 8 | 置入 | 拖尖端到尿道口 → 放大視圖以拖曳／按住／↑↓鍵推進；過快、偏離方向會提醒；模擬阻力事件可選停止並求助；見尿；到達末端 | 9 |
| 9 | 水球與定位 | 安全閘門（見尿＋末端）→ 選工具 → 接水球閥（非引流端）→ 拖曳設定水量 → 輕拉至卡住 | 10 |
| 10 | 尿袋連接與固定 | 取保護蓋方式 → 接頭拖到引流端吸附 → 紙膠拖到大腿／下腹 → 尿袋拖到掛點（四件事分開判斷） | 11、12 |
| 11 | 廢棄物處理 | 脫手套 → 拖曳分類到感染性／一般垃圾桶；整理環境與病人舒適 | 13 |
| 12 | 操作後手部衛生 | 需先脫手套 | 14 |

**污染與補救**

- 隨時可按「我發現污染了」，選擇補救方式：換手套、換導尿管、換導尿包、換尿袋。
- 錯誤選項「擦一擦」會被記錄。
- 引導模式在污染當下彈出說明與補救選擇；自主與挑戰模式只記錄，不揭露。

**安全中止（所有模式）**

以下情況在所有模式都會中止該動作並提供求助選項：

- 以受污染的手套、導尿包或導尿管置入
- 遇阻力選擇強行推進
- 未達模擬定位條件就打水球

## 4. 評分規準對照

- 14 項逐字取自考官指引，每項 0／1／2；第 7、11、12 項依原評分表只有 0／2（`allowedScores: [0, 2]`）。
- 第 1、2、4、5、9、14 項標示「需教師實體評核」：網頁只能以代理指標觀察（語氣、手法、手感）。
- 整體表現 1–5 分保留「尚未評核・由教師評估」，不與 28 分相加。
- 分數一律稱為「模擬形成性評量」。

**教案專屬數值**（保留在 `rubricConfig.ts`，標示待臨床教師審核）

| 項目 | 教案要求 | 備註 |
| --- | --- | --- |
| 潤滑範圍 | 前二分之一，20–25 cm 左右 | 不代表所有導尿管型號皆適用 |
| 水球容量 | 5–10 cc | 實際依產品標示與院內 SOP |

置入速度上限、阻力、見尿與定位的觸發點是介面參數，不是臨床數值。消毒與手部衛生的細部規則同樣標示待感染管制教師審核。

## 5. 公開練習內容與教師評分資料

- 網站是公開的靜態網站：`rubric.ts`、`rubricConfig.ts` 會打包進前端 JavaScript，任何人都可以用瀏覽器檢視。隱藏 UI 不等於保密。
- 目前做法與傷口縫合相同：評分說明逐字顯示於回饋報告。若教案或考官指引不可公開，建議：
  1. 公開版只保留 `caseData.ts`（教學內容）與摘要化的規準標題；
  2. `rubric.ts` 的逐字說明改為摘要，完整版放在院內私有 repo 或以私有建置（環境變數切換）產出教師版；
  3. 真正需要保密的評分資料應放在需登入的後端，而不是前端程式。
- 練習紀錄只送匿名資料到 Google 試算表，見 `docs/practice-log.md`。

## 6. 分階段狀態

| Phase | 內容 | 狀態 |
| --- | --- | --- |
| 1 | 技能卡入口、情境介紹 | ✅ |
| 2 | 模擬診間（3D 總覽＋2D 操作）、器材工作車、病人溝通 | ✅ |
| 3 | 手部衛生、無菌準備、污染狀態追蹤 | ✅ |
| 4 | 消毒、鋪單、潤滑 | ✅ |
| 5 | 置入互動核心與安全狀態 | ✅ |
| 6 | 水球、定位、尿袋連接與固定 | ✅ |
| 7 | 廢棄物、三種模式、評分回饋 | ✅ |
| 8 | 操作回放、手機版、測試 | ✅（回放、手機版面已完成；臨床內容待教師審核） |

## 7. 測試方式

1. 技能訓練中心第二張卡「導尿管置入」顯示已開放，可進入訓練。
2. 以自主模式依正確流程完成 12 階段，報告應為 28／28。
3. 故意犯錯，報告與回放應對應到正確項目：
   - 導尿包由近側先開
   - 戴手套後碰床欄
   - 用擦拭代替更換
   - 污染後嘗試置入（應安全中止）
   - 未見尿就打水球（應被阻擋）
4. 手機寬度（390 px）：工作車在器材準備階段移到操作區上方，觸控拖曳可用。
