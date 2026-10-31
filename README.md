# OSCE Learning Islands｜醫學生 OSCE 學習探索島

3D 群島學習平台。目前已開放：**病史詢問島 → HISTORY QUEST 病史偵探學院**、**技能操作島 → 技能訓練中心 → 傷口縫合、導尿管置入（CATHETER QUEST）互動關卡**。

🌐 線上版：https://luyun1224.github.io/osce-island/

![全景](docs/screenshots/overview.png)

技術：React 18 · Vite 5 · TypeScript · Three.js · React Three Fiber · Drei · Tailwind CSS

## 本機執行

需求：Node.js 18 以上（建議 20 / 22）

```bash
npm install
npm run dev        # 開發模式 http://localhost:5173（同網段手機可用顯示的 Network 位址測試）
npm run build      # 產出 dist/
npm run preview    # 預覽正式版
```

## 病史詢問島：HISTORY QUEST 病史偵探學院

路徑：群島 → 病史詢問島（點島上的建築，或「進入學習區」）→ `#/history`。設計與分階段計畫見 [`docs/history-quest-plan.md`](docs/history-quest-plan.md)。

- **01 問診 SOP 學院**：六單元（開場、開放式問診、OPQRST、相關病史、危險徵象與優先順序、ICE 與摘要），每單元含核心教學、互動練習、即時回饋與重練。
- **02 問診技巧訓練場**：問診排序（彈性順序判斷）、OPQRST 線索收集、病史分類拼圖（隨機抽題）、病人情緒回應。
- **03 虛擬病人診間**：Case 001「50 歲陳小姐頭暈」—自由問診、條件式追問、SP 主動提問、病歷線索板、檢驗報告、病情說明；三種模式（引導／自主／8 分鐘挑戰）；15 項規準模擬評量與個別化回饋。
- **04 問診能力分析中心**：依本機練習紀錄顯示進度、弱項與建議重練單元。
- 教材與題庫皆為教學示範情境，標示「待教師審核」；分數為模擬形成性評量。

## 技能操作島：傷口縫合關卡

路徑：群島 → 技能操作島 →「進入學習區」→ 技能訓練中心（`#/island/procedural-skills`）→ 傷口縫合（`#/skill/wound-suturing`）

設計依據為《傷口縫合.pdf》（考生指引、評分表、考官指引、道具耗材、診間示意圖）；完整設計說明見 [`docs/wound-suturing-plan.md`](docs/wound-suturing-plan.md)。

- **正確示範模式**：以真實模擬引擎自動重播完整正確流程（8 章），搭配字幕、病人說明對白、正確觀念與常見錯誤；可暫停、跳章、重播與 0.75–2 倍速，並可開啟瀏覽器語音旁白。腳本在 `demo/demoScript.ts`，章節可加 `videoUrl` 換成實拍影片。
- **三種練習模式**：教學引導（逐層提示、即時回饋與修正選項）／自主練習（只記錄、結束後回饋）／OSCE 模擬挑戰（8 分鐘倒數，不提供即時答案）
- **七個可自由切換的階段**：器材準備 → 無菌手套 → 消毒 → 鋪單 → 縫合 → 覆蓋 → 廢棄物
- **縫合核心**：桌面版 3D 手部模型（可放大）＋ 傷口截面圖；選工具夾針 → 點選進／出針點 → 設定角度 → 沿弧拖曳穿針 → 拉線 → 打結小遊戲（三個結、方結判斷）→ 剪線；可逐針重設，針距即時量測。手機版改用 2D 俯視圖。
- **評量**：10 項規準 0／1／2 分逐字依考官指引；數位評分標示「模擬練習評量」，整體表現 1–5 分保留「尚未評核（由教師評估）」，無法由網頁觀察的部分標示「需實體操作評核」。
- **回饋**：流程回顧、個別化補強建議（可一鍵重練弱項）、10 項規準對照、前後練習比較（僅存於本機瀏覽器）。

## 技能操作島：導尿管置入關卡（CATHETER QUEST）

路徑：技能訓練中心 → 導尿管置入（`#/skill/urinary-catheterization`）。依《技術操作－導尿管置放.pdf》建置；完整設計說明見 [`docs/catheter-quest-plan.md`](docs/catheter-quest-plan.md)。

