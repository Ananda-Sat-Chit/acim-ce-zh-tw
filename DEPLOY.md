# ACIM CE 繁體中文 PWA V27.5 更新說明

V27.5 處理 Android 手機目錄操作仍慢及朗讀暫停後無法繼續的回報，保留 V27.4 的配色、圖示、按鈕尺寸、書稿與 180 ms 抽屜動畫。完整原因、修改、測試及限制見 `V27_5_ANDROID_PERFORMANCE_TTS_REPORT.pdf`。

本包提供來源與模型可驗證的修正。原回報手機的實際聲音、觸控延遲、無障礙及 PWA 行為仍須驗收，未宣稱已達 30% 反應時間改善。

## 本版操作變化

1. 明確由 Android 觸控開啟目錄時，初始焦點工作延後至後續動畫排程；介面與防誤觸狀態照常套用。關閉、跨斷點、背景化或使用者另選控制項時，過期焦點工作不得搶回焦點。鍵盤與未知輸入沿用同步焦點方式。
2. 對不能取消的觸控移動／滾輪事件，避免無效的捲動幾何讀取；可取消事件的邊界防護及抽屜期間的 listener 生命週期保留。
3. Android 暫停由 App 保存目前分句與待讀佇列。按繼續時重讀目前分句，接著完成剩餘內容；不依賴 Android 原生 resume 恢復已停止的聲音。
4. Android 段落朗讀進入背景後保持暫停，回到 App 不自動出聲。註腳沒有段落繼續控制列，背景時停止並重設，須由使用者重新啟動。
5. 非 Android 桌面沿用原生 pause/resume；語言、語速、音色偏好及原有段落／註腳入口保留。

分句重讀可能重複暫停前已聽到的部分，不保證從同一字精準續接。是否實際出聲要聽音確認，不能只看按鈕文字或引擎狀態旗標。

## 上傳 GitHub Pages

1. 解壓縮 `ACIM_CE_V27_5_GitHub_Upload.zip`，進入 `github-upload/`。若使用另附純部署包，其根目錄就是同一組網站檔案。
2. 覆蓋全部 23 個網站檔案及子資料夾，保留 `fonts/`、`index.files/` 與 `.nojekyll`，不要多包一層 `github-upload/` 網址路徑。
3. 同一次提交包含 `index.html`、`sw.js`、`manifest.json` 與全部資源，等待 GitHub Pages 部署完成。
4. 提交訊息可用 `V27.5: improve Android reader interaction and recover paused speech`。
5. 依 App 更新提示套用並重新載入，確認版本 `v27.5`、本次修訂時間，及 HTML／當前控制 worker 相同的完整 ReleaseID。

本包未代為推送或部署 GitHub。外層的原始碼、檢核、證據、手動工具及報告供維護保存，不必部署到公開網站。

## 書稿、書籤與偏好

`src/book.html` 與 V27.4、V27.3、V27.2、V27.1 逐位元相同，SHA-256：

`5e311405bf95962d560fe753560a3eb11b20689efeb91e1ff69559abab9adc93`

英中拆段、術語 ID、語言屬性、註文、分享編號與 A-C05 等原譯者待決文字不變。更新沿用原儲存鍵名，不要求清除網站資料；可先匯出書籤備份。清除資料不是一般更新程序。

## Android 優先驗收

| 情境 | 應確認的結果 |
|---|---|
| 原回報手機直接點目錄 | 首次及暖機後分開記錄，目錄可見、關閉與焦點控制正常 |
| 點目錄後立即選搜尋／設定 | 延後焦點不得搶走使用者剛選擇的控制項 |
| 大分支展開與觸控捲動 | 保留展開狀態、TOC 位置與背景防穿透；關閉後正文正常捲動 |
| 段落暫停 → 繼續 | 暫停時無聲，繼續重讀目前分句，後續不跳句或排入兩份聲音 |
| 多次快速暫停／繼續與停止 | 不重疊；停止後舊事件或定時器不能重新出聲 |
| 暫停時換段落／英中語言 | 舊工作結束，新段落使用自己的文字、語言與高亮 |
| 暫停時調語速／音色 | 重讀與下一單位符合說明，另記裝置引擎是否有實際差異 |
| 背景與鎖螢幕後返回 | 段落保持暫停；註腳已停止；不自動恢復聲音 |
| 桌面 Chrome／Edge／Safari | 保留原生 pause/resume 路徑及既有鍵盤、面板行為 |

`manual-tests/native_acceptance_v27_5.json` 有固定 N275-01 至 N275-26，交付時全部 `not_run`，`native_audio_tested:false`。記錄裝置、Android／瀏覽器／語音引擎版本、視窗、字級、主題、網路、首次／暖機狀態及實際聲音。未測的項目不能改成通過。

## 人工 A/B 比較與限制

`manual-tests/v27_5_interaction_comparison.html` 包含固定 V27.4 基準與目前 V27.5 完整 App；只插入資源 base，其餘原程式保存。記錄器不替換 speechSynthesis 或語音事件，不自動操作按鈕，也不預填結果。

在同一裝置以相同條件，對每種目錄／設定操作分別記錄至少 20 次，交換版本順序，首次與暖機分開。Event Timing 可能略過短事件；未回報不是 0 ms，混合操作的 P50／P95 也不是某個按鈕的成績或整頁 INP。程式工作量下降不能直接換算為延遲改善比例。

iframe 尺寸不是 Android／iOS 模擬，不能取代頂層 HTTPS PWA 的安裝、更新、背景、鎖螢幕、使用者啟用、音訊與離線冷啟動。實際平台狀態見 `evidence/browser_v275_validation.json`。

## 快取與離線

| 項目 | 規則 |
|---|---|
| 版本 | HTML、JavaScript 與 worker 為 `v27.5` |
| 建置 | 完整 64 位 ReleaseID 綁定 HTML、worker 與資源 |
| 快取 | shell/runtime 依版本及 ReleaseID 分隔，字型逐檔 SHA 驗證 |
| 清理 | 只清理明確且嚴格較舊的本專案版本 |
| 保留 | 同版其他 build、較新／未知快取、其他專案及 localStorage |
| 更新 | 沿用提示套用 waiting worker，不強制跳過 |

完成當次全書、字型與圖片保存確認後，才斷網重開抽查。外部英文網站與裝置語音不包含在中文書籍離線快取；下載書籍完整不代表語音引擎離線可用。V27.4→V27.5 真正接管與離線冷啟動需在裝置另驗。

## 維護與重建

```bash
npm ci --prefix checks
python3 checks/build_release.py
python3 checks/build_release.py --check
python3 checks/run_checks.py
python3 manual-tests/make_browser_harness.py
python3 manual-tests/make_interaction_comparison.py
python3 checks/make_package.py
```

修改正規 `src/` 後重建，不手改生成檔。歷史書稿／App 基準及案例 ID 保留，本輪 Android 修改用精確可逆差異核對；TTS 歷史 SHA 不因新修補而被抹除。正式結果、手動工具及報告必須對應同一份最終成品。本文件參與 ReleaseID，修改後也要重新建置。

回復時成對回復 HTML、worker 與資源並確認接管。已安裝的新 worker 不保證因較舊版號上傳而自動回復；必要時以更高修訂版本發布已確認來源。
