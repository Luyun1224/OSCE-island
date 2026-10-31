# 練習紀錄與 KPI（Google 試算表）

網站會把每一次完成的練習自動寫入你的 Google 試算表，不需要另外架設資料庫。沿用瀏覽次數的同一個 Apps Script，只要更新程式並重新部署新版本即可（網址不變）。

## 會記錄哪些練習

| 島嶼 | 類型 | 記錄時機 |
| --- | --- | --- |
| 群島地圖 | 瀏覽 | 開啟群島地圖時 |
| 五座島嶼（含尚未開放） | 瀏覽 | 在群島點選島嶼、按「進入學習區」時（結果欄：open／not-open） |
| 技能操作島 | 瀏覽 | 進入技能訓練中心、進入各技能關卡時 |
| 技能操作島 | 開始練習 | 選擇模式開始傷口縫合練習、開始觀看正確示範時（含單項練習） |
| 病史詢問島 | 瀏覽 | 進入四棟建築、各 SOP 單元、遊戲、案例頁面時 |
| 病史詢問島 | 開始練習 | 選擇模式進入虛擬病人診間時 |
| 技能操作島 | 傷口縫合練習 | 結束並產生回饋時（含模式、10 項規準各項得分） |
| 技能操作島 | 傷口縫合正確示範 | 看完整段示範時 |
| 病史詢問島 | SOP 單元 | 完成單元練習時 |
| 病史詢問島 | 訓練場遊戲 | 完成遊戲時 |
| 病史詢問島 | 虛擬病人案例 | 結束問診時（含模式、15 項規準各項得分） |

「瀏覽」在同一個瀏覽器分頁中，同一頁只記一次（重新整理或關閉分頁後再開會再記一次），避免來回切換灌水。之後新增的島嶼或技能關卡，網址瀏覽會自動記錄。

**匿名**：每個瀏覽器有一組隨機代碼（例如 `v-k3x9q2ab1f4c`），用來估計練習人數；不記錄姓名、學號、IP 或任何個資。

## 更新步驟

1. 開啟原本的試算表 → **擴充功能 → Apps Script**。
2. 用下方程式**整份取代**原本的程式碼，按 💾 儲存。
3. **部署 → 管理部署作業** → 選原本的部署 → ✏️ **編輯** → 版本選 **新版本** → **部署**。
   （一定要用「編輯 → 新版本」，網址才會維持不變；若按「新增部署作業」會得到新網址，網站就收不到。）
4. 到網站完成任一練習，回到試算表應出現「練習紀錄」與「KPI 總覽」兩個工作表。
   （若先前已建立過「KPI 總覽」，新版程式會在下一筆紀錄寫入時自動重建，不需手動刪除。）

