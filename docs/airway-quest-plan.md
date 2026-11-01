# AIRWAY QUEST｜氣管內管插管互動模擬訓練

路徑：技能訓練中心 → 氣管內管插管（`#/skill/endotracheal-intubation`）

依據《氣管插管(1).pdf》（告示牌、考生指引、評分表、考官指引、道具耗材、助手須知，共 7 頁）。
本系統是醫學生模擬學習工具，不取代臨床教師指導、實體插管模型訓練、臨床操作資格認定或真實病人處置判斷。

## 1. 四種共用訓練模式

| 模式 | 共用元件 | 說明 |
| --- | --- | --- |
| 正確示範 | `training/components/DemonstrationPlayer.tsx`（含 NarrationTrack、SubtitleTrack、ChapterNavigator） | 資料驅動時間軸；六章；0.5–2 倍速；章節／步驟跳轉；旁白與字幕同步 |
| 教學引導 | `hintSystem`（GuidedHintSystem）＋ `HintPanel` | 漸進式提示、即時回饋；可隨時「觀看這一段的正確示範」 |
| 自主練習 | `interactionEngine`（IndependentPracticeEngine） | 不提供答案；記錄器材、順序、狀態、安全事件、遺漏與補救 |
| OSCE 模擬挑戰 | `modes.ts`＋工作列倒數（OSCEChallengeTimer） | 8 分鐘；不提供即時答案；安全中止仍會出現 |

模式入口：`training/components/TrainingModeSelector.tsx`。評分：`assessment.ts`（SkillAssessmentEngine）。回放：`PracticeReplay.tsx`。

### 示範時間軸與同步機制

`demo/timeline.ts` 的每個步驟都有以下欄位：

- `stepId`、`title`、`duration`、`narrationText`、`narrationAudio`、`subtitles`
- `cameraPreset`、`animationAction`、`highlightedObjects`、`teachingPoints`、`safetyNotes`
- `source`：`case` 表示教案原始要求，`supplement` 表示現行臨床安全補充

字幕由一句一句的 `cues` 組成。播放規則：

1. 一句字幕開始時，才套用該句的動畫動作。
2. 旁白逐句朗讀，畫面上的字幕永遠是正在朗讀的那一句。
3. 一個步驟要等「最短時間」與「旁白」都結束才前進。

所以旁白不會跑到畫面前面。跳轉章節時，以確定性的動作序列重建畫面狀態。

有已審核的錄音檔時，填入 `narrationAudio`，播放器就改播錄音；有已核准的實拍影片時，填入章節的 `videoUrl`。

## 2. 專屬模組

```
src/features/skills/endotracheal-intubation/
├── AirwaySkill.tsx           情境 → 四種模式 → 模擬室 → 回饋（可連回示範章節）
├── AirwaySession.tsx         左：任務提示／中：訓練模型與鏡頭／右：器材盤／下：口述、停止求助、計時
├── caseData.ts               教學資料（情境、8 階段、耗材、聽診位置、口述選項）
├── rubricConfig.ts           教案原始要求、案例規則、審核狀態
├── rubric.ts                 14 項規準（rubricId、allowedScores、criteria、observableEvents、safetyCritical、sourcePage、reviewStatus）
├── engine.ts                 AirwayEquipmentTray／VentilationSimulation／LaryngoscopeInteraction／IntubationSimulation／TubePositionState／PlacementVerification／AirwaySafetyEvents
├── report.ts                 形成性回饋、安全警示、補充模組
├── scene/AirwayScene.tsx     低多邊形急診插管模擬室（3D）
├── ui/CameraController.tsx   AirwayCameraController：全景／呼吸道／喉頭鏡局部／管路位置示意／胸廓／聽診位置
├── ui/views.tsx              2D 教學示意圖（標示「非真實解剖影像」）
├── stages/                   8 個互動階段
└── demo/                     示範時間軸與播放
```

