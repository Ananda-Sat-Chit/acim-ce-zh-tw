# ACIM CE 繁體中文 PWA V27.6.1 匯出修補

此版修復 V27.6 在手機目錄開啟時，效能紀錄的下載動作被 App 自己攔截的問題。原下載連結建立在側欄外，與背景防誤觸保護衝突；現在改為建立在設定面板的匯出控制列內。背景防誤觸規則保留。

頁面會顯示檔名 ACIM_v27.6.1_performance.json，並說明已要求瀏覽器下載，而不宣稱手機已完成存檔。若啟動下載發生程式錯誤，仍保留當次紀錄，讀者可重試。

## 部署

1. 純部署包解壓後，將根目錄全部 23 個網站檔案與子資料夾覆蓋原 GitHub Pages 發布位置。完整維護包則使用 github-upload/ 內同一組檔案。
2. index.html、sw.js、manifest.json 及所有字型、圖檔需一併提交。保留 fonts/、index.files/ 及 .nojekyll，不增加一層 github-upload/ 網址。
3. 等待 Pages 部署完成，依 App 更新提示套用新版並重新載入，確認目錄顯示 v27.6.1。
4. 此更新保留既有書籤與偏好的儲存鍵。一般更新不需要清除網站資料或解除安裝。

本包沒有代為推送 GitHub。完整維護包的來源、檢核、證據與說明文件不必部署到網站。

## 匯出與尋找檔案

1. 開啟目錄 → 設定與資訊 → 效能檢測。
2. 按開始記錄，操作目錄、設定與功能鈕，遇到卡頓後等待恢復。
3. 回到效能檢測，按停止記錄，再按匯出紀錄。若瀏覽器詢問儲存位置或確認下載，完成該步驟。
4. Android 開啟檔案管理器，查看下載或 Downloads；或開啟 Chrome 選單中的下載。
5. 搜尋 ACIM_v27.6.1_performance.json。重複下載時，系統可能在檔名附加序號。
6. 將 JSON 檔作為附件提供給維護者。它不會自動上傳。

原 V27.6 的失敗匯出不保證存在任何檔案。效能紀錄只暫存在原分頁；更新或重新整理後必須重新記錄。請勿將清除網站資料當作尋找檔案的方法。

## 修補範圍與驗證

產品來源只有一個可逆的匯出處理區塊修補。書文、註腳、語言拆段、分享編號、目錄與功能鍵布局、TTS 策略，以及背景事件保護保持 V27.6 內容。

驗證使用完整正式 HTML 在受控 DOM 環境派送真實 DOM click 事件，保留產品事件捕捉及保護流程；舊 V27.6 作負對照。這與只把 anchor.click 換成紀錄函式的單元測試不同，能檢查下載動作是否在抵達連結前被 App 取消。

受控 DOM 無法證明 Android 作業系統已建立檔案。本次沒有原生手機下載、瀏覽器視覺、語音或真機耗時驗收。部署後請依維護包 manual-tests/V27_6_1_ANDROID_EXPORT_CHECKLIST.md，在原回報手機分別測 Chrome 分頁與主畫面 PWA。

## 維護重建

```bash
npm ci --prefix checks
python3 checks/build_release.py
python3 checks/build_release.py --check
python3 checks/run_checks.py
python3 checks/make_package.py
```

修改 src/ 正規來源後重新建置；不直接修改生成的 index.html。歷史來源、案例 ID 與可逆差異保留。DEPLOY.md 參與 ReleaseID，改動後須重新建置與檢核。