```js
// OSCE Learning Islands：瀏覽次數計數器 ＋ 練習紀錄
const SHEET_NAME = '瀏覽紀錄';
const LOG_SHEET = '練習紀錄';
const KPI_SHEET = 'KPI 總覽';
const KPI_VERSION = '2'; // 版本改變時自動重建 KPI 總覽
const TIMEZONE = 'Asia/Taipei';

const ISLAND_NAME = {
  'history-taking': '病史詢問島',
  'physical-exam': '身體檢查島',
  'clinical-management': '病情解釋與臨床處置島',
  'communication': '醫病溝通與衛教島',
  'procedural-skills': '技能操作島',
  'map': '群島地圖',
};
const MODULE_NAME = { 'visit': '瀏覽', 'start': '開始練習', 'skill': '技能練習', 'demo': '正確示範', 'sop-unit': 'SOP 單元', 'lab-game': '訓練場遊戲', 'case': '虛擬病人案例' };
const MODE_NAME = { guided: '引導', independent: '自主', challenge: '挑戰', demo: '示範' };

/* ---------------- 瀏覽次數（與原本相同） ---------------- */
function doGet(e) {
  const action = (e && e.parameter && e.parameter.action) || 'get';
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sheet = getSheet_();
    const props = PropertiesService.getScriptProperties();
    let total = Number(props.getProperty('total'));
    if (!total) total = sumSheet_(sheet); // 第一次或屬性遺失時，由試算表加總還原

    if (action === 'hit') {
      total += 1;
      props.setProperty('total', String(total));
      const today = Utilities.formatDate(new Date(), TIMEZONE, 'yyyy-MM-dd');
      const last = sheet.getLastRow();
      if (last > 1 && sheet.getRange(last, 1).getDisplayValue() === today) {
        const cell = sheet.getRange(last, 2);
        cell.setValue(Number(cell.getValue()) + 1);
      } else {
        sheet.appendRow([today, 1]);
      }
    }
    return json_({ total: total });
  } finally {
    lock.releaseLock();
  }
}

/* ---------------- 練習紀錄 ---------------- */
function doPost(e) {
  let data;
  try {
    data = JSON.parse((e && e.postData && e.postData.contents) || '{}');
  } catch (err) {
    return json_({ ok: false, error: 'bad json' });
  }
  if (data.action !== 'log') return json_({ ok: false, error: 'unknown action' });

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sheet = getLogSheet_();
    const now = new Date();
    const score = num_(data.score);
    const max = num_(data.max);
    sheet.appendRow([
      now,
      new Date(now.getFullYear(), now.getMonth(), now.getDate()),
      str_(data.visitor, 40),
      str_(data.device, 20),
      ISLAND_NAME[data.island] || str_(data.island, 40),
      MODULE_NAME[data.module] || str_(data.module, 40),
      str_(data.itemId, 60),
      str_(data.itemTitle, 120),
      MODE_NAME[data.mode] || str_(data.mode, 20),
      score,
      max,
      score !== '' && max ? score / max : '',
      num_(data.durationSec),
      str_(data.result, 30),
      str_(data.detail, 500),
    ]);
    ensureKpi_();
    return json_({ ok: true });
  } finally {
    lock.releaseLock();
  }
}

function getLogSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(LOG_SHEET);
  if (!sheet) {
    sheet = ss.insertSheet(LOG_SHEET);
    sheet.appendRow(['時間', '日期', '匿名代碼', '裝置', '島嶼', '類型', '項目代碼', '項目名稱', '模式', '得分', '滿分', '得分率', '用時（秒）', '結果', '細項']);
    sheet.setFrozenRows(1);
    sheet.getRange('A:A').setNumberFormat('yyyy-mm-dd hh:mm:ss');
    sheet.getRange('B:B').setNumberFormat('yyyy-mm-dd');
    sheet.getRange('L:L').setNumberFormat('0%');
  }
  return sheet;
}

/** KPI 總覽：第一次寫入（或 KPI_VERSION 改變）時自動建立，之後由公式即時更新 */
function ensureKpi_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const props = PropertiesService.getScriptProperties();
  const old = ss.getSheetByName(KPI_SHEET);
  if (old && props.getProperty('kpiVersion') === KPI_VERSION) return;
  if (old) ss.deleteSheet(old);
  props.setProperty('kpiVersion', KPI_VERSION);

  const k = ss.insertSheet(KPI_SHEET, 0);
  const L = "'" + LOG_SHEET + "'";
  const DONE = L + '!F2:F,"<>瀏覽",' + L + '!F2:F,"<>開始練習"'; // 完成的練習（排除瀏覽與開始）
  k.getRange('A1').setValue('OSCE Learning Islands｜練習 KPI 總覽').setFontSize(14).setFontWeight('bold');
  k.getRange('A3:B11').setValues([
    ['完成練習次數', '=COUNTIFS(' + L + '!A2:A,"<>",' + DONE + ')'],
    ['開始練習次數', '=COUNTIF(' + L + '!F2:F,"開始練習")'],
    ['完成率（技能練習＋虛擬病人）', '=IFERROR((COUNTIF(' + L + '!F2:F,"技能練習")+COUNTIF(' + L + '!F2:F,"虛擬病人案例"))/B4,"")'],
    ['瀏覽次數（島嶼／頁面）', '=COUNTIF(' + L + '!F2:F,"瀏覽")'],
    ['使用人數（匿名瀏覽器）', '=IFERROR(COUNTUNIQUE(' + L + '!C2:C),0)'],
    ['練習人數（有完成練習）', '=IFERROR(COUNTUNIQUE(FILTER(' + L + '!C2:C,' + L + '!F2:F<>"瀏覽",' + L + '!F2:F<>"開始練習",' + L + '!C2:C<>"")),0)'],
    ['平均得分率', '=IFERROR(AVERAGE(' + L + '!L2:L),"")'],
    ['近 7 日完成練習', '=COUNTIFS(' + L + '!B2:B,">="&(TODAY()-6),' + DONE + ')'],
    ['本月完成練習', '=COUNTIFS(' + L + '!B2:B,">="&EOMONTH(TODAY(),-1)+1,' + DONE + ')'],
  ]);
  k.getRange('B5').setNumberFormat('0%');
  k.getRange('B9').setNumberFormat('0%');
  k.getRange('A3:A11').setFontWeight('bold');

  const Q = (sql) => '=IFERROR(QUERY(' + L + '!A1:O,"' + sql + '",1),"尚無資料")';
  k.getRange('A13').setValue('完成練習：各島嶼／項目').setFontWeight('bold');
  k.getRange('A14').setFormula(Q("select E, H, count(A), avg(L), avg(M) where A is not null and F <> '瀏覽' and F <> '開始練習' group by E, H order by count(A) desc label count(A) '完成次數', avg(L) '平均得分率', avg(M) '平均用時（秒）'"));
  k.getRange('D:D').setNumberFormat('0%');

  k.getRange('G13').setValue('各島嶼使用情形').setFontWeight('bold');
  k.getRange('G14').setFormula(Q("select E, count(A) where A is not null group by E pivot F"));

  k.getRange('G30').setValue('開始練習（依項目與模式）').setFontWeight('bold');
  k.getRange('G31').setFormula(Q("select H, I, count(A) where F = '開始練習' group by H, I label count(A) '開始次數'"));

  k.getRange('N13').setValue('每日使用次數').setFontWeight('bold');
  k.getRange('N14').setFormula(Q("select B, count(A) where A is not null group by B pivot F order by B desc"));
  k.getRange('N:N').setNumberFormat('yyyy-mm-dd');
  k.setColumnWidths(1, 2, 200);
}

/* ---------------- 共用 ---------------- */
function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(['日期', '瀏覽次數']);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function sumSheet_(sheet) {
  const last = sheet.getLastRow();
  if (last < 2) return 0;
  return sheet.getRange(2, 2, last - 1, 1).getValues().reduce((s, r) => s + Number(r[0] || 0), 0);
}

function str_(v, n) {
  return v === undefined || v === null ? '' : String(v).slice(0, n);
}

function num_(v) {
  const x = Number(v);
  return v === undefined || v === null || v === '' || isNaN(x) ? '' : x;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
```

## 「練習紀錄」欄位

| 欄 | 說明 |
| --- | --- |
| 時間／日期 | 完成練習的時間 |
| 匿名代碼 | 每個瀏覽器一組，估計練習人數 |
| 裝置 | desktop / mobile |
| 島嶼、類型、項目名稱 | 例如「病史詢問島／虛擬病人案例／CASE 001：50 歲陳小姐頭暈」 |
| 模式 | 引導／自主／挑戰（有分模式的練習才會填） |
| 得分、滿分、得分率 | 模擬形成性評量分數 |
| 用時（秒） | 完成練習所花時間 |
| 結果 | completed / finished / timeout / watched；瀏覽紀錄為 open（已開放）／not-open（尚未開放） |
| 細項 | 各評分項目得分，例如 `1:2 2:1 3:2 …`（可用來分析哪一項最常失分） |

## 注意

- 若之後要記錄學號或姓名，需另外取得學員同意並注意個資保護；目前設計刻意只記錄匿名資料。
- 「KPI 總覽」只在第一次寫入時建立；若想重建，刪除該工作表後再使用一次網站即可。
- 任何人都能送資料到這個網址（與瀏覽次數相同），數字適合作為趨勢參考，不適合作為正式成績。