## 3. 案例規則（不使用隨機生理數據）

| 學員操作 | 模擬結果 |
| --- | --- |
| 面罩尖端朝頭側＋覆蓋口鼻＋單／雙手固定 | 擠壓時胸廓起伏；否則無起伏 |
| 喉頭鏡沿握把方向上提 | 示意視野可見聲門；以牙齒為支點撬動：只見舌頭會厭（安全事件） |
| 看得到聲門時把管尖放在聲門 | 氣管內；放在後方開口或看不到聲門時盲放：食道 |
| 氣管內且深度符合教案 | 兩側胸廓對稱起伏、兩側呼吸音對稱、胃部無聲、持續波形 ETCO₂ |
| 深度超過教案範圍 | 以右側為主的起伏，左側呼吸音減弱 |
| 食道 | 胸廓無起伏、上腹鼓起、胃部氣過水聲、無持續波形 |

## 4. 安全事件與安全中止

**安全事件**（會列入報告的「臨床安全相關警示」）：

- 面罩壓到眼睛
- 以牙齒為支點撬動喉頭鏡
- 看不到聲門時盲目置管
- 拔管後沒有重新給氧就再次嘗試
- 未確認位置就固定
- 把食道插管判斷為正確
- 深度過深卻未調整就判斷正確或固定
- 通條前端超出管尖（現行臨床安全補充）

**安全中止**：以下兩種情況在所有模式都會中止該動作，並提供「停止，以袋瓣罩重新給氧並尋求協助」：

- 固定位於食道內的管子
- 通條超出管尖時置管

## 5. 14 項規準與待教師確認事項

| # | 有效分數 | 待確認 |
| --- | --- | --- |
| 2 | 0／1／2 | 考官指引寫「2 項均做到」但未說明是哪 2 項；本模擬僅依「選擇內徑 7.0 或 7.5」給 2 或 0 分 |
| 7 | 0／2 | 評分表與考官指引一致 |
| 11 | 依考官指引 0／2 | 評分表 1 分欄位未塗黑，但考官指引只有兩種說明 |
| 12 | 依評分表 0／2 | 評分表 1 分欄位塗黑，但考官指引列有「部分做到」；符合部分做到者顯示 0 分並註明 |
| 13 | 0／2 | 評分表與考官指引一致 |

- **需教師實體評核**：第 5、6、7、8、13 項。
- **安全關鍵**：第 8、14 項。

回饋報告分開呈現四部分：

1. 數位形成性評量
2. 需實體確認的項目
3. 臨床安全警示
4. 教師整體表現（1–5 分，不與 28 分相加）

## 6. 資料標籤

- **教案原始要求**：PDF 中的流程、數值與規準。
- **現行臨床安全補充**：持續波形 ETCO₂、通條不超出管尖、拔管後重新給氧。這些內容另外標示，不計入 14 項評分。
- 教案未提供血液氣體分析數值，本關卡不顯示任何檢驗數據。
- 正確示範目前為「動畫原型・待臨床教師審核（未核准）」。

## 7. 公開網站注意事項

- 規準文字與參數會打包進公開的 GitHub Pages，可被瀏覽器檢視；隱藏 UI 不是保密措施。
- 若考官指引未獲授權公開，建議公開版改為摘要化規準，完整版放在院內私有建置或需登入的後端。

## 8. 測試

1. 自主模式完整正確操作 → 28／28（實際以擠壓時間點計算給氣速度）。
2. 第一次食道插管 → 拔管 → 重新給氧 → 第二次成功 → 第 14 項為 1 分。
3. OSCE 挑戰模式中固定食道插管 → 出現安全中止；報告列出安全警示，點「觀看正確示範」會跳到對應章節，再返回報告。
4. 示範時間軸全部動作套用到引擎 → 28／28、無錯誤事件。
5. 手機（390 px）：器材準備時工作車移到操作區上方。
