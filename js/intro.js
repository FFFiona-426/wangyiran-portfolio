/* ============================================================
   intro.js — walk with Yiran 开场覆盖层（嵌入 index.html 同页运行）

   与主页的关系：覆盖层盖在主页之上，加载序列结束后用户点击
   「点击进入下一界面」，覆盖层以点击点为圆心做 clip-path
   圆形收缩，揭开下方主页；不发生任何页面跳转。
   页脚「重看开场」调用 window.Intro.replay() 复位重播。

   入场序列（加载动画，用户明确要求）：
   ① 预加载底图 + 6 张边缘花 + i 点花（进度 0 → 25%）
   ② 字母逐个跳出（打字机效果， stagger 110ms，进度 25% → 93%）
   ③ i 点花最后跳出（Yiran 的 i 上方的花点）→ 进度 100%
   ④ 自动切换显示「点击进入下一界面」按钮

   交互原则（持续动效无自动播放）：
   - 鼠标移动 → 距标题字母越近，该字母单独倾斜/浮起（逐字母摇动）
   - 鼠标进入字母 → 该字母一次性抖动
   - 鼠标靠近左右边缘大花 → 花摇动 + 微提亮
   - 鼠标靠近 i 点花 → 花持续转动（视频中的效果）
   - 唯一无限循环动画：.enter 提示的呼吸效果
   ============================================================ */
