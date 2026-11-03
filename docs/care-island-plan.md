# CARE ISLAND（醫病溝通與衛教島）— Phase 1

> CARE-6 是本平台參考 Calgary–Cambridge 指引自行整理的教學架構，**不是官方西醫師 OSCE 國考 SOP**。
> 所有情境（劇場四幕、衛教工坊、VSP 林小姐）皆為本平台原創教學示範，非正式考題、非 SP 劇本，內容待臨床教師審核。
> 未經授權的正式考題、SP 劇本與考官資料不得放入本專案（GitHub Pages 為公開網站，前端資源可被任何人檢視）。

## 路由

| 路徑 | 內容 |
| --- | --- |
| `#/care` | 總覽（五棟建築、CARE-6 導覽） |
| `#/care/academy`、`#/care/academy/:stage` | 01 溝通 SOP 學院：CARE-6 六單元（觀念 → 好／不佳對照 → 短情境 → 回饋、重練） |
| `#/care/academy/game-sop` | Game 1 溝通 SOP 挑戰（分類 → 彈性排序 → 下一步；允許多條合理路徑） |
| `#/care/theater`、`#/care/theater/:sceneId` | 02 同理心對話劇場：Game 2（焦慮／生氣／害怕／悲傷；第二回合依第一回合分支） |
| `#/care/workshop` | 03 衛教互動工坊：Game 3 Teach-back 七步驟（病人復述依說明方式而不同；「我懂了」不算數） |
| `#/care/tools`、`#/care/tools/:toolId` | 04 困難溝通情境館：Calgary–Cambridge、NURSE、SPIKES、Teach-back 教學卡＋小遊戲 |
| `#/care/vsp`、`#/care/vsp/:caseId` | 05 Virtual SP 挑戰中心：示範／引導／自主／OSCE 挑戰四模式＋形成性回饋 |

3D 島嶼（`CommunicationBuildings.tsx`）：五棟建築在島嶼選取後可點擊進入。

## 資料架構（`src/features/care/`）

引擎與案例資料分離：

- `types.ts`：CommunicationFramework、CommunicationLesson、DialogueScenario、DialogueNode、VirtualPatient、EmotionCue、ResponseOption（含 evidence）、TeachBackTask、CommunicationRubric、FeedbackReport。DemonstrationTimeline 沿用共用的 `DemoChapterDef`，由案例的 `demoPath` 自動產生。
- `engine/dialogue.ts`：純函式對話引擎（`choose`、`undoLast`、`nextNodeConditions` 旗標條件、`validateScenario`）。
- `engine/feedback.ts`：九個分析面向（已展現／部分展現／待加強／未觀察），證據來自學生選擇的說法，附實際說法、病人反應、可參考說法、安全提醒、建議重練單元與限制說明。
- `data/`：CARE-6 單元、四種工具、Game 1、Teach-back 任務、分析面向、五棟建築。
- `cases/`：劇場四幕與 VSP 案例。

### 新增 VSP 案例

1. 在 `cases/` 新增一個 `DialogueScenario`（每個節點需有 dialogueId、speaker、message、responseOptions、emotionCues、nextNodeConditions、communicationSkills、feedbackRules、safetyFlags）。
2. 加入 `VSP_CASES`。
3. 用 `validateScenario` 檢查所有分支都能到達結尾，並確認 `demoPath` 與節點一致。
4. 設定 `timeLimitSec`（依案例設定，不使用預設 8 分鐘）與 `review`、`license`。

## 回饋原則

- 不做關鍵字計分、不用單一句型模板、不從病人情緒數值推論同理心。
- 報告明示限制：選項式對話無法觀察語氣、語速與非語言表現，不是完整的溝通能力評估。
- 練習結果標示「模擬形成性評量」，不等同正式 OSCE 評分。

## 練習紀錄

`logVisit('communication', …)` 與 `logPractice({ island: 'communication', … })`：
lesson → `sop-unit`；Game／劇場／工具 → `lab-game`；VSP → `case`；開始練習 → `start`。皆為匿名。

## 待辦（Phase 2 以後）

- 臨床教師審核所有教學內容與 VSP 對話。
- 更多 VSP 案例（例如共享決策、壞消息告知）。
- 已審核的示範錄音或影片（`DemoChapterDef.videoUrl`／`narrationAudio`）。
