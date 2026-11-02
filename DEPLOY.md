# ACIM CE 繁體中文 PWA V27.1 發布說明

本次七項修改、逐項驗證與平台限制見完整上傳包內 `V27_1_RELEASE_AND_TEST_REPORT.md`。正式修訂時間由 `src/release.json` 固定設定，App 側欄顯示台灣時區的日期及 24 小時制時間。

書稿只作明確授權的排版：第一章指定引句置中、Cameo 29 指定圖片位置與窄螢幕呈現、57 個詞彙標題間距及英中解說拆段。全書包含空白的文字逐字相同，原有 ID 與全部 2,927 個註文區塊保留；59 筆可逆 patch 可完整還原 V27 原稿。英中段落新增語言及穩定 ID，不更動譯文。

A-C05 保留原句：最後一生的身體就此消失。A-T01 至 A-T07、Cameo 8/16/21 版本同步、Cameo 33 斷段、A-R02 及 A-C05 共 13 項仍待譯者或編務核定，不列為本次完成事項。

## 上傳 GitHub Pages

1. 解壓縮 `ACIM_CE_V27_1_GitHub_Upload.zip`，進入 `github-upload/`。
2. 將此資料夾內全部檔案及子資料夾覆蓋原儲存庫網站根目錄，保留 `fonts/` 和 `index.files/` 層級。不要多加一層 `github-upload` 網址路徑。
3. 同一次提交包含 `index.html`、`sw.js` 與全部配套資源，等待 GitHub Pages 部署完成。
4. 可使用提交訊息：`V27.1: improve reading layout, glossary speech and reference navigation`。
5. 依下列步驟驗收舊版升級、已安裝 App 與離線保存。

外層 `src/`、`checks/`、`evidence/`、報告及 SHA 清單是維護資料。請保存完整上傳包供重建與交接；不必把外層測試工具放到網站根目錄。本包未代為推送或部署 GitHub。

## 讀者更新與離線驗收

連線開啟 App，等待更新提示，套用後重新載入。確認側欄版本為 `v27.1`，展開「設定與資訊」核對修訂時間及離線狀態。只有版本文字相同，尚不足以證明頁面與控制它的 worker 屬於同一 build。

若顯示更新尚未套用，先完成更新提示及重新載入。其他版本或 build 的完整 cache 不會被當成本次完成證據。安裝不主動跳過 waiting，仍由更新提示觸發套用。

若字型或圖片尚未齊全，保持連線，依設定區按鈕補齊離線資料。確認全書、字型及書內圖片已驗證保存後，再關閉網路、關閉並重開書籍，抽查正文、註腳及圖片。狀態尚未確認時不可當作離線已完成；實際原因需依該裝置檢查。

完成狀態代表當次所需資源已在本機且雜湊吻合，作業系統或瀏覽器之後仍可能回收資料。外部英文 `acimce.app` 及系統語音服務不包含在中文離線書籍快取中。

一般更新不需要清除網站資料。更新前可匯出書籤備份；清除網站資料可能同時刪除書籤與偏好。localStorage 的書籤／偏好和 Service Worker／CacheStorage 的版本資源是不同資料層。

## 發布識別與快取規則

| 項目 | 規則 |
|---|---|
| 人類可讀版本 | HTML `acim-version`、`ACIM_VERSION`、SW `CACHE_VERSION` 均為 `v27.1` |
| 建置識別 | HTML `acim-release-id` 與 SW `RELEASE_ID` 使用同一完整 64 位 SHA-256 |
| 識別輸入 | 正規化 HTML、SW 邏輯、資源、上傳檔及固定建置設定；相同輸入產生相同識別 |
| Shell cache | `acimce-zh-tw-shell-v27.1-<releaseId>` |
| Runtime cache | `acimce-zh-tw-runtime-v27.1-<releaseId>` |
| 字型 cache | 延用共用名稱；逐檔核對 SHA |
| 安裝重用 | 既有同 build 的全書和四個核心資源全部驗證通過後才重用 |
| 安裝失敗 | 不刪除其他 build；僅處理本次新建且確定不完整的候選 shell |
| 版本比較 | 數字段逐項比較：`v27 < v27.1 < v27.2 < v27.10`；缺少的尾段視為 0 |
| 啟用清理 | 清理已辨識且嚴格較舊的專案版本；保留同版其他 build、較新、未知名稱及其他專案 |

同版 hash 不能判斷哪個 worker 還在 waiting，因此不以猜測方式刪除其他同版 build。這可能暫時多占空間；後續數字版本可清理嚴格較舊版本。不得自行刪除所有 v27.1 cache 當成一般更新步驟。

新 worker 的保護不能回頭改變裝置上已安裝的舊 worker。V27 → V27.1 接管、不同 build 分頁與已安裝 PWA 更新仍須實際驗收。

## 維護與重建

工作來源是 `src/book.html`、`src/app.template.html`、`src/sw.js`、`src/release.json`，固定資源放在 `github-upload/`。不要手改生成的 `index.html` 或 `sw.js`。在完整包根目錄執行：

```bash
npm ci --prefix checks
python3 checks/build_release.py
python3 checks/build_release.py --check
python3 checks/run_checks.py
python3 checks/make_package.py
```

詳細內容契約、明確時間核定、單項測試及後續改版邊界見 `checks/README.md`。`checks/finalize_release_contract.py` 先驗證固定 V27 原件與59筆 patch，才可寫入本次核定 SHA；不會自動接受其他書稿改動。

本文件也參與 ReleaseID 計算，修改本文件後須重新 build 與驗證。從已核定 HTML 書稿組裝 App 的流程，不包含 Word 轉換或英文內容自動補譯。

## 發布端實機驗收清單

下表為應驗收項目，實際已測範圍以完整包 `evidence/browser_v271_validation.json` 為準。未測的平台不得視為已通過。

| 平台 | 驗收重點 |
|---|---|
| 桌面 Chrome／Edge | V27 → V27.1 更新、同版重發的多分頁接管、章節與首句跳轉、選句分享、書籤及離線重開 |
| Android Chrome／已安裝 PWA | 安裝、更新提示、飛航模式冷啟動、實際觸控長按書籤、刪除復原及系統 TTS |
| iPhone／iPad Safari 與主畫面 | 加入主畫面、更新接管、關閉後離線重開、前背景切換、VoiceOver、英文／中文實際語音 |
| macOS Safari | worker 更新、離線重開、鍵盤操作、系統 TTS |
| 各平台 | 第一章引句置中、Cameo 29 圖片靠左且窄螢幕完整、57詞彙間距與英中段落、舊書籤重定位、英文對應段句 |

Node VM、jsdom、CacheStorage／Fetch 與語音模型不等同於原生瀏覽器、真機或音訊證據。系統是否有可用英文／中文語音，需依裝置實際確認。

## 回復與再次發布

後續可用 `v27.2` 或更高版本發布修復；同一 `v27.1` 再發也必須完整重建，使內容改動產生新 ReleaseID。回復 Git 提交時，成對回復 HTML、worker 及配套資源，並確認部署與控制權切換。

不得只回復 HTML、手改 SHA 或清除全部網站資料來代替修復。所有測試紀錄均須對應最終實際上傳的檔案指紋。
