# V22 部署說明 — 完整加註版奇蹟課程 PWA

## 上傳 GitHub（覆蓋式部署）

將本資料夾內的**所有檔案**上傳到 `ananda-sat-chit/acim-ce-zh-tw` 儲存庫的根目錄
（即 GitHub Pages 服務的分支/目錄），完全**覆蓋**舊檔：

```
index.html          ← 全書（V22 優化版，與 index.htm 內容相同）
index.htm           ← 全書（SW 完整性驗證的主檔）
sw.js               ← Service Worker v22（自包含，不再依賴 Workbox CDN）
manifest.json       ← PWA 資訊清單（加 id 欄位）
offline.html        ← 離線回退頁（沿用 V21）
favicon.ico
pwa-192x192.png     ← 重壓縮（42.5KB → 6.8KB）
icon-512.png        ← 重壓縮（59.7KB → 10.5KB）
.nojekyll           ← 新增（禁用 Jekyll 處理）
fonts/
  lxgw-slice0.woff2 … lxgw-slice7.woff2   ← 楷體子集 8 片（共 594KB）
index.files/
  image001.webp     ← 封面（原 image001.png 874KB → 24KB）
  image002.webp     ← 手稿照（原 image002.png 709KB → 102KB）
  ce-manuscript.webp← 手稿引文（原 94KB → 17KB）
```

### 刪除清單（舊檔請一併移除，避免混淆）

- `index.files/image001.png`、`index.files/image002.png`、
  `index.files/ce-manuscript-d43d5d40e701.png`（已由 .webp 取代）

### 驗證部署

上傳後約 1–2 分鐘生效，依序檢查：

1. 開啟 https://ananda-sat-chit.github.io/acim-ce-zh-tw/ — 封面應正常顯示，
   側欄版本標籤顯示 **v22**。
2. DevTools → Network：首次載入總傳輸應約 **1.8 MB**（Win/Mac/iOS 不載入
   LXGW 時約 1.77 MB；Linux/Android 於載入後 2.5 秒起陸續下載楷體子集，
   共 594KB）。
3. DevTools → Application → Service Workers：狀態 activated，來源 `sw.js`
   （不再出現 storage.googleapis.com）。
4. 點深色按鈕（🌓）— 應即時翻轉（無漸變動畫，屬預期行為）。
5. 搜尋「奇蹟」— 首次按 Enter 應在約 0.2 秒內顯示結果。
6. DevTools → Console 執行 `await (await caches.keys())` 應含
   `acim-shell-v22`、`acim-fonts-v22`、`acim-runtime-v22`。

### 舊用戶升級路徑

- V21 的 SW 不會自動被替換（`skipWaiting` 需明確觸發）：瀏覽器偵測到
  `sw.js` 位元組差異後於背景安裝 v22，**下次**造訪生效；或使用者在
  DevTools 手動 `skipWaiting`。安裝成功後 activate 階段自動清除
  `acim-shell-v21`、`acim-content-v21`、`acim-images-v19`、
  `acim-font-css-v21`、`acim-font-files-v21`、`acim-fonts-v19` 等舊快取。
- 讀書進度、書籤、深色偏好、字級設定都在 localStorage（key 未變），升級無感。

## 本版三大變更（等價性工程）

| # | 變更 | 目的 |
|---|------|------|
| 1 | 深色模式改為 CSS 變數即時翻轉＋移除 5 條全元素 `!important` 覆蓋 | 切換 729ms → ~22–46ms |
| 2 | Word inline style 去重為 383 個 class、a11y 屬性執行期合成、空白塌縮、圖片 WebP、楷體子集自架、捨棄 Workbox CDN | 首訪 6.10MB → 1.77MB |
| 3 | 搜尋索引啟動 1.2 秒後閒置預建＋批次預算加大 | 首次搜尋 538ms → ~190ms |

詳見同目錄《V22_驗收報告.md》。
