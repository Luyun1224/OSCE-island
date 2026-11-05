# 與臨床技能島雙向往返

## OSCE 學習島 → 臨床技能島（本站已完成）

- 網址設定：`src/config/site.ts` 的 `EXTERNAL_LINKS.skillsIsland.url`
- 入口：群島地圖左側選單卡片（手機為上方膠囊列最後一顆）＋海上的 3D 碼頭與傳送門
- 一律使用一般 `<a href="…" target="_self">`，在目前分頁開啟，瀏覽器「上一頁」即可回來；
  不使用 `target="_blank"` 或 `window.open`，外部網址也不經過本站的 hash 路由。

## 臨床技能島 → OSCE 學習島（交給同事貼到臨床技能島頁面）

```html
<!-- 返回 OSCE 學習島：在目前分頁開啟（不開新分頁），支援鍵盤與手機 -->
<a href="https://luyun1224.github.io/OSCE-island/#/"
   target="_self"
   class="osce-back-link"
   aria-label="返回 OSCE 學習島（於目前分頁開啟）">
  🏝️ 返回 OSCE 學習島
</a>

<style>
  .osce-back-link {
    display: inline-flex; align-items: center; gap: .4em;
    padding: .6em 1.1em; border-radius: 999px;
    background: linear-gradient(90deg, #0ea5e9, #14b8a6);
    color: #fff; font-weight: 800; text-decoration: none;
    box-shadow: 0 4px 14px rgba(14, 165, 233, .35);
    min-height: 44px; /* 手機易於點擊 */
  }
  .osce-back-link:hover { filter: brightness(1.08); }
  .osce-back-link:focus-visible { outline: 3px solid #f97316; outline-offset: 3px; }
</style>
```

注意：不要加上 `target="_blank"`，也不要改用 `window.open`；若該頁有自己的前端路由，請保持為一般外部連結（不要攔截 click 再交給路由處理）。
