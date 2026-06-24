/**
 * arch-patch.js — 《完整加註版奇蹟課程》PWA 課程架構強化補丁 v1.0
 *
 * 功能：
 *  1. 側邊欄「課程架構」頁籤  — 31章視覺化課程地圖，點擊跳轉
 *  2. TOC 章節階段色點        — h2 章標題前加彩色相位圓點
 *  3. breadcrumb 節次計數器   — 顯示「第N/277節」
 *
 * 使用方式：
 *  在 index.htm 的 </body> 標籤前加入：
 *    <script src="arch-patch.js"></script>
 *
 * 依賴：無（純原生 JS，相容 index.htm 現有架構）
 */

(function () {
  'use strict';

  /* ═══════════════════════════════════════════════════════════════
     §1  章節資料：31章的階段、顏色、節數、核心新主題
     ═══════════════════════════════════════════════════════════════ */

  var PHASE_META = {
    foundation:  { label: '奠基 1-3章',   color: '#C9A227', bg: 'rgba(201,162,39,0.12)'  },
    ego:         { label: '展開 4-7章',   color: '#8B5BAE', bg: 'rgba(139,91,174,0.12)'  },
    healing:     { label: '深化 8-13章',  color: '#3A7AC8', bg: 'rgba(58,122,200,0.12)'  },
    integration: { label: '整合 14-18章', color: '#2A8A6A', bg: 'rgba(42,138,106,0.12)'  },
    culmination: { label: '高峰 19-26章', color: '#C85A30', bg: 'rgba(200,90,48,0.12)'   },
    completion:  { label: '完成 27-31章', color: '#7A3080', bg: 'rgba(122,48,128,0.12)'  }
  };

  var CHAPTERS = [
    { n:1,  phase:'foundation',  secs:9,  title:'奇蹟原則',       topics:['奇蹟','知見基礎'],         summary:'全書50條奇蹟原則，定義奇蹟的本質與功能。是整部課程的根基石。' },
    { n:2,  phase:'foundation',  secs:13, title:'正確的防衛機制',  topics:['分裂','救贖'],             summary:'引入分裂（separation）的觀念，探討正確的防衛機制與救贖作為防衛的概念。' },
    { n:3,  phase:'foundation',  secs:11, title:'清明的知見',      topics:['知見','真知'],             summary:'區分知見（perception）與真知（knowledge），引入研習的重要性。' },
    { n:4,  phase:'ego',         secs:11, title:'小我的掙扎',      topics:['小我','聖靈初現'],          summary:'深入分析小我的產生與運作，首次引入聖靈（Holy Spirit）的概念。' },
    { n:5,  phase:'ego',         secs:10, title:'聖靈',            topics:['聖靈詳述','喜悅'],          summary:'聖靈的主要闡述章：全然喜悅、喜悅之靈、代上主發言的聲音。' },
    { n:6,  phase:'ego',         secs:8,  title:'愛的課題',        topics:['投射','攻擊'],             summary:'愛的課題：十字架的訊息、投射與分裂，「只教人愛」的核心原則。' },
    { n:7,  phase:'ego',         secs:10, title:'天國的延伸',      topics:['延伸','療癒原則'],          summary:'天國的律、才能的統一、療癒是憶起之道。力量延伸的根本原理。' },
    { n:8,  phase:'healing',     secs:9,  title:'全然指向療癒的意志', topics:['意志','身體角色'],      summary:'討論療癒的意志，以及身體在課程中的角色與功能。' },
    { n:9,  phase:'healing',     secs:8,  title:'接受糾正',        topics:['糾正','寬恕初步'],          summary:'接受糾正的原則，以及如何在關係中實踐療癒與寬恕。' },
    { n:10, phase:'healing',     secs:5,  title:'心靈回歸上主',    topics:['回歸','恩典'],             summary:'討論心靈回歸上主的路徑，以及恩典的概念與實踐。' },
    { n:11, phase:'healing',     secs:9,  title:'上主的恩物',      topics:['黑暗到光','恩物'],          summary:'從黑暗到光、從幻相到實相的轉化過程，論述上主的恩物。' },
    { n:12, phase:'healing',     secs:8,  title:'神聖的拉力',      topics:['神聖拉力','共同目標'],      summary:'神聖的拉力：詮釋他人動機、回應內在呼喚，尋找共同目標。' },
    { n:13, phase:'healing',     secs:11, title:'時間與永恆',      topics:['時間','永恆','罪疚深化'],   summary:'討論時間的本質、永恆的觀念，以及罪疚在時間中的角色。' },
    { n:14, phase:'integration', secs:12, title:'正確教課的準則',  topics:['聖靈課程表','天國教師'],    summary:'聖靈的課程表、天國的教師，以及讓聖靈引領的原則。' },
    { n:15, phase:'integration', secs:11, title:'神聖一刻',        topics:['神聖一刻','特殊關係'],      summary:'神聖一刻與特殊關係同時完整登場。犧牲-罪疚-憤怒的循環被揭示。' },
    { n:16, phase:'integration', secs:7,  title:'恩典的幻相',      topics:['真正的另類','恩典幻相'],    summary:'恩典的幻相、被移植的衝動，真正的另類（true alternative）。' },
    { n:17, phase:'integration', secs:8,  title:'寬恕與神聖關係',  topics:['神聖關係','寬恕詳述'],      summary:'神聖關係的主要引入章：從特殊關係中誕生的神聖關係的機制。' },
    { n:18, phase:'integration', secs:9,  title:'夢的終結',        topics:['夢','幻相','從夢中醒來'],   summary:'夢的本質、世界是幻相、尋找真實的自我。從夢中醒來的心靈準備。' },
    { n:19, phase:'culmination', secs:4,  title:'超越知見的成就',  topics:['罪(sin)詳述','基督聖容'],  summary:'罪的完整課程式引入，以及基督聖容（face of Christ）首次出現。' },
    { n:20, phase:'culmination', secs:9,  title:'復活的願景',      topics:['復活願景','神聖目的'],      summary:'神聖的目的、基督的願景、復活的意義，看見無罪的世界。' },
    { n:21, phase:'culmination', secs:8,  title:'原因與結果',      topics:['原因結果','責任在心靈'],    summary:'心靈對其知見的責任：快樂是一個選擇。原因與結果的課程。' },
    { n:22, phase:'culmination', secs:6,  title:'救贖與平安',      topics:['救贖平安整合'],            summary:'救贖與平安的深度整合：加入救贖的同盟，沒有矛盾的世界。' },
    { n:23, phase:'culmination', secs:4,  title:'戰爭與平安',      topics:['戰爭幻相','失去幻相'],      summary:'小我的戰爭與內在平安的對比，探討「失去」的幻相。' },
    { n:24, phase:'culmination', secs:7,  title:'偶像的目標',      topics:['偶像','特殊任務初現'],      summary:'偶像的本質與束縛，尋找基督，走出偶像的詳細討論。' },
    { n:25, phase:'culmination', secs:9,  title:'上主的見證人',    topics:['公正','特殊任務'],          summary:'正義與公正、神聖知覺、特殊任務（special function）的主要引入章。' },
    { n:26, phase:'culmination', secs:11, title:'過渡',            topics:['赦免功能','過渡'],          summary:'兩個世界之間的橋梁、赦免的特殊功能、剩餘的時光。' },
    { n:27, phase:'completion',  secs:8,  title:'身體與夢',        topics:['夢者與夢','快樂之夢'],      summary:'痊癒的圖像、「世界已被寬恕了」，夢者與夢的關係。' },
    { n:28, phase:'completion',  secs:8,  title:'消除恐懼',        topics:['無過去','現在聖潔'],        summary:'消除恐懼的條件：寬恕作為最後一步、時間的解脫。' },
    { n:29, phase:'completion',  secs:9,  title:'醒來',            topics:['醒來','偶像夢終結'],        summary:'醒來的準備：偶像夢的終結、快樂之夢的開始。' },
    { n:30, phase:'completion',  secs:8,  title:'新的開始',        topics:['作決定的準則'],             summary:'唯二由作者命名的節（T-30.I）所在章次。具體信賴聖靈的方法。' },
    { n:31, phase:'completion',  secs:8,  title:'最終的願景',      topics:['選擇再次','課程終點'],      summary:'選擇的最終課題：我們可以選擇。自我觀念的轉化，旅程的圓滿。' }
  ];

  var TOTAL_SECTIONS = 277; // CE版總節數

  /* ═══════════════════════════════════════════════════════════════
     §2  CSS 注入
     ═══════════════════════════════════════════════════════════════ */

  function injectCSS() {
    var s = document.createElement('style');
    s.id = 'arch-patch-styles';
    s.textContent = [

      /* ── 頁籤切換列 ── */
      '#arch-tab-bar{display:flex;gap:0;border-bottom:1px solid var(--c-border);',
      'margin:0;padding:0;flex-shrink:0;background:var(--c-sidebar);}',

      '#arch-tab-bar button{flex:1;padding:7px 4px;font-size:11.5px;border:none;',
      'background:transparent;cursor:pointer;color:var(--c-muted);',
      'border-bottom:2px solid transparent;transition:all .18s;',
      'font-family:inherit;letter-spacing:.01em;}',

      '#arch-tab-bar button.ap-active{color:var(--c-gold);',
      'border-bottom-color:var(--c-gold);font-weight:600;}',

      '#arch-tab-bar button:hover:not(.ap-active){color:var(--c-text);}',

      /* ── 架構視圖容器 ── */
      '#arch-view{display:none;flex:1;overflow-y:auto;',
      'padding:10px 10px 24px;flex-direction:column;gap:0;}',
      '#arch-view.ap-open{display:flex;}',

      /* ── 階段說明列 ── */
      '.ap-phase-header{font-size:10px;font-weight:600;letter-spacing:.04em;',
      'padding:6px 4px 3px;color:var(--c-muted);margin-top:6px;}',
      '.ap-phase-header:first-child{margin-top:0;}',

      /* ── 章節 grid（每行最多5塊）── */
      '.ap-ch-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:4px;margin-bottom:2px;}',

      /* ── 章節色塊 ── */
      '.ap-ch-block{border-radius:6px;padding:5px 3px 4px;text-align:center;',
      'cursor:pointer;transition:transform .12s,opacity .12s;',
      'border:1.5px solid transparent;position:relative;}',

      '.ap-ch-block:hover{transform:translateY(-2px);opacity:1!important;}',
      '.ap-ch-block:active{transform:scale(.96);}',

      '.ap-ch-block.ap-current{border-color:rgba(255,255,255,.7)!important;',
      'box-shadow:0 0 0 2px rgba(255,255,255,.25);}',

      '.ap-ch-n{font-size:13px;font-weight:700;color:rgba(255,255,255,.95);',
      'display:block;line-height:1;}',

      '.ap-ch-s{font-size:9px;color:rgba(255,255,255,.7);display:block;',
      'line-height:1;margin-top:2px;}',

      /* ── 選中章節詳情卡 ── */
      '#arch-detail{background:var(--c-bg2,rgba(128,0,128,.08));',
      'border-radius:8px;padding:10px 11px;margin-top:8px;font-size:12px;',
      'line-height:1.6;border:1px solid var(--c-border);min-height:60px;}',

      '#arch-detail .ad-ch{font-size:10px;font-weight:600;',
      'letter-spacing:.04em;color:var(--c-muted);margin-bottom:3px;}',

      '#arch-detail .ad-title{font-size:13px;font-weight:600;',
      'color:var(--c-text,#1a1a2e);margin-bottom:5px;}',

      '#arch-detail .ad-summary{color:var(--c-muted);font-size:12px;',
      'line-height:1.6;margin-bottom:5px;}',

      '#arch-detail .ad-topics{display:flex;flex-wrap:wrap;gap:3px;}',

      '#arch-detail .ad-tag{font-size:10px;padding:2px 6px;border-radius:10px;',
      'background:rgba(139,91,174,.15);color:#8B5BAE;font-weight:500;}',

      'body.dark-mode #arch-detail .ad-tag{background:rgba(201,162,39,.2);color:#C9A227;}',

      '#arch-detail .ad-nav-btn{margin-top:8px;padding:5px 12px;',
      'font-size:11px;border-radius:6px;border:1px solid var(--c-border);',
      'background:transparent;cursor:pointer;color:var(--c-text);width:100%;',
      'transition:background .15s;}',
      '#arch-detail .ad-nav-btn:hover{background:var(--c-bg2);}',

      /* ── 圖例列 ── */
      '#arch-legend{display:flex;flex-direction:column;gap:3px;',
      'margin-top:8px;padding-top:8px;border-top:1px solid var(--c-border);}',

      '.ap-legend-item{display:flex;align-items:center;gap:6px;font-size:10.5px;',
      'color:var(--c-muted);padding:1px 0;}',

      '.ap-legend-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;}',

      /* ── TOC 章節相位色點 ── */
      '.ap-phase-dot{width:7px;height:7px;border-radius:50%;',
      'display:inline-block;flex-shrink:0;margin-right:5px;',
      'vertical-align:middle;transition:opacity .2s;}',

      /* ── breadcrumb 節次徽章 ── */
      '#ap-sect-badge{font-size:10.5px;color:var(--c-muted);',
      'flex-shrink:0;white-space:nowrap;padding:1px 6px;',
      'border-radius:10px;background:rgba(139,91,174,.12);',
      'display:none;font-weight:500;letter-spacing:.01em;}',

      'body.dark-mode #ap-sect-badge{background:rgba(201,162,39,.15);',
      'color:var(--c-gold);}',

      '#ap-sect-badge.ap-visible{display:inline-block;}',

      /* ── 手機：架構視圖稍小字 ── */
      '@media(max-width:768px){',
      '.ap-ch-n{font-size:12px;}.ap-ch-s{font-size:8px;}',
      '.ap-ch-grid{grid-template-columns:repeat(5,1fr);}',
      '}'

    ].join('');
    document.head.appendChild(s);
  }

  /* ═══════════════════════════════════════════════════════════════
     §3  側邊欄 UI 注入
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

    /* 按階段分組渲染章節 */
    var phaseOrder = ['foundation','ego','healing','integration','culmination','completion'];
    phaseOrder.forEach(function (phase) {
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
        block.dataset.ch = ch.n;
        block.style.background = meta.color;
        block.style.opacity = '0.82';
        block.title = '第' + ch.n + '章　' + ch.title + '（' + ch.secs + '節）';
        block.innerHTML =
          '<span class="ap-ch-n">' + ch.n + '</span>' +
          '<span class="ap-ch-s">' + ch.secs + '節</span>';

        block.addEventListener('click', function () {
          apShowChapterDetail(ch, block);
        });
        grid.appendChild(block);
      });
      archView.appendChild(grid);
    });

    /* 詳情卡 */
    var detail = document.createElement('div');
    detail.id = 'arch-detail';
    detail.innerHTML = '<div class="ad-ch">點擊任意章節查看詳情</div>';
    archView.appendChild(detail);

    /* 圖例 */
    var legend = document.createElement('div');
    legend.id = 'arch-legend';
    phaseOrder.forEach(function (phase) {
      var m = PHASE_META[phase];
      var item = document.createElement('div');
      item.className = 'ap-legend-item';
      item.innerHTML =
        '<span class="ap-legend-dot" style="background:' + m.color + '"></span>' +
        '<span>' + m.label + '</span>';
      legend.appendChild(item);
    });
    archView.appendChild(legend);

    /* 插入 DOM：tabBar 在 toc-wrapper 前，archView 緊接 toc-wrapper 後 */
    sidebar.insertBefore(tabBar, tocWrapper);
    tocWrapper.parentNode.insertBefore(archView, tocWrapper.nextSibling);
  }

  /* ── 頁籤切換（全局可呼叫）── */
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
      /* 標示當前所在章 */
      apHighlightCurrentChapter();
    }
  };

  /* ── 顯示章節詳情 ── */
  function apShowChapterDetail(ch, blockEl) {
    /* 高亮選中塊 */
    document.querySelectorAll('.ap-ch-block').forEach(function (b) {
      b.style.outline = 'none';
      b.style.opacity = '0.82';
    });
    blockEl.style.outline = '2px solid rgba(255,255,255,.85)';
    blockEl.style.opacity = '1';

    var detail = document.getElementById('arch-detail');
    if (!detail) return;
    var meta = PHASE_META[ch.phase];
    var tagsHtml = ch.topics.map(function (t) {
      return '<span class="ad-tag">✦ ' + t + '</span>';
    }).join('');

    detail.innerHTML =
      '<div class="ad-ch" style="color:' + meta.color + '">第' + ch.n + '章 ／ ' + meta.label + '</div>' +
      '<div class="ad-title">' + ch.title + '（' + ch.secs + '節）</div>' +
      '<div class="ad-summary">' + ch.summary + '</div>' +
      '<div class="ad-topics">' + tagsHtml + '</div>' +
      '<button class="ad-nav-btn" onclick="apNavToChapter(' + ch.n + ')">▶ 跳轉到第' + ch.n + '章</button>';
  }

  /* ── 跳轉到指定章次（全局可呼叫）── */
  window.apNavToChapter = function (chNum) {
    /* 尋找 h2 heading 中包含「第X章」的元素 */
    var headings = document.querySelectorAll('#content-area h1,#content-area h2');
    var target = null;
    headings.forEach(function (h) {
      var text = h.textContent.trim();
      /* 匹配「第N章」（阿拉伯數字）*/
      var m = text.match(/第\s*(\d+)\s*章/);
      if (m && parseInt(m[1]) === chNum) target = h;
    });
    if (!target) return;

    /* 切換回目錄頁籤 */
    apSwitchTab('toc');

    /* 捲動 */
    setTimeout(function () {
      var offset = window.scrollY + target.getBoundingClientRect().top - 56;
      window.scrollTo({ top: Math.max(0, offset), behavior: 'smooth' });
    }, 120);
  };

  /* ── 標示當前所在章 ── */
  function apHighlightCurrentChapter() {
    /* 取得目前捲動位置對應的 h2 */
    var headings = Array.from(document.querySelectorAll('#content-area h2'));
    var currentChNum = null;
    headings.forEach(function (h) {
      var m = h.textContent.match(/第\s*(\d+)\s*章/);
      if (m && h.getBoundingClientRect().top <= 80) {
        currentChNum = parseInt(m[1]);
      }
    });
    document.querySelectorAll('.ap-ch-block').forEach(function (b) {
      var n = parseInt(b.dataset.ch);
      b.style.opacity = (n === currentChNum) ? '1' : '0.75';
      if (n === currentChNum) b.style.outline = '2px solid rgba(255,255,255,.7)';
      else b.style.outline = 'none';
    });
  }

  /* ═══════════════════════════════════════════════════════════════
     §4  breadcrumb 節次徽章
     ═══════════════════════════════════════════════════════════════ */

  function injectSectionBadge() {
    var crumb = document.getElementById('chapter-crumb');
    var crumbText = document.getElementById('crumb-text');
    if (!crumb || !crumbText) return;

    var badge = document.createElement('span');
    badge.id = 'ap-sect-badge';
    badge.setAttribute('aria-label', '目前節次');
    /* 插入到 crumb-text 之後 */
    crumbText.parentNode.insertBefore(badge, crumbText.nextSibling);
  }

  /* ═══════════════════════════════════════════════════════════════
     §5  等 buildTOC 完成後的強化（MutationObserver）
     ═══════════════════════════════════════════════════════════════ */

  /* 全局：h3 heading id → 全書節次序號（1-277）*/
  var SECTION_INDEX = {};
  var SECTION_IDS   = []; /* 按文件順序排列的 h3 id 陣列 */

  function onTOCBuilt() {
    addPhaseDots();
    buildSectionIndex();
    initSectionObserver();
  }

  /* ── 在 h2 TOC 連結前加相位色點 ── */
  function addPhaseDots() {
    var links = document.querySelectorAll('#toc-wrapper .toc-h2');
    links.forEach(function (a) {
      if (a.querySelector('.ap-phase-dot')) return; /* 避免重複 */
      var text = a.textContent.trim();
      var m = text.match(/第\s*(\d+)\s*章/);
      if (!m) return;
      var n = parseInt(m[1]);
      var ch = CHAPTERS.find(function (c) { return c.n === n; });
      if (!ch) return;
      var dot = document.createElement('span');
      dot.className = 'ap-phase-dot';
      dot.style.background = PHASE_META[ch.phase].color;
      dot.title = PHASE_META[ch.phase].label + '：' + ch.title;
      a.insertBefore(dot, a.firstChild);
    });
  }

  /* ── 建立 h3 → 全書節次對照表 ── */
  function buildSectionIndex() {
    SECTION_INDEX = {};
    SECTION_IDS   = [];
    var cnt = 0;
    /* 只計算〈卷一 正文〉下的 h3（所有 h3，不限卷別）*/
    var headings = Array.from(document.querySelectorAll('#content-area h1,#content-area h2,#content-area h3'));
    var inText = false; /* 是否在〈卷一〉以後 */
    headings.forEach(function (h) {
      /* 以 h1 切換書卷 */
      if (h.tagName === 'H1') {
        /* 若包含「正文」或「卷一」則進入；其他卷仍繼續計數（練習手冊等有自己的節）*/
        inText = true;
      }
      if (h.tagName === 'H3' && inText) {
        cnt++;
        if (h.id) {
          SECTION_INDEX[h.id] = cnt;
          SECTION_IDS.push(h.id);
        }
      }
    });
  }

  /* ── IntersectionObserver：h3 進入視窗時更新節次徽章 ── */
  function initSectionObserver() {
    if (!('IntersectionObserver' in window)) return;
    var badge = document.getElementById('ap-sect-badge');
    if (!badge) return;

    var h3List = Array.from(document.querySelectorAll('#content-area h3'));
    if (!h3List.length) return;

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var n = SECTION_INDEX[e.target.id];
        if (!n) return;
        badge.textContent = '§ ' + n + '/' + TOTAL_SECTIONS;
        badge.classList.add('ap-visible');
      });
    }, { rootMargin: '-8% 0px -75% 0px', threshold: 0 });

    h3List.forEach(function (h) { io.observe(h); });
  }

  /* ── 監聽 toc-wrapper 的子節點變化，確認 buildTOC 已完成 ── */
  function watchForTOC() {
    var wrapper = document.getElementById('toc-wrapper');
    if (!wrapper) return;

    /* 若已有內容則立即執行 */
    if (wrapper.children.length > 0) {
      onTOCBuilt();
      return;
    }

    var mo = new MutationObserver(function (mutations, obs) {
      if (wrapper.children.length > 0) {
        obs.disconnect();
        /* 等一個 tick 確保 buildTOC 完整執行後 */
        setTimeout(onTOCBuilt, 60);
      }
    });
    mo.observe(wrapper, { childList: true });
  }

  /* ═══════════════════════════════════════════════════════════════
     §6  初始化
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
