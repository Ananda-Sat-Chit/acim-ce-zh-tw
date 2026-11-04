# ACIM CE 繁體中文版 V30.6 部署說明

## 版本資訊

- 版本：v30.6
- 建置時間：2026-11-04 14:07 (Asia/Taipei)
- 發布識別碼：`1577f8d589b9f6a1e106df32ddd04b2f2928578361e90772326f3a9554f6d0f2`
- 主程式 SHA-256：`11621f27b49fe175fe68db4cb6bd527fe416bdb08785e100c79cdff5168c4712`
- 基準：GitHub main 的 V30.5，包含 2026-11-04 已更新的 OG 設定。

## GitHub Pages 部署

將 `github-upload` 資料夾內的 `index.html`、`sw.js` 和 `DEPLOY.md` 三個檔案
放進現有 GitHub 儲存庫的根目錄，同一次 Commit 覆蓋舊檔。
不要把 `github-upload` 當成新資料夾上傳；請保留既有 `fonts/`、
`index.files/`、`manifest.json`、圖示與 OG 圖片。

本版不變更現有 PWA 網址、manifest id、讀者儲存資料鍵、TTS 內容、
書籍正文、TOC 或搜尋實作。已安裝 PWA 的讀者依既有版本更新提示套用新版本。
更新時不可只上傳 HTML：SW 內的版本、發布識別碼及整本書 SHA-256 必須同步。

## 功能調整

1. 已將 `og:description` 精簡為：

   支援全文搜尋、註釋查閱及離線閱讀，隨時隨地探索奇蹟課程。

   `description` 與 `twitter:description` 同步更新。OG 圖片沿用現有
   `og-share-20261104.png`，不重新上傳圖片。
2. LINE 內建瀏覽器：提供使用 LINE 官方網址參數 `openExternalBrowser=1`
   的連結，並提供複製功能。PWA 的段落分享網址也帶有此參數，保留原有章節錨點。
3. WeChat、Messenger、Facebook、Instagram、Telegram、WhatsApp、TikTok、
   KakaoTalk、Discord、Snapchat、X 及部分 Android WebView：在可識別的
   內建瀏覽器中，以非強制、可關閉的提醒建議使用外部瀏覽器。
4. iOS 建議 Safari；Android 建議 Chrome 或系統預設瀏覽器；一般電腦建議
   Chrome、Safari 或 Edge。一般 Chrome/Safari/Edge 與已安裝 PWA 不主動顯示。
5. 若 Web Speech API 缺少，讀者按語音按鈕時提供指引；若語音引擎回報實際
   錯誤，也可顯示提醒。正常 TTS 的播放、暫停、繼續邏輯維持不變。
6. 在通訊軟體內建瀏覽器不顯示不適用的 Safari 加入主畫面提示。

## 分享網址

一般網址：
https://ananda-sat-chit.github.io/acim-ce-zh-tw/

跨聊天軟體建議分享：
https://ananda-sat-chit.github.io/acim-ce-zh-tw/?openExternalBrowser=1

LINE 官方支援此網址參數；WeChat 等平台不保證接受，網頁會提供手動引導。
無法透過單純的網頁 JavaScript 強制所有通訊軟體開啟外部瀏覽器。

## 驗證與限制

- 已比對原始 V30.5 HTML 與 Service Worker 的 Git 物件 SHA，和 GitHub 現行版相同。
- HTML 中 10 段可執行 JavaScript 通過 Node 語法檢查。
- 12 種裝置與應用程式 User-Agent 使用 Chromium 模擬通過。
- 已測試提示關閉、重複顯示防護、原生編輯焦點保留、分享連結參數及錨點。
- 另測試獨立安裝 PWA 不顯示提示，以及缺少 TTS API 時的指引。
- 完整 HTML 於 Chromium 模擬 LINE/一般 Chrome 載入，無新增 pageerror；書籍內容與 TTS 控制列存在。
- 服務工作者版本、Release ID 與 HTML SHA-256 一致。
- 尚未在真實 LINE、WeChat、iOS Safari 或 Android Chrome 裝置驗證效能、語音輸出與外部瀏覽器跳轉。
- OG 分享摘要可能受聊天軟體快取影響，更新後不保證舊訊息卡片立即刷新。