(function () {
  'use strict';

  var layer = document.getElementById('introLayer');
  if (!layer) return;

  var BASE = 'assets/img/intro/base.jpg?v=3';
  var IDOT_SRC = 'assets/img/intro/flower-idot.png?v=3';

  /* x/y = 图片中心在视口中的百分比锚点；h = 高度（vh）；r = 基础旋转（deg） */
  /* ?v=3：第 10 轮修复——预览环境的浏览器按 URL 缓存了第 8 轮的旧 PNG
     （带白块残留的版本），必须换 URL 才能强制拉到当前抠干净的版本 */
  var FLOWERS = [
    { src: 'assets/img/intro/flower-big-daisy.png?v=3',    x: 3.5, y: 29, h: 54, r: -6 },
    { src: 'assets/img/intro/flower-big-yellow.png?v=3',   x: 8,  y: 74, h: 48, r: 5 },
    { src: 'assets/img/intro/flower-big-daisy2.png?v=3',   x: 2,  y: 95, h: 42, r: -4 },
    { src: 'assets/img/intro/flower-big-peony.png?v=3',    x: 94, y: 26, h: 52, r: 6 },
    { src: 'assets/img/intro/flower-big-larkspur.png?v=3', x: 92, y: 58, h: 58, r: -5 },
    { src: 'assets/img/intro/flower-big-peony2.png?v=3',   x: 96, y: 86, h: 48, r: 4 }
  ];

  var LETTER_R = 130;    // 字母响应半径（px）
  var STAGGER = 110;     // 字母逐个跳出的间隔（ms）
  var PRELOAD_MAX = 25;  // 预加载阶段进度上限（%）

  var flowersBox = document.getElementById('sceneFlowers');
  var titleEl = document.getElementById('introTitle');
  var loaderEl = document.getElementById('introLoader');
  var pctEl = document.getElementById('loaderPct');
  var fillEl = document.getElementById('loaderFill');
  var enterBtn = document.getElementById('enterBtn');
  var idotEl = document.getElementById('idotFlower');

  var flowers = [];   // { el, spec, cx, cy, swayR }
  var letters = [];   // { el, inEl, cx, cy }
  var idotLetter = null;
  var idotR = 40;
  var idotPopped = false;

  var transitioning = false;
  var loadedCount = 0;
  var seqStep = 0;
  var seqTimer = null;
  var px = -9999, py = -9999, hasPointer = false, rafPending = false;

  /* ---------- 构建 ---------- */
  function buildFlowers() {
    var frag = document.createDocumentFragment();
    FLOWERS.forEach(function (spec) {
      var wrap = document.createElement('div');
      wrap.className = 'edge-flower';
      wrap.style.left = spec.x + '%';
      wrap.style.top = spec.y + '%';
      wrap.style.setProperty('--h', spec.h + 'vh');
      wrap.style.setProperty('--r', spec.r + 'deg');
      var sway = document.createElement('div');
      sway.className = 'ef-sway';
      var img = document.createElement('img');
      img.src = spec.src;
      img.alt = '';
      img.draggable = false;
      sway.appendChild(img);
      wrap.appendChild(sway);
      frag.appendChild(wrap);
      flowers.push({ el: wrap, spec: spec, cx: 0, cy: 0, swayR: 0 });
    });
    flowersBox.appendChild(frag);
  }

  function buildTitle() {
    var lines = titleEl.querySelectorAll('.tline');
    lines.forEach(function (line, lineIdx) {
      var text = line.getAttribute('data-text') || '';
      var frag = document.createDocumentFragment();
      text.split('').forEach(function (ch, charIdx) {
        if (ch === ' ') {
          var sp = document.createElement('span');
          sp.className = 'sp';
          frag.appendChild(sp);
          return;
        }
        var ltr = document.createElement('span');
        ltr.className = 'ltr pending';
        var inner = document.createElement('span');
        inner.className = 'ltr-in';
        inner.textContent = ch;
        ltr.appendChild(inner);
        ltr.addEventListener('mouseenter', function () { jigOnce(ltr); });
        frag.appendChild(ltr);
        var entry = { el: ltr, inEl: inner, cx: 0, cy: 0 };
        letters.push(entry);
        // 「with Yiran」中 Yiran 的 i（第 7 个字符，索引 6）—— i 点花锚点
        if (lineIdx === 1 && charIdx === 6) idotLetter = entry;
      });
      line.textContent = '';
      line.appendChild(frag);
    });
  }

  function jigOnce(el) {
    if (el.classList.contains('jig')) return;
    el.classList.add('jig');
    setTimeout(function () { el.classList.remove('jig'); }, 620);
  }

  /* ---------- 测量（resize / 字体加载后重算） ---------- */
  function measure() {
    var vw = window.innerWidth, vh = window.innerHeight;
    flowers.forEach(function (f) {
      var hPx = Math.min(f.spec.h * vh / 100, 64 * vw / 100);
      f.cx = f.spec.x * vw / 100;
      f.cy = f.spec.y * vh / 100;
      f.swayR = hPx * 0.55;
    });
    letters.forEach(function (l) {
      var r = l.el.getBoundingClientRect();
      l.cx = r.left + r.width / 2;
      l.cy = r.top + r.height / 2;
    });
    measureIdot();
  }

  /* i 点花：定位到 Yiran 的 i 的原生点位置（花把这个点盖住，充当它）。
     点的垂直位置用实测校准比例（Caveat 下点中心 ≈ 字母盒高 28.5% 处）；
     花尺寸取 0.34em，确保完全盖住原生点（约 0.23em 高） */
  function measureIdot() {
    if (!idotLetter || !idotEl) return;
    var line = idotLetter.el.closest('.tline');
    var fs = parseFloat(getComputedStyle(line).fontSize) || 120;
    var r = idotLetter.el.getBoundingClientRect();

    var caveat = true;
    try { caveat = !!(document.fonts && document.fonts.check(fs + 'px Caveat')); } catch (e) {}
    var ratio = caveat ? 0.285 : 0.26; // 回退字体的近似比例

    var size = Math.max(34, Math.min(76, fs * 0.34));
    idotEl.style.width = size + 'px';
    idotEl.style.height = size + 'px';
    idotEl.style.marginLeft = (-size / 2) + 'px';
    idotEl.style.marginTop = (-size / 2) + 'px';
    idotEl.style.left = (r.left + r.width / 2) + 'px';
    idotEl.style.top = (r.top + r.height * ratio) + 'px';
    idotR = size * 0.9;
  }

  /* ---------- 指针驱动 ---------- */
  function onMove(e) {
    px = e.clientX; py = e.clientY; hasPointer = true;
    if (!rafPending) { rafPending = true; requestAnimationFrame(applyFrame); }
  }

  function applyFrame() {
    rafPending = false;
    if (!hasPointer) return;

    // 边缘大花：进入响应半径 → 摇动 + 提亮
    for (var i = 0; i < flowers.length; i++) {
      var f = flowers[i];
      var d = Math.hypot(px - f.cx, py - f.cy);
      var near = d < f.swayR;
      f.el.classList.toggle('near', near);
      f.el.classList.toggle('sway', near);
    }

    // i 点花：靠近 → 持续转动
    if (idotPopped && idotEl) {
      var r = idotEl.getBoundingClientRect();
      var dc = Math.hypot(px - (r.left + r.width / 2), py - (r.top + r.height / 2));
      var nearIdot = dc < idotR;
      idotEl.classList.toggle('near', nearIdot);
      idotEl.classList.toggle('spin', nearIdot);
    }

    // 标题字母：逐字母按距离形变（越近越夸张；未入场的不响应）
    for (var j = 0; j < letters.length; j++) {
      var l = letters[j];
      if (l.el.classList.contains('pending')) continue;
      var dx = px - l.cx, dy = py - l.cy;
      var ld = Math.hypot(dx, dy);
      if (ld < LETTER_R) {
        var k = 1 - ld / LETTER_R;
        var dir = dx >= 0 ? 1 : -1;
        l.el.style.transform =
          'translateY(' + (-k * 10).toFixed(1) + 'px) ' +
          'rotate(' + (k * 12 * dir).toFixed(2) + 'deg) ' +
          'scale(' + (1 + k * 0.05).toFixed(3) + ')';
      } else if (l.el.style.transform) {
        l.el.style.transform = '';
      }
    }
  }

  function onLeave() {
    hasPointer = false;
    flowers.forEach(function (f) { f.el.classList.remove('near', 'sway'); });
    if (idotEl) idotEl.classList.remove('near', 'spin');
    letters.forEach(function (l) { l.el.style.transform = ''; });
  }

  /* ---------- 加载 + 入场序列 ---------- */
  function setPct(p) {
    p = Math.max(0, Math.min(100, Math.round(p)));
    pctEl.textContent = p + '%';
    fillEl.style.width = p + '%';
  }

  function whenReady(cb) {
    var done = false;
    function fin() { if (!done) { done = true; cb(); } }
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fin);
    else fin();
    setTimeout(fin, 2000); // 字体请求挂起也不能卡住开场
  }

  function resetSequence() {
    clearTimeout(seqTimer);
    seqStep = 0;
    idotPopped = false;
    letters.forEach(function (l) {
      l.el.classList.add('pending');
      l.el.classList.remove('jig');
      l.el.style.transform = '';
      l.inEl.classList.remove('pop', 'done');
    });
    if (idotEl) idotEl.classList.remove('pop', 'done', 'near', 'spin');
    measureIdot();
  }

  function preload() {
    loadedCount = 0;
    setPct(0);
    loaderEl.classList.remove('is-hidden');
    enterBtn.classList.remove('show');
    resetSequence();
    var assets = [BASE, IDOT_SRC].concat(FLOWERS.map(function (f) { return f.src; }));
    assets.forEach(function (src) {
      var im = new Image();
      im.onload = im.onerror = tick;
      im.src = src;
    });
    function tick() {
      loadedCount++;
      setPct(loadedCount / assets.length * PRELOAD_MAX);
      if (loadedCount >= assets.length) {
        whenReady(startSequence);
      }
    }
  }

  /* ② 字母逐个跳出 */
  function startSequence() {
    seqStep = 0;
    popNext();
  }

  function popNext() {
    if (seqStep >= letters.length) { popIdot(); return; }
    var l = letters[seqStep];
    l.el.classList.remove('pending');
    l.inEl.classList.add('pop');
    setTimeout(function () {
      l.inEl.classList.remove('pop');
      l.inEl.classList.add('done');
    }, 620);
    seqStep++;
    // 进度：预加载段 25% + 序列段 75%（13 字母 + 1 花点 = 14 步）
    setPct(PRELOAD_MAX + (100 - PRELOAD_MAX) * seqStep / (letters.length + 1));
    seqTimer = setTimeout(popNext, STAGGER);
  }

  /* ③ i 点花最后跳出 → 100% → ④ 自动显示进入按钮 */
  function popIdot() {
    if (!idotEl) { finishIntro(); return; }
    measureIdot(); // 用当前真实字体位置定位
    idotPopped = true;
    idotEl.classList.add('pop');
    seqTimer = setTimeout(function () {
      idotEl.classList.remove('pop');
      idotEl.classList.add('done'); // 稳态：不依赖动画填充
      setPct(100);
      finishIntro();
    }, 850);
  }

  function finishIntro() {
    loaderEl.classList.add('is-hidden');
    enterBtn.classList.add('show');
  }

  /* ---------- 点击进入：圆形揭开主页（不跳转） ---------- */
  function enter(x, y) {
    if (transitioning) return;
    transitioning = true;
    var R = Math.hypot(window.innerWidth, window.innerHeight) * 1.08;
    layer.style.transition = 'none';
    layer.style.clipPath = 'circle(' + R + 'px at ' + x + 'px ' + y + 'px)';
    void layer.getBoundingClientRect(); // 强制回流，保证过渡生效
    layer.style.transition = 'clip-path 0.95s cubic-bezier(0.65, 0, 0.35, 1)';
    layer.style.clipPath = 'circle(0px at ' + x + 'px ' + y + 'px)';
    setTimeout(function () {
      layer.classList.add('is-done');
      document.body.classList.remove('intro-lock');
      transitioning = false;
    }, 1020);
  }

  function onEnterClick(e) {
    var x = e.clientX, y = e.clientY;
    if (!x && !y) { // 键盘触发：用按钮中心
      var r = enterBtn.getBoundingClientRect();
      x = r.left + r.width / 2;
      y = r.top + r.height / 2;
    }
    enter(x, y);
  }

  /* ---------- 重播（页脚入口） ---------- */
  function replay() {
    layer.classList.remove('is-done');
    layer.style.transition = 'none';
    layer.style.clipPath = 'none';
    transitioning = false;
    document.body.classList.add('intro-lock');
    flowers.forEach(function (f) { f.el.classList.remove('near', 'sway'); });
    letters.forEach(function (l) { l.el.style.transform = ''; });
    if (idotEl) idotEl.classList.remove('near', 'spin');
    hasPointer = false;
    measure();
    preload();
  }

  /* ---------- 初始化 ---------- */
  buildFlowers();
  buildTitle();
  measure();
  document.body.classList.add('intro-lock');

  layer.addEventListener('pointermove', onMove);
  layer.addEventListener('pointerleave', onLeave);
  enterBtn.addEventListener('click', onEnterClick);
  window.addEventListener('resize', function () { measure(); });

  // 字体加载完成后重新测量（i 点花位置依赖真实字形）
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { measure(); });
  }

  var replayLink = document.getElementById('replayIntro');
  if (replayLink) {
    replayLink.addEventListener('click', function (e) {
      e.preventDefault();
      replay();
    });
  }

  preload();

  window.Intro = { replay: replay };
})();
