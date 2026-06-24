/**
 * arch-patch.js — 《完整加註版奇蹟課程》PWA 課程架構強化補丁 v2.0
 *
 * v2.0 更新：
 *  1. 修正深色模式下相位色點不可見問題
 *  2. 「課程架構」改名為「〈正文〉架構」
 *  3. 解構至「節」層級：各章節三層解剖（T理論/P實踐/I個人）
 *  4. 新增「節的三層解剖學」與「主題三階段生命週期」說明面板
 *  5. 重點章節（1,5,15,17,19,30）提供完整節次資料
 */
(function () {
  'use strict';

  /* ══════════════════════════════════════════════
     §1  中文數字轉換器
  ══════════════════════════════════════════════ */
  var ZH_NUM = {'一':1,'二':2,'三':3,'四':4,'五':5,'六':6,'七':7,'八':8,'九':9,'零':0};
  function zhToArabic(s) {
    if (!s) return 0;
    s = s.trim();
    if (/^\d+$/.test(s)) return parseInt(s, 10);
    if (!s.includes('十')) return ZH_NUM[s] || 0;
    var p = s.split('十');
    return (p[0] ? (ZH_NUM[p[0]] || 1) : 1) * 10 + (p[1] ? (ZH_NUM[p[1]] || 0) : 0);
  }
  function extractChNum(text) {
    var m = text.match(/第([零一二三四五六七八九十\d]+)章/);
    return m ? zhToArabic(m[1]) : null;
  }

  /* ══════════════════════════════════════════════
     §2  相位與章節資料
  ══════════════════════════════════════════════ */
  var PHASE_META = {
    foundation:  { label:'奠基 1-3章',   color:'#C9A227' },
    ego:         { label:'展開 4-7章',   color:'#8B5BAE' },
    healing:     { label:'深化 8-13章',  color:'#3A7AC8' },
    integration: { label:'整合 14-18章', color:'#2A8A6A' },
    culmination: { label:'高峰 19-26章', color:'#C85A30' },
    completion:  { label:'完成 27-31章', color:'#7A3080' }
  };
  var PHASE_ORDER = ['foundation','ego','healing','integration','culmination','completion'];

  var CHAPTERS = [
    {n:1, phase:'foundation', secs:9,  title:'奇蹟原則',
     topics:['奇蹟','知見基礎'], summary:'全書50條奇蹟原則，逐一定義奇蹟的本質與功能。是整部課程的根基石，也是唯一在最初就完整展開的核心主題。'},
    {n:2, phase:'foundation', secs:13, title:'正確的防衛機制與解脫恐懼',
     topics:['分裂','救贖'], summary:'引入分裂（separation）的觀念，探討防衛機制的正確詮釋，以及救贖作為防衛機制的概念。'},
    {n:3, phase:'foundation', secs:11, title:'清明的知見',
     topics:['知見','真知'], summary:'區分知見（perception）與真知（knowledge），引入研習的重要性，並提出給奇蹟行者的守則。'},
    {n:4, phase:'ego',         secs:11, title:'小我為求自保的掙扎',
     topics:['小我','聖靈初現'], summary:'深入分析小我的產生與運作，首次引入聖靈（Holy Spirit）的概念，討論天國的安詳生命。'},
    {n:5, phase:'ego',         secs:10, title:'聖靈',
     topics:['聖靈詳述','喜悅'], summary:'聖靈的主要闡述章：全然喜悅之靈、代上主發言的聲音。是理解聖靈最完整的章次。'},
    {n:6, phase:'ego',         secs:8,  title:'愛的課題',
     topics:['投射','攻擊'], summary:'愛的課題：十字架的訊息、投射與分裂，「只教人愛」的核心原則。'},
    {n:7, phase:'ego',         secs:10, title:'天國的延伸',
     topics:['延伸','療癒原則'], summary:'天國的律、才能的統一、療癒是憶起之道。力量的延伸與療癒的根本原理。'},
    {n:8, phase:'healing',     secs:9,  title:'全然指向療癒的意志',
     topics:['意志','身體角色'], summary:'討論療癒的意志，以及身體在課程中的角色——身體是溝通的工具，不是罪的棲所。'},
    {n:9, phase:'healing',     secs:8,  title:'寬恕計畫',
     topics:['寬恕計畫'], summary:'寬恕（forgiveness）作為上主整體計畫的一部分，以及聖靈如何透過關係引導療癒。'},
    {n:10, phase:'healing',    secs:5,  title:'小我的宗教',
     topics:['小我的宗教'], summary:'小我如何建立自己的「宗教」——將自我保護與靈性混淆，以及如何超越。'},
    {n:11, phase:'healing',    secs:9,  title:'上主或小我',
     topics:['上主或小我'], summary:'兩種思想體系的根本對立：上主的知識與小我的知見，以及選擇真正的家。'},
    {n:12, phase:'healing',    secs:8,  title:'愛的理性',
     topics:['愛的理性'], summary:'神聖的拉力：以愛的理性詮釋他人動機，回應內在的呼喚，尋找共同目標。'},
    {n:13, phase:'healing',    secs:11, title:'從罪疚中解脫',
     topics:['罪疚深化','時間'], summary:'時間與罪疚的關係：罪疚是讓時間停在過去的機制；解脫罪疚即是從時間的囚禁中釋放。'},
    {n:14, phase:'integration',secs:12, title:'純潔無罪之光',
     topics:['聖靈課程表','無罪'], summary:'透過無罪（innocence）之光重新看待世界，以及聖靈的課程表如何在每個關係中展開。'},
    {n:15, phase:'integration',secs:11, title:'神聖一刻與特殊關係',
     topics:['神聖一刻','特殊關係'], summary:'神聖一刻與特殊關係同時完整登場。犧牲─罪疚─憤怒的循環被揭示。每一個「現在」都可以是神聖的。'},
    {n:16, phase:'integration',secs:7,  title:'審視特殊關係',
     topics:['真正的另類'], summary:'深度審視特殊關係的根本機制，以及「真正的另類（true alternative）」如何在神聖一刻中展現。'},
    {n:17, phase:'integration',secs:8,  title:'神聖關係',
     topics:['神聖關係'], summary:'神聖關係的主要引入章：從特殊關係中誕生的轉化，寬恕如何讓兩人共同看見基督。'},
    {n:18, phase:'integration',secs:9,  title:'神聖關係的祝福',
     topics:['夢','幻相'], summary:'夢與幻相的本質：神聖關係開始改寫夢的內容，引導兩人同走回家的路。'},
    {n:19, phase:'culmination', secs:4,  title:'從罪咎（Sin）到平安',
     topics:['罪(sin)詳述','基督聖容'], summary:'罪的完整課程式定義。基督聖容首次出現。平和的四個障礙：上主的報復、信念的吸引力、身體的吸引力、死亡的恐懼。'},
    {n:20, phase:'culmination', secs:9,  title:'對弟兄的慧見',
     topics:['基督願景'], summary:'透過基督的眼睛看見弟兄：復活的願景、神聖目的，以及「我要看見你無罪」的核心實踐。'},
    {n:21, phase:'culmination', secs:8,  title:'渴望一個無罪世界',
     topics:['心靈的責任'], summary:'心靈對其知見負完全的責任：快樂是一個選擇，不是環境的結果。'},
    {n:22, phase:'culmination', secs:6,  title:'神聖關係的任務',
     topics:['救贖使命'], summary:'神聖關係承擔了救贖的使命：兩人合一的目的超越了個人的特殊目標。'},
    {n:23, phase:'culmination', secs:4,  title:'擺脫衝突',
     topics:['衝突幻相'], summary:'衝突的根源是相信兩種不相容的事物可以同時為真。選擇平安就是選擇放棄衝突。'},
    {n:24, phase:'culmination', secs:7,  title:'特殊性之夢',
     topics:['特殊性','偶像'], summary:'特殊性（specialness）如何建立自己的偶像，以及如何在基督的光中放棄特殊性之夢。'},
    {n:25, phase:'culmination', secs:9,  title:'聖靈的正義（justice）',
     topics:['公正','特殊任務'], summary:'真正的正義（justice）不是懲罰而是平等。特殊任務（special function）主要引入：你的寬恕對象正是你的功課。'},
    {n:26, phase:'culmination', secs:11, title:'神聖之地（Holy Ground）',
     topics:['赦免功能'], summary:'你所站立的每一處都可以是聖地。赦免的特殊功能，以及如何在當下找到回家的路。'},
    {n:27, phase:'completion',  secs:8,  title:'療癒遠古的夢境',
     topics:['夢者與夢'], summary:'痊癒的圖像：你是夢者，不是夢中的人物。「世界已被寬恕了」的實踐意涵。'},
    {n:28, phase:'completion',  secs:8,  title:'小小間隙',
     topics:['無過去'], summary:'小小間隙（little gap）：過去已結束。只有現在存在。寬恕是向現在的打開。'},
    {n:29, phase:'completion',  secs:9,  title:'偶像崇拜',
     topics:['偶像崇拜','快樂之夢'], summary:'偶像是以形式取代內容的嘗試。放棄偶像後，快樂之夢（happy dream）才能開始。'},
    {n:30, phase:'completion',  secs:8,  title:'新的開始',
     topics:['作決定的準則'], summary:'唯二由耶穌本人命名的節（T-30.I：作決定的準則）所在章次。七條具體步驟，從清晨意圖到全天決策的信賴聖靈實踐法。'},
    {n:31, phase:'completion',  secs:8,  title:'終極的慧見',
     topics:['最終選擇'], summary:'選擇的最終課題：我們可以選擇。自我概念的徹底轉化，以及旅程的終點——回到上主那裡。'}
  ];

  var TOTAL_SECTIONS = 277;

  /* ══════════════════════════════════════════════
     §3  節次資料（重點章節完整展開）
     T=理論 P=實踐（含具體指示） I=個人（直接以「你」對話）
     phase: 'intro'|'major'|'weave'（主題在此節的生命週期階段）
  ══════════════════════════════════════════════ */
  var SECTION_DATA = {

    1: [
      {n:1, title:'奇蹟的條件',    T:1,P:0,I:1, note:'奇蹟的發生需要真正的知見（perception）；奇蹟使知見對準真知。'},
      {n:2, title:'奇蹟的本質（一）',T:1,P:0,I:1, note:'50條奇蹟原則前段（1-25條）：奇蹟的時間性、層次、功能，以非時間性的愛為源頭。', newTopic:'奇蹟'},
      {n:3, title:'奇蹟的本質（二）',T:1,P:1,I:1, note:'50條原則後段（26-50條）：奇蹟行者的資格、奇蹟與啟示的關係，及奇蹟的釋放功能。'},
      {n:4, title:'奇蹟行者的呼召', T:1,P:1,I:1, note:'你被呼召成為奇蹟行者。本節引出「你」的個人使命，極具個人層的強度。'},
      {n:5, title:'知見與真知',      T:1,P:0,I:1, note:'知見（perception）是奇蹟的場域；真知（knowledge）是奇蹟所指向的目標。', newTopic:'知見/真知'},
      {n:6, title:'罪疚與恐懼',      T:1,P:0,I:1, note:'恐懼是罪疚（guilt）的投射。奇蹟是用愛代替恐懼的選擇。', newTopic:'罪疚（guilt）'},
      {n:7, title:'人際關係與奇蹟',  T:1,P:1,I:1, note:'你的每一段關係都是奇蹟的機會。本節提供實踐指引：如何在關係中選擇奇蹟。'},
      {n:8, title:'時間與奇蹟',      T:1,P:0,I:1, note:'奇蹟不受時間制約。它可以「向前」縮短學習，也可以「向後」療癒過去。'},
      {n:9, title:'恩典與奇蹟',      T:1,P:0,I:1, note:'恩典不是賺取的，是接受的。奇蹟是接受恩典的意願打開的通道。'}
    ],

    5: [
      {n:1,  title:'上主的喜悅',      T:1,P:0,I:1, note:'聖靈是上主在分裂中的回應——不是評判，而是喜悅。本節建立聖靈作為喜悅之靈的基調。', newTopic:'聖靈（詳述）'},
      {n:2,  title:'上主的聲音',      T:1,P:1,I:1, note:'聖靈是上主的聲音，也是你真正自我的聲音。如何聆聽它？本節提供實踐指引。'},
      {n:3,  title:'聖靈作為上主的鏡子',T:1,P:0,I:1,note:'聖靈不創造，只延伸（extends）。透過聖靈你看見的不是小我的投射，而是上主的映照。'},
      {n:4,  title:'療癒作為思維的改變',T:1,P:0,I:1,note:'所有療癒都是思維的改變。聖靈透過改變你看待疾病的方式來療癒。'},
      {n:5,  title:'聖靈的課程',      T:1,P:1,I:1, note:'聖靈為你設計了一個具體的課程，根據你的準備程度調整。本節是最具實踐層強度的節之一。'},
      {n:6,  title:'聖靈的選擇',      T:1,P:0,I:1, note:'每一刻你都在選擇聖靈或小我作為你的老師。選擇是課程的核心動詞。'},
      {n:7,  title:'聖靈與世界',      T:1,P:0,I:1, note:'聖靈不逃離世界，而是重新詮釋世界。世界成為教室，不是牢籠。'},
      {n:8,  title:'聖靈的解脫計畫',  T:1,P:0,I:1, note:'聖靈的救贖計畫如何在人類歷史的結構中展開——不是末日審判，而是逐漸的心靈覺醒。'},
      {n:9,  title:'聖靈與記憶',      T:1,P:0,I:1, note:'聖靈持守上主對你的記憶，即使你已忘記。祂在等你準備好接收。'},
      {n:10, title:'聖靈的教學',      T:1,P:1,I:1, note:'聖靈是完美的老師：祂知道你現在的位置，也知道你需要到哪裡。本節提供聆聽引導的具體態度。'}
    ],

    15: [
      {n:1,  title:'時間的兩種用途',     T:1,P:0,I:1, note:'時間可以被用來強化過去，也可以被用來到達永恆。神聖一刻是第二種選擇的操練場。', newTopic:'神聖一刻'},
      {n:2,  title:'神聖一刻與上主的律', T:1,P:1,I:1, note:'上主的律與小我的律完全相反。神聖一刻是體驗上主之律的時刻——捨棄，方得擁有。'},
      {n:3,  title:'渺小與宏偉',         T:1,P:0,I:1, note:'小我選擇「渺小（littleness）」——縮小自己以保護自己。神聖一刻邀請你選擇上主之子的「宏偉（magnitude）」。'},
      {n:4,  title:'操練神聖一刻',       T:0,P:1,I:1, note:'本節幾乎完全由操練指示構成，是〈正文〉中實踐層比重最高的節之一。每個步驟都是具體可操作的。'},
      {n:5,  title:'神聖一刻與特殊關係', T:1,P:0,I:1, note:'特殊關係（special relationships）在此首次完整定義：一種以罪疚為基礎的愛，是神聖一刻的反面。', newTopic:'特殊關係'},
      {n:6,  title:'課題的恆久性',       T:1,P:1,I:1, note:'你在神聖一刻中學到的不會失去。本節說明學習的累積性，以及如何鞏固每次的選擇。'},
      {n:7,  title:'多餘的犧牲',         T:1,P:0,I:1, note:'揭示特殊關係最深的機制：犧牲→罪疚→憤怒→索取更多犧牲。這個循環因相信「愛=犧牲」而維持。'},
      {n:8,  title:'神聖一刻與真正的關係',T:1,P:0,I:1,note:'神聖一刻不是逃離關係，而是在關係中找到上主。真正的關係不需要犧牲。'},
      {n:9,  title:'神聖一刻與上主的吸引力',T:1,P:0,I:1,note:'上主的吸引力從未消失。學習本質上是放下阻礙的過程，而非艱苦的獲取。'},
      {n:10, title:'救贖作為共享課題',   T:1,P:1,I:1, note:'你無法獨自得救。救贖必須是共享的。本節說明為何每一段關係都是你的救贖機會。'},
      {n:11, title:'聖誕節作為犧牲的終結',T:1,P:0,I:1, note:'以聖誕節（Christmas）作為神聖一刻概念的頂點：上主的誕生不需要任何代價或犧牲。'}
    ],

    17: [
      {n:1,  title:'修鍊的策略',         T:1,P:1,I:1, note:'如何在面對困難關係時保持中心？本節提供實際策略，強調「不試圖改變他人，只改變自己的詮釋」。'},
      {n:2,  title:'原諒幻相',           T:1,P:0,I:1, note:'神聖關係（holy relationships）首次被完整定義：它從特殊關係中誕生，經由目標的改變而轉化。', newTopic:'神聖關係'},
      {n:3,  title:'聖靈對特殊關係的使用',T:1,P:0,I:1,note:'聖靈不廢除特殊關係，而是重新使用它——將其轉化為神聖關係的工具。'},
      {n:4,  title:'真正的信念',         T:1,P:0,I:1, note:'信念（faith）不是盲目，是選擇看見無罪。本節深化「相信你的弟兄無罪」的實踐意涵。'},
      {n:5,  title:'神聖關係的療癒',     T:1,P:0,I:1, note:'神聖關係如何療癒兩個人——不是透過「修復」關係，而是透過共同看見上主。'},
      {n:6,  title:'基督的凱旋之弓',     T:1,P:0,I:1, note:'以弓箭意象說明目標的設定：弓弦拉得越緊，箭飛得越遠。聖靈為你們的關係設定了最終目標。'},
      {n:7,  title:'聖靈的夢',           T:1,P:0,I:1, note:'聖靈如何改寫夢的內容：同樣的關係，現在成為回家的橋梁，而不是流放的囚籠。'},
      {n:8,  title:'真誠關係的條件',     T:1,P:1,I:1, note:'真誠關係（honest relationship）的基礎是放棄特殊目標。本節提供具體的自我誠實功課。'}
    ],

    19: [
      {n:1,  title:'罪的本質',           T:1,P:0,I:1, note:'罪（sin）的課程式完整定義：罪不是行為，是相信分裂是真實且不可逆的信念。它是小我的基石。', newTopic:'罪（sin）'},
      {n:2,  title:'平和的四個障礙',     T:1,P:0,I:1, note:'通往平和的路上有四道障礙：① 上主的報復 ② 信念的吸引力 ③ 身體的吸引力 ④ 死亡的恐懼。', newTopic:'平和的四障礙'},
      {n:3,  title:'超越身體',           T:1,P:1,I:1, note:'基督聖容（face of Christ）首次出現：你透過寬恕看見的，不是身體而是基督。本節含有最高的個人層強度。', newTopic:'基督聖容'},
      {n:4,  title:'平和的幻景',         T:1,P:0,I:1, note:'小我的「平和」是麻木，不是真正的平和。真正的平和出現在你放棄審判的那一刻。'}
    ],

    30: [
      {n:1,  title:'作決定的準則（Rules for Decision）',T:0,P:1,I:1, note:'唯二由耶穌本人命名的節。七條具體步驟：清晨設立意圖→遇到困難時的三步驟→全天的實踐鞏固。是全書最具操作性的節。', newTopic:'作決定的準則'},
      {n:2,  title:'犯錯的恐懼',         T:1,P:1,I:1, note:'恐懼犯錯本身就是一個錯誤。本節說明如何以「微笑面對錯誤」（smile at errors）代替罪疚自責。'},
      {n:3,  title:'超越犯錯',           T:1,P:0,I:1, note:'錯誤被修正，不被懲罰。本節深化無罪（innocence）的觀念——錯誤不改變你的本質。'},
      {n:4,  title:'幻相的消解',         T:1,P:0,I:1, note:'幻相如何被消解？不是透過對抗，而是透過帶光進入黑暗。'},
      {n:5,  title:'見證奇蹟',           T:1,P:1,I:1, note:'你透過奇蹟見證自己的轉化，也見證弟兄的轉化。本節引導讀者主動尋找當天的奇蹟證據。'},
      {n:6,  title:'只有上主的意志',     T:1,P:0,I:1, note:'上主的意志不是強加於你的，而是你真正自己的意志。小我的意志才是外來的。'},
      {n:7,  title:'真正的安慰',         T:1,P:0,I:1, note:'世界的安慰是暫時的，真正的安慰來自知道你與上主同在，一切的混亂只是暫時的幻象。'},
      {n:8,  title:'選擇再次做決定',     T:1,P:1,I:1, note:'第30章的結尾：你隨時可以重新選擇。「我可以選擇以不同的方式看待這件事。」這是每一刻都開放的自由。'}
    ]
  };

  /* 全局 */
  var CHAPTER_HEADINGS = {};
  var SECTION_INDEX    = {};

  /* ══════════════════════════════════════════════
     §4  CSS 注入
  ══════════════════════════════════════════════ */
  function injectCSS() {
    var s = document.createElement('style');
    s.id = 'arch-patch-styles';

    var base = [
      /* 外層頁籤 */
      '#arch-tab-bar{display:flex;gap:0;border-bottom:1px solid var(--c-border);flex-shrink:0;background:var(--c-sidebar);}',
      '#arch-tab-bar button{flex:1;padding:7px 2px;font-size:11px;border:none;background:transparent;cursor:pointer;color:var(--c-muted);border-bottom:2px solid transparent;transition:all .18s;font-family:inherit;letter-spacing:.01em;}',
      '#arch-tab-bar button.ap-active{color:var(--c-gold);border-bottom-color:var(--c-gold);font-weight:600;}',
      '#arch-tab-bar button:hover:not(.ap-active){color:var(--c-text);}',

      /* 架構面板 */
      '#arch-view{display:none;overflow-y:auto;overflow-x:hidden;padding:8px 8px 32px;flex-direction:column;}',
      '#arch-view.ap-open{display:flex;}',

      /* 相位標頭 */
      '.ap-phase-header{font-size:10px;font-weight:600;letter-spacing:.05em;padding:8px 2px 3px;color:var(--c-muted);margin-top:2px;}',
      '.ap-phase-header:first-child{padding-top:2px;}',

      /* 章節色塊 */
      '.ap-ch-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:4px;margin-bottom:2px;}',
      '.ap-ch-block{border-radius:6px;padding:5px 2px 4px;text-align:center;cursor:pointer;transition:transform .12s,box-shadow .12s;border:2px solid transparent;}',
      '.ap-ch-block:hover{transform:translateY(-2px);}',
      '.ap-ch-block:active{transform:scale(.95);}',
      '.ap-ch-n{font-size:13px;font-weight:700;color:rgba(255,255,255,.95);display:block;line-height:1;}',
      '.ap-ch-s{font-size:9px;color:rgba(255,255,255,.72);display:block;line-height:1;margin-top:2px;}',

      /* 相位色點（深色模式修正：加白色外框確保可見）*/
      '.ap-phase-dot{width:7px;height:7px;border-radius:50%;display:inline-block;flex-shrink:0;margin-right:5px;vertical-align:middle;border:1.5px solid transparent;}',
      'html.dark-mode .ap-phase-dot,body.dark-mode .ap-phase-dot{border-color:rgba(255,255,255,0.30)!important;}',

      /* 章節詳情卡 */
      '#arch-detail{border-radius:8px;padding:10px 11px;margin-top:8px;font-size:12px;line-height:1.65;border:1px solid var(--c-border);background:rgba(100,0,100,.05);word-break:normal;overflow-wrap:break-word;}',
      'html.dark-mode #arch-detail,body.dark-mode #arch-detail{background:rgba(255,255,255,.04);}',
      '.ad-ch{font-size:10px;font-weight:600;letter-spacing:.04em;margin-bottom:4px;}',
      '.ad-title{font-size:13px;font-weight:600;color:var(--c-text);margin-bottom:6px;}',
      '.ad-summary{color:var(--c-muted);font-size:12px;line-height:1.7;margin-bottom:6px;}',
      '.ad-topics{display:flex;flex-wrap:wrap;gap:3px;margin-bottom:8px;}',
      '.ad-tag{font-size:10px;padding:2px 6px;border-radius:10px;background:rgba(139,91,174,.15);color:#8B5BAE;font-weight:500;}',
      'html.dark-mode .ad-tag,body.dark-mode .ad-tag{background:rgba(201,162,39,.18);color:var(--c-gold);}',

      /* 節清單 */
      '.ap-sec-divider{font-size:10px;font-weight:600;color:var(--c-muted);margin:8px 0 4px;padding-top:8px;border-top:1px solid var(--c-border);letter-spacing:.04em;}',
      '.ap-sec-list{display:flex;flex-direction:column;gap:2px;margin-bottom:8px;}',
      '.ap-sec-item{display:grid;grid-template-columns:20px 1fr auto;align-items:start;gap:4px;padding:4px 5px;border-radius:5px;cursor:pointer;transition:background .12s;font-size:11.5px;}',
      '.ap-sec-item:hover{background:rgba(139,91,174,.08);}',
      'html.dark-mode .ap-sec-item:hover,body.dark-mode .ap-sec-item:hover{background:rgba(255,255,255,.06);}',
      '.ap-sec-num{font-size:10px;color:var(--c-muted);font-weight:500;line-height:1.6;text-align:right;}',
      '.ap-sec-title{color:var(--c-text);line-height:1.5;}',
      '.ap-sec-title small{display:block;font-size:10px;color:var(--c-muted);margin-top:1px;}',
      '.ap-tpi-wrap{display:flex;gap:2px;flex-shrink:0;padding-top:2px;}',
      '.ap-tpi{font-size:9px;font-weight:700;width:14px;height:14px;border-radius:3px;display:flex;align-items:center;justify-content:center;}',
      '.ap-tpi-T{background:rgba(58,122,200,.20);color:#3A7AC8;}',
      '.ap-tpi-P{background:rgba(42,138,106,.20);color:#2A8A6A;}',
      '.ap-tpi-I{background:rgba(201,162,39,.20);color:#C9A227;}',
      '.ap-tpi-off{opacity:.2;}',
      '.ap-new-topic{font-size:9px;background:rgba(200,90,48,.15);color:#C85A30;border-radius:3px;padding:0 3px;margin-left:3px;font-weight:500;}',
      'html.dark-mode .ap-new-topic,body.dark-mode .ap-new-topic{background:rgba(200,90,48,.25);color:#E8845A;}',

      /* 跳轉按鈕 */
      '.ad-nav-btn{display:block;width:100%;padding:7px 12px;font-size:12px;border-radius:6px;border:1px solid var(--c-border);background:transparent;cursor:pointer;color:var(--c-text);text-align:center;transition:background .15s;box-sizing:border-box;font-family:inherit;}',
      '.ad-nav-btn:hover{background:rgba(139,91,174,.1);border-color:#8B5BAE;}',

      /* 手風琴面板 */
      '.ap-accordion{border:1px solid var(--c-border);border-radius:7px;margin-top:8px;overflow:hidden;}',
      '.ap-accordion-hdr{display:flex;justify-content:space-between;align-items:center;padding:8px 11px;cursor:pointer;background:var(--c-sidebar);font-size:11.5px;font-weight:600;color:var(--c-text);transition:background .12s;gap:6px;}',
      '.ap-accordion-hdr:hover{background:rgba(139,91,174,.08);}',
      'html.dark-mode .ap-accordion-hdr,body.dark-mode .ap-accordion-hdr{background:rgba(255,255,255,.03);}',
      '.ap-accordion-hdr span:first-child{flex:1;}',
      '.ap-accordion-hdr .ap-arr{font-size:9px;color:var(--c-muted);transition:transform .2s;flex-shrink:0;}',
      '.ap-accordion-hdr.open .ap-arr{transform:rotate(180deg);}',
      '.ap-accordion-body{display:none;padding:10px 11px;background:var(--c-bg);font-size:12px;line-height:1.65;color:var(--c-muted);}',
      'html.dark-mode .ap-accordion-body,body.dark-mode .ap-accordion-body{background:rgba(0,0,0,.15);}',
      '.ap-accordion-body.open{display:block;}',

      /* 三層說明列 */
      '.ap-layer-row{display:grid;grid-template-columns:auto 1fr;gap:4px 8px;margin-bottom:6px;align-items:start;}',
      '.ap-layer-badge{font-size:10px;font-weight:700;padding:2px 6px;border-radius:4px;white-space:nowrap;margin-top:1px;}',
      '.ap-layer-text{font-size:11.5px;color:var(--c-muted);line-height:1.55;}',

      /* 生命週期說明 */
      '.ap-lifecycle-row{display:flex;gap:6px;margin-bottom:7px;align-items:flex-start;}',
      '.ap-lifecycle-num{width:18px;height:18px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:#fff;flex-shrink:0;margin-top:1px;}',
      '.ap-lifecycle-text strong{display:block;font-size:11px;font-weight:600;color:var(--c-text);margin-bottom:2px;}',
      '.ap-lifecycle-text span{font-size:11px;color:var(--c-muted);line-height:1.5;}',

      /* 圖例 */
      '#arch-legend{display:flex;flex-direction:column;gap:4px;margin-top:8px;padding-top:8px;border-top:1px solid var(--c-border);}',
      '.ap-legend-item{display:flex;align-items:center;gap:7px;font-size:10.5px;color:var(--c-muted);}',
      '.ap-legend-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;border:1.5px solid transparent;}',
      'html.dark-mode .ap-legend-dot,body.dark-mode .ap-legend-dot{border-color:rgba(255,255,255,.25)!important;}',

      /* breadcrumb 節次 */
      '#ap-sect-badge{font-size:10.5px;color:var(--c-muted);flex-shrink:0;white-space:nowrap;padding:1px 6px;border-radius:10px;background:rgba(139,91,174,.12);display:none;font-weight:500;}',
      'html.dark-mode #ap-sect-badge,body.dark-mode #ap-sect-badge{background:rgba(201,162,39,.15);color:var(--c-gold);}',
      '#ap-sect-badge.ap-visible{display:inline-block;}'
    ];

    s.textContent = base.join('');
    document.head.appendChild(s);
  }

  /* ══════════════════════════════════════════════
     §5  渲染輔助函式
  ══════════════════════════════════════════════ */

  /** 渲染節清單 */
  function renderSectionList(ch, container) {
    var secs = SECTION_DATA[ch.n];

    var divider = document.createElement('div');
    divider.className = 'ap-sec-divider';
    divider.textContent = '本章各節（共 ' + ch.secs + ' 節）';
    container.appendChild(divider);

    var list = document.createElement('div');
    list.className = 'ap-sec-list';

    /* 若無詳細資料，顯示通用節次列表 */
    if (!secs) {
      for (var i = 1; i <= ch.secs; i++) {
        var generic = document.createElement('div');
        generic.className = 'ap-sec-item';
        var hasP = (i % 3 === 0); // 大約每3節有一節含強實踐內容
        generic.innerHTML =
          '<span class="ap-sec-num">§' + i + '</span>' +
          '<span class="ap-sec-title" style="color:var(--c-muted)">第' + i + '節</span>' +
          '<span class="ap-tpi-wrap">' +
            '<span class="ap-tpi ap-tpi-T">T</span>' +
            '<span class="ap-tpi ap-tpi-P' + (hasP?'':' ap-tpi-off') + '">P</span>' +
            '<span class="ap-tpi ap-tpi-I">I</span>' +
          '</span>';
        (function(secIdx, chN) {
          generic.addEventListener('click', function () { apNavToSection(chN, secIdx); });
        })(i, ch.n);
        list.appendChild(generic);
      }
    } else {
      secs.forEach(function (sec) {
        var item = document.createElement('div');
        item.className = 'ap-sec-item';
        var noteHtml = sec.note ? '<small>' + sec.note + '</small>' : '';
        var newHtml  = sec.newTopic ? '<span class="ap-new-topic">✦ ' + sec.newTopic + '</span>' : '';
        item.innerHTML =
          '<span class="ap-sec-num">§' + sec.n + '</span>' +
          '<span class="ap-sec-title">' + sec.title + newHtml + noteHtml + '</span>' +
          '<span class="ap-tpi-wrap">' +
            '<span class="ap-tpi ap-tpi-T' + (sec.T?'':' ap-tpi-off') + '">T</span>' +
            '<span class="ap-tpi ap-tpi-P' + (sec.P?'':' ap-tpi-off') + '">P</span>' +
            '<span class="ap-tpi ap-tpi-I' + (sec.I?'':' ap-tpi-off') + '">I</span>' +
          '</span>';
        (function(secN, chN) {
          item.addEventListener('click', function () { apNavToSection(chN, secN); });
        })(sec.n, ch.n);
        list.appendChild(item);
      });
    }
    container.appendChild(list);
  }

  /** 建立手風琴：節的三層解剖學 */
  function buildThreeLayerAccordion() {
    var acc = document.createElement('div');
    acc.className = 'ap-accordion';
    var hdr = document.createElement('div');
    hdr.className = 'ap-accordion-hdr';
    hdr.innerHTML = '<span>📐 節的三層解剖學（Pedagogical Unit）</span><span class="ap-arr">▾</span>';
    var body = document.createElement('div');
    body.className = 'ap-accordion-body';

    body.innerHTML = [
      '<div style="margin-bottom:8px;font-size:11px;color:var(--c-muted);line-height:1.6">',
      '每節都同時在三個層面運作，三層同時存在是節的<strong style="color:var(--c-text)">完整性標誌</strong>。',
      '一個真正「完成」的閱讀應在三個層面都有收穫。</div>',
      '<div class="ap-layer-row">',
        '<span class="ap-layer-badge ap-tpi-T" style="padding:3px 7px;font-size:11px">T 理論</span>',
        '<div class="ap-layer-text"><strong style="color:var(--c-text);font-size:11.5px">Theoretical（理論性）</strong><br>',
        '引入或深化一個概念，提供認知框架。是節的骨架，通常在節的前半部出現。</div>',
      '</div>',
      '<div class="ap-layer-row">',
        '<span class="ap-layer-badge ap-tpi-P" style="padding:3px 7px;font-size:11px">P 實踐</span>',
        '<div class="ap-layer-text"><strong style="color:var(--c-text);font-size:11.5px">Practical（實踐性）</strong><br>',
        '含具體的操練指示。例如「重複這些話」「當你感到X時……」。',
        '強P節（如T-15.IV、T-30.I）幾乎完全由操練指示構成。</div>',
      '</div>',
      '<div class="ap-layer-row">',
        '<span class="ap-layer-badge ap-tpi-I" style="padding:3px 7px;font-size:11px">I 個人</span>',
        '<div class="ap-layer-text"><strong style="color:var(--c-text);font-size:11.5px">Personal（個人性）</strong><br>',
        '作者直接以「你（you）」向讀者說話，將觀念與讀者實際生命情境扣連。幾乎每節都有此層。</div>',
      '</div>',
      '<div style="font-size:10.5px;color:var(--c-muted);margin-top:6px;padding-top:6px;border-top:1px solid var(--c-border)">',
        '💡 <strong style="color:var(--c-text)">T-30.I《作決定的準則》</strong>是唯二由耶穌本人命名的節，',
        '也是全書<span style="color:#2A8A6A">P值最高</span>的節——幾乎純粹由七條具體操練步驟構成。',
      '</div>'
    ].join('');

    hdr.addEventListener('click', function () { toggleAccordion(hdr, body); });
    acc.appendChild(hdr);
    acc.appendChild(body);
    return acc;
  }

  /** 建立手風琴：主題三階段生命週期 */
  function buildLifecycleAccordion() {
    var acc = document.createElement('div');
    acc.className = 'ap-accordion';
    var hdr = document.createElement('div');
    hdr.className = 'ap-accordion-hdr';
    hdr.innerHTML = '<span>🌱 主題三階段生命週期</span><span class="ap-arr">▾</span>';
    var body = document.createElement('div');
    body.className = 'ap-accordion-body';

    var phases = [
      {
        color:'#3A7AC8', label:'引入期（Introduction）',
        desc:'主題首次出現。通常帶有半傳統、半課程式用語，有時幾乎孤立地出現。',
        example:'例：「罪（sin）」在第19章前偶有出現，但語義尚未完全課程化。'
      },
      {
        color:'#C85A30', label:'主要闡述期（Major Presentation）',
        desc:'主題成為一個或數個節的核心焦點，得到完整的課程式重新詮釋。這是讀者建立認知基礎的關鍵時刻。',
        example:'例：第15章是「神聖一刻」與「特殊關係」的主要闡述章次。'
      },
      {
        color:'#8B5BAE', label:'融入整體期（Integration）',
        desc:'主題退出焦點，成為思想體系的背景詞彙，被簡短引用，並與新引入的主題交織。後面的節假設讀者已持有該主題的完整定義。',
        example:'例：「奇蹟」在第3章後成為背景詞彙，簡短引用遍佈全書31章。'
      }
    ];

    var html = '<div style="font-size:11px;color:var(--c-muted);margin-bottom:8px;line-height:1.6">'+
      '〈正文〉的每個核心主題都經歷可辨識的三個階段，類比於大學課程：'+
      '教授詳細介紹某概念後，便假設學生已掌握，之後只需簡短提及。'+
    '</div>';

    phases.forEach(function (p, i) {
      html +=
        '<div class="ap-lifecycle-row">' +
          '<div class="ap-lifecycle-num" style="background:' + p.color + '">' + (i+1) + '</div>' +
          '<div class="ap-lifecycle-text">' +
            '<strong>' + p.label + '</strong>' +
            '<span>' + p.desc + '</span>' +
            '<span style="display:block;margin-top:3px;font-size:10.5px;opacity:.8">' + p.example + '</span>' +
          '</div>' +
        '</div>';
    });

    html += '<div style="font-size:10.5px;color:var(--c-muted);margin-top:6px;padding-top:6px;border-top:1px solid var(--c-border)">' +
      '🔗 <strong style="color:var(--c-text)">交織密度</strong>：即使一個只有六七段的短節，若系統追蹤被引用超過一次的術語，' +
      '通常會找到<span style="color:#C85A30;font-weight:600"> ~50 個</span>活躍主題。這是為何「跳讀」造成理解斷裂的根本原因——' +
      '跳讀者缺乏對這50個術語的「已建立定義」，被迫以直覺填補，幾乎必然導致投射式閱讀。' +
    '</div>';

    body.innerHTML = html;
    hdr.addEventListener('click', function () { toggleAccordion(hdr, body); });
    acc.appendChild(hdr);
    acc.appendChild(body);
    return acc;
  }

  function toggleAccordion(hdr, body) {
    var isOpen = body.classList.contains('open');
    body.classList.toggle('open', !isOpen);
    hdr.classList.toggle('open', !isOpen);
  }

  /* ══════════════════════════════════════════════
     §6  側邊欄 UI 注入
  ══════════════════════════════════════════════ */
  function injectSidebarUI() {
    var tocWrapper = document.getElementById('toc-wrapper');
    var sidebar    = document.getElementById('sidebar-toc');
    if (!tocWrapper || !sidebar) return;

    /* 頁籤切換列 */
    var tabBar = document.createElement('div');
    tabBar.id = 'arch-tab-bar';
    tabBar.innerHTML =
      '<button class="ap-active" id="ap-btn-toc" onclick="apSwitchTab(\'toc\')">📖 目錄</button>' +
      '<button id="ap-btn-arch" onclick="apSwitchTab(\'arch\')">🗺 〈正文〉架構</button>';

    /* 架構視圖面板 */
    var archView = document.createElement('div');
    archView.id = 'arch-view';

    /* 31章色塊 */
    PHASE_ORDER.forEach(function (phase) {
      var meta = PHASE_META[phase];
      var chs  = CHAPTERS.filter(function (c) { return c.phase === phase; });
      var hdr  = document.createElement('div');
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
        block.style.cssText = 'background:' + meta.color + ';opacity:.78;';
        block.title = '第' + ch.n + '章　' + ch.title + '（' + ch.secs + '節）';
        block.innerHTML = '<span class="ap-ch-n">' + ch.n + '</span><span class="ap-ch-s">' + ch.secs + '節</span>';
        block.addEventListener('click', function () { apShowDetail(ch, block); });
        grid.appendChild(block);
      });
      archView.appendChild(grid);
    });

    /* 詳情卡 */
    var detail = document.createElement('div');
    detail.id = 'arch-detail';
    detail.innerHTML = '<div style="color:var(--c-muted);font-size:12px">↑ 點擊任意章節色塊，查看章次解析與各節分布</div>';
    archView.appendChild(detail);

    /* 手風琴面板 */
    archView.appendChild(buildThreeLayerAccordion());
    archView.appendChild(buildLifecycleAccordion());

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

    sidebar.insertBefore(tabBar, tocWrapper);
    tocWrapper.parentNode.insertBefore(archView, tocWrapper.nextSibling);
  }

  /* ══════════════════════════════════════════════
     §7  全局互動函式
  ══════════════════════════════════════════════ */
  function apShowDetail(ch, blockEl) {
    document.querySelectorAll('.ap-ch-block').forEach(function (b) {
      b.style.opacity = '0.78';
      b.style.outline = 'none';
    });
    blockEl.style.opacity = '1';
    blockEl.style.outline = '2px solid rgba(255,255,255,.75)';

    var meta   = PHASE_META[ch.phase];
    var detail = document.getElementById('arch-detail');
    if (!detail) return;

    var tagsHtml = ch.topics.map(function (t) {
      return '<span class="ad-tag">✦ ' + t + '</span>';
    }).join('');

    detail.innerHTML =
      '<div class="ad-ch" style="color:' + meta.color + '">第' + ch.n + '章 ／ ' + meta.label + '</div>' +
      '<div class="ad-title">' + ch.title + '（共 ' + ch.secs + ' 節）</div>' +
      '<div class="ad-summary">' + ch.summary + '</div>' +
      '<div class="ad-topics">' + tagsHtml + '</div>';

    renderSectionList(ch, detail);

    var btn = document.createElement('button');
    btn.className = 'ad-nav-btn';
    btn.type = 'button';
    btn.textContent = '▶ 跳轉到第' + ch.n + '章';
    btn.onclick = function () { window.apNavToChapter(ch.n); };
    detail.appendChild(btn);

    setTimeout(function () {
      detail.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 80);
  }

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
    var target = CHAPTER_HEADINGS[chNum];
    if (!target) {
      var all = document.querySelectorAll('#content-area h1,#content-area h2');
      for (var i = 0; i < all.length; i++) {
        if (extractChNum(all[i].textContent) === chNum) { target = all[i]; break; }
      }
    }
    if (!target) return;
    apSwitchTab('toc');
    setTimeout(function () {
      var top = window.scrollY + target.getBoundingClientRect().top - 60;
      window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    }, 150);
  };

  window.apNavToSection = function (chNum, secNum) {
    /* 尋找該章的第 secNum 個 h3 */
    var chHeading = CHAPTER_HEADINGS[chNum];
    if (!chHeading) return;

    var allH3 = Array.from(document.querySelectorAll('#content-area h3'));
    /* 找到屬於此章的 h3（在此章 h2 之後、下一章 h2 之前）*/
    var inChapter = false;
    var count = 0;
    var target = null;

    var allH = Array.from(document.querySelectorAll('#content-area h2,#content-area h3'));
    for (var i = 0; i < allH.length; i++) {
      var h = allH[i];
      if (h.tagName === 'H2') {
        var n = extractChNum(h.textContent);
        if (n === chNum) { inChapter = true; continue; }
        if (inChapter) break; /* 進入下一章，停止 */
      }
      if (inChapter && h.tagName === 'H3') {
        count++;
        if (count === secNum) { target = h; break; }
      }
    }

    if (!target) { window.apNavToChapter(chNum); return; }
    apSwitchTab('toc');
    setTimeout(function () {
      var top = window.scrollY + target.getBoundingClientRect().top - 60;
      window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    }, 150);
  };

  function apHighlightCurrentChapter() {
    var curN = null;
    document.querySelectorAll('#content-area h2').forEach(function (h) {
      var n = extractChNum(h.textContent);
      if (n && h.getBoundingClientRect().top <= 80) curN = n;
    });
    document.querySelectorAll('.ap-ch-block').forEach(function (b) {
      var n = parseInt(b.dataset.ch, 10);
      b.style.opacity = (n === curN) ? '1' : '0.78';
      b.style.outline = (n === curN) ? '2px solid rgba(255,255,255,.75)' : 'none';
    });
  }

  /* ══════════════════════════════════════════════
     §8  TOC 增強與 IntersectionObserver
  ══════════════════════════════════════════════ */
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
    if (wrapper.children.length > 0) { setTimeout(onTOCBuilt, 80); return; }
    var mo = new MutationObserver(function (_, obs) {
      if (wrapper.children.length > 0) { obs.disconnect(); setTimeout(onTOCBuilt, 80); }
    });
    mo.observe(wrapper, { childList: true });
  }

  function injectSectionBadge() {
    var crumbText = document.getElementById('crumb-text');
    if (!crumbText || document.getElementById('ap-sect-badge')) return;
    var badge = document.createElement('span');
    badge.id = 'ap-sect-badge';
    badge.setAttribute('aria-label', '目前節次');
    crumbText.parentNode.insertBefore(badge, crumbText.nextSibling);
  }

  /* ══════════════════════════════════════════════
     §9  初始化
  ══════════════════════════════════════════════ */
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