- **正確示範模式**：與傷口縫合相同，以引擎自動重播 12 章正確流程，附字幕、語音旁白、病人對話、正確觀念與常見錯誤，可暫停、跳章、倍速；章節可換成實拍影片（`demo/demoScript.ts` 的 `videoUrl`）
- **12 個可自由切換的階段**：說明與安撫 → 操作前手部衛生 → 器材準備 → 無菌手套 → 消毒 → 鋪洞巾 → 潤滑 → 置入 → 水球與定位 → 尿袋連接與固定 → 廢棄物 → 操作後手部衛生
- **無菌狀態機與污染追蹤**：手套、導尿包、導尿管、尿袋接頭分別追蹤；可自行辨識並選擇補救方式
- **置入模擬**：拖曳／按住／鍵盤推進，過快與偏離方向提醒、模擬阻力事件（停止並求助）、見尿與到達末端；所有進度皆為教學模擬狀態
- **安全閘門**：受污染時不可置入；未見尿或未置入至末端時無法打水球
- **評量**：14 項規準逐字依考官指引（第 7、11、12 項只有 0／2 分），整體表現 1–5 分由教師評估；回饋含狀態摘要、操作順序與**操作歷程回放**
- 低多邊形 3D 急診診間可點選物件切換階段；手機版改以 2D 操作為主

### 新增技能關卡

1. 在 `src/features/skills/registry/skillRegistry.ts` 新增一筆技能並提供 `load()`
2. 在 `src/features/skills/<skill-id>/` 建立：`caseData.ts`（SkillCase）、`engine.ts`（互動規則 reducer）、`rubric.ts`（AssessmentRubric）、`report.ts`（FeedbackReport）與各階段 UI
3. 共用框架在 `src/features/training/`：`interactionEngine`（事件紀錄／計時／暫停）、`hintSystem`、`assessment`、`modes`、`storage`、`sterile`（無菌狀態機、手套決策點、手部衛生部位）與 `components/`（拖曳、提示面板、操作紀錄、回饋報告、操作回放、手部衛生、病人溝通、無菌狀態卡）

## 部署（GitHub Pages）

推送到 `main` 後，`.github/workflows/deploy.yml` 會自動建置並發布到 GitHub Pages（約 1–2 分鐘）。
首次使用需在 repo 的 **Settings → Pages → Build and deployment → Source** 選擇 **GitHub Actions**。

## 群島氛圍：白天／深夜與背景音樂

- 右上角可切換 **☀️ 白天／🌙 深夜**：天空、海面與光線平滑轉換；深夜有星空、月亮、海面月光與螢火光點，島上路燈亮起。
- **🎵 背景音樂**：以 Web Audio API 即時合成的原創輕快旋律（不需音檔、無版權問題）；白天為撥弦琶音版，深夜為較慢的音樂盒版，可調整音量。
- 依瀏覽器規定需使用者操作後才能播放；選擇會記在本機，下次點擊畫面即自動恢復。音樂只在群島頁播放，切到背景分頁會暫停。

## 製作單位與瀏覽次數

- 群島右下角顯示「奇美醫院教學部｜臨床技能中心 製作」（文字在 `src/config/site.ts`）。
- 瀏覽次數以 Google 試算表＋Apps Script 計數，設定步驟見 [`docs/view-counter.md`](docs/view-counter.md)；未設定時不顯示。
- 練習紀錄（各島嶼、技能、SOP 單元、遊戲、虛擬病人案例）匿名寫入同一份試算表並自動產生 KPI 總覽，見 [`docs/practice-log.md`](docs/practice-log.md)。

## 操作方式

| 動作 | 桌機 | 手機 |
| --- | --- | --- |
| 旋轉視角 | 左鍵拖曳 | 單指拖曳 |
| 縮放 | 滾輪 | 雙指捏合 |
| 平移 | 右鍵拖曳 | 雙指拖曳 |
| 選擇島嶼 | 點擊島嶼 / 建築 / 左側選單 | 點擊島嶼 / 上方膠囊選單 |
| 返回全景 | 「返回全景」按鈕、Esc、點中央廣場、雙擊海面 | 「全景」按鈕、點中央廣場 |

## 專案結構

