/**
 * arch-patch.js — 《完整加註版奇蹟課程》PWA 課程架構強化補丁 v1.1
 *
 * 修正 v1.1：
 *  - 修正章節標題為中文數字（第二十九章）導致跳轉按鈕無效的問題
 *  - 修正詳情卡文字溢出與截斷問題
 *  - 強化 arch-view 的高度與捲動行為
 *
 * 使用方式：在 index.htm 的 </body> 前加入：
 *   <script src="arch-patch.js"></script>
 */
(function () {
  'use strict';

  /* ═══════════════════════════════════════════════════════════════
     §1  中文數字轉阿拉伯數字（支援 1-31）
     ═══════════════════════════════════════════════════════════════ */
  var ZH_NUM = {
    '一':1,'二':2,'三':3,'四':4,'五':5,
    '六':6,'七':7,'八':8,'九':9,'零':0
  };

  function zhToArabic(s) {
    if (!s) return 0;
    s = s.trim();
    if (/^\d+$/.test(s)) return parseInt(s, 10);   // 已是阿拉伯數字
    if (!s.includes('十')) return ZH_NUM[s] || 0;  // 一 ~ 九
    var parts = s.split('十');
    var tens = parts[0] ? (ZH_NUM[parts[0]] || 1) : 1;
    var ones = parts[1] ? (ZH_NUM[parts[1]] || 0) : 0;
    return tens * 10 + ones;
  }

  /** 從標題文字提取章次（支援中/阿拉伯數字） */
  function extractChNum(text) {
    var m = text.match(/第([零一二三四五六七八九十\d]+)章/);
    return m ? zhToArabic(m[1]) : null;
  }

  /* ═══════════════════════════════════════════════════════════════
     §2  章節資料
     ═══════════════════════════════════════════════════════════════ */
  var PHASE_META = {
    foundation:  { label:'奠基 1-3章',   color:'#C9A227' },
    ego:         { label:'展開 4-7章',   color:'#8B5BAE' },
    healing:     { label:'深化 8-13章',  color:'#3A7AC8' },
    integration: { label:'整合 14-18章', color:'#2A8A6A' },
    culmination: { label:'高峰 19-26章', color:'#C85A30' },
    completion:  { label:'完成 27-31章', color:'#7A3080' }
  };

  var CHAPTERS = [
    {n:1, phase:'foundation', secs:9,  title:'奇蹟原則',
     topics:['奇蹟','知見基礎'],
     summary:'全書50條奇蹟原則，定義奇蹟的本質與功能。是整部課程的根基石。'},
    {n:2, phase:'foundation', secs:13, title:'正確的防衛機制',
     topics:['分裂','救贖'],
     summary:'引入分裂（separation）的觀念，探討防衛機制的正確詮釋。'},
    {n:3, phase:'foundation', secs:11, title:'清明的知見',
     topics:['知見','真知'],
     summary:'區分知見（perception）與真知（knowledge），引入研習的重要性。'},
    {n:4, phase:'ego', secs:11, title:'小我的掙扎',
     topics:['小我','聖靈初現'],
     summary:'深入分析小我的產生與運作，首次引入聖靈（Holy Spirit）的概念。'},
    {n:5, phase:'ego', secs:10, title:'聖靈',
     topics:['聖靈詳述','喜悅'],
     summary:'聖靈的主要闡述章：全然喜悅之靈、代上主發言的聲音。'},
    {n:6, phase:'ego', secs:8,  title:'愛的課題',
     topics:['投射','攻擊'],
     summary:'愛的課題：十字架的訊息、投射與分裂，「只教人愛」的核心原則。'},
    {n:7, phase:'ego', secs:10, title:'天國的延伸',
     topics:['延伸','療癒原則'],
     summary:'天國的律、才能的統一、療癒是憶起之道。力量延伸的根本原理。'},
    {n:8, phase:'healing', secs:9,  title:'全然指向療癒的意志',
     topics:['意志','身體角色'],
     summary:'討論療癒的意志，以及身體在課程中的角色與功能。'},
    {n:9, phase:'healing', secs:8,  title:'接受糾正',
     topics:['糾正','寬恕初步'],
     summary:'接受糾正的原則，以及如何在關係中實踐療癒與寬恕。'},
    {n:10, phase:'healing', secs:5,  title:'心靈回歸上主',
     topics:['回歸','恩典'],
     summary:'討論心靈回歸上主的路徑，以及恩典的概念與實踐。'},
    {n:11, phase:'healing', secs:9,  title:'上主的恩物',
     topics:['黑暗到光','恩物'],
     summary:'從黑暗到光、從幻相到實相的轉化過程，論述上主的恩物。'},
    {n:12, phase:'healing', secs:8,  title:'神聖的拉力',
     topics:['神聖拉力','共同目標'],
     summary:'神聖的拉力：詮釋他人動機、回應內在呼喚，尋找共同目標。'},
    {n:13, phase:'healing', secs:11, title:'時間與永恆',
     topics:['時間','永恆','罪疚深化'],
     summary:'討論時間的本質、永恆的觀念，以及罪疚在時間中的角色。'},
    {n:14, phase:'integration', secs:12, title:'正確教課的準則',
     topics:['聖靈課程表','天國教師'],
     summary:'聖靈的課程表、天國的教師，以及讓聖靈引領的原則。'},
    {n:15, phase:'integration', secs:11, title:'神聖一刻',
     topics:['神聖一刻','特殊關係'],
     summary:'神聖一刻與特殊關係同時完整登場。犧牲─罪疚─憤怒的循環被揭示。'},
    {n:16, phase:'integration', secs:7,  title:'審視特殊關係',
     topics:['真正的另類','恩典幻相'],
     summary:'恩典的幻相、被移植的衝動，探討真正的另類（true alternative）。'},
    {n:17, phase:'integration', secs:8,  title:'神聖關係',
     topics:['神聖關係','寬恕詳述'],
     summary:'神聖關係的主要引入章：從特殊關係中誕生的神聖關係的機制。'},
    {n:18, phase:'integration', secs:9,  title:'神聖關係的祝福',
     topics:['夢','幻相','從夢中醒來'],
     summary:'夢的本質、世界是幻相、尋找真實的自我。從夢中醒來的心靈準備。'},
    {n:19, phase:'culmination', secs:4,  title:'從罪咎到平安',
     topics:['罪(sin)詳述','基督聖容'],
     summary:'罪的完整課程式引入，以及基督聖容（face of Christ）首次出現。'},
    {n:20, phase:'culmination', secs:9,  title:'對弟兄的慧見',
     topics:['復活願景','神聖目的'],
     summary:'神聖的目的、基督的願景、復活的意義，看見無罪的世界。'},
    {n:21, phase:'culmination', secs:8,  title:'渴望一個無罪世界',
     topics:['原因結果','責任在心靈'],
     summary:'心靈對其知見的責任：快樂是一個選擇。原因與結果的課程。'},
    {n:22, phase:'culmination', secs:6,  title:'神聖關係的任務',
     topics:['救贖平安整合'],
     summary:'救贖與平安的深度整合：加入救贖的同盟，沒有矛盾的世界。'},
    {n:23, phase:'culmination', secs:4,  title:'擺脫衝突',
     topics:['戰爭幻相','失去幻相'],
     summary:'小我的戰爭與內在平安的對比，探討「失去」的幻相。'},
    {n:24, phase:'culmination', secs:7,  title:'特殊性之夢',
     topics:['偶像','特殊任務初現'],
     summary:'偶像的本質與束縛，尋找基督，走出偶像的詳細討論。'},
    {n:25, phase:'culmination', secs:9,  title:'聖靈的正義',
     topics:['公正','特殊任務'],
     summary:'正義與公正、神聖知覺、特殊任務（special function）的主要引入章。'},
    {n:26, phase:'culmination', secs:11, title:'神聖之地',
     topics:['赦免功能','過渡'],
     summary:'兩個世界之間的橋梁、赦免的特殊功能、剩餘的時光。'},
    {n:27, phase:'completion', secs:8,  title:'療癒遠古的夢境',
     topics:['夢者與夢','快樂之夢'],
     summary:'痊癒的圖像、「世界已被寬恕了」，夢者與夢的關係。'},
    {n:28, phase:'completion', secs:8,  title:'小小間隙',
     topics:['無過去','現在聖潔'],
     summary:'消除恐懼的條件：寬恕作為最後一步、時間的解脫。'},
    {n:29, phase:'completion', secs:9,  title:'偶像崇拜',
     topics:['醒來','偶像夢終結'],
     summary:'醒來的準備：偶像夢的終結、快樂之夢的開始，以及如何真正醒過來。'},
    {n:30, phase:'completion', secs:8,  title:'新的開始',
     topics:['作決定的準則'],
     summary:'唯二由作者命名的節（T-30.I：作決定的準則）所在章次。具體信賴聖靈的方法。'},
    {n:31, phase:'completion', secs:8,  title:'終極的慧見',
     topics:['選擇再次','課程終點'],
     summary:'選擇的最終課題：我們可以選擇。自我觀念的轉化，旅程的圓滿終點。'}
  ];

  var TOTAL_SECTIONS = 277;
  var PHASE_ORDER = ['foundation','ego','healing','integration','culmination','completion'];

  /* ── 全局：章次 → h2 heading 元素（buildSectionIndex 時填入）── */
  var CHAPTER_HEADINGS = {};   /* chNum → h2 element */
  var SECTION_INDEX    = {};   /* h3.id  → 全書節次序號 */

  /* ═══════════════════════════════════════════════════════════════
     §3  CSS 注入
     ═══════════════════════════════════════════════════════════════ */
  function injectCSS() {
    var s = document.createElement('style');
    s.id = 'arch-patch-styles';
    s.textContent = '\
#arch-tab-bar{display:flex;gap:0;border-bottom:1px solid var(--c-border);\
flex-shrink:0;background:var(--c-sidebar);}\
#arch-tab-bar button{flex:1;padding:7px 4px;font-size:11.5px;border:none;\
background:transparent;cursor:pointer;color:var(--c-muted);\
border-bottom:2px solid transparent;transition:all .18s;font-family:inherit;}\
#arch-tab-bar button.ap-active{color:var(--c-gold);border-bottom-color:var(--c-gold);font-weight:600;}\
#arch-tab-bar button:hover:not(.ap-active){color:var(--c-text);}\
#arch-view{display:none;overflow-y:auto;overflow-x:hidden;\
padding:10px 10px 32px;flex-direction:column;}\
#arch-view.ap-open{display:flex;}\
.ap-phase-header{font-size:10px;font-weight:600;letter-spacing:.04em;\
padding:8px 2px 3px;color:var(--c-muted);margin-top:4px;}\
.ap-phase-header:first-child{margin-top:0;padding-top:2px;}\
.ap-ch-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:4px;margin-bottom:2px;}\
.ap-ch-block{border-radius:6px;padding:5px 3px 4px;text-align:center;\
cursor:pointer;transition:transform .12s,opacity .12s;\
border:2px solid transparent;}\
.ap-ch-block:hover{transform:translateY(-2px);opacity:1!important;}\
.ap-ch-block:active{transform:scale(.96);}\
.ap-ch-n{font-size:13px;font-weight:700;color:rgba(255,255,255,.95);\
display:block;line-height:1;}\
.ap-ch-s{font-size:9px;color:rgba(255,255,255,.72);display:block;\
line-height:1;margin-top:2px;}\
#arch-detail{border-radius:8px;padding:10px 11px;margin-top:10px;\
font-size:12px;line-height:1.65;border:1px solid var(--c-border);\
background:var(--c-bg2,rgba(100,0,100,.06));word-break:break-all;\
word-wrap:break-word;}\
body.dark-mode #arch-detail{background:rgba(255,255,255,.05);}\
.ad-ch{font-size:10px;font-weight:600;letter-spacing:.04em;\
color:var(--c-muted);margin-bottom:4px;}\
.ad-title{font-size:13px;font-weight:600;color:var(--c-text,#1a1a2e);\
margin-bottom:6px;word-break:normal;}\
.ad-summary{color:var(--c-muted);font-size:12px;line-height:1.7;\
margin-bottom:6px;word-break:normal;}\
.ad-topics{display:flex;flex-wrap:wrap;gap:3px;margin-bottom:8px;}\
.ad-tag{font-size:10px;padding:2px 6px;border-radius:10px;\
background:rgba(139,91,174,.15);color:#8B5BAE;font-weight:500;}\
body.dark-mode .ad-tag{background:rgba(201,162,39,.2);color:#C9A227;}\
.ad-nav-btn{display:block;width:100%;padding:7px 12px;font-size:12px;\
border-radius:6px;border:1px solid var(--c-border);background:transparent;\
cursor:pointer;color:var(--c-text);text-align:center;transition:background .15s;\
box-sizing:border-box;font-family:inherit;}\
.ad-nav-btn:hover{background:rgba(139,91,174,.1);border-color:#8B5BAE;}\
#arch-legend{display:flex;flex-direction:column;gap:4px;\
margin-top:10px;padding-top:10px;border-top:1px solid var(--c-border);}\
.ap-legend-item{display:flex;align-items:center;gap:7px;font-size:10.5px;\
color:var(--c-muted);}\
.ap-legend-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;}\
.ap-phase-dot{width:7px;height:7px;border-radius:50%;display:inline-block;\
flex-shrink:0;margin-right:5px;vertical-align:middle;}\
#ap-sect-badge{font-size:10.5px;color:var(--c-muted);flex-shrink:0;\
white-space:nowrap;padding:1px 6px;border-radius:10px;\
background:rgba(139,91,174,.12);display:none;font-weight:500;}\
body.dark-mode #ap-sect-badge{background:rgba(201,162,39,.15);color:var(--c-gold);}\
#ap-sect-badge.ap-visible{display:inline-block;}\
';
    document.head.appendChild(s);
  }

  /* ═══════════════════════════════════════════════════════════════
     §4  側邊欄 UI 注入
     ═══════════════════════════════════════════════════════════════ */
  function injectSidebarUI() {
    var tocWrapper = document.getElementById('toc-wrapper');
    var sidebar    = document.getElementById('sidebar-toc');
    if (!tocWrapper || !sidebar) return;

    /* 頁籤切換列 */
    var tabBar = document.createElement('div');
    tabBar.id = 'arch-tab-bar';
    tabBar.innerHTML =
      '<button class="ap-active" id="ap-btn-toc" onclick="apSwitchTab(\'toc\')">📖 目錄</button>' +
      '<button id="ap-btn-arch" onclick="apSwitchTab(\'arch\')">🗺 課程架構</button>';

    /* 架構視圖面板 */
    var archView = document.createElement('div');
    archView.id = 'arch-view';

    /* 31章色塊（按階段分組）*/
    PHASE_ORDER.forEach(function (phase) {
      var meta = PHASE_META[phase];
      var chs  = CHAPTERS.filter(function (c) { return c.phase === phase; });

      var hdr = document.createElement('div');
      hdr.className = 'ap-phase-header';
      hdr.textContent = meta.label;
      hdr.style.color = meta.color;
      archView.appendChild(hdr);

      var grid = document.createElement('div');
      grid.className = 'ap-ch-grid';
      chs.forEach(function (ch) {
        var block = document.createElement('div');
        block.className = 'ap-ch-block';
        block.id = 'ap-ch-' + ch.n;
        block.dataset.ch = ch.n;
        block.style.background = meta.color;
        block.style.opacity = '0.80';
        block.title = '第' + ch.n + '章　' + ch.title + '（' + ch.secs + '節）';
        block.innerHTML =
          '<span class="ap-ch-n">' + ch.n + '</span>' +
          '<span class="ap-ch-s">' + ch.secs + '節</span>';
        block.addEventListener('click', function () {
          apShowDetail(ch, block);
        });
        grid.appendChild(block);
      });
      archView.appendChild(grid);
    });

    /* 詳情卡 */
    var detail = document.createElement('div');
    detail.id = 'arch-detail';
    detail.innerHTML = '<div class="ad-ch" style="color:var(--c-muted)">↑ 點擊任意章節色塊查看詳情</div>';
    archView.appendChild(detail);

    /* 圖例 */
    var legend = document.createElement('div');
    legend.id = 'arch-legend';
    PHASE_ORDER.forEach(function (phase) {
      var m = PHASE_META[phase];
      var item = document.createElement('div');
      item.className = 'ap-legend-item';
      item.innerHTML =
        '<span class="ap-legend-dot" style="background:' + m.color + '"></span>' +
        '<span>' + m.label + '</span>';
      legend.appendChild(item);
    });
    archView.appendChild(legend);

    /* 插入 DOM */
    sidebar.insertBefore(tabBar, tocWrapper);
    tocWrapper.parentNode.insertBefore(archView, tocWrapper.nextSibling);
  }

  /* ── 顯示詳情卡 ── */
  function apShowDetail(ch, blockEl) {
    document.querySelectorAll('.ap-ch-block').forEach(function (b) {
      b.style.outline = 'none';
      b.style.opacity = '0.80';
    });
    blockEl.style.outline = '2px solid rgba(255,255,255,.80)';
    blockEl.style.opacity = '1';

    var meta   = PHASE_META[ch.phase];
    var detail = document.getElementById('arch-detail');
    if (!detail) return;

    var tagsHtml = ch.topics.map(function (t) {
      return '<span class="ad-tag">✦ ' + t + '</span>';
    }).join('');

    detail.innerHTML =
      '<div class="ad-ch" style="color:' + meta.color + '">' +
        '第' + ch.n + '章 ／ ' + meta.label +
      '</div>' +
      '<div class="ad-title">' + ch.title + '（' + ch.secs + '節）</div>' +
      '<div class="ad-summary">' + ch.summary + '</div>' +
      '<div class="ad-topics">' + tagsHtml + '</div>' +
      '<button class="ad-nav-btn" ' +
        'onclick="apNavToChapter(' + ch.n + ')" ' +
        'type="button">' +
        '▶ 跳轉到第' + ch.n + '章' +
      '</button>';

    /* 確保詳情卡捲入可視區 */
    setTimeout(function () { detail.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }, 80);
  }

  /* ═══════════════════════════════════════════════════════════════
     §5  全局函式（供 onclick= 呼叫）
     ═══════════════════════════════════════════════════════════════ */

  window.apSwitchTab = function (tab) {
    var tocWrapper = document.getElementById('toc-wrapper');
    var archView   = document.getElementById('arch-view');
    var btnToc     = document.getElementById('ap-btn-toc');
    var btnArch    = document.getElementById('ap-btn-arch');
    if (!tocWrapper || !archView) return;
    if (tab === 'toc') {
      tocWrapper.style.display = '';
      archView.classList.remove('ap-open');
      if (btnToc)  btnToc.classList.add('ap-active');
      if (btnArch) btnArch.classList.remove('ap-active');
    } else {
      tocWrapper.style.display = 'none';
      archView.classList.add('ap-open');
      if (btnArch) btnArch.classList.add('ap-active');
      if (btnToc)  btnToc.classList.remove('ap-active');
      apHighlightCurrentChapter();
    }
  };

  window.apNavToChapter = function (chNum) {
    /* 先查預建的 CHAPTER_HEADINGS map（最可靠）*/
    var target = CHAPTER_HEADINGS[chNum];

    /* fallback：即時掃描（以防 buildSectionIndex 尚未執行）*/
    if (!target) {
      var all = document.querySelectorAll('#content-area h1,#content-area h2');
      for (var i = 0; i < all.length; i++) {
        var n = extractChNum(all[i].textContent);
        if (n === chNum) { target = all[i]; break; }
      }
    }

    if (!target) {
      console.warn('[arch-patch] apNavToChapter: 找不到第' + chNum + '章的 heading');
      return;
    }

    /* 切回目錄頁籤 */
    apSwitchTab('toc');

    /* 等 toc-wrapper 顯示後捲動 */
    setTimeout(function () {
      var top = window.scrollY + target.getBoundingClientRect().top - 60;
      window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    }, 150);
  };

  /* ═══════════════════════════════════════════════════════════════
     §6  建立索引（buildTOC 完成後執行）
     ═══════════════════════════════════════════════════════════════ */

  function addPhaseDots() {
    document.querySelectorAll('#toc-wrapper .toc-h2').forEach(function (a) {
      if (a.querySelector('.ap-phase-dot')) return;
      var n = extractChNum(a.textContent);
      if (!n) return;
      var ch = CHAPTERS.find(function (c) { return c.n === n; });
      if (!ch) return;
      var dot = document.createElement('span');
      dot.className = 'ap-phase-dot';
      dot.style.background = PHASE_META[ch.phase].color;
      dot.title = PHASE_META[ch.phase].label + '：' + ch.title;
      a.insertBefore(dot, a.firstChild);
    });
  }

  function buildSectionIndex() {
    CHAPTER_HEADINGS = {};
    SECTION_INDEX    = {};
    var cnt = 0;
    var inBook = false;

    document.querySelectorAll('#content-area h1,#content-area h2,#content-area h3')
      .forEach(function (h) {
        if (h.tagName === 'H1') { inBook = true; }
        if (h.tagName === 'H2' && inBook) {
          var n = extractChNum(h.textContent);
          if (n && n >= 1 && n <= 31) CHAPTER_HEADINGS[n] = h;
        }
        if (h.tagName === 'H3' && inBook && h.id) {
          cnt++;
          SECTION_INDEX[h.id] = cnt;
        }
      });
  }

  function apHighlightCurrentChapter() {
    var curN = null;
    document.querySelectorAll('#content-area h2').forEach(function (h) {
      var n = extractChNum(h.textContent);
      if (n && h.getBoundingClientRect().top <= 80) curN = n;
    });
    document.querySelectorAll('.ap-ch-block').forEach(function (b) {
      var n = parseInt(b.dataset.ch, 10);
      b.style.opacity = (n === curN) ? '1' : '0.80';
      b.style.outline = (n === curN) ? '2px solid rgba(255,255,255,.75)' : 'none';
    });
  }

  function initSectionObserver() {
    if (!('IntersectionObserver' in window)) return;
    var badge = document.getElementById('ap-sect-badge');
    if (!badge) return;
    var h3s = document.querySelectorAll('#content-area h3');
    if (!h3s.length) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var n = SECTION_INDEX[e.target.id];
        if (!n) return;
        badge.textContent = '§ ' + n + ' / ' + TOTAL_SECTIONS;
        badge.classList.add('ap-visible');
      });
    }, { rootMargin: '-8% 0px -75% 0px', threshold: 0 });
    h3s.forEach(function (h) { io.observe(h); });
  }

  function onTOCBuilt() {
    addPhaseDots();
    buildSectionIndex();
    initSectionObserver();
  }

  function watchForTOC() {
    var wrapper = document.getElementById('toc-wrapper');
    if (!wrapper) return;
    if (wrapper.children.length > 0) { setTimeout(onTOCBuilt, 60); return; }
    var mo = new MutationObserver(function (_, obs) {
      if (wrapper.children.length > 0) {
        obs.disconnect();
        setTimeout(onTOCBuilt, 60);
      }
    });
    mo.observe(wrapper, { childList: true });
  }

  /* ═══════════════════════════════════════════════════════════════
     §7  breadcrumb 節次徽章
     ═══════════════════════════════════════════════════════════════ */
  function injectSectionBadge() {
    var crumbText = document.getElementById('crumb-text');
    if (!crumbText || document.getElementById('ap-sect-badge')) return;
    var badge = document.createElement('span');
    badge.id = 'ap-sect-badge';
    badge.setAttribute('aria-label', '目前節次');
    crumbText.parentNode.insertBefore(badge, crumbText.nextSibling);
  }

  /* ═══════════════════════════════════════════════════════════════
     §8  初始化
     ═══════════════════════════════════════════════════════════════ */
  function init() {
    injectCSS();
    injectSidebarUI();
    injectSectionBadge();
    watchForTOC();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
