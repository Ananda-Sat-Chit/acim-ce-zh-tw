# V23 部署說明 — 完整加註版奇蹟課程 PWA

V23 是「V22 評測報告」五項改進建議的完整落地版：**三項量化指標（深色切換 <100ms、
首訪傳輸 <2.2MB、首次搜尋 <300ms）維持全達標**，並消除安裝期重複下載、
倉庫殘留與深色模式體驗的最後瑕疵。

## 上傳 GitHub（覆蓋式部署）

將本資料夾內的**所有檔案**上傳到 `ananda-sat-chit/acim-ce-zh-tw` 儲存庫根目錄，
完全**覆蓋**舊檔：

```
index.html          ← 全書（V23：版本號 v23、深色初始化上移 head、OS 跟隨、idle 索引預建）
index.htm           ← 【新】數百位元組轉址 stub（相容舊捷徑，不再是 5.2MB 全書副本！）
sw.js               ← Service Worker v23（全書快取金鑰改 './'，安裝期零重複下載）
manifest.json       ← start_url 改 './'（捷徑同步）
.nojekyll           ← 【新】禁用 Jekyll 處理（0 位元組，建議補上）
offline.html        ← 沿用 V22
favicon.ico         ← 沿用
pwa-192x192.png     ← 沿用
icon-512.png        ← 沿用
screenshot-og.png   ← 【更新】重壓縮 591KB → 234KB（256 色量化，僅供分享卡/安裝面板）
DEPLOY.md           ← 本說明
fonts/
  lxgw-slice0.woff2 … lxgw-slice7.woff2   ← 楷體子集 8 片（共 593KB，沿用）
index.files/
  image001.webp      ← 封面（24KB）
  image002.webp      ← 手稿照片（102KB）
  image003.jpg       ← 版權頁（138KB）
  ce-manuscript.webp ← 手稿標記圖（17KB）
```

### 刪除清單（請務必在 GitHub 網頁上一併刪除，共約 16.5MB 倉庫殘留）

`index.files/` 內除上述 4 檔以外**全部刪除**，特別是：

- `image.emf`（13.9MB！Word 匯出殘留，無任何引用）
- `image001.png`、`image002.png`、`image003.png`、`image004.png`（已由 WebP 取代）
- `image004.png`、`ce-manuscript-d43d5d40e701.png`、`colorschememapping.xml`、
  `filelist.xml`、`header.htm`、`item0001.xml` 等 8 個 xml、`props00*.xml`、
  `themedata.thmx`（Word「另存網頁」附帶物，全數無引用）

> 註：GitHub 網頁上傳無法刪檔，請先在儲存庫頁面逐一 Delete 舊的
> `index.files/*` 殘留檔，再上傳本資料夾。

## 驗證部署

上傳後約 1–2 分鐘生效，依序檢查：

1. 開啟 https://ananda-sat-chit.github.io/acim-ce-zh-tw/ — 封面正常，側欄版本標籤 **v23**。
2. DevTools → Application → Service Workers：狀態 activated；Cache Storage 內
   `acim-shell-v23` 應含 5 筆（`/acim-ce-zh-tw/`、`index.htm`、`offline.html`、
   `manifest.json`、`favicon.ico`），且 `/acim-ce-zh-tw/` 與全書同位元組數 5,206,219 B。
3. **V23 關鍵驗證**：DevTools → Network 勾選 Disable cache 之外的全新無痕視窗開站，
   等待 30 秒：Network 面板中 **index 文件只出現 1 次下載（約 1.87MB）**——
   V22 會在 Service Worker 安裝期多下載一份 index.htm（1.87MB），V23 已歸零
   （安裝驗證命中導航回應的 HTTP 快取）。
4. 系統切換深色模式（或 DevTools Rendering → Emulate prefers-color-scheme）：
   讀者從未手動切換過深色時，站點應**即時跟隨作業系統**翻轉；一旦手動點過 🌓
   按鈕，則以手動選擇為準（localStorage `acim-dark`）。
5. 深色切換延遲：點擊 🌓 應於 1 幀內翻轉（實測中位數 14.6ms）。
6. 搜尋「奇蹟」：首搜結果應在約 0.13–0.18 秒內出現（含 120ms 防抖）。
7. 舊連結相容：直接開 `…/acim-ce-zh-tw/index.htm` 應立即轉址到 `…/acim-ce-zh-tw/`。
8. DevTools → Console：`(await caches.keys())` 應含 `acim-shell-v23`、
   `acim-fonts-v23`、`acim-runtime-v23`（v22 系列快取自動清除）。

## 舊用戶升級路徑

- V22 的 SW 偵測到 sw.js 位元組差異後於背景安裝 v23，讀者點按更新提示
  （或下次造訪）後生效；activate 階段自動清除 `acim-*-v22` 快取。
- V21/V22 期已安裝的 PWA：start_url 仍指 `index.htm` → 由 stub 轉址，閱讀進度、
  書籤、深色偏好、字級（localStorage key 未變）全部保留，升級無感。

## 本版五項變更（V22 評測報告建議的落地）

| # | 變更 | 效果 |
|---|------|------|
| 1 | 全書快取金鑰 `index.htm` → `'./'`；index.htm 改 316 B stub | SW 安裝期不再重複下載 1.87MB，首訪總傳輸 -1.87MB |
| 2 | 刪除 index.files 16.8MB 殘留（image.emf 13.9MB 等） | 倉庫 -16.5MB（僅倉庫成本，讀者傳輸本就不含） |
| 3 | 深色初始化上移 `<head>`＋`prefers-color-scheme` 跟隨 | 深色用戶首繪不再閃白；未手動設定時跟隨系統並即時切換 |
| 4 | 搜尋索引預建改 requestIdleCallback（timeout 4s 兜底） | 與首屏/滾動的競爭最小化；最壞首搜實測仍 180ms |
| 5 | screenshot-og.png 重壓縮 591KB → 234KB | 分享卡/安裝面板載入加速（讀者主流程不受影響） |

## 三項量化指標（本地全量測試實測）

| 指標 | 目標 | V23 實測 | 判定 |
|------|------|---------|------|
| 深色模式切換 | < 100ms | 14.6ms（中位數） | ✅ |
| 首訪傳輸（關鍵路徑） | < 2.2MB | 1.96MB；含背景字型 2.36MB；含 SW 安裝亦不再增 1.87MB | ✅ |
| 首次搜尋 | < 300ms | 135ms（就緒）／180ms（最壞） | ✅ |
