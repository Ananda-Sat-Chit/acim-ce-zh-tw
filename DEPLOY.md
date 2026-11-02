# ACIM CE 繁體中文 PWA V27.2 發布說明

本版以已交付及線上核對的 V27.1 為基準，工作重點是待機恢復後的操作回應、離線狀態工作排程，以及跨尺寸側欄與工具控制。完整變更、實際驗證範圍與未驗項目見完整包的 `V27_2_RELEASE_AND_TEST_REPORT.pdf` 或同名 Markdown 報告。

正式修訂時間由 `src/release.json` 固定設定，App 顯示台灣日期及 24 小時制時間。本文件也參與 ReleaseID 計算，修改本文件後必須重新建置與驗證。

## 書稿與原有資料

本版 `src/book.html` 與 V27.1 逐位元相同，固定 SHA 為 `5e311405bf95962d560fe753560a3eb11b20689efeb91e1ff69559abab9adc93`。57 條英中拆段、所有原文、HTML 標記、語言屬性、ID、空白與 2,927 個註文區塊均保留。

A-C05 原句保持：最後一生的身體就此消失。原有 13 項譯者／編務待決內容沒有藉本次介面與效能修改而自動改譯。

書籤及偏好繼續使用原有儲存資料。一般更新不需要清除網站資料；可先匯出書籤備份。清除網站資料可能同時刪除書籤、偏好與離線資料，不能當成日常升級步驟。

## 上傳 GitHub Pages

1. 解壓縮 `ACIM_CE_V27_2_GitHub_Upload.zip`，進入 `github-upload/`。
2. 將此資料夾內全部 23 個檔案及原有子資料夾覆蓋原儲存庫網站根目錄，保留 `fonts/`、`index.files/` 與 `.nojekyll`。不要多加一層 `github-upload` 網址路徑。
3. 同一次提交包含 `index.html`、`sw.js`、`manifest.json` 與全部配套資源，等待 GitHub Pages 部署完成。
4. 可使用提交訊息：`V27.2: improve resume scheduling and responsive reader controls`。
5. 依本文件與正式報告驗收升級、恢復操作與離線行為。

完整包外層的 `src/`、`checks/`、`evidence/`、`manual-tests/`、報告和 SHA 清單供維護與交接保存，不必部署到公開網站。若使用另附純部署包，根目錄已是相同 23 個網站檔案。

本包未代為推送或部署 GitHub。

## 更新與離線驗收

連線開啟 App，等待更新提示，套用後重新載入。確認版本為 `v27.2`，修訂時間符合本次發布設定。版本文字相同不代表頁面和當前控制它的 worker 必然屬於同一 build；完整 ReleaseID 仍須一致。

若顯示更新尚未套用，先完成提示及重新載入。其他版本或 build 的離線資料不能作為本次完整保存的證據。安裝不主動跳過 waiting，仍由更新提示套用。

恢復頁面後先操作設定與資訊，確認控制項可展開、收合及捲動，再查看離線狀態。上次確認結果與本次重新驗證應清楚區分；若尚未重新確認，不應自行推定全部離線資料仍完整。需要確認時保持連線，使用 App 的重新檢查／補齊功能，等待結果後再驗收。

看到全書、字型與書內圖片已完成當次驗證後，關閉網路、關閉並重開書籍，抽查正文、註腳、字型與圖片。作業系統或瀏覽器日後仍可能回收資料，完成狀態不是永久保存保證。

外部英文 `acimce.app` 和裝置語音服務不包含在中文 App 的全書離線快取。系統是否有可用中英文聲音，需依該裝置確認。

## 發布識別與快取

| 項目 | 規則 |
|---|---|
| 人類可讀版本 | HTML `acim-version`、`ACIM_VERSION`、SW `CACHE_VERSION` 均為 `v27.2` |
| 建置識別 | HTML `acim-release-id` 與 SW `RELEASE_ID` 為同一完整 64 位 SHA-256 |
| Shell cache | `acimce-zh-tw-shell-v27.2-<releaseId>` |
| Runtime cache | `acimce-zh-tw-runtime-v27.2-<releaseId>` |
| 字型 cache | 使用獨立共用名稱，仍逐檔核對 SHA |
| 版本比較 | 數字段逐項比較，例如 `v27.1 < v27.2 < v27.10`；缺少尾段視為 0 |
| 啟用清理 | 只清理已辨識且嚴格較舊的專案版本及原有明列舊格式 |
| 必須保留 | 同數字版本其他 build、較新、未知名稱及其他專案 cache |
| localStorage | 書籤／偏好是另一資料層，不作版本 cache 刪除 |

同版 cache 的 hash 無法判斷哪些 worker 還在 waiting，因此不猜測刪除同版其他 build。安裝失敗仍保護其他可讀版本；完整同 build shell 可經驗證後重用。新 worker 無法回頭改寫裝置上已安裝的舊 worker，真正的 V27.1→V27.2 接管仍須實機驗收。

## 發布端驗收重點

下表是應驗收項目。哪些本輪已執行、哪些未執行或受政策限制，以 `evidence/browser_v272_validation.json` 為準，不以模型結果代替真機。

| 平台或情境 | 驗收重點 |
|---|---|
| 桌面 Chrome／Edge | 更新接管、多分頁、鍵盤焦點、側欄及工具列、視窗變窄與恢復 |
| Android Chrome／已安裝 PWA | 鎖螢幕與待機後立即點設定、觸控區域、長按書籤、橫豎向、安裝與更新、離線冷啟動 |
| iPhone／iPad Safari／主畫面 | 前背景恢復、可見視窗變化、安全邊界、軟鍵盤、VoiceOver、更新及離線 |
| macOS Safari | 鍵盤、視窗尺寸、worker 接管、離線及系統語音 |
| 各平台與不同字級 | 右側圖示辨識、按鈕觸控尺寸、文字大小調整、側欄遮擋、工具列與底欄重疊、設定捲動 |
| 待機與重複操作 | 連續恢復事件不累積重複工作，設定先顯示、狀態適當更新，關閉／再開不跳回不合理位置 |

Node VM、jsdom、受控事件／時鐘、CacheStorage／Fetch 模型不等同真實手機速度。靜態 CSS 或幾何規格也不是原生瀏覽器截圖。`manual-tests/` 可供使用者自行檢查視窗與操作，但 iframe 不可代替頂層正式 PWA 的安裝／SW／離線驗收。

## 維護與重建

來源為 `src/book.html`、`src/app.template.html`、`src/sw.js`、`src/release.json`。固定資源在 `github-upload/`。不要直接修改生成的 `index.html` 或 `sw.js`。

```bash
npm ci --prefix checks
python3 checks/build_release.py
python3 checks/build_release.py --check
python3 checks/run_checks.py
python3 manual-tests/make_browser_harness.py
python3 checks/make_package.py
```

詳細契約與單項指令見 `checks/README.md`。完整包保留原 331 個案例 ID，再加入本版效能／恢復與 UI 專項；所有正式結果都必須對應最後成品。前版結果與截圖不能改名充作本輪通過。

若只修改日期、文件、CSS、JS 或 SW，也須完整重建；ReleaseID 應由來源自動產生，不能手改 SHA。

## 回復與再次發布

後續可用更高數字版本發布修復；相同 v27.2 重發亦須完整重建，使內容改動產生新的 ReleaseID。回復 Git 提交時須成對回復 HTML、worker 及配套資源，再確認部署和控制權切換。

不要只回復 HTML，或清除全部網站資料來代替修復。請保存原完整包、交付檢核、最後測試結果及使用者書籤備份。
