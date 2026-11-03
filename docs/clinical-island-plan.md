# CLINICAL DECISION ISLAND（病情解釋與臨床處置島）

> CLINICAL-6 是本平台整理的臨床推理教學架構，**不是國考官方 SOP**。危急狀況下評估與處置常需同步進行，不強迫依固定順序。
> DEMO 病例為本平台原創教學情境，非國考題目、非真實病人；臨床數值、處置與模擬後果**待臨床教師審核**。
> 回饋為「模擬形成性評量」，不是國考或正式 OSCE 評分標準。未經授權的正式考題與評分標準不得放入本專案（GitHub Pages 為公開網站）。

## 已完成：Phase 1–3（以及挑戰館的整合流程）

| 建築 | 路由 | 內容 |
| --- | --- | --- |
| 01 臨床推理學院 | `#/clinical/academy`、`#/clinical/academy/:stage` | CLINICAL-6 六單元：核心教學、圖像化學習卡、臨床情境、小遊戲、即時回饋、重練、安全提醒 |
| 02 診斷線索實驗室 | `#/clinical/lab`、`/lab/clues`、`/lab/ddx` | Game 1 臨床線索拼圖（拖曳／點選）、Game 2 鑑別診斷擂台（選擇 → 排序 → 支持／反對證據 → 不能漏掉） |
| 03 臨床處置決策中心 | `#/clinical/decision` | Game 3 臨床處置模擬器：立即處置／求援 → 檢查 → 初步處置 → 第一小時順序 → 模擬後果 → 治療 → 監測與去處 |
| 04 病情解釋模擬診間 | `#/clinical/explain` | Game 4 病情解釋挑戰：六元素的內容正確性＋病人疑問（先找原因，再解釋） |
| 05 OSCE 臨床決策挑戰館 | `#/clinical/challenge` | 同一病例連續四關、過程不顯示答案、依病例設定計時，結束後整合回饋 |

3D 島嶼（`ClinicalManagementBuildings.tsx`）：五棟建築在島嶼選取後可點擊進入（共用 `LinkedBuilding.tsx`）。

## 與醫病溝通島的分工

- 本島 Game 4 評估「醫學內容是否正確、完整、確定程度是否適當」，以及能否找出病人不配合的原因並給出醫學上正確的方案。
- 同理、語氣、互動技巧由醫病溝通島（CARE ISLAND）評估，本島不重複評分。

## 資料架構（`src/features/clinical/`）

- `types.ts`：ClinicalCase、PatientState、ClinicalEvidence、ProblemRepresentation、DifferentialDiagnosis、InvestigationOption、ManagementOption、DecisionEvent、SimulationOutcome、PatientExplanation、ClinicalRubric、FeedbackReport；示範時間軸沿用共用的 `DemoChapterDef`。
- `cases/`：病例資料（目前為 DEMO 01）。
- `engine/evaluate.ts`：純函式判分與模擬；所有規則來自病例資料（evidence.role、differential.support/against/rank/mustNotMiss、necessity、beforeTreatment、mustNotDelay、outcomes）。
- `engine/feedback.ts`：十個形成性面向；每一項都列出對應的決策事件；**安全事件獨立呈現**，不會被其他面向的表現掩蓋。
- `games/`：四個遊戲元件，只讀取病例資料；`defer` 參數用於不顯示即時答案的挑戰流程。

### 新增病例

1. 在 `cases/` 新增一個 `ClinicalCase`（證據卡、問題摘要選項、鑑別診斷、檢查、處置、模擬後果規則、病情解釋與病人疑問）。
2. 每條 `SimulationOutcome` 須填寫 `source`（審核來源）；不使用生成式 AI 產生病情變化。
3. 加入 `CLINICAL_CASES`，並設定 `timeLimitSec`（依病例設定）與 `review`。

## 待辦（Phase 4–7）

- Phase 4–5：更多病例；病情解釋改為多輪虛擬 SP 對話。
- Phase 6：四種模式完整化（正確示範時間軸：旁白、字幕、章節、證據連結動畫；教學引導／自主練習／OSCE 挑戰切換）。目前單一遊戲頁為「每步即時回饋」，挑戰館為「結束後回饋＋計時」。
- Phase 7：效能與更多裝置測試。
- 所有醫療內容與模擬後果須經臨床教師審核。