```
src/
├── router.ts                       # hash 路由（GitHub Pages 相容）
├── pages/IslandMapPage.tsx         # 群島地圖頁
├── features/
│   ├── training/                   # 可重複使用的技能訓練框架
│   └── skills/                     # SkillRegistry、技能訓練中心、各技能關卡
├── types/island.ts                 # 型別：IslandConfig、IslandTheme、LearningModule…
├── data/islandData.ts              # IslandData：五座島設定、鏡頭參數（改內容只需改這裡）
├── components/
│   ├── scene/
│   │   ├── IslandMapScene.tsx      # Canvas、燈光、霧、組合整個場景
│   │   ├── CameraControls.tsx      # OrbitControls + 平滑飛行聚焦 / 全景
│   │   ├── Island.tsx              # 通用島嶼：地基、hover 浮起、光環、點擊、標籤
│   │   ├── CentralPlaza.tsx        # 中央導航廣場
│   │   ├── SeaRoutes.tsx           # 發光航線、浮標、流動光點
│   │   ├── Ocean.tsx               # Low Poly 動態海面
│   │   ├── Ambience.tsx            # 雲、小船
│   │   ├── primitives.tsx          # Low Poly 共用幾何（Box、Tree、Heart、MedCross…）
│   │   └── buildings/
│   │       ├── index.ts            # 建築註冊表 BUILDING_REGISTRY（島 ID → 建築元件）
│   │       ├── HistoryTakingBuildings.tsx       # 病史詢問學院
│   │       ├── PhysicalExamBuildings.tsx        # 身體檢查訓練館
│   │       ├── ClinicalManagementBuildings.tsx  # 臨床處置決策中心
│   │       ├── CommunicationBuildings.tsx       # 醫病溝通劇場
│   │       └── ProceduralSkillsBuildings.tsx    # 技能操作中心
│   └── ui/
│       ├── NavigationMenu.tsx      # 快速導航（桌機左側 / 手機上方）
│       ├── IslandCard.tsx          # 導航選單中的島嶼卡片
│       ├── IslandInfoPanel.tsx     # 島嶼介紹面板（桌機右側 / 手機底部抽屜）
│       └── Overlay.tsx             # 頁首、操作提示、Toast
├── App.tsx                         # 路由表
└── main.tsx
```

## 如何修改

- **改島嶼名稱、簡介、顏色、位置**：只改 `src/data/islandData.ts`。
- **調整某島建築**：改 `components/scene/buildings/` 中對應檔案；建築正面朝 +Z，島面高度 y = 0，可用半徑約 `radius - 1.5`。
- **新增第六座島**：在 `IslandId` 加入新 ID → `ISLANDS` 加一筆設定 → 新增建築元件並註冊到 `BUILDING_REGISTRY`。
- **調整鏡頭**：`OVERVIEW_CAMERA`、`DEFAULT_FOCUS_OFFSET`，或在單島設定 `cameraOffset`。

## 後續擴充建議

1. **路由**：加入 `react-router`，`/` 為群島、`/island/:id` 為島內學習區；「進入學習區」目前在 `App.tsx` 的 `handleEnter` 顯示提示，之後改成導頁即可。
2. **學習內容資料**：`IslandConfig.modules`（`LearningModule`）已預留，可擴充為教案（病人設定、SP 劇本、評分表）、技能步驟清單、測驗題；建議先以 `src/data/modules/<islandId>.ts` 或 JSON 管理，之後再換成 API。
3. **島內場景**：每座建築可以變成可點擊的「考站入口」（例如點檢查床進入身體檢查流程），在建築元件上加 `onClick` 並把熱點座標放進資料檔。
4. **學習進度視覺化**：在 `Island` 加上進度旗幟 / 完成徽章，使用 `localStorage` 或 zustand 先做本機進度，再接後端。
5. **狀態管理**：互動變多時，將 `selectedId` 等狀態移到 zustand（R3F 生態常用）。
6. **效能**：裝飾物數量大增時改用 `Instances` / `Merged`（drei）；需要時以 `React.lazy` 分割島內頁面，降低首屏 bundle。
7. **無障礙與多語**：標題 / 簡介已集中在資料檔，之後可加 `i18n` 與鍵盤導覽。
