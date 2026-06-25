/**
 * arch-patch.js — 《完整加註版奇蹟課程》PWA 課程架構強化補丁 v2.1
 * 修正：深色模式章節色塊/圓點顏色消失；補全31章完整節次資料
 */
(function () {
  'use strict';

  /* ── §1 中文數字轉換器 ── */
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

  /* ── §2 相位 & 章節資料 ── */
  var PHASE_META = {
    foundation:  { label:'奠基 1-3章',   color:'#C9A227', cls:'ap-ph-foundation'  },
    ego:         { label:'展開 4-7章',   color:'#8B5BAE', cls:'ap-ph-ego'         },
    healing:     { label:'深化 8-13章',  color:'#3A7AC8', cls:'ap-ph-healing'     },
    integration: { label:'整合 14-18章', color:'#2A8A6A', cls:'ap-ph-integration' },
    culmination: { label:'高峰 19-26章', color:'#C85A30', cls:'ap-ph-culmination' },
    completion:  { label:'完成 27-31章', color:'#7A3080', cls:'ap-ph-completion'  }
  };
  var PHASE_ORDER = ['foundation','ego','healing','integration','culmination','completion'];
  var CHAPTERS = [
    {n:1, phase:'foundation', secs:9,  title:'奇蹟原則',             topics:['奇蹟','知見基礎'],      summary:'全書50條奇蹟原則逐一定義奇蹟的本質與功能。是整部課程的根基石，也是唯一在最初就完整展開的核心主題。'},
    {n:2, phase:'foundation', secs:13, title:'正確的防衛機制與解脫恐懼', topics:['分裂','救贖'],          summary:'引入分裂（separation）的觀念，探討防衛機制的正確詮釋，以及救贖作為防衛機制的概念。'},
    {n:3, phase:'foundation', secs:11, title:'清明的知見',             topics:['知見','真知'],          summary:'區分知見（perception）與真知（knowledge），引入研習的重要性，並提出給奇蹟行者的守則。'},
    {n:4, phase:'ego',        secs:11, title:'小我為求自保的掙扎',      topics:['小我','聖靈初現'],      summary:'深入分析小我的產生與運作，首次引入聖靈（Holy Spirit）的概念，討論天國的安詳生命。'},
    {n:5, phase:'ego',        secs:10, title:'聖靈',                  topics:['聖靈詳述','喜悅'],      summary:'聖靈的主要闡述章：全然喜悅之靈、代上主發言的聲音。是理解聖靈最完整的章次。'},
    {n:6, phase:'ego',        secs:8,  title:'愛的課題',               topics:['投射','攻擊'],          summary:'愛的課題：十字架的訊息、投射與分裂，「只教人愛」的核心原則。'},
    {n:7, phase:'ego',        secs:10, title:'天國的延伸',              topics:['延伸','療癒原則'],      summary:'天國的律、才能的統一、療癒是憶起之道。力量的延伸與療癒的根本原理。'},
    {n:8, phase:'healing',    secs:9,  title:'全然指向療癒的意志',      topics:['意志','身體角色'],      summary:'討論療癒的意志，以及身體在課程中的角色——身體是溝通的工具，不是罪的棲所。'},
    {n:9, phase:'healing',    secs:8,  title:'寬恕計畫',               topics:['寬恕計畫'],             summary:'寬恕（forgiveness）作為上主整體計畫的一部分，以及聖靈如何透過關係引導療癒。'},
    {n:10,phase:'healing',    secs:5,  title:'小我的宗教',              topics:['小我的宗教'],           summary:'小我如何建立自己的「宗教」——將自我保護與靈性混淆，以及如何超越這種錯誤的神學。'},
    {n:11,phase:'healing',    secs:9,  title:'上主或小我',              topics:['上主或小我'],           summary:'兩種思想體系的根本對立：上主的知識與小我的知見，以及在兩者之間做出真正的選擇。'},
    {n:12,phase:'healing',    secs:8,  title:'愛的理性',               topics:['愛的理性'],             summary:'神聖的拉力：以愛的理性詮釋他人動機，回應內在的呼喚，尋找共同目標。'},
    {n:13,phase:'healing',    secs:11, title:'從罪疚中解脫',            topics:['罪疚','時間'],          summary:'時間與罪疚的關係：罪疚是讓時間停在過去的機制；解脫罪疚即是從時間的囚禁中得到自由。'},
    {n:14,phase:'integration',secs:12, title:'純潔無罪之光',            topics:['無罪之光','聖靈課程'],  summary:'透過無罪（innocence）之光重新看待世界，以及聖靈的課程表如何在每個關係中展開。'},
    {n:15,phase:'integration',secs:11, title:'神聖一刻與特殊關係',      topics:['神聖一刻','特殊關係'],  summary:'神聖一刻與特殊關係同時完整登場。犧牲─罪疚─憤怒的循環被揭示。每一個「現在」都可以是神聖的。'},
    {n:16,phase:'integration',secs:7,  title:'審視特殊關係',            topics:['真正的另類'],           summary:'深度審視特殊關係的根本機制，以及「真正的另類（true alternative）」如何在神聖一刻中展現。'},
    {n:17,phase:'integration',secs:8,  title:'神聖關係',               topics:['神聖關係'],             summary:'神聖關係的主要引入章：從特殊關係中誕生的轉化，寬恕如何讓兩人共同看見基督。'},
    {n:18,phase:'integration',secs:9,  title:'神聖關係的祝福',          topics:['夢','從夢中醒來'],      summary:'夢與幻相的本質：神聖關係開始改寫夢的內容，引導兩人同走回家的路。'},
    {n:19,phase:'culmination', secs:4,  title:'從罪咎（Sin）到平安',     topics:['罪(sin)','基督聖容'],   summary:'罪的完整課程式定義。基督聖容首次出現。平和的四個障礙：上主的報復、信念的吸引力、身體的吸引力、死亡的恐懼。'},
    {n:20,phase:'culmination', secs:9,  title:'對弟兄的慧見',           topics:['基督願景'],             summary:'透過基督的眼睛看見弟兄：復活的願景、神聖目的，以及「我要看見你無罪」的核心實踐。'},
    {n:21,phase:'culmination', secs:8,  title:'渴望一個無罪世界',        topics:['心靈的責任'],           summary:'心靈對其知見負完全的責任：快樂是一個選擇，不是環境的結果。'},
    {n:22,phase:'culmination', secs:6,  title:'神聖關係的任務',          topics:['救贖使命'],             summary:'神聖關係承擔了救贖的使命：兩人合一的目的超越了個人的特殊目標。'},
    {n:23,phase:'culmination', secs:4,  title:'擺脫衝突',               topics:['衝突幻相'],             summary:'衝突的根源是相信兩種不相容的事物可以同時為真。選擇平安就是選擇放棄衝突。'},
    {n:24,phase:'culmination', secs:7,  title:'特殊性之夢',              topics:['特殊性','偶像'],        summary:'特殊性（specialness）如何建立自己的偶像，以及如何在基督的光中放棄特殊性之夢。'},
    {n:25,phase:'culmination', secs:9,  title:'聖靈的正義（justice）',   topics:['公正','特殊任務'],      summary:'真正的正義不是懲罰而是平等。特殊任務（special function）主要引入：你的寬恕對象正是你的功課。'},
    {n:26,phase:'culmination', secs:11, title:'神聖之地（Holy Ground）',  topics:['赦免功能'],             summary:'你所站立的每一處都可以是聖地。赦免的特殊功能，以及如何在當下找到回家的路。'},
    {n:27,phase:'completion',  secs:8,  title:'療癒遠古的夢境',          topics:['夢者與夢'],             summary:'痊癒的圖像：你是夢者，不是夢中的人物。「世界已被寬恕了」的實踐意涵。'},
    {n:28,phase:'completion',  secs:8,  title:'小小間隙',               topics:['無過去','現在'],        summary:'小小間隙（little gap）：過去已結束。只有現在存在。寬恕是向現在的打開。'},
    {n:29,phase:'completion',  secs:9,  title:'偶像崇拜',               topics:['偶像','快樂之夢'],      summary:'偶像是以形式取代內容的嘗試。放棄偶像後，快樂之夢（happy dream）才能開始。'},
    {n:30,phase:'completion',  secs:8,  title:'新的開始',               topics:['作決定的準則'],         summary:'唯二由耶穌本人命名的節（T-30.I：作決定的準則）所在章次。七條具體步驟，從清晨意圖到全天決策的信賴聖靈實踐法。'},
    {n:31,phase:'completion',  secs:8,  title:'終極的慧見',              topics:['最終選擇'],             summary:'選擇的最終課題：我們可以選擇。自我概念的徹底轉化，以及旅程的終點——回到上主那裡。'}
  ];
  var TOTAL_SECTIONS = 277;
  var CHAPTER_HEADINGS = {};
  var SECTION_INDEX    = {};

  /* ── §3 節次資料（全31章完整展開）T=理論 P=實踐 I=個人 ── */
  var SD = {
    1: [
      {n:1,T:1,P:0,I:1,title:'奇蹟的條件',      note:'奇蹟使知見對準真知。知見被愛校正時，奇蹟自然發生——不是努力的結果。'},
      {n:2,T:1,P:0,I:1,title:'奇蹟的本質（一）', note:'50條原則前段（1-25條）：奇蹟的時間性、層次、功能，以非時間性的愛為源頭。', newTopic:'奇蹟'},
      {n:3,T:1,P:1,I:1,title:'奇蹟的本質（二）', note:'50條原則後段（26-50條）：奇蹟行者的資格、奇蹟與啟示的關係，含具體操練指示。'},
      {n:4,T:1,P:1,I:1,title:'奇蹟行者的呼召',   note:'你被呼召成為奇蹟行者。本節引出個人使命，是全書「個人層（I）」強度最高的節之一。'},
      {n:5,T:1,P:0,I:1,title:'知見與真知',       note:'知見（perception）是奇蹟的場域；真知（knowledge）是奇蹟所指向的目標。',newTopic:'知見/真知'},
      {n:6,T:1,P:0,I:1,title:'罪疚與恐懼',       note:'恐懼是罪疚（guilt）的投射。奇蹟是用愛代替恐懼的選擇。',newTopic:'罪疚（guilt）'},
      {n:7,T:1,P:1,I:1,title:'人際關係與奇蹟',   note:'你的每一段關係都是奇蹟的機會。本節提供實踐指引：如何在關係中選擇奇蹟。'},
      {n:8,T:1,P:0,I:1,title:'時間與奇蹟',       note:'奇蹟不受時間制約。它可以「向前」縮短學習，也可以「向後」療癒過去。'},
      {n:9,T:1,P:0,I:1,title:'恩典與奇蹟',       note:'恩典不是賺取的，是接受的。奇蹟是接受恩典的意願打開的通道。'}
    ],
    2: [
      {n:1, T:1,P:0,I:1,title:'分裂的起源',       note:'「微小的瘋狂念頭（tiny mad idea）」如何被認真看待，由此產生了分裂的幻覺。',newTopic:'分裂（separation）'},
      {n:2, T:1,P:0,I:1,title:'救贖作為防衛',     note:'救贖（Atonement）是唯一有效的防衛：它不攻擊，而是根本地取消錯誤的根源。',newTopic:'救贖（Atonement）'},
      {n:3, T:1,P:1,I:1,title:'上主的祭壇',       note:'上主的祭壇在你的心中。任何逃避祭壇的嘗試都是對自身本質的否認。含實踐指示。'},
      {n:4, T:1,P:0,I:1,title:'從恐懼中療癒',     note:'所有療癒都是從恐懼（fear）轉向愛（love）的選擇。恐懼是愛的缺席，不是真實的力量。'},
      {n:5, T:1,P:1,I:1,title:'奇蹟行者的功能',   note:'奇蹟行者的功能是傳遞而非製造奇蹟。聖靈設定奇蹟的時機；你只需要願意。'},
      {n:6, T:1,P:0,I:1,title:'恐懼與衝突',       note:'衝突是兩種互斥信念同時存在的狀態。選擇只能有一個——要麼是上主，要麼是小我。'},
      {n:7, T:1,P:0,I:1,title:'原因與結果',       note:'你所感知的世界是你的思想（原因）的結果。改變思想，知見自然改變。'},
      {n:8, T:1,P:0,I:1,title:'最後審判的真義',   note:'最後審判不是懲罰，而是徹底的無罪宣告——對所有人，因為罪根本從未真實發生。'},
      {n:9, T:1,P:1,I:1,title:'錯誤的修正',       note:'錯誤被修正（corrected），不被懲罰（punished）。聖靈的修正方式是用真理輕輕替換謬誤。'},
      {n:10,T:1,P:0,I:1,title:'知識的恢復',       note:'本節引入「知識（knowledge）」作為最終目標——超越知見的境界，不需修正，因為沒有謬誤。'},
      {n:11,T:1,P:0,I:1,title:'理性的功能',       note:'真正的理性為愛服務，而不是小我的自我保護邏輯。神聖理性幫助你辨認什麼是真實的。'},
      {n:12,T:1,P:0,I:1,title:'審判與權威問題',   note:'「權威問題（authority problem）」是小我的根本衝突：相信自己創造了自己，無需上主。'},
      {n:13,T:1,P:1,I:1,title:'放棄攻擊',         note:'本節是第2章的結語：放棄所有形式的攻擊，包括對自己的攻擊。含清晰的操練指引。'}
    ],
    3: [
      {n:1, T:1,P:0,I:1,title:'真實的知見',       note:'真實的知見（true perception）看見弟兄的無罪（innocence），而不是他的行為。'},
      {n:2, T:1,P:0,I:1,title:'清明知見的原則',   note:'清明的知見不等於知識，但它是通往知識的橋梁——是「寬恕式的看見」。'},
      {n:3, T:1,P:0,I:1,title:'知見與知識的分野', note:'知見（perception）涉及詮釋；知識（knowledge）超越詮釋。這是課程理解的關鍵架構。'},
      {n:4, T:1,P:1,I:1,title:'無罪的知見',       note:'選擇看見弟兄的無罪是一個積極的操練，需要有意識的選擇。本節含具體的練習指示。'},
      {n:5, T:1,P:0,I:1,title:'心靈超越身體',     note:'心靈不在身體裡；身體在心靈裡。這個認識是所有療癒的認識論基礎。'},
      {n:6, T:1,P:0,I:1,title:'給予的真義',       note:'真正的給予（giving）增加給予者，而不是減少。這是天國的律，與世界的律完全相反。'},
      {n:7, T:1,P:0,I:1,title:'超越審判',         note:'小我的審判投射它自己的罪疚。放棄審判是放下投射，讓真相自然顯現。'},
      {n:8, T:1,P:0,I:1,title:'創造與溝通',       note:'上主透過創造來溝通愛；你透過奇蹟來溝通上主。創造與溝通是同一件事。'},
      {n:9, T:1,P:0,I:1,title:'無罪的見證',       note:'你不能見證你自己的無罪——你只能見證弟兄的無罪，在那裡你也看見了自己。'},
      {n:10,T:1,P:1,I:1,title:'課程的意義',       note:'這門課程的目的不是改變行為，而是改變思想。含實踐指示：如何重新選擇詮釋。'},
      {n:11,T:1,P:0,I:1,title:'觀念與形式',       note:'觀念（ideas）不離開其源頭。你分享的每一個觀念，你都同時持有——這就是延伸（extension）。'}
    ],
    4: [
      {n:1, T:1,P:0,I:1,title:'小我的起源',       note:'小我是分裂信念的化身——它相信分裂是真實的，並竭力維護這個信念。',newTopic:'小我（ego）詳述'},
      {n:2, T:1,P:0,I:1,title:'小我的幻象',       note:'小我的「世界」是由它的恐懼投射構成的幻象。它越怕被看穿，就越猛烈地攻擊。'},
      {n:3, T:1,P:0,I:1,title:'小我的真正面貌',   note:'小我的本質是對分裂的信念，而非真實存在的力量。認識它的虛假是解除它的第一步。'},
      {n:4, T:1,P:0,I:1,title:'小我的不安全感',   note:'小我永遠不安全，因為它建立在沙土之上——一個從未真實發生的分裂之上。'},
      {n:5, T:1,P:0,I:1,title:'小我與錯誤',       note:'小我把錯誤（errors）變成罪（sins），讓你相信它們是不可逆的。聖靈只看到可被修正的錯誤。'},
      {n:6, T:1,P:1,I:1,title:'上主的安詳',       note:'上主的安詳（peace of God）不依賴任何外在條件。本節含實踐指示：如何轉向那份安詳。'},
      {n:7, T:1,P:0,I:1,title:'小我的衝突',       note:'小我在不同欲望之間永遠處於衝突狀態，因為它的每個「解決方案」都製造新的問題。'},
      {n:8, T:1,P:0,I:1,title:'聖靈的聲音',       note:'聖靈的聲音從不強迫，從不批判，只是安靜地等待你的意願轉向它。',newTopic:'聖靈初現（詳述）'},
      {n:9, T:1,P:1,I:1,title:'選擇真正的老師',   note:'每一刻你都在選擇老師：小我或聖靈。本節強調這是持續性的、具體的選擇實踐。'},
      {n:10,T:1,P:0,I:1,title:'超越小我的束縛',   note:'你不必消滅小我——你只需要選擇不聽從它。當你選擇聖靈時，小我自然失去影響力。'},
      {n:11,T:1,P:1,I:1,title:'天國的安詳',       note:'本節是第4章結語：天國的安詳不是你賺取的，是你在放下小我時自然回復的本然狀態。'}
    ],
    5: [
      {n:1, T:1,P:0,I:1,title:'上主的喜悅',       note:'聖靈是上主在分裂中的回應——不是評判，而是喜悅。本節建立聖靈作為喜悅之靈的基調。',newTopic:'聖靈（主要闡述）'},
      {n:2, T:1,P:1,I:1,title:'上主的聲音',       note:'聖靈是上主的聲音，也是你真正自我的聲音。如何聆聽它？本節提供具體的實踐指引。'},
      {n:3, T:1,P:0,I:1,title:'聖靈作為上主的鏡子',note:'聖靈不創造，只延伸（extends）。透過聖靈你看見的不是小我的投射，而是上主的映照。'},
      {n:4, T:1,P:0,I:1,title:'療癒作為思維的改變',note:'所有療癒都是思維的改變。聖靈透過改變你看待疾病的方式來療癒——不是治療症狀。'},
      {n:5, T:1,P:1,I:1,title:'聖靈的課程',       note:'聖靈為你設計了一個具體的課程，根據你的準備程度調整。本節是全章實踐層比重最高的節。'},
      {n:6, T:1,P:0,I:1,title:'聖靈的選擇',       note:'每一刻你都在選擇聖靈或小我作為你的老師。選擇是課程的核心動詞——不是被動的接受。'},
      {n:7, T:1,P:0,I:1,title:'聖靈與世界',       note:'聖靈不逃離世界，而是重新詮釋世界。世界成為教室，不是牢籠。'},
      {n:8, T:1,P:0,I:1,title:'聖靈的解脫計畫',   note:'聖靈的救贖計畫如何在人類歷史結構中展開——不是末日審判，而是逐漸的心靈覺醒。'},
      {n:9, T:1,P:0,I:1,title:'聖靈與記憶',       note:'聖靈持守上主對你的記憶，即使你已忘記。祂在等你準備好接收那份完整的愛。'},
      {n:10,T:1,P:1,I:1,title:'聖靈的教學',       note:'聖靈是完美的老師：祂知道你現在的位置，也知道你需要到哪裡。本節提供聆聽引導的具體態度。'}
    ],
    6: [
      {n:1, T:1,P:0,I:1,title:'十字架的真實訊息', note:'十字架不是受苦的象徵，而是愛的極致示範——即使面對極端攻擊也不報復，只教人愛。'},
      {n:2, T:1,P:1,I:1,title:'攻擊的真正替代品', note:'攻擊的真正替代品不是被動，而是主動地選擇以愛回應。本節含具體的操練指示。'},
      {n:3, T:1,P:0,I:1,title:'轉另一面臉頰',     note:'「轉另一面臉頰」不是自我貶低，而是拒絕讓攻擊決定你的回應——你選擇留在愛中。'},
      {n:4, T:1,P:1,I:1,title:'只教人愛',         note:'課程的核心命令：只教人愛。你所教導的（透過你的反應）就是你相信的，也是你學習的。'},
      {n:5, T:1,P:0,I:1,title:'小我對愛的詮釋',   note:'小我的「愛」建立在特殊性和條件上。認識小我的愛的真面目，是轉向真正的愛的前提。'},
      {n:6, T:1,P:0,I:1,title:'分裂的訊息',       note:'每個選擇分裂而非聯合的念頭，都在傳達「分裂是真實的」這個訊息——並因此強化它。'},
      {n:7, T:1,P:0,I:1,title:'對療癒的設障',     note:'你對療癒設置的唯一障礙，是相信某些人或情況不值得被愛——而那種信念來自小我。'},
      {n:8, T:1,P:1,I:1,title:'上主的愛的課題',   note:'本章結語：上主的愛不需要任何條件。本節以最清晰的方式總結愛的課題，含實踐指引。'}
    ],
    7: [
      {n:1, T:1,P:0,I:1,title:'天國的律',         note:'天國的律是延伸（extension）：你給予的，你就擁有更多。這與世界的「奪取」律完全相反。',newTopic:'延伸（extension）'},
      {n:2, T:1,P:0,I:1,title:'才能的統一',       note:'你的所有才能（gifts）屬於整體。將才能用於分裂是浪費；用於延伸是它們的真正目的。'},
      {n:3, T:1,P:0,I:1,title:'延伸VS投射',       note:'延伸（extension）創造真實；投射（projection）製造幻象。二者都來自思想，指向截然不同的結果。'},
      {n:4, T:1,P:1,I:1,title:'治療的意願',       note:'療癒需要意願（willingness）——不是能力，不是理解，只是願意讓聖靈透過你工作。含操練。'},
      {n:5, T:1,P:0,I:1,title:'整全性的禮物',     note:'你不能給予你所沒有的。但你擁有一切，因為你是上主的孩子。你的整全性是療癒的基礎。'},
      {n:6, T:1,P:0,I:1,title:'創造的完整性',     note:'上主的創造是完整的（complete）——你無法增加也無法減少它。但你可以認識或否認這個事實。'},
      {n:7, T:1,P:0,I:1,title:'療癒VS魔法',       note:'「魔法（magic）」是試圖用物質手段解決心靈問題。真正的療癒是心靈的改變，身體只是結果。'},
      {n:8, T:1,P:0,I:1,title:'永恆的完整',       note:'你在時間中體驗的任何破碎，都不影響你在永恆中的完整性。這個認識本身就是療癒。'},
      {n:9, T:1,P:1,I:1,title:'療癒的信任',       note:'療癒需要對聖靈的完全信任——不是對結果的控制，而是對過程的交託。本節含實踐指引。'},
      {n:10,T:1,P:0,I:1,title:'拯救的保證',       note:'本章結語：你的拯救是有保證的，不是因為你努力，而是因為上主的意志無法被否定。'}
    ],
    8: [
      {n:1, T:1,P:0,I:1,title:'身體的使用',       note:'身體是溝通的工具（tool for communication），不是存在的目的。它的使用取決於你選擇哪個老師。'},
      {n:2, T:1,P:0,I:1,title:'誰來教你？',       note:'你在每一刻都在被教導——要麼被小我，要麼被聖靈。「誰是你的老師」決定了你的體驗。'},
      {n:3, T:1,P:1,I:1,title:'療癒的意志',       note:'全然指向療癒的意志意味著你不希望保留任何疾病——身體的、心靈的或關係的。含操練。',newTopic:'療癒意志（主要闡述）'},
      {n:4, T:1,P:0,I:1,title:'身體的非真實性',   note:'身體不是你——它是你選擇用來溝通的媒介。認識這一點解除了你對身體的認同與恐懼。'},
      {n:5, T:1,P:0,I:1,title:'身體作為溝通工具', note:'當身體被聖靈使用時，它成為給予（giving）的工具；當被小我使用時，成為攻擊的工具。'},
      {n:6, T:1,P:0,I:1,title:'聖靈的計畫',       note:'聖靈有一個具體的計畫，為每個願意的人量身設計，以最有效的方式帶領你走向療癒。'},
      {n:7, T:1,P:0,I:1,title:'否定療癒的障礙',   note:'唯一能阻止你被療癒的，是你不願意放棄的某個信念——通常是「我不配」或「這太難了」。'},
      {n:8, T:1,P:0,I:1,title:'心靈與身體',       note:'心靈控制身體，不是反過來。身體出現的症狀是心靈信念的語言——改變信念，症狀失去目的。'},
      {n:9, T:1,P:1,I:1,title:'選擇你的老師',     note:'本章結語：每一天的起點都是一個選擇——你今天要讓誰來教你？本節含具體的清晨操練指示。'}
    ],
    9: [
      {n:1, T:1,P:0,I:1,title:'上主的拯救計畫',   note:'上主的計畫使用時間來超越時間。它在當下具體展開，不在未來或過去。',newTopic:'寬恕計畫'},
      {n:2, T:1,P:0,I:1,title:'小我的方案',       note:'小我的「計畫」是讓你一直感到不足——永遠在尋找，永遠沒有到達。認識這個陷阱是第一步。'},
      {n:3, T:1,P:0,I:1,title:'寬恕與特殊性',     note:'寬恕（forgiveness）不針對特殊的人或事，而是一種對所有知見的根本態度：這不是真的。'},
      {n:4, T:1,P:1,I:1,title:'寬恕的真義',       note:'真正的寬恕不是「原諒某人做了某件壞事」，而是認識到根本沒有壞事真實地發生過。含操練。'},
      {n:5, T:1,P:0,I:1,title:'療癒作為新知見',   note:'療癒是知見的改變——從看見罪疚到看見無罪。療癒者（healer）提供一個無罪的視角。'},
      {n:6, T:1,P:1,I:1,title:'慷慨地接受',       note:'你接受治癒的能力，就是你給予治癒的能力。接受與給予是同一個動作。本節含實踐指引。'},
      {n:7, T:1,P:0,I:1,title:'夢與現實',         note:'這個世界是一場夢——不是在說它「不重要」，而是說它的根源在心靈，而非物質。'},
      {n:8, T:1,P:1,I:1,title:'療癒的慷慨',       note:'本章結語：如果你把所有的療癒都給予弟兄，你將保留一切。給予與擁有在靈性層面是同義詞。'}
    ],
    10: [
      {n:1, T:1,P:0,I:1,title:'小我的上帝',       note:'小我為自己創造了一個「上帝」，這個上帝跟小我一樣：善妒、愛批判、需要被安撫。',newTopic:'小我的宗教'},
      {n:2, T:1,P:0,I:1,title:'小我的神學',       note:'小我的神學基於恐懼：「上帝是危險的，你需要我來保護你。」認識這個謊言是解脫的開始。'},
      {n:3, T:1,P:0,I:1,title:'真理的替代品',     note:'小我提供「特殊的愛」「特殊的知識」「特殊的安全感」作為上主的替代品。全都是幻象。'},
      {n:4, T:1,P:0,I:1,title:'小我對上主的詮釋', note:'小我將上主詮釋為威脅，因為上主的存在意味著小我的消滅。這個恐懼使小我拼命維護分裂。'},
      {n:5, T:1,P:1,I:1,title:'真正的神學',       note:'本章結語：上主就是愛，別無其他。任何把恐懼歸因於上主的神學都是小我的謊言。含操練指引。'}
    ],
    11: [
      {n:1, T:1,P:0,I:1,title:'選擇你的老師',     note:'每一刻你都在選擇：上主的聲音或小我的聲音。這不是一個外部的選擇，而是內在的定向。'},
      {n:2, T:1,P:0,I:1,title:'兩種世界',         note:'你同時看到兩個世界：小我的恐懼世界和聖靈的愛的世界。你所看見的，取決於你選擇的老師。'},
      {n:3, T:1,P:0,I:1,title:'上主的真正替代品', note:'上主的真正替代品不是任何小我提供的東西，而是你本來就是的那個你——祂的孩子。'},
      {n:4, T:1,P:1,I:1,title:'把光帶入黑暗',     note:'你不需要戰勝黑暗——你只需要帶入光。光不攻擊黑暗；黑暗在光的臨在中自然消失。含操練。'},
      {n:5, T:1,P:0,I:1,title:'幻覺VS真理',       note:'幻覺看起來像真理，但它有一個特徵：它造成恐懼。真理只帶來平安。恐懼是幻覺的標誌。'},
      {n:6, T:1,P:0,I:1,title:'上主之路',         note:'上主之路不是艱苦的攀爬，而是放下（releasing）——放下你用來阻擋祂的所有防衛。'},
      {n:7, T:1,P:0,I:1,title:'小我與上主的張力', note:'小我相信它必須對抗上主。但上主不知道衝突——祂只是愛。這種「戰爭」只存在於小我的幻覺中。'},
      {n:8, T:1,P:0,I:1,title:'上主的傑作',       note:'你是上主的傑作（masterpiece）——不是你建造的，而是你接受的。接受你的本質是回家的道路。'},
      {n:9, T:1,P:1,I:1,title:'在上主裡找到家',   note:'本章結語：家不是地方，而是對上主同在的認識。本節含深刻的個人性呼召與實踐指引。'}
    ],
    12: [
      {n:1, T:1,P:0,I:1,title:'愛的邏輯',         note:'愛是完全合理的（rational）。它不盲目，不軟弱——它是唯一清醒的選擇，因為它對準現實。'},
      {n:2, T:1,P:0,I:1,title:'聖靈的理性',       note:'聖靈的「理性（reason）」不同於邏輯——它建立在你真正的本質上，而非小我的假設上。'},
      {n:3, T:1,P:0,I:1,title:'真實的判斷',       note:'真實的判斷（real judgment）只有一個：上主創造的一切都是好的。任何其他判斷都是幻覺。'},
      {n:4, T:1,P:1,I:1,title:'回應上主的呼喚',   note:'上主的呼喚不是要求，而是邀請。本節描述如何聆聽並回應這個邀請——含具體的操練指引。'},
      {n:5, T:1,P:0,I:1,title:'拯救的理由',       note:'你為什麼尋求拯救？你的理由決定了你的學習。如果出於恐懼，你仍在小我的課程裡；出於愛，才是真正的課程。'},
      {n:6, T:1,P:0,I:1,title:'愛的知識',         note:'愛帶來的知識不同於學習的知識。它是一種直接的認識（recognition），超越語言和概念。'},
      {n:7, T:1,P:0,I:1,title:'神聖拉力',         note:'上主的拉力（pull of God）一直存在——比小我的吸引力更強大、更深邃。你只需要讓它起作用。',newTopic:'神聖的拉力'},
      {n:8, T:1,P:1,I:1,title:'走向光',           note:'本章結語：轉向光不是困難的奮鬥，而是放下遮蔽光的種種防衛。含清晰的實踐邀請。'}
    ],
    13: [
      {n:1, T:1,P:0,I:1,title:'罪疚的根源',       note:'罪疚（guilt）的根源是對分裂的信念——相信你真的離開了上主，並且這是你的錯。',newTopic:'罪疚（主要闡述）'},
      {n:2, T:1,P:0,I:1,title:'時間的幻象',       note:'小我使用時間把過去的罪疚帶入現在，並將恐懼投射到未來。聖靈只在當下工作。',newTopic:'時間（主要闡述）'},
      {n:3, T:1,P:0,I:1,title:'罪疚的保護功能',   note:'罪疚「保護」了分裂——只要你相信自己有罪，你就不敢接近上主。小我利用罪疚維持距離。'},
      {n:4, T:1,P:1,I:1,title:'逃脫罪疚的方法',   note:'逃脫罪疚不是壓制它，而是認識它的虛假性。本節含具體的步驟：如何在當下放下罪疚。'},
      {n:5, T:1,P:0,I:1,title:'罪疚的殘害',       note:'罪疚不僅痛苦，還是主動的破壞力——它製造疾病、衝突、痛苦，用來「證明」懲罰是合理的。'},
      {n:6, T:1,P:0,I:1,title:'無罪的見證',       note:'你透過選擇看見弟兄的無罪來見證自己的無罪。你為弟兄所做的一切，你同時為自己做了。'},
      {n:7, T:1,P:1,I:1,title:'解除時間',         note:'解除時間意味著放棄「過去決定我」的信念。你在當下永遠有全新的選擇。含操練指引。'},
      {n:8, T:1,P:0,I:1,title:'過去在當下',       note:'你帶到每一刻的過去，只有你選擇帶的那些。過去沒有力量——除非你賦予它力量。'},
      {n:9, T:1,P:0,I:1,title:'小我的時間表',     note:'小我有它自己的時間表：拖延救贖，讓你「準備好了再說」。而準備好的時刻永遠在下一刻。'},
      {n:10,T:1,P:0,I:1,title:'真正的療癒',       note:'真正的療癒不是治療過去的傷，而是認識過去從未真正發生過——它只是一個夢。'},
      {n:11,T:1,P:1,I:1,title:'走向無罪',         note:'本章結語：無罪是你的本質，不是你奮力達到的成就。本節含深刻的個人性呼召與實踐指引。'}
    ],
    14: [
      {n:1, T:1,P:0,I:1,title:'黑暗的消解',       note:'你不需要與黑暗戰鬥——帶入光，黑暗自然消解。這是整個第14章的核心意象。'},
      {n:2, T:1,P:1,I:1,title:'讓光進入',         note:'讓光進入意味著讓聖靈看見你試圖隱藏的那些部分。不需要先修正；先帶光進去。含操練。'},
      {n:3, T:1,P:0,I:1,title:'幸福的教學',       note:'你透過展示幸福（happiness）來教導幸福。你的內在狀態是你傳遞給世界的課程。'},
      {n:4, T:1,P:0,I:1,title:'外在與內在',       note:'你看到的外在世界是你的內在狀態的鏡子。改變內在，外在的詮釋自然轉化。'},
      {n:5, T:1,P:0,I:1,title:'真理的特徵',       note:'真理有兩個特徵：它帶來平安（peace），它帶來確定性（certainty）。任何帶來恐懼的都不是真理。'},
      {n:6, T:1,P:1,I:1,title:'傳遞光',           note:'你傳遞光不是透過言語，而是透過你的選擇——選擇看見無罪，選擇給予平安。含實踐指引。'},
      {n:7, T:1,P:0,I:1,title:'信念體系',         note:'你的信念體系決定你的體驗。上主的信念體系是：愛是真實的，恐懼是虛幻的。',newTopic:'聖靈的課程（主要闡述）'},
      {n:8, T:1,P:0,I:1,title:'真正的知識',       note:'真正的知識不是關於這個世界的知識，而是對你自己本質（你是愛）的直接認識。'},
      {n:9, T:1,P:1,I:1,title:'聖靈的課程表',     note:'聖靈的課程表為你量身設計。你需要的每一堂課都已安排好，你只需要願意接受它。含操練。'},
      {n:10,T:1,P:0,I:1,title:'上主之子的本質',   note:'你是上主之子（Son of God）——不是隱喻，是你的真實本質。認識這一點是所有療癒的基礎。'},
      {n:11,T:1,P:0,I:1,title:'自我教學',         note:'你所教導的，你就學習了。教人無罪，你就學習無罪。教人攻擊，你就學習了恐懼。'},
      {n:12,T:1,P:1,I:1,title:'光的見證',         note:'本章結語：你是光的見證者，不是黑暗的見證者。你的角色是照耀，不是控訴。含操練指引。'}
    ],
    15: [
      {n:1, T:1,P:0,I:1,title:'時間的兩種用途',   note:'時間可以被用來強化過去，也可以被用來到達永恆。神聖一刻是第二種選擇的操練場。',newTopic:'神聖一刻'},
      {n:2, T:1,P:1,I:1,title:'神聖一刻與上主的律',note:'上主的律與小我的律完全相反。神聖一刻是體驗上主之律的時刻——捨棄，方得擁有。'},
      {n:3, T:1,P:0,I:1,title:'渺小與宏偉',       note:'小我選擇「渺小（littleness）」——縮小自己以保護自己。神聖一刻邀請你選擇上主之子的「宏偉（magnitude）」。'},
      {n:4, T:0,P:1,I:1,title:'操練神聖一刻',     note:'本節幾乎完全由操練指示構成，是〈正文〉中實踐層比重最高的節之一。每個步驟都是具體可操作的。'},
      {n:5, T:1,P:0,I:1,title:'神聖一刻與特殊關係',note:'特殊關係（special relationships）在此首次完整定義：一種以罪疚為基礎的愛，是神聖一刻的反面。',newTopic:'特殊關係'},
      {n:6, T:1,P:1,I:1,title:'課題的恆久性',     note:'你在神聖一刻中學到的不會失去。本節說明學習的累積性，以及如何鞏固每次的選擇。'},
      {n:7, T:1,P:0,I:1,title:'多餘的犧牲',       note:'揭示特殊關係最深的機制：犧牲→罪疚→憤怒→索取更多犧牲。這個循環因相信「愛=犧牲」而維持。'},
      {n:8, T:1,P:0,I:1,title:'神聖一刻與真正的關係',note:'神聖一刻不是逃離關係，而是在關係中找到上主。真正的關係不需要犧牲。'},
      {n:9, T:1,P:0,I:1,title:'神聖一刻與上主的吸引力',note:'上主的吸引力從未消失。學習本質上是放下阻礙的過程，而非艱苦的獲取。'},
      {n:10,T:1,P:1,I:1,title:'救贖作為共享課題', note:'你無法獨自得救。救贖必須是共享的。本節說明為何每一段關係都是你的救贖機會。'},
      {n:11,T:1,P:0,I:1,title:'聖誕節作為犧牲的終結',note:'以聖誕節（Christmas）作為神聖一刻概念的頂點：上主的誕生不需要任何代價或犧牲。'}
    ],
    16: [
      {n:1, T:1,P:1,I:1,title:'真正的寬恕',       note:'真正的寬恕認識到：根本沒有需要被寬恕的事，因為罪從未真實地發生。含操練指引。'},
      {n:2, T:1,P:0,I:1,title:'幻相的吸引力',     note:'特殊關係有它的吸引力，因為它給了小我它想要的：罪疚、特殊性、「愛的證明」。'},
      {n:3, T:1,P:0,I:1,title:'替代品',           note:'特殊關係是對真正聯合的替代品——它看起來像聯合，但建立在分裂（罪疚和特殊性）的基礎上。'},
      {n:4, T:1,P:0,I:1,title:'幻相的終結',       note:'所有幻相的終結不是透過對抗，而是透過認識它們的虛假性。光不攻擊黑暗，只是照亮它。'},
      {n:5, T:1,P:0,I:1,title:'真正另類的選擇',   note:'「真正的另類（true alternative）」是神聖一刻，它在每一個特殊關係的當下都可以選擇。'},
      {n:6, T:1,P:0,I:1,title:'結合的意義',       note:'真正的結合（joining）不是兩個分裂的個體合在一起，而是一起認識你們本來已是一體的。'},
      {n:7, T:1,P:1,I:1,title:'放棄審判',         note:'本章結語：放棄審判是你唯一需要做的事。當你停止審判，愛自然填滿那個空間。含操練。'}
    ],
    17: [
      {n:1, T:1,P:1,I:1,title:'修鍊的策略',       note:'如何在面對困難關係時保持中心？本節提供實際策略，強調「不試圖改變他人，只改變自己的詮釋」。'},
      {n:2, T:1,P:0,I:1,title:'原諒幻相',         note:'神聖關係（holy relationships）首次被完整定義：它從特殊關係中誕生，經由目標的改變而轉化。',newTopic:'神聖關係'},
      {n:3, T:1,P:0,I:1,title:'聖靈對特殊關係的使用',note:'聖靈不廢除特殊關係，而是重新使用它——將其轉化為神聖關係的工具。'},
      {n:4, T:1,P:0,I:1,title:'真正的信念',       note:'信念（faith）不是盲目，是選擇看見無罪。本節深化「相信你的弟兄無罪」的實踐意涵。'},
      {n:5, T:1,P:0,I:1,title:'神聖關係的療癒',   note:'神聖關係如何療癒兩個人——不是透過「修復」關係，而是透過共同看見上主。'},
      {n:6, T:1,P:0,I:1,title:'基督的凱旋之弓',   note:'以弓箭意象說明目標的設定：弓弦拉得越緊，箭飛得越遠。聖靈為你們的關係設定了最終目標。'},
      {n:7, T:1,P:0,I:1,title:'聖靈的夢',         note:'聖靈如何改寫夢的內容：同樣的關係，現在成為回家的橋梁，而不是流放的囚籠。'},
      {n:8, T:1,P:1,I:1,title:'真誠關係的條件',   note:'真誠關係的基礎是放棄特殊目標。本節提供具體的自我誠實功課：你在這段關係中真正想要什麼？'}
    ],
    18: [
      {n:1, T:1,P:1,I:1,title:'你自己的角色',     note:'在神聖關係的夢中，你的角色是什麼？本節說明：你的角色是放棄對夢的控制，讓聖靈改寫它。'},
      {n:2, T:1,P:0,I:1,title:'夢境的替換',       note:'聖靈不消滅你的夢，而是替換夢的目的——從恐懼的夢變成療癒的夢。'},
      {n:3, T:1,P:0,I:1,title:'夢中的光',         note:'神聖關係把光帶入夢中。有了光，夢的性質改變了——它開始指向醒來，而不是更深地入睡。'},
      {n:4, T:1,P:0,I:1,title:'轉化的禮物',       note:'當兩個人共同選擇神聖目標時，他們的關係成為整個世界療癒的管道。這是神聖關係的禮物。'},
      {n:5, T:1,P:0,I:1,title:'小我對關係的使用', note:'小我也「喜愛」關係——但它使用關係來強化分裂、罪疚和對上主的防衛。'},
      {n:6, T:1,P:1,I:1,title:'在你之內的光',     note:'光在你之內，不在外面。本節含實踐指引：如何轉向內在的光，不向外尋求你本已擁有的。'},
      {n:7, T:1,P:0,I:1,title:'小我從自身退縮',   note:'在神聖關係的光中，小我感到威脅而退縮。它表現為關係中突然的困難——但那是好的徵兆。'},
      {n:8, T:1,P:0,I:1,title:'一的意識',         note:'神聖關係的目的是讓兩個人共同認識「一（oneness）」——不是合併，而是認識你們本來就是一的。'},
      {n:9, T:1,P:0,I:1,title:'真實世界的基礎',   note:'本章結語：神聖關係是真實世界（real world）的基礎——一個被聖靈重新詮釋的、充滿恩典的世界。'}
    ],
    19: [
      {n:1, T:1,P:0,I:1,title:'罪的本質',         note:'罪（sin）的課程式完整定義：罪不是行為，是相信分裂是真實且不可逆的信念。它是小我的基石。',newTopic:'罪（sin）'},
      {n:2, T:1,P:0,I:1,title:'平和的四個障礙',   note:'通往平和的路上有四道障礙：① 上主的報復 ② 信念的吸引力 ③ 身體的吸引力 ④ 死亡的恐懼。',newTopic:'平和的四障礙'},
      {n:3, T:1,P:1,I:1,title:'超越身體',         note:'基督聖容（face of Christ）首次出現：你透過寬恕看見的，不是身體而是基督。本節含最高個人層強度。',newTopic:'基督聖容'},
      {n:4, T:1,P:0,I:1,title:'平和的幻景',       note:'小我的「平和」是麻木，不是真正的平和。真正的平和出現在你放棄審判的那一刻。'}
    ],
    20: [
      {n:1, T:1,P:0,I:1,title:'聖週（Holy Week）', note:'以復活節的意象為起點：「死亡」不是結局，復活（resurrection）是放棄恐懼後的自然狀態。'},
      {n:2, T:1,P:1,I:1,title:'選擇的禮物',       note:'視覺是選擇的功能。你選擇看見什麼，你就看見什麼。本節含具體的視覺轉化操練。'},
      {n:3, T:1,P:0,I:1,title:'願景的喜悅',       note:'基督的願景（vision of Christ）帶來喜悅，因為它看見了真相——無罪、愛與上主的同在。'},
      {n:4, T:1,P:0,I:1,title:'邪惡VS善意',       note:'你是否相信弟兄的「邪惡」？本節說明：弟兄的攻擊行為下面，永遠有一個求助的呼喚。'},
      {n:5, T:1,P:0,I:1,title:'無罪的見證',       note:'你透過選擇看見弟兄的無罪，同時給予他和你自己最大的禮物。見證無罪是療癒的核心機制。'},
      {n:6, T:1,P:0,I:1,title:'天使般的視野',     note:'以天使的視野看世界：不是透過身體的眼睛，而是透過寬恕的眼睛——在每個人身上看見基督。'},
      {n:7, T:1,P:1,I:1,title:'真正的願景',       note:'真正的願景不是神秘體驗，而是每天的選擇：以寬恕的眼睛看待你所遭遇的一切。含操練。'},
      {n:8, T:1,P:0,I:1,title:'聖靈的贈禮',       note:'聖靈給你的禮物是：用祂的眼睛取代你的眼睛——不是消滅你，而是讓你看見你從未看過的美。'},
      {n:9, T:1,P:0,I:1,title:'神聖的標記',       note:'本章結語：你到處看見的神聖標記，是你自己內在轉化的映射。世界的美源於你的寬恕。'}
    ],
    21: [
      {n:1, T:1,P:0,I:1,title:'心靈的責任',       note:'你為你所看見的一切負完全責任——不是你選擇了這些事件，而是你選擇了如何詮釋它們。',newTopic:'心靈的責任'},
      {n:2, T:1,P:1,I:1,title:'選擇快樂',         note:'快樂（happiness）是一個選擇，不是環境的結果。本節提供具體的步驟：如何在任何情況下選擇快樂。'},
      {n:3, T:1,P:0,I:1,title:'渴望無罪的世界',   note:'你有能力看見一個無罪的世界，因為無罪是真實的，罪只是一個知見的問題。'},
      {n:4, T:1,P:0,I:1,title:'快樂的理由',       note:'你有充分的理由快樂：你是上主之子，你不能被真正傷害，你的本質是愛。'},
      {n:5, T:1,P:0,I:1,title:'理性的功能',       note:'真正的理性（reason）看見：錯誤只是錯誤，不是罪。修正是可能的，懲罰是不必要的。'},
      {n:6, T:1,P:0,I:1,title:'超越理性',         note:'超越理性（beyond reason）的是恩典——一種不需要理由的接受，超越所有理解的平安。'},
      {n:7, T:1,P:0,I:1,title:'上主的理性',       note:'上主的理性最簡單：你是祂的孩子，你永遠受到祂的愛護。一切的複雜都是小我製造的。'},
      {n:8, T:1,P:1,I:1,title:'真正的看見',       note:'本章結語：你渴望一個無罪的世界——這個渴望本身就是療癒的開始。本節含具體實踐邀請。'}
    ],
    22: [
      {n:1, T:1,P:0,I:1,title:'神聖關係的目的',   note:'神聖關係的目的不是個人幸福，而是救贖：兩個人共同為世界帶來救贖的見證。'},
      {n:2, T:1,P:0,I:1,title:'分裂的終結',       note:'神聖關係是分裂終結的預演：當兩個人聯合，他們示範了分裂的虛假性。'},
      {n:3, T:1,P:1,I:1,title:'救贖的同盟',       note:'加入救贖的同盟（alliance for salvation）意味著選擇讓聖靈使用你的關係。含操練指引。'},
      {n:4, T:1,P:0,I:1,title:'療癒的奇蹟',       note:'真正的奇蹟透過神聖關係發生：一個人選擇看見弟兄的無罪，兩人都被療癒。'},
      {n:5, T:1,P:0,I:1,title:'一起旅行',         note:'在神聖關係中，你不是獨自旅行，而是與弟兄同行，與聖靈同行。'},
      {n:6, T:1,P:1,I:1,title:'找到家',           note:'本章結語：神聖關係讓你們一起找到家——不是某個地方，而是上主同在的認識。含操練指引。'}
    ],
    23: [
      {n:1, T:1,P:0,I:1,title:'矛盾的信仰',       note:'衝突的根源：相信兩件互斥的事都是真的。相信愛是真的，又相信攻擊是必要的。'},
      {n:2, T:1,P:0,I:1,title:'衝突的幻相',       note:'衝突只是一個幻相——但它的痛苦是真實的，因為你相信它。改變信念，衝突消解。',newTopic:'衝突幻相'},
      {n:3, T:1,P:1,I:1,title:'從攻擊中得救',     note:'你從攻擊中得救，不是透過反擊，而是透過認識攻擊不是真實的。本節含具體操練指引。'},
      {n:4, T:1,P:0,I:1,title:'超越衝突',         note:'本章結語：超越衝突意味著你不再需要「贏」，因為你認識到根本沒有敵人。只有等待被愛的弟兄。'}
    ],
    24: [
      {n:1, T:1,P:0,I:1,title:'特殊性的目的',     note:'特殊性（specialness）的目的是讓小我覺得自己比別人更好——而「更好」需要別人「更差」。',newTopic:'特殊性（主要闡述）'},
      {n:2, T:1,P:0,I:1,title:'特殊性的遺忘',     note:'在追求特殊性的過程中，你遺忘了自己真正的本質：不是特殊的，而是神聖的（holy）。'},
      {n:3, T:1,P:0,I:1,title:'特殊性的罪疚',     note:'特殊性和罪疚緊密相連：相信你比別人更好，同時帶著你不應該這樣想的罪疚感。'},
      {n:4, T:1,P:0,I:1,title:'真正的特殊性',     note:'真正的「特殊性」是你作為上主孩子的獨特性——不需要與他人比較，因為每個人都同樣神聖。'},
      {n:5, T:1,P:1,I:1,title:'尋找基督',         note:'在特殊性的夢中尋找基督——在每個人身上，包括你最難寬恕的那個人。本節含操練指引。'},
      {n:6, T:1,P:0,I:1,title:'偶像的意義',       note:'偶像（idols）是特殊性的具體形式：你把某人或某物放在上主的位置，相信它能給你上主給的。',newTopic:'偶像（初現）'},
      {n:7, T:1,P:0,I:1,title:'從特殊到神聖',     note:'本章結語：從特殊性轉向神聖性的道路是寬恕。當你放下特殊性，你看見了每個人的神聖。'}
    ],
    25: [
      {n:1, T:1,P:0,I:1,title:'正義的真義',       note:'真正的正義（justice）不是懲罰壞人，而是認識每個人的無罪——因此，正義就是寬恕。',newTopic:'公正（justice）'},
      {n:2, T:1,P:0,I:1,title:'平等的原則',       note:'在上主面前，每個人完全平等。正義的視野認識這個平等，而不製造等級和特殊性。'},
      {n:3, T:1,P:0,I:1,title:'特殊任務的意義',   note:'你的特殊任務（special function）是：寬恕那些你「應該」最難寬恕的人。這是你的修行道場。',newTopic:'特殊任務（special function）'},
      {n:4, T:1,P:1,I:1,title:'聖靈的選擇',       note:'聖靈為你選擇了你的特殊任務，基於你的學習需求。本節含實踐指引：如何辨識你的特殊任務。'},
      {n:5, T:1,P:0,I:1,title:'正義的見證',       note:'當你寬恕，你成為正義的見證者——不是控訴他人的見證者，而是無罪的見證者。'},
      {n:6, T:1,P:0,I:1,title:'真正的公正',       note:'真正的公正（true equity）是：每個人都得到他們需要的，因為每個人的需要最終都是相同的——愛。'},
      {n:7, T:1,P:0,I:1,title:'知覺的轉化',       note:'寬恕不是改變他人，而是轉化你自己的知見——從看見罪疚到看見基督聖容。'},
      {n:8, T:1,P:0,I:1,title:'恩典與正義',       note:'恩典（grace）超越正義：它給予你不配得的，不因為你值得，而因為你是上主的孩子。'},
      {n:9, T:1,P:1,I:1,title:'神聖的見證',       note:'本章結語：你透過你的特殊任務成為神聖的見證者——向世界展示，真正的正義就是寬恕。含操練。'}
    ],
    26: [
      {n:1, T:1,P:0,I:1,title:'寬恕的替代品',     note:'這個世界提供了許多「寬恕的替代品」——其中沒有一個真正帶來平安，因為它們都建立在評判上。'},
      {n:2, T:1,P:0,I:1,title:'兩個世界之間',     note:'你站在兩個世界之間：舊的恐懼世界和新的真實世界。寬恕是跨越這道橋梁的方法。'},
      {n:3, T:1,P:0,I:1,title:'恩典的轉移',       note:'恩典從你轉移到那些你寬恕的人——而寬恕使你明白自己也被寬恕了。'},
      {n:4, T:1,P:0,I:1,title:'過去的終結',       note:'寬恕讓過去結束——不是忘記，而是不再讓過去決定你的現在。'},
      {n:5, T:1,P:0,I:1,title:'中間之地',         note:'「中間之地（middle ground）」的幻象：以為自己可以同時持有恐懼和愛。真相是：你必須選擇一個。'},
      {n:6, T:1,P:0,I:1,title:'拱形橋梁',         note:'神聖關係是拱形橋梁（arch of safety），連接你現在所在之處和你本來應在之處。'},
      {n:7, T:1,P:1,I:1,title:'成為橋梁',         note:'你的功能是成為橋梁——在那些尚未選擇寬恕的人和那個選擇之間。含具體操練指引。'},
      {n:8, T:1,P:0,I:1,title:'認識上主',         note:'在寬恕中你認識上主——不是透過概念，而是透過實踐寬恕時的直接體驗。'},
      {n:9, T:1,P:0,I:1,title:'真實的世界',       note:'真實的世界（real world）不是你製造的，而是你在寬恕中看見的：這個世界，被愛重新詮釋。'},
      {n:10,T:1,P:0,I:1,title:'神聖的腳步',       note:'每一步寬恕的實踐都是神聖的腳步——不是朝向未來，而是深入當下的愛。'},
      {n:11,T:1,P:1,I:1,title:'回家之路',         note:'本章結語：回家之路已在你腳下——每一個寬恕的選擇，都讓你離家更近一步。含操練指引。',newTopic:'赦免的特殊功能'}
    ],
    27: [
      {n:1, T:1,P:0,I:1,title:'痊癒的圖像',       note:'痊癒（healing）不是讓身體看起來好，而是讓心靈認識它從未生病過。你是夢者，不是夢中的患者。',newTopic:'夢者與夢'},
      {n:2, T:1,P:1,I:1,title:'世界已被寬恕了',   note:'「世界已被寬恕了（The world is forgiven）」不是態度，而是一個認識。本節含實踐此認識的操練。'},
      {n:3, T:1,P:0,I:1,title:'夢者與夢',         note:'你是夢者（dreamer），不是夢中的人物（figure in the dream）。這個認識改變了一切——你有選擇權。'},
      {n:4, T:1,P:0,I:1,title:'夢境的分離',       note:'夢境中的「分離（separation）」感——覺得你被困在夢裡——也只是夢的一部分。你永遠可以選擇醒來。'},
      {n:5, T:1,P:0,I:1,title:'選擇夢境',         note:'既然你是夢者，你可以選擇不同的夢——不是讓夢境改變，而是讓聖靈來詮釋同一場夢。'},
      {n:6, T:1,P:0,I:1,title:'快樂之夢',         note:'快樂之夢（happy dream）不是逃避現實，而是讓聖靈改寫夢的目的：從恐懼到療癒。',newTopic:'快樂之夢'},
      {n:7, T:1,P:0,I:1,title:'夢中的英雄',       note:'小我讓你在夢中扮演英雄或受害者。認識這兩個角色都只是夢中的人物，你才能真正醒來。'},
      {n:8, T:1,P:1,I:1,title:'覺醒的準備',       note:'本章結語：快樂之夢是醒來前的最後一步。本節含實踐指引：如何選擇快樂之夢而非恐懼之夢。'}
    ],
    28: [
      {n:1, T:1,P:0,I:1,title:'小小間隙',         note:'小小間隙（little gap）是你相信自己與上主之間存在的距離——實際上，它根本不存在。',newTopic:'小小間隙'},
      {n:2, T:1,P:1,I:1,title:'寬恕讓我重見光明', note:'寬恕使我重新看見（regain my sight）——不是身體的視覺，而是對真相的認識。含具體操練指引。'},
      {n:3, T:1,P:0,I:1,title:'分裂的原因',       note:'分裂的「原因」在心靈，不在世界。改變心靈（原因），世界的體驗（結果）自然改變。'},
      {n:4, T:1,P:0,I:1,title:'夢的「現實」',     note:'夢在你做夢時感覺完全真實。但你一旦認識自己是夢者，夢的「現實性」就動搖了。'},
      {n:5, T:1,P:0,I:1,title:'唯一的結果',       note:'所有選擇最終只有一個結果：上主或小我。中間沒有路——但選擇的過程可以是漸進的。'},
      {n:6, T:1,P:0,I:1,title:'邁向光',           note:'你邁向光不是透過艱苦的修行，而是透過放下那些阻擋光的防衛，一個一個地。'},
      {n:7, T:1,P:1,I:1,title:'忘掉過去',         note:'忘掉過去（forget the past）不是忽視，而是不讓過去決定此刻。此刻永遠是新的。含操練。'},
      {n:8, T:1,P:0,I:1,title:'解除過去的束縛',   note:'本章結語：過去唯一的功能是讓你學習。學完了，就讓它離開。你現在是自由的。'}
    ],
    29: [
      {n:1, T:1,P:0,I:1,title:'偶像的特性',       note:'偶像（idols）的核心特性：它承諾給你上主給的，但它不能給——因為上主的位置只有上主能佔據。',newTopic:'偶像崇拜（主要闡述）'},
      {n:2, T:1,P:0,I:1,title:'替代品的崇拜',     note:'崇拜替代品（substitutes）是所有苦難的根源：你在追求一個永遠給不了你所需要的東西。'},
      {n:3, T:1,P:0,I:1,title:'偶像的毀滅',       note:'偶像注定會讓你失望——不是作為懲罰，而是因為它從來都不是你真正需要的。這種失望是禮物。'},
      {n:4, T:1,P:0,I:1,title:'對偶像的渴望',     note:'你渴望偶像，因為你相信真正的愛（上主）是危險的或不可及的。放棄這個信念，渴望消解。'},
      {n:5, T:1,P:0,I:1,title:'假冒的上帝',       note:'偶像是假冒的上帝（counterfeit God）——它模仿上主的功能，但帶來的是失望，不是平安。'},
      {n:6, T:1,P:0,I:1,title:'偶像的本質',       note:'偶像的本質是「以形式取代內容」——你把具體的形式（人、物、地位）放在愛的內容之上。'},
      {n:7, T:1,P:1,I:1,title:'尋找真相',         note:'放棄偶像後，你開始真正尋找真相。本節含操練指引：如何辨識生命中的偶像並放下它們。'},
      {n:8, T:1,P:0,I:1,title:'快樂之夢的開始',   note:'放棄偶像是快樂之夢的開始：不再追求替代品，而是允許真正的愛填滿那個空間。'},
      {n:9, T:1,P:0,I:1,title:'覺醒的步驟',       note:'本章結語：每一次放棄偶像，你就向醒來（awakening）更近了一步。醒來是漸進的，但確定的。'}
    ],
    30: [
      {n:1, T:0,P:1,I:1,title:'作決定的準則（Rules for Decision）',note:'唯二由耶穌本人命名的節。七條具體步驟：清晨設立意圖→遇困難的三步驟→全天的實踐鞏固。',newTopic:'作決定的準則'},
      {n:2, T:1,P:1,I:1,title:'犯錯的恐懼',       note:'恐懼犯錯本身就是一個錯誤。本節說明如何以「微笑面對錯誤（smile at errors）」代替罪疚自責。'},
      {n:3, T:1,P:0,I:1,title:'超越犯錯',         note:'錯誤被修正，不被懲罰。本節深化無罪（innocence）的觀念——錯誤不改變你的本質。'},
      {n:4, T:1,P:0,I:1,title:'幻相的消解',       note:'幻相如何被消解？不是透過對抗，而是透過帶光進入黑暗。光與黑暗不爭，只是照亮。'},
      {n:5, T:1,P:1,I:1,title:'見證奇蹟',         note:'你透過奇蹟見證自己的轉化，也見證弟兄的轉化。本節引導讀者主動尋找當天的奇蹟證據。'},
      {n:6, T:1,P:0,I:1,title:'只有上主的意志',   note:'上主的意志不是強加於你的，而是你真正自己的意志。小我的意志才是外來的強迫。'},
      {n:7, T:1,P:0,I:1,title:'真正的安慰',       note:'世界的安慰是暫時的，真正的安慰來自知道你與上主同在，一切的混亂只是暫時的幻象。'},
      {n:8, T:1,P:1,I:1,title:'選擇再次做決定',   note:'本章結語：「我可以選擇以不同的方式看待這件事。」這是每一刻都開放的自由。含操練。'}
    ],
    31: [
      {n:1, T:1,P:0,I:1,title:'變化的必要性',     note:'課程的最後章次開始於一個問題：你真的願意改變嗎？不是改變外在，而是改變你對自己的認識。'},
      {n:2, T:1,P:1,I:1,title:'選擇的最終課題',   note:'選擇（choice）是課程的核心。本節說明：你在任何時刻都可以選擇重新開始。含實踐指引。'},
      {n:3, T:1,P:0,I:1,title:'判斷與錯誤',       note:'你所有的痛苦都來自於判斷——判斷什麼是好的，什麼是壞的。放棄判斷，讓聖靈來評估。'},
      {n:4, T:1,P:0,I:1,title:'自我概念的轉化',   note:'你對自己的看法（self-concept）決定了你的體驗。課程的目的是用真理取代自我概念。',newTopic:'自我概念轉化'},
      {n:5, T:1,P:0,I:1,title:'終極的選擇',       note:'終極的選擇只有一個：上主或小我。一切其他的選擇都是這個選擇的不同形式。'},
      {n:6, T:1,P:0,I:1,title:'慧見的達到',       note:'慧見（vision）不是努力達到的，而是在放棄阻礙它的一切之後，自然顯現的。'},
      {n:7, T:1,P:0,I:1,title:'旅程的終點',       note:'旅程的終點是你的起點：回到上主那裡。你從未真正離開，但你需要記起這個真相。'},
      {n:8, T:1,P:1,I:1,title:'回到上主',         note:'本章結語，也是〈正文〉的結語：「我選擇了上主。」這個選擇，就是整個課程的精華。含最後的實踐邀請。'}
    ]
  };

  /* ── §4 CSS 注入（深色模式強制修正版）── */
  function injectCSS() {
    var s = document.createElement('style');
    s.id = 'arch-patch-styles';
    /* 深色模式根本原因：body.dark-mode div/span { background:var(--c-bg)!important }
       修正：用更高權重的 !important 規則，在我們的 <style> 被追加到 <head> 末尾後生效 */
    var phaseColors = {
      foundation:  '#C9A227',
      ego:         '#8B5BAE',
      healing:     '#3A7AC8',
      integration: '#2A8A6A',
      culmination: '#C85A30',
      completion:  '#7A3080'
    };
    var darkOverrides = Object.keys(phaseColors).map(function(ph){
      var c = phaseColors[ph];
      return [
        'body.dark-mode .ap-ch-block.ap-ph-'+ph+'{background-color:'+c+'!important;color:rgba(255,255,255,.95)!important;}',
        'body.dark-mode .ap-dot-'+ph+'{background-color:'+c+'!important;}'
      ].join('');
    }).join('');

    s.textContent = [
      /* 頁籤列 */
      '#arch-tab-bar{display:flex;gap:0;border-bottom:1px solid var(--c-border);flex-shrink:0;background:var(--c-sidebar);}',
      '#arch-tab-bar button{flex:1;padding:7px 2px;font-size:11px;border:none;background:transparent;cursor:pointer;',
        'color:var(--c-muted);border-bottom:2px solid transparent;transition:all .18s;font-family:inherit;letter-spacing:.01em;}',
      '#arch-tab-bar button.ap-active{color:var(--c-gold)!important;border-bottom-color:var(--c-gold)!important;font-weight:600;}',
      '#arch-tab-bar button:hover:not(.ap-active){color:var(--c-text)!important;}',
      /* 架構面板 */
      '#arch-view{display:none;overflow-y:auto;overflow-x:hidden;padding:8px 8px 40px;flex-direction:column;}',
      '#arch-view.ap-open{display:flex;}',
      /* 相位標頭 */
      '.ap-phase-header{font-size:10px;font-weight:600;letter-spacing:.05em;padding:8px 2px 3px;color:var(--c-muted);margin-top:2px;}',
      '.ap-phase-header:first-child{padding-top:2px;}',
      /* 章節色塊 — 顏色透過 class 設定，避免被 dark-mode div 規則覆蓋 */
      '.ap-ch-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:4px;margin-bottom:2px;}',
      '.ap-ch-block{border-radius:6px;padding:5px 2px 4px;text-align:center;cursor:pointer;',
        'transition:transform .12s,box-shadow .12s;border:2px solid transparent;opacity:.78;}',
      '.ap-ch-block:hover{transform:translateY(-2px);opacity:1!important;}',
      '.ap-ch-block:active{transform:scale(.95);}',
      /* 章節色塊 — 亮色模式顏色（深色模式透過 darkOverrides 覆蓋）*/
      '.ap-ph-foundation{background-color:#C9A227!important;}',
      '.ap-ph-ego{background-color:#8B5BAE!important;}',
      '.ap-ph-healing{background-color:#3A7AC8!important;}',
      '.ap-ph-integration{background-color:#2A8A6A!important;}',
      '.ap-ph-culmination{background-color:#C85A30!important;}',
      '.ap-ph-completion{background-color:#7A3080!important;}',
      '.ap-ch-n{font-size:13px;font-weight:700;color:rgba(255,255,255,.95)!important;display:block;line-height:1;}',
      '.ap-ch-s{font-size:9px;color:rgba(255,255,255,.72)!important;display:block;line-height:1;margin-top:2px;}',
      /* 相位圓點 — 顏色透過 ap-dot-X class 設定 */
      '.ap-phase-dot{width:7px;height:7px;border-radius:50%!important;display:inline-block;',
        'flex-shrink:0;margin-right:5px;vertical-align:middle;}',
      '.ap-dot-foundation{background-color:#C9A227!important;}',
      '.ap-dot-ego{background-color:#8B5BAE!important;}',
      '.ap-dot-healing{background-color:#3A7AC8!important;}',
      '.ap-dot-integration{background-color:#2A8A6A!important;}',
      '.ap-dot-culmination{background-color:#C85A30!important;}',
      '.ap-dot-completion{background-color:#7A3080!important;}',
      /* 深色模式強制覆蓋 */
      darkOverrides,
      /* 詳情卡 */
      '#arch-detail{border-radius:8px;padding:10px 11px;margin-top:8px;font-size:12px;line-height:1.65;',
        'border:1px solid var(--c-border);word-break:normal;overflow-wrap:break-word;}',
      '.ad-ch{font-size:10px;font-weight:600;letter-spacing:.04em;margin-bottom:4px;}',
      '.ad-title{font-size:13px;font-weight:600;margin-bottom:6px;}',
      '.ad-summary{font-size:12px;line-height:1.7;margin-bottom:6px;color:var(--c-muted);}',
      '.ad-topics{display:flex;flex-wrap:wrap;gap:3px;margin-bottom:8px;}',
      '.ad-tag{font-size:10px;padding:2px 6px;border-radius:10px;',
        'background:rgba(139,91,174,.15);color:#8B5BAE!important;font-weight:500;}',
      'body.dark-mode .ad-tag{background:rgba(201,162,39,.18)!important;color:var(--c-gold)!important;}',
      /* 節清單 */
      '.ap-sec-divider{font-size:10px;font-weight:600;color:var(--c-muted);',
        'margin:8px 0 4px;padding-top:8px;border-top:1px solid var(--c-border);letter-spacing:.04em;}',
      '.ap-sec-list{display:flex;flex-direction:column;gap:2px;margin-bottom:8px;}',
      '.ap-sec-item{display:grid;grid-template-columns:20px 1fr auto;align-items:start;gap:4px;',
        'padding:4px 5px;border-radius:5px;cursor:pointer;transition:background .12s;font-size:11.5px;}',
      '.ap-sec-item:hover{background:rgba(139,91,174,.08)!important;}',
      'body.dark-mode .ap-sec-item:hover{background:rgba(255,255,255,.05)!important;}',
      '.ap-sec-num{font-size:10px;color:var(--c-muted);font-weight:500;line-height:1.6;text-align:right;}',
      '.ap-sec-title{line-height:1.5;}',
      '.ap-sec-title small{display:block;font-size:10px;color:var(--c-muted);margin-top:1px;line-height:1.4;}',
      '.ap-tpi-wrap{display:flex;gap:2px;flex-shrink:0;padding-top:2px;}',
      '.ap-tpi{font-size:9px;font-weight:700;width:14px;height:14px;border-radius:3px;',
        'display:flex;align-items:center;justify-content:center;}',
      '.ap-tpi-T{background:rgba(58,122,200,.20)!important;color:#3A7AC8!important;}',
      '.ap-tpi-P{background:rgba(42,138,106,.20)!important;color:#2A8A6A!important;}',
      '.ap-tpi-I{background:rgba(201,162,39,.20)!important;color:#B8880A!important;}',
      'body.dark-mode .ap-tpi-I{color:#C9A227!important;}',
      '.ap-tpi-off{opacity:.2;}',
      '.ap-new-topic{font-size:9px;background:rgba(200,90,48,.15)!important;color:#C85A30!important;',
        'border-radius:3px;padding:0 3px;margin-left:3px;font-weight:500;display:inline-block;}',
      'body.dark-mode .ap-new-topic{background:rgba(200,90,48,.28)!important;color:#E8845A!important;}',
      /* 跳轉按鈕 */
      '.ad-nav-btn{display:block;width:100%;padding:7px 12px;font-size:12px;border-radius:6px;',
        'border:1px solid var(--c-border);background:transparent!important;cursor:pointer;',
        'text-align:center;transition:background .15s;box-sizing:border-box;font-family:inherit;}',
      '.ad-nav-btn:hover{background:rgba(139,91,174,.10)!important;border-color:#8B5BAE!important;}',
      /* 手風琴 */
      '.ap-accordion{border:1px solid var(--c-border);border-radius:7px;margin-top:8px;overflow:hidden;}',
      '.ap-accordion-hdr{display:flex;justify-content:space-between;align-items:center;',
        'padding:8px 11px;cursor:pointer;font-size:11.5px;font-weight:600;transition:background .12s;gap:6px;}',
      '.ap-accordion-hdr span:first-child{flex:1;}',
      '.ap-accordion-hdr .ap-arr{font-size:9px;color:var(--c-muted);transition:transform .2s;flex-shrink:0;}',
      '.ap-accordion-hdr.open .ap-arr{transform:rotate(180deg);}',
      '.ap-accordion-body{display:none;padding:10px 11px;font-size:12px;line-height:1.65;color:var(--c-muted);}',
      '.ap-accordion-body.open{display:block;}',
      '.ap-layer-row{display:grid;grid-template-columns:auto 1fr;gap:4px 8px;margin-bottom:6px;align-items:start;}',
      '.ap-layer-text{font-size:11.5px;color:var(--c-muted);line-height:1.55;}',
      '.ap-lc-row{display:flex;gap:6px;margin-bottom:7px;align-items:flex-start;}',
      '.ap-lc-num{width:18px;height:18px;border-radius:50%!important;display:flex;align-items:center;',
        'justify-content:center;font-size:10px;font-weight:700;color:#fff!important;flex-shrink:0;margin-top:1px;}',
      '.ap-lc-text strong{display:block;font-size:11px;font-weight:600;margin-bottom:2px;}',
      '.ap-lc-text span{font-size:11px;color:var(--c-muted);line-height:1.5;}',
      /* 圖例 */
      '#arch-legend{display:flex;flex-direction:column;gap:4px;margin-top:8px;padding-top:8px;border-top:1px solid var(--c-border);}',
      '.ap-legend-item{display:flex;align-items:center;gap:7px;font-size:10.5px;color:var(--c-muted);}',
      '.ap-legend-dot{width:8px;height:8px;border-radius:50%!important;flex-shrink:0;}',
      /* breadcrumb 節次徽章 */
      '#ap-sect-badge{font-size:10.5px;color:var(--c-muted)!important;flex-shrink:0;white-space:nowrap;',
        'padding:1px 6px;border-radius:10px;background:rgba(139,91,174,.12)!important;display:none;font-weight:500;}',
      'body.dark-mode #ap-sect-badge{background:rgba(201,162,39,.15)!important;color:var(--c-gold)!important;}',
      '#ap-sect-badge.ap-visible{display:inline-block!important;}'
    ].join('');
    document.head.appendChild(s);
  }

  /* ── §5 手風琴面板 ── */
  function toggleAccordion(hdr, body) {
    var open = body.classList.contains('open');
    body.classList.toggle('open', !open);
    hdr.classList.toggle('open', !open);
  }
  function mkBadge(cls, text) {
    return '<span class="ap-tpi '+cls+'" style="padding:3px 7px;font-size:11px;width:auto;height:auto;border-radius:4px">'+text+'</span>';
  }
  function buildThreeLayerAcc() {
    var acc = document.createElement('div'); acc.className = 'ap-accordion';
    var hdr = document.createElement('div'); hdr.className = 'ap-accordion-hdr';
    hdr.innerHTML = '<span>📐 節的三層解剖學</span><span class="ap-arr">▾</span>';
    var body = document.createElement('div'); body.className = 'ap-accordion-body';
    body.innerHTML = [
      '<p style="margin-bottom:8px;font-size:11px;line-height:1.6">每節同時在三個層面運作，三層俱全是節的<strong>完整性標誌</strong>。真正「完成」的閱讀應在三個層面都有收穫。</p>',
      '<div class="ap-layer-row">'+mkBadge('ap-tpi-T','T 理論')+'<div class="ap-layer-text"><strong style="font-size:11.5px">Theoretical（理論性）</strong><br>引入或深化一個概念，提供認知框架。通常在節的前半部出現。</div></div>',
      '<div class="ap-layer-row">'+mkBadge('ap-tpi-P','P 實踐')+'<div class="ap-layer-text"><strong style="font-size:11.5px">Practical（實踐性）</strong><br>含具體操練指示，如「重複這些話」「當你感到X時……」。T-15.IV、T-30.I 是強P節。</div></div>',
      '<div class="ap-layer-row">'+mkBadge('ap-tpi-I','I 個人')+'<div class="ap-layer-text"><strong style="font-size:11.5px">Personal（個人性）</strong><br>作者直接以「你（you）」說話，將觀念與讀者實際生命扣連。幾乎每節都有此層。</div></div>',
      '<div style="font-size:10.5px;color:var(--c-muted);margin-top:6px;padding-top:6px;border-top:1px solid var(--c-border)">💡 <strong>T-30.I《作決定的準則》</strong>是全書P值最高的節——七條具體操練步驟幾乎佔滿全節。</div>'
    ].join('');
    hdr.addEventListener('click', function(){ toggleAccordion(hdr, body); });
    acc.appendChild(hdr); acc.appendChild(body); return acc;
  }
  function buildLifecycleAcc() {
    var acc = document.createElement('div'); acc.className = 'ap-accordion';
    var hdr = document.createElement('div'); hdr.className = 'ap-accordion-hdr';
    hdr.innerHTML = '<span>🌱 主題三階段生命週期</span><span class="ap-arr">▾</span>';
    var body = document.createElement('div'); body.className = 'ap-accordion-body';
    var phases = [
      {c:'#3A7AC8',t:'引入期（Introduction）',d:'主題首次出現，用語尚未完全課程化，有時幾乎孤立地出現。',e:'例：「罪」在第19章前偶有出現，但語義尚未完全課程化。'},
      {c:'#C85A30',t:'主要闡述期（Major Presentation）',d:'主題成為一個或數個節的核心焦點，得到完整的課程式重新詮釋，建立讀者的認知基礎。',e:'例：第15章是「神聖一刻」與「特殊關係」的主要闡述章次。'},
      {c:'#8B5BAE',t:'融入整體期（Integration）',d:'主題退出焦點，成為思想體系的背景詞彙，被簡短引用，並與新引入的主題交織。',e:'例：「奇蹟」在第3章後成為背景詞彙，簡短引用遍佈全書。'}
    ];
    var html = '<p style="font-size:11px;line-height:1.6;margin-bottom:8px">每個核心主題都經歷可辨識的三個階段，類比於大學課程：教授詳細介紹後，便假設學生已掌握，之後只需簡短提及。</p>';
    phases.forEach(function(p,i){
      html += '<div class="ap-lc-row"><div class="ap-lc-num" style="background:'+p.c+'">'+(i+1)+'</div>'+
              '<div class="ap-lc-text"><strong>'+p.t+'</strong><span>'+p.d+'</span>'+
              '<span style="display:block;margin-top:2px;font-size:10.5px;opacity:.8">'+p.e+'</span></div></div>';
    });
    html += '<div style="font-size:10.5px;margin-top:6px;padding-top:6px;border-top:1px solid var(--c-border)">'+
            '🔗 <strong>交織密度</strong>：即使只有六七段的短節，系統追蹤被引用超過一次的術語，通常找到 <span style="color:#C85A30;font-weight:600">~50個</span>活躍主題。'+
            '這是為何「跳讀」造成理解斷裂的根本原因——跳讀者缺乏這50個術語的「已建立定義」，被迫投射式閱讀。</div>';
    body.innerHTML = html;
    hdr.addEventListener('click', function(){ toggleAccordion(hdr, body); });
    acc.appendChild(hdr); acc.appendChild(body); return acc;
  }

  /* ── §6 渲染節清單 ── */
  function renderSecList(ch, container) {
    var secs = SD[ch.n];
    var divider = document.createElement('div');
    divider.className = 'ap-sec-divider';
    divider.textContent = '本章各節（共 ' + ch.secs + ' 節）';
    container.appendChild(divider);
    var list = document.createElement('div');
    list.className = 'ap-sec-list';
    var total = secs ? secs.length : ch.secs;
    for (var i = 0; i < total; i++) {
      var sec = secs ? secs[i] : {n:i+1,T:1,P:(i%3===2?1:0),I:1,title:'第'+(i+1)+'節',note:'',newTopic:null};
      var newHtml = sec.newTopic ? '<span class="ap-new-topic">✦ '+sec.newTopic+'</span>' : '';
      var noteHtml = sec.note ? '<small>'+sec.note+'</small>' : '';
      var item = document.createElement('div');
      item.className = 'ap-sec-item';
      item.innerHTML =
        '<span class="ap-sec-num">§'+sec.n+'</span>'+
        '<span class="ap-sec-title">'+sec.title+newHtml+noteHtml+'</span>'+
        '<span class="ap-tpi-wrap">'+
          '<span class="ap-tpi ap-tpi-T'+(sec.T?'':' ap-tpi-off')+'">T</span>'+
          '<span class="ap-tpi ap-tpi-P'+(sec.P?'':' ap-tpi-off')+'">P</span>'+
          '<span class="ap-tpi ap-tpi-I'+(sec.I?'':' ap-tpi-off')+'">I</span>'+
        '</span>';
      (function(sN,cN){ item.addEventListener('click', function(){ window.apNavToSection(cN,sN); }); })(sec.n, ch.n);
      list.appendChild(item);
    }
    container.appendChild(list);
  }

  /* ── §7 側邊欄注入 ── */
  function injectSidebarUI() {
    var tocWrapper = document.getElementById('toc-wrapper');
    var sidebar    = document.getElementById('sidebar-toc');
    if (!tocWrapper || !sidebar) return;

    var tabBar = document.createElement('div');
    tabBar.id = 'arch-tab-bar';
    tabBar.innerHTML =
      '<button class="ap-active" id="ap-btn-toc" onclick="apSwitchTab(\'toc\')">📖 目錄</button>'+
      '<button id="ap-btn-arch" onclick="apSwitchTab(\'arch\')">🗺 〈正文〉架構</button>';

    var archView = document.createElement('div');
    archView.id = 'arch-view';

    PHASE_ORDER.forEach(function(phase){
      var meta = PHASE_META[phase];
      var chs  = CHAPTERS.filter(function(c){ return c.phase === phase; });
      var hdr  = document.createElement('div');
      hdr.className = 'ap-phase-header';
      hdr.textContent = meta.label;
      hdr.style.color = meta.color;
      archView.appendChild(hdr);
      var grid = document.createElement('div'); grid.className = 'ap-ch-grid';
      chs.forEach(function(ch){
        var b = document.createElement('div');
        b.className = 'ap-ch-block ' + meta.cls;
        b.id = 'ap-ch-'+ch.n; b.dataset.ch = ch.n;
        b.title = '第'+ch.n+'章　'+ch.title+'（'+ch.secs+'節）';
        b.innerHTML = '<span class="ap-ch-n">'+ch.n+'</span><span class="ap-ch-s">'+ch.secs+'節</span>';
        b.addEventListener('click', function(){ apShowDetail(ch, b); });
        grid.appendChild(b);
      });
      archView.appendChild(grid);
    });

    var detail = document.createElement('div'); detail.id = 'arch-detail';
    detail.innerHTML = '<div style="color:var(--c-muted);font-size:12px">↑ 點擊任意章節色塊，查看章次解析與各節分布</div>';
    archView.appendChild(detail);
    archView.appendChild(buildThreeLayerAcc());
    archView.appendChild(buildLifecycleAcc());

    var legend = document.createElement('div'); legend.id = 'arch-legend';
    PHASE_ORDER.forEach(function(phase){
      var m = PHASE_META[phase];
      var item = document.createElement('div'); item.className = 'ap-legend-item';
      var dot = document.createElement('span');
      dot.className = 'ap-legend-dot ap-dot-'+phase;
      item.appendChild(dot);
      var txt = document.createElement('span'); txt.textContent = m.label;
      item.appendChild(txt);
      legend.appendChild(item);
    });
    archView.appendChild(legend);

    sidebar.insertBefore(tabBar, tocWrapper);
    tocWrapper.parentNode.insertBefore(archView, tocWrapper.nextSibling);
  }

  /* ── §8 章節詳情卡 ── */
  function apShowDetail(ch, blockEl) {
    document.querySelectorAll('.ap-ch-block').forEach(function(b){
      b.style.opacity = '0.78'; b.style.outline = 'none';
    });
    blockEl.style.opacity = '1';
    blockEl.style.outline = '2px solid rgba(255,255,255,.75)';

    var meta = PHASE_META[ch.phase];
    var detail = document.getElementById('arch-detail');
    if (!detail) return;
    var tagsHtml = ch.topics.map(function(t){
      return '<span class="ad-tag">✦ '+t+'</span>';
    }).join('');

    detail.innerHTML =
      '<div class="ad-ch" style="color:'+meta.color+'">第'+ch.n+'章 ／ '+meta.label+'</div>'+
      '<div class="ad-title">'+ch.title+'（共 '+ch.secs+' 節）</div>'+
      '<div class="ad-summary">'+ch.summary+'</div>'+
      '<div class="ad-topics">'+tagsHtml+'</div>';
    renderSecList(ch, detail);
    var btn = document.createElement('button');
    btn.className = 'ad-nav-btn'; btn.type = 'button';
    btn.textContent = '▶ 跳轉到第'+ch.n+'章';
    btn.onclick = function(){ window.apNavToChapter(ch.n); };
    detail.appendChild(btn);
    setTimeout(function(){ detail.scrollIntoView({behavior:'smooth',block:'nearest'}); }, 80);
  }

  /* ── §9 全局函式 ── */
  window.apSwitchTab = function(tab){
    var tw = document.getElementById('toc-wrapper');
    var av = document.getElementById('arch-view');
    var bt = document.getElementById('ap-btn-toc');
    var ba = document.getElementById('ap-btn-arch');
    if (!tw || !av) return;
    if (tab === 'toc') {
      tw.style.display = ''; av.classList.remove('ap-open');
      if (bt) bt.classList.add('ap-active'); if (ba) ba.classList.remove('ap-active');
    } else {
      tw.style.display = 'none'; av.classList.add('ap-open');
      if (ba) ba.classList.add('ap-active'); if (bt) bt.classList.remove('ap-active');
      apHighlightCurrentChapter();
    }
  };

  window.apNavToChapter = function(chNum){
    var target = CHAPTER_HEADINGS[chNum];
    if (!target) {
      var all = document.querySelectorAll('#content-area h1,#content-area h2');
      for (var i = 0; i < all.length; i++) {
        if (extractChNum(all[i].textContent) === chNum) { target = all[i]; break; }
      }
    }
    if (!target) return;
    window.apSwitchTab('toc');
    setTimeout(function(){
      var top = window.scrollY + target.getBoundingClientRect().top - 60;
      window.scrollTo({top: Math.max(0, top), behavior:'smooth'});
    }, 150);
  };

  window.apNavToSection = function(chNum, secNum){
    var allH = Array.from(document.querySelectorAll('#content-area h2,#content-area h3'));
    var inCh = false, count = 0, target = null;
    for (var i = 0; i < allH.length; i++) {
      var h = allH[i];
      if (h.tagName === 'H2') {
        if (extractChNum(h.textContent) === chNum) { inCh = true; continue; }
        if (inCh) break;
      }
      if (inCh && h.tagName === 'H3' && ++count === secNum) { target = h; break; }
    }
    if (!target) { window.apNavToChapter(chNum); return; }
    window.apSwitchTab('toc');
    setTimeout(function(){
      var top = window.scrollY + target.getBoundingClientRect().top - 60;
      window.scrollTo({top: Math.max(0, top), behavior:'smooth'});
    }, 150);
  };

  function apHighlightCurrentChapter(){
    var curN = null;
    document.querySelectorAll('#content-area h2').forEach(function(h){
      var n = extractChNum(h.textContent);
      if (n && h.getBoundingClientRect().top <= 80) curN = n;
    });
    document.querySelectorAll('.ap-ch-block').forEach(function(b){
      var n = parseInt(b.dataset.ch, 10);
      b.style.opacity = (n === curN) ? '1' : '0.78';
      b.style.outline = (n === curN) ? '2px solid rgba(255,255,255,.75)' : 'none';
    });
  }

  /* ── §10 TOC 增強 & IntersectionObserver ── */
  function addPhaseDots(){
    document.querySelectorAll('#toc-wrapper .toc-h2').forEach(function(a){
      if (a.querySelector('.ap-phase-dot')) return;
      var n = extractChNum(a.textContent); if (!n) return;
      var ch = CHAPTERS.find(function(c){ return c.n === n; }); if (!ch) return;
      var dot = document.createElement('span');
      dot.className = 'ap-phase-dot ap-dot-'+ch.phase;
      dot.title = PHASE_META[ch.phase].label + '：' + ch.title;
      a.insertBefore(dot, a.firstChild);
    });
  }
  function buildSectionIndex(){
    CHAPTER_HEADINGS = {}; SECTION_INDEX = {};
    var cnt = 0, inBook = false;
    document.querySelectorAll('#content-area h1,#content-area h2,#content-area h3').forEach(function(h){
      if (h.tagName === 'H1') { inBook = true; }
      if (h.tagName === 'H2' && inBook) {
        var n = extractChNum(h.textContent);
        if (n && n >= 1 && n <= 31) CHAPTER_HEADINGS[n] = h;
      }
      if (h.tagName === 'H3' && inBook && h.id) SECTION_INDEX[h.id] = ++cnt;
    });
  }
  function initSectionObserver(){
    if (!('IntersectionObserver' in window)) return;
    var badge = document.getElementById('ap-sect-badge'); if (!badge) return;
    var h3s = document.querySelectorAll('#content-area h3'); if (!h3s.length) return;
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if (!e.isIntersecting) return;
        var n = SECTION_INDEX[e.target.id]; if (!n) return;
        badge.textContent = '§ ' + n + ' / ' + TOTAL_SECTIONS;
        badge.classList.add('ap-visible');
      });
    }, {rootMargin:'-8% 0px -75% 0px', threshold:0});
    h3s.forEach(function(h){ io.observe(h); });
  }
  function onTOCBuilt(){ addPhaseDots(); buildSectionIndex(); initSectionObserver(); }
  function watchForTOC(){
    var wrapper = document.getElementById('toc-wrapper'); if (!wrapper) return;
    if (wrapper.children.length > 0) { setTimeout(onTOCBuilt, 80); return; }
    var mo = new MutationObserver(function(_, obs){
      if (wrapper.children.length > 0) { obs.disconnect(); setTimeout(onTOCBuilt, 80); }
    });
    mo.observe(wrapper, {childList:true});
  }
  function injectSectionBadge(){
    var ct = document.getElementById('crumb-text');
    if (!ct || document.getElementById('ap-sect-badge')) return;
    var badge = document.createElement('span');
    badge.id = 'ap-sect-badge'; badge.setAttribute('aria-label','目前節次');
    ct.parentNode.insertBefore(badge, ct.nextSibling);
  }

  /* ── §11 初始化 ── */
  function init(){ injectCSS(); injectSidebarUI(); injectSectionBadge(); watchForTOC(); }
  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', init); }
  else { init(); }

})();
