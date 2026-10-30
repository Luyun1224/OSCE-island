# 瀏覽次數設定（Google Sheet ＋ Apps Script）

網站右下角可顯示「👁 累計瀏覽次數」。資料存在你自己的 Google 試算表中，不需要另外架資料庫或付費服務。

- 計數方式：每位訪客每次開啟網站（一個瀏覽工作階段）計 1 次；在站內切換頁面不重複計算。
- 不收集任何個人資料（不記錄 IP、帳號、裝置），只記錄「日期」與「次數」。
- 未設定網址前，網站不會顯示瀏覽次數，其他功能不受影響。

## 步驟一：建立試算表與 Apps Script

1. 開啟（或新建）一份 Google 試算表，例如命名為「OSCE 群島瀏覽統計」。
2. 上方選單 **擴充功能 → Apps Script**。
3. 刪除預設內容，貼上以下程式碼後按 💾 儲存：

```js
// OSCE Learning Islands 瀏覽次數計數器
const SHEET_NAME = '瀏覽紀錄';
const TIMEZONE = 'Asia/Taipei';

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

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
```

## 步驟二：部署成網頁應用程式

1. 右上角 **部署 → 新增部署作業**。
2. 類型選 **網頁應用程式**。
3. 設定：
   - 執行身分：**我**
   - 誰可以存取：**所有人**（網站訪客不需登入 Google 才能計數）
4. 按 **部署**，第一次會要求授權存取試算表，請同意。
5. 複製「網頁應用程式網址」，格式類似：
   `https://script.google.com/macros/s/AKfycb..../exec`

> 先在瀏覽器開啟 `網址?action=get`，應看到 `{"total":0}`，代表設定成功。

## 步驟三：把網址接到網站（擇一）

**A. GitHub 設定（建議，不用改程式）**

1. GitHub repo → **Settings → Secrets and variables → Actions → Variables** 分頁
2. **New repository variable**：Name 填 `VIEW_COUNTER_URL`，Value 貼上步驟二的網址
3. 到 **Actions → Deploy to GitHub Pages → Run workflow** 重新部署一次

**B. 直接寫在程式**：在 `src/config/site.ts` 把 `viewCounterUrl` 改成該網址。

## 之後要看統計

試算表的「瀏覽紀錄」工作表會每天一列，可以直接插入圖表看每日趨勢。

## 注意事項

- 修改 Apps Script 程式後，需要 **部署 → 管理部署作業 → 編輯 → 版本選「新版本」** 才會生效（網址不變）。
- 這是簡單的計數器，不是完整的網站分析。若之後想知道停留時間、熱門頁面、裝置類型，可另外加 Google Analytics 4 或 GoatCounter（隱私友善、免費）。
- Apps Script 免費額度足以應付一般教學網站的流量（每天數千次瀏覽沒問題）。
