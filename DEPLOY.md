# ACIM CE 繁體中文 PWA V27.3 發布說明

V27.3 針對已上線 V27.2 在目錄、設定及功能切換的卡頓回報。保留新版介面，將暫時互動狀態限制在小型 UI 區域，避免每次開關把整本書設為 inert；導航改為先完成側欄狀態再量目標位置。完整分析、修改與證據見完整包的 `V27_3_INTERACTION_FIX_REPORT.pdf` 或同名 Markdown 報告。

本版自動檢核證明來源、行為與工作路徑符合契約；原生手機延遲、觸控慣性、無障礙及實際更新接管仍需驗收。不得以 DOM 模型耗時宣稱手機速度。

正式修訂時間由 `src/release.json` 固定設定，App 顯示台灣日期及 24 小時制。本文件參與 ReleaseID 計算，修改後必須重新建置與驗證。

## 書稿與資料保全

`src/book.html` 與 V27.2、V27.1 逐位元相同，固定 SHA 為 `5e311405bf95962d560fe753560a3eb11b20689efeb91e1ff69559abab9adc93`。57 條英中拆段、HTML 標記、語言屬性、ID、空白及 2,927 個註文區塊均保留。A-C05「最後一生的身體就此消失。」及原有 13 項譯者／編務待決內容沒有變更。

書籤與偏好使用原有儲存資料。一般更新不需要清除網站資料，可先匯出書籤。清除網站資料可能同時刪除書籤、偏好與離線資料，不能作日常升級程序。

## 上傳 GitHub Pages

1. 解壓縮 `ACIM_CE_V27_3_GitHub_Upload.zip`，進入 `github-upload/`。
2. 將其中全部 23 個檔案及子資料夾覆蓋原儲存庫網站根目錄，保留 `fonts/`、`index.files/` 與 `.nojekyll`。不要多加一層 `github-upload` 網址路徑。
3. 同一次提交包含 `index.html`、`sw.js`、`manifest.json` 及全部資源，等待 GitHub Pages 部署完成。
4. 可使用提交訊息：`V27.3: bound reader UI work and settle navigation before measurement`。
5. 依下列程序確認版本、互動、更新及離線。

完整包外層的原始碼、檢核、證據、手動工具、報告及 SHA 清單供維護保存，不必部署。若使用純部署包，其根目錄就是同一組 23 個檔案。本包未代為推送或部署 GitHub。

## 更新與互動驗收

連線開啟 App，等待更新提示，套用並重新載入。確認版本 `v27.3` 與本次修訂時間。HTML 和控制它的 worker 必須有相同完整 ReleaseID；只有版號相同不足以證明是同一 build。安裝不主動跳過 waiting，仍由提示套用。

在原本發生卡頓的手機，以相同主題、字級及閱讀位置，重複操作開啟目錄、設定與資訊、返回目錄、關閉目錄、章節／詞彙／搜尋跳轉。保留首次操作和暖機後結果；每版至少 20 次真人操作，再交換版本順序比較。確認背景不能誤觸、側欄可捲動，關閉後正文立即恢復正常捲動與焦點。鎖螢幕、前背景與橫豎向另行測試。

`manual-tests/v27_3_interaction_comparison.html` 可供自行比較兩版完整 App，記錄瀏覽器支援的 Event Timing 與長影格資料。iframe 尺寸不是裝置模擬，資料不等同頂層 PWA 的 INP 或真機驗收；沒有回報事件也不是 0 ms。詳細條件及限制見手動工具 README。

離線狀態沿用 V27.2 的新鮮時間、過期標示與手動重新驗證。保持連線，完成全書、字型及圖片當次確認，再斷網、關閉並重開書籍，抽查正文、註腳、字型與圖片。裝置日後仍可能回收資料，不能視為永久保存保證。

外部英文 `acimce.app` 與裝置語音不在中文全書離線快取內。

## 發布識別與快取

| 項目 | 規則 |
|---|---|
| 版本 | HTML `acim-version`、`ACIM_VERSION`、SW `CACHE_VERSION` 均為 `v27.3` |
| 建置識別 | HTML 與 SW 使用同一完整 64 位 ReleaseID |
| Shell cache | `acimce-zh-tw-shell-v27.3-<releaseId>` |
| Runtime cache | `acimce-zh-tw-runtime-v27.3-<releaseId>` |
| 字型 | 獨立共用快取，仍逐檔核對 SHA |
| 版本比較 | 數字段逐項比較：`v27.2 < v27.3 < v27.10`；缺少尾段視為 0 |
| 清理 | 僅清除明確辨識且嚴格較舊的專案版本及明列舊格式 |
| 保留 | 同數字版本其他 build、較新版本、未知名稱及其他專案 |
| localStorage | 書籤／偏好與版本快取分離，不作版本清理 |

同版 hash 無法判斷哪些 worker 仍在 waiting，不猜測刪除同版其他 build。新 worker 不能回頭改寫裝置已安裝的舊 worker；V27.2→V27.3 真正接管須另驗。

## 平台驗收與證據

| 平台或情境 | 重點 |
|---|---|
| 原回報的 Android 手機與已安裝 PWA | 目錄／設定連續切換、長書跳轉、關閉後正常捲動、待機恢復、安裝／更新／離線冷啟動 |
| iPhone／iPad Safari 與主畫面 | 觸控慣性、安全區、鍵盤、橫豎向、焦點保護、VoiceOver |
| 桌面 Chrome／Edge／Safari | 鍵盤、側欄開關、縮放、跨斷點、多分頁更新 |
| 所有尺寸 | 保留工具圖示與觸控大小、側欄可捲、正文不誤觸、面板互不遮擋 |

本輪已執行、未執行與受限制事項以 `evidence/browser_v273_validation.json` 為準。歷史截圖不會自動當成新版證據。Node VM、jsdom、受控幾何／時鐘／快取模型沒有原生 style/layout、無障礙樹或觸控延遲。

## 維護、重建與封裝

```bash
npm ci --prefix checks
python3 checks/build_release.py
python3 checks/build_release.py --check
python3 checks/run_checks.py
python3 manual-tests/make_browser_harness.py
python3 manual-tests/make_interaction_comparison.py
python3 checks/make_package.py
```

修改 `src/`，不要手改生成的 HTML 或 worker。詳細授權契約及單項指令見 `checks/README.md`。原 402 個案例 ID 保留，再加本版來源契約及互動專項；全部結果都須對應最終成品。

日期、文件、CSS、JS 或 SW 有變更也須完整重建。後續可發布更高版本；同版重發也要產生新的 ReleaseID。回復時成對回復 HTML、worker 與資源並驗證接管，不能只回復 HTML 或用清除資料代替修復。
