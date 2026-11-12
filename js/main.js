/* =========================================================
   王依然 · 个人作品集 — 交互脚本
   3D 圆环轮播 / 滑动选中态 / 详情弹窗 / 鼠标视差 / 灯箱
   ========================================================= */
(function () {
  'use strict';

  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));
  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const TO_RAD = Math.PI / 180;

  /* ---------------------------------------------------------
     1. Hero 星星
  --------------------------------------------------------- */
  (function stars() {
    const box = $('#stars');
    if (!box) return;
    const chars = ['✦', '✧', '★', '·', '✧'];
    const frag = document.createDocumentFragment();
    for (let i = 0; i < 46; i++) {
      const s = document.createElement('span');
      s.className = 'star';
      s.textContent = chars[i % chars.length];
      s.style.left = Math.random() * 100 + '%';
      s.style.top = Math.random() * 100 + '%';
      s.style.fontSize = (7 + Math.random() * 14).toFixed(1) + 'px';
      s.style.animationDelay = (Math.random() * 2.6).toFixed(2) + 's';
      s.style.animationDuration = (2 + Math.random() * 2.4).toFixed(2) + 's';
      frag.appendChild(s);
    }
    box.appendChild(frag);
  })();

  /* ---------------------------------------------------------
     2. 打字机
  --------------------------------------------------------- */
  (function typewriter() {
    const el = $('#typewriter');
    if (!el) return;
    const lines = [
      '用数据与影像，讲好有温度的故事',
      '在数据里找事实，在影像里找温度',
      '数据新闻 × 影像创作 × AIGC 探索者'
    ];
    let li = 0, ci = 0, deleting = false;
    function tick() {
      const line = lines[li];
      if (!deleting) {
        el.textContent = line.slice(0, ++ci);
        if (ci === line.length) {
          deleting = true;
          return setTimeout(tick, 2400);
        }
        return setTimeout(tick, 110);
      }
      el.textContent = line.slice(0, --ci);
      if (ci === 0) {
        deleting = false;
        li = (li + 1) % lines.length;
        return setTimeout(tick, 500);
      }
      setTimeout(tick, 45);
    }
    tick();
  })();

  /* ---------------------------------------------------------
     3. 导航：滚动态 / 进度条 / Scrollspy
  --------------------------------------------------------- */
  (function nav() {
    const nav = $('#nav');
    const bar = $('#progressBar');
    function onScroll() {
      const y = window.scrollY;
      nav.classList.toggle('scrolled', y > 30);
      const h = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    const links = $$('.nav-links a[data-spy]');
    const sections = links.map(a => document.getElementById(a.dataset.spy)).filter(Boolean);
    const spy = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          links.forEach(a => a.classList.toggle('active', a.dataset.spy === en.target.id));
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    sections.forEach(s => spy.observe(s));
  })();

  /* ---------------------------------------------------------
     4. 滚动显现
  --------------------------------------------------------- */
  (function reveal() {
    const io = new IntersectionObserver(entries => {
      entries.forEach((en, i) => {
        if (en.isIntersecting) {
          en.target.style.transitionDelay = (i % 6) * 70 + 'ms';
          en.target.classList.add('in');
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12 });
    $$('.reveal').forEach(el => io.observe(el));
  })();

  /* ---------------------------------------------------------
     5. 数字滚动
  --------------------------------------------------------- */
  (function countUp() {
    const box = $('.about-stats');
    if (!box) return;
    const io = new IntersectionObserver(entries => {
      if (!entries[0].isIntersecting) return;
      io.disconnect();
      $$('b[data-count]', box).forEach(el => {
        const target = parseInt(el.dataset.count, 10) || 0;
        const suffix = el.dataset.suffix || '';
        const t0 = performance.now(), dur = 1200;
        (function step(t) {
          const p = Math.min((t - t0) / dur, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(target * eased) + (p === 1 ? suffix : '');
          if (p < 1) requestAnimationFrame(step);
        })(t0);
      });
    }, { threshold: 0.4 });
    io.observe(box);
  })();

  /* ---------------------------------------------------------
     6. 作品数据
  --------------------------------------------------------- */
  /* ---------------------------------------------------------
     6. 作品数据（按文件夹分类：视频作品 / 项目经历 / 图文作品）
  --------------------------------------------------------- */

  /* 文档库：PDF 已全部渲染为图片，任何环境都能翻页查看 */
  /* ?v=3：第 10 轮起——强制预览环境浏览器重新拉取（旧缓存曾是 progressive JPEG，
     在部分预览代理里解码失败；同时避开任何按 URL 的陈旧缓存） */
  const docPages = (prefix, n) =>
    Array.from({ length: n }, (_, i) => 'assets/img/' + prefix + '-' + String(i + 1).padStart(2, '0') + '.jpg?v=3');

  const DOCS = {
    resume: {
      title: '个人简历 · Resume',
      /* 文件形式（第 10 轮诊断证实：预览沙箱中文件图片加载 100% 可靠；
         data URI 大图会静默失败且增大主 bundle，已移除内联兜底） */
      pages: ['assets/img/doc-resume.jpg?v=5'],
      pdf: 'assets/resume.pdf',
      pdfJs: 'js/pdf-resume.js?v=5'
    },
    portfolio: {
      title: '作品集 · Portfolio',
      pages: docPages('doc-portfolio', 22),
      pdf: 'assets/portfolio.pdf',
      pdfJs: 'js/pdf-portfolio.js'
    },
    shenshan: {
      title: '《十年·神山的变与不变》· 数据新闻',
      pages: docPages('doc-shenshan', 1),
      pdf: 'assets/docs/shenshan.pdf',
      pdfJs: 'js/pdf-shenshan.js'
    },
    hongse: {
      title: '《红色中华》漫画革命史料数据库',
      pages: docPages('doc-hongse', 4),
      pdf: 'assets/docs/hongse.pdf',
      pdfJs: 'js/pdf-hongse.js'
    },
    efuxingjiang: {
      title: '《e赋兴疆》创新大赛项目',
      pages: docPages('doc-efuxingjiang', 39)
    },
    tangniaobing: {
      title: '糖尿病健康科普图文',
      pages: docPages('page-tangniaobing', 3),
      pdf: 'assets/docs/tangniaobing.pdf',
      pdfJs: 'js/pdf-tangniaobing.js'
    }
  };

  const WORKS = [
    /* ---------- 视频作品 · 数字人/AI视频 ---------- */
    {
      cat: 'video', subCat: 'ai', catLabel: '数字人 · AI视频',
      title: '《千里泰和·万里绿境》', sub: 'AI 数字人中英双语宣传片',
      cover: 'assets/img/work-taihe.jpg',
      award: '🏆 新文科实践创新大赛省铜',
      desc: '以 AI 数字人为虚拟主持人，采用中英双语讲述泰和县生态资源与乡村振兴实践，立体呈现当地自然风貌、产业特色与人文底蕴。',
      role: ['脚本撰写', '数字人视频制作', '剪辑', '双语配音'],
      result: '大学生新文科实践创新大赛省级三等奖',
      tools: ['AI 数字人', '双语配音', '剪映'],
      links: [{ label: '▶ 播放视频', url: 'http://liuwamiaoji.com/r/2TdCsD' }]
    },
    {
      cat: 'video', subCat: 'ai', catLabel: '数字人 · AI视频',
      title: '《“赣”啥呢文物》系列', sub: '江西省博物馆文物轻科普账号',
      cover: 'assets/img/work-ganwenwu.jpg',
      desc: '聚焦江西省博物馆馆藏文物打造短视频账号，以「面向大众的江西文物轻量化科普」为账号定位，推出三期趣味科普短片。',
      role: ['账号运营', '选题策划', '拍摄', '脚本撰写', '剪辑制作'],
      result: '三期系列片 · 账号持续运营',
      tools: ['拍摄', '剪映', '账号运营'],
      links: [{ label: '▶ 播放视频', url: 'http://liuwamiaoji.com/r/b8LLS' }]
    },
    {
      cat: 'video', subCat: 'ai', catLabel: '数字人 · AI视频',
      title: '《此生有味·苏东坡美食地图》', sub: 'AI 创意短视频',
      cover: 'assets/img/work-sudongpo.jpg',
      desc: 'AI 短视频创作：走进「东坡饭馆直播间」，以轻松语态复现苏东坡笔下的宋代美食风雅。',
      role: ['脚本策划', 'AI 视频制作'],
      result: 'AIGC 内容创作实践',
      tools: ['AI 视频生成', '剪映'],
      links: [{ label: '▶ 播放视频', url: 'http://liuwamiaoji.com/r/3p2f0c' }]
    },
    {
      cat: 'video', subCat: 'ai', catLabel: '数字人 · AI视频',
      title: '《“癌中之王”的临终忠告》', sub: '胰腺癌科普宣传片',
      cover: 'assets/img/work-aizhongwang.jpg',
      desc: '采用拟人化叙事手法，围绕胰腺癌「早筛早防」的核心议题，以第一人称视角结合生活化场景进行医学科普，消解传统医学科普枯燥沉闷的观感。',
      role: ['动画制作', '剪辑'],
      result: '早筛早防 · 健康传播',
      tools: ['动画', '剪映'],
      links: [{ label: '▶ 播放视频', url: 'http://liuwamiaoji.com/r/2FKwNh' }]
    },
    {
      cat: 'video', subCat: 'ai', catLabel: '数字人 · AI视频',
      title: '《春日赏花特别报道》', sub: 'AI 数字人新闻融媒体特别报道',
      cover: 'assets/img/work-chunri.jpg',
      desc: 'AI 主播 + 数字人记者 + 实景混剪的融媒体特别报道，聚焦南昌马兰花海公园郁金香热点，融合新闻报道、城市形象宣传与文明观花引导，发布于大江新闻 APP。',
      role: ['数字人视频制作', '实景混剪', '新闻包装'],
      result: '大江新闻 APP 发布 · 兼具服务性与传播力',
      tools: ['AI 数字人', '剪映', '实景拍摄'],
      links: [{ label: '▶ 播放视频', url: 'https://channels.weixin.qq.com/finder-preview/pages/sph?id=Am6EWtQra' }]
    },

    /* ---------- 视频作品 · 宣传片 ---------- */
    {
      cat: 'video', subCat: 'promo', catLabel: '宣传片',
      title: '《情归于农》', sub: '乡村振兴双语宣传片',
      cover: 'assets/img/work-qingguiyu.jpg',
      desc: '2025 年暑期赴江西泰和县调研一周，拍摄上千张照片、百余条视频，走访二十余位村干部与新农人，记录乡村风貌、挖掘返乡新农人的真实故事；产出中、英双语版本，适配多元受众。',
      role: ['现场拍摄', '素材整理', '后期剪辑'],
      result: '中英双语双版本 · 乡村纪实影像',
      tools: ['拍摄', '剪映', '双语字幕'],
      links: [{ label: '▶ 播放视频', url: 'http://liuwamiaoji.com/r/rDKX4' }]
    },

    /* ---------- 视频作品 · 纪实影像 ---------- */
    {
      cat: 'video', subCat: 'doc', catLabel: '纪实影像作品',
      title: '《善岸者》', sub: '融媒体纪实视频系列',
      cover: 'assets/img/work-shananzhe.jpg',
      desc: '以当代青年内卷、迷茫、求职焦虑为现实切口，实地采访崛美公益五位青年的真实故事，传达「心有归处，行有担当，便是上岸」的主旨；同步产出公众号推文与「青年观潮」栏目 logo。',
      role: ['采访提纲撰写', '实地采访', '后期素材剪辑', '推文制作'],
      result: '视频号播放 2700+ · 系列短视频累计 4000+',
      tools: ['拍摄', '剪映', '公众号排版'],
      links: [{ label: '▶ 播放视频', url: 'https://dqr.cn/oC06cS/qlP3zEj' }]
    },
    {
      cat: 'video', subCat: 'doc', catLabel: '纪实影像作品',
      title: '《创青春》', sub: '青年创业纪录短片',
      cover: 'assets/img/work-chuangqingchun.jpg',
      desc: '以「青春无定式，选择即答案」为内核，记录念青书店主理人、homebar 合伙人、湖陂村豆豆窑烤面包创始人三位青年的创业故事，采用「逃离、框定、遇见、托举」四章节结构，展现当代青年打破职业边界的精神面貌。',
      role: ['选题构思', '现场拍摄', '素材整理', '后期剪辑'],
      result: '四章节结构 · 人物纪录短片',
      tools: ['拍摄', '剪映'],
      links: [{ label: '▶ 播放视频', url: 'http://liuwamiaoji.com/r/39EfOy' }]
    },

    /* ---------- 视频作品 · 广告 ---------- */
    {
      cat: 'video', subCat: 'ad', catLabel: '广告',
      title: '《高能量人的一天》', sub: '银鹭创意影视广告',
      cover: 'assets/img/work-yinlu.jpg',
      award: '🏆 广告艺术节学院奖 · 短视频类优秀奖',
      desc: '以「模拟游戏 + 全场景适配」的创意形式，突出银鹭花生牛奶「全时段扛饿饱腹、补充能量」的核心卖点，传递年轻群体「活力满格、全天候在线」的生活态度。',
      role: ['选题策划', '角色出演', '后期剪辑'],
      result: '中国大学生广告艺术节学院奖短视频类优秀奖（国家级）',
      tools: ['剧情策划', '出演', '剪映'],
      links: [{ label: '▶ 播放视频', url: 'http://liuwamiaoji.com/r/3wFJ1W' }]
    },
    {
      cat: 'video', subCat: 'ad', catLabel: '广告',
      title: '《当 HPV 出现在校园剧》', sub: '校园医学科普广告',
      cover: 'assets/img/work-hpv.jpg',
      award: '🏆 学院奖 HPV 公益创意大赛入围奖',
      desc: '以「影视经典角色 + 生活化场景」为突破口，打破 HPV 传统科普的刻板印象，面向大学生群体传递 HPV 相关知识与可落地的防护手段，让青年群体意识到风险就在身边。',
      role: ['主创'],
      result: '创意星球学院奖全国大学生 HPV 公益创意大赛入围奖',
      tools: ['剧情策划', '剪映'],
      links: [{ label: '▶ 播放视频', url: 'http://liuwamiaoji.com/r/1WfzXe' }]
    },
    {
      cat: 'video', subCat: 'ad', catLabel: '广告',
      title: '《无惧汗渍·净护新生》', sub: '超能创意影视广告',
      cover: 'assets/img/work-chaoneng.jpg',
      desc: '采用三幕叙事串联运动与洗衣场景，突出超能洗衣液去渍留香的产品卖点；开放式叙事适配社交媒体传播，打造产品「运动伴侣」的品牌形象。',
      role: ['剧情策划', '角色出演', '后期剪辑'],
      result: '开放式叙事 · 社媒适配广告片',
      tools: ['剧情策划', '出演', '剪映'],
      links: [{ label: '▶ 播放视频', url: 'http://liuwamiaoji.com/r/2Kg1Ie' }]
    },
    {
      cat: 'video', subCat: 'ad', catLabel: '广告',
      title: '《因·果》', sub: '公共卫生倡导短片',
      cover: 'assets/img/work-yinguo.jpg',
      desc: '因果叙事：角色随手乱扔香蕉皮，最终引发自身滑倒——用直观的连锁后果展现不文明行为的代价，传递公共环境文明素养的倡导主题。',
      role: ['剧情策划', '后期剪辑'],
      result: '公共卫生文明倡导',
      tools: ['剧情策划', '剪映'],
      links: [{ label: '▶ 播放视频', url: 'http://liuwamiaoji.com/r/3w4B62' }]
    },

    /* ---------- 视频作品 · 剧情片 ---------- */
    {
      cat: 'video', subCat: 'drama', catLabel: '剧情片',
      title: '《二十二》', sub: '剧情短片',
      cover: 'assets/img/work-22.jpg',
      desc: '剧情短片创作，从剧本到成片的完整实践。',
      role: ['剧情策划', '角色出演', '后期剪辑'],
      result: '剧情片完整创作实践',
      tools: ['剧本', '拍摄', '剪映'],
      links: [{ label: '▶ 播放视频', url: 'http://liuwamiaoji.com/r/1d1xcL' }]
    },

    /* ---------- 项目经历 ---------- */
    {
      cat: 'project', catLabel: '项目经历 · 数据新闻',
      title: '《十年·神山的变与不变》', sub: '井冈山神山村十年民生变迁',
      cover: 'assets/img/work-shenshan.jpg',
      award: '🏆 数据新闻大赛省二 · 入围国赛',
      desc: '赴井冈山神山村深度走访，完成数据采集、清洗校验与结构化处理，用可视化图表呈现乡村十年民生变迁。作品刊登于《江西日报》2026 年 2 月 3 日第 5 版特别策划，被人民网、澎湃新闻等转载。',
      role: ['前期策划', '实地走访', '数据归集校验', '可视化图表设计', '主创'],
      result: '全网阅读 260w+ · 点赞互动 8.2w+ · 多家主流媒体转载',
      tools: ['Excel', 'Photoshop', '数据新闻采编流程'],
      pages: ['assets/img/doc-shenshan-01.jpg'],
      doc: { key: 'shenshan', page: 0 }
    },
    {
      cat: 'project', catLabel: '项目经历 · 史料数据库',
      title: '《红色中华》漫画革命史料数据库', sub: '数据库建设与可视化传播',
      cover: 'assets/img/work-hongse.jpg',
      award: '🏆 数据库建设及可视化设计大赛国二',
      desc: '参与项目选题研讨，逐期梳理《红色中华》报刊内容，完成漫画样本截取、信息登记、文献搜集与史料数据核对归类，并用 PS 制作可视化成品，让革命史料以可视方式走进当代传播。',
      role: ['样本截取', '文献搜集', '史料数据核对归类', 'PS 可视化成品'],
      result: '中国新闻传播学科数据库建设及可视化设计大赛国家级二等奖',
      tools: ['Photoshop', '史料数据库建设流程'],
      pages: ['assets/img/doc-hongse-01.jpg', 'assets/img/doc-hongse-02.jpg', 'assets/img/doc-hongse-03.jpg', 'assets/img/doc-hongse-04.jpg'],
      doc: { key: 'hongse', page: 0 }
    },
    {
      cat: 'project', catLabel: '项目经历 · 非遗整合营销',
      title: '《尚品承天工，铜心铸国魂》', sub: '国家级非遗品牌整合营销策划',
      cover: 'assets/img/work-feiyi.jpg',
      award: '🏆 品牌策划竞赛双赛道国二',
      desc: '以国家级非遗贵溪錾铜雕刻品牌「尚铜堂」为研究对象，针对大众认知不足、数字营销薄弱、产品脱离当代场景三大痛点，构建品牌数字化转型路径，提出「让非遗活在当下」的全链路营销策略。',
      role: ['品牌策划', '数字营销方案'],
      result: '全国高校商业精英挑战赛品牌策划竞赛 · 品牌策划 & 数字营销双赛道国家级二等奖',
      tools: ['品牌策划', '数字营销', 'PPT 提案'],
      pages: ['assets/img/page-feiyi.jpg'],
      doc: { key: 'portfolio', page: 19 },
      links: [{ label: '▶ 查看方案', url: 'http://liuwamiaoji.com/r/3F9or8' }]
    },
    {
      cat: 'project', catLabel: '项目经历 · 创新创业',
      title: '《e赋兴疆》', sub: '全疆首支乡村产业赋能志愿服务团',
      cover: 'assets/img/work-efuxingjiang.jpg',
      desc: '中国国际大学生创新大赛参赛项目：全疆首支乡村产业赋能志愿服务团，负责 PPT 制作与参赛报告撰写。',
      role: ['PPT 制作', '参赛报告撰写'],
      result: '校赛第三 · 现已入围省赛',
      tools: ['PPT 设计', '项目报告'],
      pages: ['assets/img/doc-efuxingjiang-01.jpg', 'assets/img/doc-efuxingjiang-02.jpg', 'assets/img/doc-efuxingjiang-03.jpg'],
      doc: { key: 'efuxingjiang', page: 0 }
    },
    {
      cat: 'project', catLabel: '项目经历 · 大创项目',
      title: '国家级大学生创新创业训练项目', sub: '调研 · 文创 · 宣传片',
      cover: 'assets/img/work-dachuang.jpg',
      award: '🏆 新文科实践创新大赛省三',
      desc: '负责设计文创、实地调研拍摄、撰写调研报告、制作宣传片，把论文写在乡村大地上。',
      role: ['文创设计', '实地调研拍摄', '调研报告', '宣传片制作'],
      result: '江西省大学生新文科实践创新大赛省级三等奖',
      tools: ['调研', '文创设计', '宣传片'],
      pages: [
        'assets/img/work-dachuang.jpg',
        'assets/img/work-dachuang-2.jpg',
        'assets/img/work-dachuang-3.jpg'
      ]
    },

    /* ---------- 图文作品 ---------- */
    {
      cat: 'print', catLabel: '图文作品 · 杂志设计',
      title: '《草木有信》', sub: '传统二十四节气杂志',
      cover: 'assets/img/work-caomuyouxin.jpg',
      desc: '以二十四节气之谷雨为主题的杂志创作，对比南北物候与文化，展现谷雨的自然风貌与农耕智慧，推动节气文化的当代传播。',
      role: ['选题构思', '素材搜集', '文稿创作', 'InDesign 多页版式编排与视觉设计（主创）'],
      result: '节气文化主题杂志 · 多页面视觉设计',
      tools: ['InDesign', 'Photoshop'],
      pages: ['assets/img/page-caomu.jpg'],
      doc: { key: 'portfolio', page: 6 }
    },
    {
      cat: 'print', catLabel: '图文作品 · 健康传播',
      title: '糖尿病健康科普图文', sub: '「认知 — 预防 — 管理」传播链条',
      cover: 'assets/img/work-tangniaobing.jpg',
      desc: '包含《关于糖尿病》《糖糖防控手册》《糖糖食养手册》三大板块，构建「认知 — 预防 — 管理」传播链条；内容以《成人糖尿病食养指南（2023 年版）》《健康中国行动（2019-2030 年）》等为依据，兼顾专业度与可读性。',
      role: ['内容策划', '图文版式设计'],
      result: '面向糖尿病患者及高危人群的系列科普图文',
      tools: ['信息图表', '版面设计'],
      pages: [
        'assets/img/page-tangniaobing-01.jpg',
        'assets/img/page-tangniaobing-02.jpg',
        'assets/img/page-tangniaobing-03.jpg'
      ],
      doc: { key: 'tangniaobing', page: 0 }
    },
    {
      cat: 'print', catLabel: '图文作品 · 非虚构',
      title: '非虚构写作系列', sub: '市井人物与民生探访',
      cover: 'assets/img/work-feixugou.jpg',
      desc: '《“微更新”里的“大民生”——南昌市小修小补政策落地实效探访》《困境中逆风而上，摸索中探求价值》等作品：走进经堂巷社区采访家电维修范师傅、对话宝钢教育奖获得者，记录市井生活里的真实故事。',
      role: ['采访', '撰稿'],
      result: '社区深度采访 · 非虚构特稿',
      tools: ['深度采访', '特稿写作'],
      pages: ['assets/img/page-feixugou.jpg'],
      doc: { key: 'portfolio', page: 8 }
    }
  ];

  const hasVideo = w => (w.links || []).some(l => /播放/.test(l.label));

  /* ---------------------------------------------------------
     7. 3D 圆环轮播（圆柱 preset，参考 React Bits CircularCarousel）
  --------------------------------------------------------- */
  const Carousel = (function () {
    const root = $('#worksCC');
    const viewport = $('#ccViewport');
    const stage = $('#ccStage');
    const ring = $('#ccRing');
    const capBox = $('#ccCaption');
    const capCat = $('#ccCapCat');
    const capTitle = $('#ccCapTitle');
    const capSub = $('#ccCapSub');
    const capCount = $('#ccCapCount');
    if (!root) return {};

    const DRIFT = REDUCED ? 0 : 8;      // 自转速度 deg/s
    const DEPTH_FADE = 0.62;            // 深度衰减
    const TILT = -4;                    // 相机俯仰

    let items = [];
    let cards = [];
    let n = 0, step = 0, R = 0, P = 0, cardW = 0, cardH = 0, gap = 0, fit = 1;
    let active = -1;

    const st = {
      angle: 0, velocity: 0, target: null,
      mode: 'drift',            // drift | drag | glide | snap | hold
      holdUntil: 0, hover: false, dragging: false,
      press: null
    };

    /* ---------- 构建卡片 ---------- */
    function build(list) {
      items = list;
      n = list.length;
      step = 360 / Math.max(n, 1);
      ring.innerHTML = '';
      const emptyBox = $('#ccEmpty');
      if (emptyBox) emptyBox.hidden = list.length > 0;
      cards = list.map((w, i) => {
        const card = document.createElement('div');
        card.className = 'cc-card enter';
        card.dataset.i = i;
        card.style.animationDelay = Math.min(i * 70, 700) + 'ms';
        card.innerHTML =
          '<div class="cc-face cc-front">' +
            '<img src="' + w.cover + '" alt="' + w.title + '" loading="lazy" draggable="false">' +
            '<div class="cc-shade"></div>' +
            (w.award ? '<span class="cc-award">' + w.award + '</span>' : '') +
            (hasVideo(w) ? '<span class="cc-award cc-play">▶</span>' : '') +
            '<div class="cc-info">' +
              '<span class="cc-info-cat">' + w.catLabel + '</span>' +
              '<strong>' + w.title + '</strong>' +
              '<span class="cc-info-sub">' + w.sub + '</span>' +
            '</div>' +
          '</div>' +
          '<div class="cc-face cc-back"></div>';
        card.addEventListener('animationend', () => card.classList.remove('enter'), { once: true });
        ring.appendChild(card);
        return card;
      });
      st.angle = 0; st.velocity = 0; st.target = null; st.mode = 'drift';
      active = 0;
      measure();
      updateCaption(true);
      wake();
    }

    /* ---------- 测量：卡片尺寸 / 半径 / 透视 / 缩放适配 ---------- */
    function measure() {
      if (!n) return;
      const rect = viewport.getBoundingClientRect();
      const W = rect.width || 800;
      const H = rect.height || 440;
      cardW = Math.max(104, Math.min(186, W * 0.16));
      cardH = cardW / 0.8;
      gap = cardW * 0.15;
      const pitch = cardW + gap;
      // 少作品分类（1~2 件）时按单卡/双卡处理，避免除零与空 cube 感
      const chord = n >= 3 ? pitch / (2 * Math.sin(Math.PI / n)) : (n === 2 ? pitch * 1.2 : cardW * 2.2);
      R = Math.max(chord, cardW * 1.5);
      P = Math.max(1300, R * 2.3);

      // 投影所有卡角，求包围盒 → 缩放适配
      const corners = [
        [-cardW / 2, -cardH / 2], [cardW / 2, -cardH / 2],
        [-cardW / 2, cardH / 2], [cardW / 2, cardH / 2]
      ];
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      const tilt = TILT * TO_RAD;
      for (let a = -180; a <= 180; a += 9) {
        const rad = a * TO_RAD;
        const ca = Math.cos(rad), sa = Math.sin(rad);
        const ct = Math.cos(tilt), stn = Math.sin(tilt);
        for (let c = 0; c < 4; c++) {
          const cx = corners[c][0], cy = corners[c][1];
          const x1 = cx * ca + R * sa;
          const z1 = -cx * sa + R * ca;
          const y2 = cy * ct - z1 * stn;
          const z2 = cy * stn + z1 * ct;
          const zc = z2 - R;
          if (zc >= P * 0.95) continue;
          const k = P / (P - zc);
          const px = x1 * k, py = y2 * k;
          if (px < minX) minX = px;
          if (px > maxX) maxX = px;
          if (py < minY) minY = py;
          if (py > maxY) maxY = py;
        }
      }
      const spanX = Math.max(maxX - minX, 1);
      const spanY = Math.max(maxY - minY, 1);
      fit = Math.min(1, (W * 0.94) / spanX, (H * 0.9) / spanY);
      const shiftY = -((minY + maxY) / 2) * fit;
      stage.style.perspective = P + 'px';
      stage.style.transform = 'translateY(' + shiftY.toFixed(1) + 'px) scale(' + fit.toFixed(3) + ')';

      cards.forEach(card => {
        card.style.width = cardW + 'px';
        card.style.height = cardH + 'px';
        card.style.left = (-cardW / 2) + 'px';
        card.style.top = (-cardH / 2) + 'px';
      });
      render();
    }

    /* ---------- 渲染 ---------- */
    function render() {
      if (!n) return;
      ring.style.transform = 'rotateY(' + st.angle.toFixed(2) + 'deg)';
      for (let i = 0; i < n; i++) {
        const card = cards[i];
        if (!card) continue;
        const base = i * step;
        card.style.transform = 'rotateY(' + base.toFixed(2) + 'deg) translateZ(' + R.toFixed(1) + 'px)';
        let world = (base + st.angle) % 360;
        if (world > 180) world -= 360;
        if (world < -180) world += 360;
        const facing = Math.cos(world * TO_RAD);
        const fade = DEPTH_FADE * Math.pow((1 - facing) / 2, 1.25);
        card.style.setProperty('--depth', fade.toFixed(3));
        card.style.pointerEvents = Math.abs(world) < 72 ? 'auto' : 'none';
      }
      const idx = ((Math.round(-st.angle / step) % n) + n) % n;
      if (idx !== active) {
        active = idx;
        updateCaption();
      }
    }

    function updateCaption(instant) {
      const w = items[active] || items[0];
      if (!w) return;
      capCat.textContent = w.catLabel;
      capTitle.textContent = w.title;
      capSub.textContent = w.sub;
      capCount.textContent = String(active + 1).padStart(2, '0') + ' / ' + String(n).padStart(2, '0');
      if (!instant) {
        capBox.classList.remove('bump');
        void capBox.offsetWidth;
        capBox.classList.add('bump');
      }
    }

    /* ---------- 物理 ---------- */
    function nearest(a) { return Math.round(a / step) * step; }
    function focusIndex(i) {
      const target = -i * step + 360 * Math.round((st.angle - (-i * step)) / 360);
      st.target = target;
      st.mode = 'snap';
      st.holdUntil = 0;
      wake();
    }
    function shiftBy(delta) {
      const base = st.target !== null ? st.target : nearest(st.angle);
      st.target = base - delta * step;
      st.mode = 'snap';
      st.holdUntil = 0;
      wake();
    }

    let raf = 0, last = 0;
    function frame(t) {
      raf = 0;
      const dt = last ? Math.min((t - last) / 1000, 0.05) : 0.016;
      last = t;
      const now = t;

      if (st.mode === 'drag') {
        // 角度由指针事件直接设置
      } else if (st.mode === 'glide') {
        st.angle += st.velocity * dt;
        st.velocity *= Math.exp(-dt / 0.5);
        if (Math.abs(st.velocity) < 5) {
          st.target = nearest(st.angle);
          st.mode = 'snap';
        }
      } else if (st.mode === 'snap') {
        if (st.target === null) {
          st.mode = 'hold';
        } else {
          const d = st.target - st.angle;
          st.angle += d * Math.min(1, dt * 9);
          if (Math.abs(d) < 0.06) {
            st.angle = st.target;
            st.target = null;
            st.mode = 'hold';
            st.holdUntil = now + 2600;
          }
        }
      } else if (st.mode === 'hold') {
        if (now > st.holdUntil) st.mode = 'drift';
      } else if (st.mode === 'drift') {
        if (!st.hover && DRIFT > 0 && n >= 3) st.angle += DRIFT * dt;
      }

      render();
      const busy = !(st.mode === 'drift' && (st.hover || n < 3));
      if (busy) raf = requestAnimationFrame(frame);
      else last = 0;
    }
    function wake() {
      if (!raf) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    }

    /* ---------- 指针交互 ---------- */
    root.addEventListener('pointerdown', e => {
      if (e.target.closest && e.target.closest('.cc-arrow')) return; // 箭头按钮自行处理
      if (e.button !== 0 && e.pointerType === 'mouse') return;
      st.press = {
        id: e.pointerId, x: e.clientX, angle: st.angle,
        moved: false, t: performance.now(), samples: [{ t: performance.now(), a: st.angle }]
      };
      st.target = null;
      st.mode = 'drag';
      st.dragging = false;
      try { root.setPointerCapture(e.pointerId); } catch (err) { /* noop */ }
      wake();
    });

    root.addEventListener('pointermove', e => {
      const press = st.press;
      if (!press || press.id !== e.pointerId) return;
      const dx = e.clientX - press.x;
      if (!press.moved && Math.abs(dx) < 4) return;
      if (!press.moved) {
        press.moved = true;
        st.dragging = true;
        root.classList.add('dragging');
      }
      const perPixel = 180 / (Math.PI * R * fit);
      st.angle = press.angle + dx * perPixel;
      const now = performance.now();
      press.samples.push({ t: now, a: st.angle });
      while (press.samples.length > 2 && now - press.samples[0].t > 110) press.samples.shift();
      wake();
    });

    function release(e) {
      const press = st.press;
      if (!press || (e && e.pointerId !== press.id)) return;
      st.press = null;
      root.classList.remove('dragging');
      if (!press.moved) {
        // 视为点击：用元素命中查找卡片（指针捕获后 e.target 会是根节点）
        let card = null;
        if (e) {
          const hit = document.elementFromPoint(e.clientX, e.clientY);
          card = hit && hit.closest ? hit.closest('.cc-card') : null;
        }
        st.dragging = false;
        if (card) {
          const i = parseInt(card.dataset.i, 10);
          focusIndex(i);
          const w = items[i];
          if (w) window.__openWorkModal(items, i);
        } else {
          st.mode = 'drift';
        }
        return;
      }
      st.dragging = false;
      const first = press.samples[0];
      const lastS = press.samples[press.samples.length - 1];
      const span = (lastS.t - first.t) / 1000;
      st.velocity = span > 0.008 ? Math.max(-1600, Math.min(1600, (lastS.a - first.a) / span)) : 0;
      st.mode = 'glide';
      wake();
    }
    root.addEventListener('pointerup', release);
    root.addEventListener('pointercancel', release);

    root.addEventListener('pointerenter', e => {
      if (e.pointerType === 'mouse') { st.hover = true; wake(); }
    });
    root.addEventListener('pointerleave', e => {
      if (e.pointerType === 'mouse') { st.hover = false; wake(); }
    });

    // 横向滚轮 / 触控板
    let wheelTimer = 0;
    root.addEventListener('wheel', e => {
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : 0;
      if (!delta) return;
      e.preventDefault();
      st.angle += delta * 0.22;
      st.mode = 'glide';
      st.velocity = delta * 2.2;
      clearTimeout(wheelTimer);
      wheelTimer = setTimeout(() => {
        if (st.mode === 'glide') { st.target = nearest(st.angle); st.mode = 'snap'; }
      }, 150);
      wake();
    }, { passive: false });

    // 键盘（弹窗/灯箱打开时不响应，避免冲突）
    root.addEventListener('keydown', e => {
      if ($('#modal').classList.contains('open') || $('#lightbox').classList.contains('open')) return;
      if (e.key === 'ArrowLeft') { e.preventDefault(); shiftBy(1); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); shiftBy(-1); }
      else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const w = items[active];
        if (w) window.__openWorkModal(items, active);
      }
    });

    $('#ccPrev').addEventListener('click', () => shiftBy(1));
    $('#ccNext').addEventListener('click', () => shiftBy(-1));

    // 可见性 & 尺寸
    if ('ResizeObserver' in window) {
      let rt = 0;
      new ResizeObserver(() => {
        clearTimeout(rt);
        rt = setTimeout(measure, 120);
      }).observe(viewport);
    } else {
      window.addEventListener('resize', measure);
    }
    const io = new IntersectionObserver(([en]) => {
      if (en.isIntersecting) wake();
      else { cancelAnimationFrame(raf); raf = 0; last = 0; }
    }, { threshold: 0.05 });
    io.observe(root);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) { cancelAnimationFrame(raf); raf = 0; last = 0; }
      else wake();
    });

    return {
      build,
      refresh: measure
    };
  })();

  /* ---------------------------------------------------------
     8. 分类：两级胶囊滑动选中态 + 轮播切换
  --------------------------------------------------------- */
  (function filters() {
    const bar = $('#filterBar');
    const subBar = $('#subFilterBar');
    if (!bar) return;
    const indicator = $('#filterIndicator');
    const subIndicator = $('#subFilterIndicator');
    const btns = $$('.filter-btn', bar);
    const subBtns = $$('.sub-btn', subBar);

    let curCat = 'video';
    let curSub = 'all';

    function moveIndicator(ind, btn) {
      if (!ind || !btn) return;
      ind.style.width = btn.offsetWidth + 'px';
      ind.style.transform = 'translateX(' + btn.offsetLeft + 'px)';
    }

    function currentList() {
      let list = WORKS.filter(w => w.cat === curCat);
      if (curCat === 'video' && curSub !== 'all') list = list.filter(w => w.subCat === curSub);
      return list;
    }

    function refresh() {
      // 二级分类仅视频作品显示
      subBar.hidden = curCat !== 'video';
      moveIndicator(indicator, $('.filter-btn.active', bar));
      moveIndicator(subIndicator, $('.sub-btn.active', subBar));
      Carousel.build(currentList());
    }

    btns.forEach(btn => btn.addEventListener('click', () => {
      if (btn.classList.contains('active')) return;
      btns.forEach(b => {
        const on = b === btn;
        b.classList.toggle('active', on);
        b.setAttribute('aria-selected', on ? 'true' : 'false');
      });
      curCat = btn.dataset.cat;
      curSub = 'all';
      subBtns.forEach(b => {
        const on = b.dataset.sub === 'all';
        b.classList.toggle('active', on);
        b.setAttribute('aria-selected', on ? 'true' : 'false');
      });
      refresh();
    }));

    subBtns.forEach(btn => btn.addEventListener('click', () => {
      if (btn.classList.contains('active')) return;
      subBtns.forEach(b => {
        const on = b === btn;
        b.classList.toggle('active', on);
        b.setAttribute('aria-selected', on ? 'true' : 'false');
      });
      curSub = btn.dataset.sub;
      refresh();
    }));

    const first = $('.filter-btn.active', bar) || btns[0];
    requestAnimationFrame(() => {
      moveIndicator(indicator, first);
      moveIndicator(subIndicator, $('.sub-btn.active', subBar));
      Carousel.build(currentList());
    });
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        moveIndicator(indicator, $('.filter-btn.active', bar));
        moveIndicator(subIndicator, $('.sub-btn.active', subBar));
      });
    }
    window.addEventListener('resize', () => {
      moveIndicator(indicator, $('.filter-btn.active', bar));
      moveIndicator(subIndicator, $('.sub-btn.active', subBar));
    });
  })();

  /* ---------------------------------------------------------
     9. 作品详情弹窗
  --------------------------------------------------------- */
  let modalList = [];
  let modalIndex = 0;

  function modalOpen(index) {
    const modal = $('#modal');
    if (!modalList.length) return;
    const i = ((index % modalList.length) + modalList.length) % modalList.length;
    modalIndex = i;
    const w = modalList[i];

    $('#modalImg').src = w.cover;
    $('#modalImg').alt = w.title;

    // 播放按钮：仅视频作品显示
    const play = $('#modalPlay');
    const videoLink = (w.links || []).find(l => /播放/.test(l.label));
    if (videoLink) {
      play.hidden = false;
      play.href = videoLink.url;
    } else {
      play.hidden = true;
      play.removeAttribute('href');
    }

    $('#modalCat').textContent = w.catLabel;
    const award = $('#modalAward');
    if (w.award) { award.hidden = false; award.textContent = w.award; } else { award.hidden = true; }
    $('#modalTitle').textContent = w.title;
    $('#modalSub').textContent = w.sub || '';
    $('#modalDesc').textContent = w.desc || '';

    // 作品内页（点击图片可放大查看）
    const pagesBlock = $('#modalPagesBlock');
    const pagesBox = $('#modalPages');
    if (w.pages && w.pages.length) {
      pagesBlock.hidden = false;
      pagesBox.innerHTML = w.pages.map(p =>
        '<img src="' + p + '" alt="' + w.title + ' 内页" loading="lazy">'
      ).join('');
      $$('img', pagesBox).forEach((img, i) => {
        img.addEventListener('click', () => {
          window.__openLightbox(w.pages.map(p => ({ src: p, cap: w.title + ' · 内页 ' + (i + 1) })), i);
        });
      });
    } else {
      pagesBlock.hidden = true;
      pagesBox.innerHTML = '';
    }

    const roleBlock = $('#modalRoleBlock');
    if (w.role && w.role.length) {
      roleBlock.hidden = false;
      $('#modalRole').innerHTML = w.role.map(r => '<span>' + r + '</span>').join('');
    } else roleBlock.hidden = true;

    const resBlock = $('#modalResultBlock');
    if (w.result) { resBlock.hidden = false; $('#modalResult').textContent = w.result; } else resBlock.hidden = true;

    const toolBlock = $('#modalToolBlock');
    if (w.tools && w.tools.length) {
      toolBlock.hidden = false;
      $('#modalTools').innerHTML = w.tools.map(t => '<span>' + t + '</span>').join('');
    } else toolBlock.hidden = true;

    // 操作按钮：作品原档（文档翻阅器）/ 视频 / 其他链接
    const acts = [];
    if (w.doc && DOCS[w.doc.key]) {
      const d = DOCS[w.doc.key];
      acts.push({
        label: '📄 查看作品原档（' + d.pages.length + ' 页）',
        doc: w.doc.key,
        page: w.doc.page || 0
      });
    }
    (w.links || []).forEach(l => {
      if (/播放/.test(l.label)) return; // 播放按钮已在封面上
      acts.push(l);
    });
    $('#modalActions').innerHTML = acts.map(l =>
      l.doc
        ? '<button type="button" data-doc="' + l.doc + '" data-page="' + l.page + '">' + l.label + '</button>'
        : '<a href="' + l.url + '" target="_blank" rel="noopener">' + l.label + ' ↗</a>'
    ).join('');

    $('#modalCounter').textContent = (i + 1) + ' / ' + modalList.length;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    $('#modalPanel').scrollTop = 0;
  }

  window.__openWorkModal = function (list, index) {
    modalList = list;
    modalOpen(index);
  };

  (function modalBind() {
    const modal = $('#modal');
    $('#modalClose').addEventListener('click', closeModal);
    $('#modalBackdrop').addEventListener('click', closeModal);
    $('#modalPrev').addEventListener('click', () => modalOpen(modalIndex - 1));
    $('#modalNext').addEventListener('click', () => modalOpen(modalIndex + 1));
    document.addEventListener('keydown', e => {
      if (!modal.classList.contains('open')) return;
      // 文档翻阅器/灯箱打开时，方向键优先归它们
      if ($('#docview').classList.contains('open') || $('#lightbox').classList.contains('open')) return;
      if (e.key === 'Escape') closeModal();
      if (e.key === 'ArrowLeft') modalOpen(modalIndex - 1);
      if (e.key === 'ArrowRight') modalOpen(modalIndex + 1);
    });
    function closeModal() {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
  })();

  /* ---------------------------------------------------------
     10. 实习经历：路线 + 四张小卡
  --------------------------------------------------------- */
  (function journey() {
    const DATA = [
      {
        city: '西安', icon: '🥟', date: '2024.07 – 2024.09',
        company: '西安报业集团融媒体发展有限公司', role: '新媒体运营实习生',
        points: [
          '负责「网观西安」「网信西安」公众号内容采编发布，累计编撰推文 102 篇，总阅读量突破 20 万；',
          '协助在人民日报平台刊发新闻资讯 50 条，单篇最高阅读 9 万；',
          '自主策划的「西安文创肉夹馍」短视频获 19 万播放量，互动数据位列当月榜单首位。'
        ],
        tags: ['公众号运营', '内容采编', '短视频策划']
      },
      {
        city: '上海', icon: '📺', date: '2025.06 – 2025.09',
        company: '百视通网络电视技术发展有限公司', role: '产品内容运营实习生',
        points: [
          '参与大屏端融媒体内容运营，负责内容素材筛选、节目专题策划与素材维护；',
          '协同团队完成内容上架与用户传播效果监测。'
        ],
        tags: ['融媒体运营', '专题策划', '效果监测']
      },
      {
        city: '北京', icon: '🎓', date: '2025.09 – 2025.12',
        company: '学堂在线', role: 'AI 课程建设实习生',
        points: [
          '协同团队开展 AI 内容生产工具测试，迭代提示词 10 余组，输出 8 条课程内容优化建议；',
          '对接近 10 位高校教师，协助设计 10 余门课程大纲与教学方案，覆盖 80+ 课时；',
          '梳理 150+ 个核心知识点关联，参与构建课程知识图谱。'
        ],
        tags: ['AI 工具测试', '提示词工程', '课程设计']
      },
      {
        city: '南昌', icon: '📰', date: '2025.12 – 2026.02',
        company: '江西日报社 · 经济部', role: '实习记者',
        points: [
          '赴井冈山神山村深度走访，完成数据采集、清洗校验与结构化处理；',
          '主创数据新闻《十年·神山的变与不变》，刊登于《江西日报》2026.2.3 第 5 版特别策划；',
          '作品全网阅读 260 万+，获第十一届数据新闻大赛省级二等奖并入围国赛。'
        ],
        tags: ['数据新闻', '可视化', '深度采访']
      }
    ];

    const nodes = $('#routeNodes');
    const grid = $('#journeyGrid');
    const route = $('#route');
    const plane = $('#routePlane');
    if (!nodes || !grid) return;

    /* 飞机飞到指定城市节点上方（与圆点水平居中对齐） */
    function flyTo(node) {
      if (!plane || !node || !route) return;
      if (getComputedStyle(plane).display === 'none') return;
      const r = route.getBoundingClientRect();
      const d = node.querySelector('.r-dot').getBoundingClientRect();
      const p = plane.getBoundingClientRect();
      const x = d.left + d.width / 2 - r.left - p.width / 2;
      plane.style.left = Math.max(0, x) + 'px';
    }
    /* 不带动画的瞬移（首屏定位 / 窗口尺寸变化） */
    function flyToInstant(node) {
      if (!plane || !node) return;
      plane.classList.add('np-transition');
      flyTo(node);
      void plane.offsetWidth; // 强制回流，使无过渡的位置立即生效
      plane.classList.remove('np-transition');
    }

    DATA.forEach((d, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'r-node' + (i === 0 ? ' active' : '');
      b.innerHTML =
        '<span class="r-dot"></span>' +
        '<span class="r-city">' + d.city + '</span>' +
        '<span class="r-date">' + d.date + '</span>';
      b.addEventListener('click', () => {
        $$('.r-node', nodes).forEach((nn, j) => nn.classList.toggle('active', j === i));
        flyTo(b); // 飞机跟着点中的城市飞
        // 先清除所有卡片高亮，只突出当前点中的这一个
        $$('.j-card', grid).forEach(c => c.classList.remove('flash'));
        const card = $$('.j-card', grid)[i];
        if (card) {
          card.scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth', block: 'nearest' });
          void card.offsetWidth;
          card.classList.add('flash');
        }
      });
      nodes.appendChild(b);
    });

    // 初始：飞机停在高亮中的城市（首个）上方
    flyToInstant(nodes.children[0]);
    // 字体/图片加载完成后布局可能位移，重新对齐
    window.addEventListener('load', () => {
      const active = $('.r-node.active', nodes);
      if (active) flyToInstant(active);
    });
    // 窗口尺寸变化时重新对齐
    window.addEventListener('resize', () => {
      const active = $('.r-node.active', nodes);
      if (active) flyToInstant(active);
    });

    DATA.forEach(d => {
      const card = document.createElement('article');
      card.className = 'j-card';
      card.innerHTML =
        '<div class="j-top">' +
          '<span class="j-city"><i>' + d.icon + '</i>' + d.city + '</span>' +
          '<span class="j-date">' + d.date + '</span>' +
        '</div>' +
        '<div class="j-company">' + d.company + '</div>' +
        '<span class="j-role">' + d.role + '</span>' +
        '<ul>' + d.points.map(p => '<li>' + p + '</li>').join('') + '</ul>' +
        '<div class="j-tags">' + d.tags.map(t => '<span>' + t + '</span>').join('') + '</div>';
      grid.appendChild(card);
    });
  })();

  /* ---------------------------------------------------------
     11. 复制 + Toast
  --------------------------------------------------------- */
  (function copy() {
    const toast = $('#toast');
    let t = null;
    function say(msg) {
      toast.textContent = msg;
      toast.classList.add('show');
      clearTimeout(t);
      t = setTimeout(() => toast.classList.remove('show'), 2200);
    }
    $$('[data-copy]').forEach(el => {
      el.addEventListener('click', async () => {
        const text = el.dataset.copy;
        try {
          await navigator.clipboard.writeText(text);
        } catch (e) {
          const ta = document.createElement('textarea');
          ta.value = text;
          ta.style.position = 'fixed';
          ta.style.opacity = '0';
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          ta.remove();
        }
        say(text.indexOf('@') > -1 ? '📮 邮箱已复制，快去粘贴吧' : '💬 微信号已复制，快去粘贴吧');
      });
    });
  })();

  /* ---------------------------------------------------------
     12. Hero 拼贴鼠标视差
  --------------------------------------------------------- */
  (function parallax() {
    const hero = $('#hero');
    const collage = $('#heroCollage');
    if (!hero || !collage || window.matchMedia('(pointer: coarse)').matches) return;
    const items = $$('.polaroid', collage);
    hero.addEventListener('mousemove', e => {
      const x = e.clientX / window.innerWidth - 0.5;
      const y = e.clientY / window.innerHeight - 0.5;
      items.forEach(p => {
        const d = parseFloat(p.dataset.depth || 20);
        p.style.setProperty('--px', (x * d).toFixed(1) + 'px');
        p.style.setProperty('--py', (y * d * 0.7).toFixed(1) + 'px');
      });
    });
    hero.addEventListener('mouseleave', () => {
      items.forEach(p => {
        p.style.setProperty('--px', '0px');
        p.style.setProperty('--py', '0px');
      });
    });
  })();

  /* ---------------------------------------------------------
     13. 联系区：贴纸装饰 + 鼠标视差
  --------------------------------------------------------- */
  (function contactDeco() {
    const box = $('#contactDeco');
    const section = $('#contact');
    if (!box || !section) return;
    const chars = ['✦', '✧', '♥', '✿', '🎀', '☁️', '🍀', '✧', '♡', '⭐', '✿', '☁️', '✦', '🎀'];
    const colors = ['#f0c95c', '#f7a8c4', '#ffffff', '#c9e3b5', '#d9d2f0'];
    const frag = document.createDocumentFragment();
    for (let i = 0; i < 16; i++) {
      const s = document.createElement('span');
      s.textContent = chars[i % chars.length];
      s.style.left = (2 + Math.random() * 94) + '%';
      s.style.top = (4 + Math.random() * 88) + '%';
      s.style.fontSize = (13 + Math.random() * 16).toFixed(0) + 'px';
      s.style.color = colors[i % colors.length];
      s.style.animationDelay = (Math.random() * 5).toFixed(1) + 's';
      s.style.animationDuration = (5 + Math.random() * 4).toFixed(1) + 's';
      s.dataset.depth = (10 + Math.random() * 34).toFixed(0);
      frag.appendChild(s);
    }
    box.appendChild(frag);

    if (window.matchMedia('(pointer: coarse)').matches) return;
    const stickers = $$('span', box);
    const bokeh = $$('.bokeh i', section);
    section.addEventListener('mousemove', e => {
      const r = section.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      stickers.forEach(s => {
        const d = parseFloat(s.dataset.depth);
        s.style.translate = (x * d).toFixed(1) + 'px ' + (y * d * 0.7).toFixed(1) + 'px';
      });
      bokeh.forEach((b, i) => {
        const d = 8 + (i % 3) * 6;
        b.style.marginLeft = (x * d).toFixed(1) + 'px';
        b.style.marginTop = (y * d * 0.7).toFixed(1) + 'px';
      });
    });
    section.addEventListener('mouseleave', () => {
      stickers.forEach(s => { s.style.translate = '0px 0px'; });
      bokeh.forEach(b => { b.style.marginLeft = '0px'; b.style.marginTop = '0px'; });
    });
  })();

  /* ---------------------------------------------------------
     14. 通用灯箱（摄影作品 / 作品内页放大）
  --------------------------------------------------------- */
  const Lightbox = (function () {
    const lb = $('#lightbox');
    const img = $('#lbImg');
    const cap = $('#lbCap');
    let list = [];
    let cur = 0;

    function show(i) {
      if (!list.length) return;
      cur = ((i % list.length) + list.length) % list.length;
      img.src = list[cur].src;
      img.alt = list[cur].cap || '';
      cap.textContent = list[cur].cap || '';
    }
    function open(items, i) {
      list = items;
      show(i || 0);
      lb.classList.add('open');
      lb.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }
    function close() {
      lb.classList.remove('open');
      lb.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    $('#lbClose').addEventListener('click', close);
    $('#lbPrev').addEventListener('click', () => show(cur - 1));
    $('#lbNext').addEventListener('click', () => show(cur + 1));
    lb.addEventListener('click', e => { if (e.target === lb) close(); });
    document.addEventListener('keydown', e => {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') show(cur - 1);
      if (e.key === 'ArrowRight') show(cur + 1);
    });

    window.__openLightbox = open;
    return { open, close };
  })();

  /* ---------------------------------------------------------
     15. 摄影墙入口
  --------------------------------------------------------- */
  (function photoWall() {
    const PHOTOS = [
      { src: 'assets/img/photo-spring.jpg', cap: '春序 · Spring —— 花开有时，万物有信' },
      { src: 'assets/img/photo-summer.jpg', cap: '夏盛 · Summer —— 浓荫与蝉鸣里的长日' },
      { src: 'assets/img/photo-autumn.jpg', cap: '秋实 · Autumn —— 风把叶子染成暖色' },
      { src: 'assets/img/photo-winter.jpg', cap: '冬藏 · Winter —— 静下来，等一场雪' }
    ];
    $$('.pw').forEach(f => {
      f.addEventListener('click', () => Lightbox.open(PHOTOS, parseInt(f.dataset.photo, 10) || 0));
    });
  })();

  /* ---------------------------------------------------------
     16. 文档翻阅器（图片模式 + 原档 PDF 三级模式）
     ----------------------------------------------------------
     原档方案（第 10 轮）：预览环境的静态服务器不 Serve .pdf（返回 Not Found），
     且沙箱 iframe 禁止 window.open/下载。因此 PDF 以 base64 内嵌于
     js/pdf-*.js（点击时才懒加载）。渲染分三级，按环境能力自适应：
       ① 原生查看器：解码为 Blob → blob: URL → 同页 iframe（Chrome 内置
          PDF 查看器，支持缩放/打印/保存）。通过读取 iframe location
          探测是否真正渲染——沙箱会静默拦截 blob 导航；
       ② pdf.js canvas 渲染：① 被拦截时自动切换，纯 canvas 绘制，
          不依赖任何导航/弹窗，任何沙箱与 CSP 下均可用（懒加载
          js/pdfjs.js + js/pdfjs.worker.js）；
       ③ 图片版：② 也失败时退回，并有提示。
     真实浏览器环境中直接打开 PDF 文件链接作为第一选择。
  --------------------------------------------------------- */
  (function docViewer() {
    const dv = $('#docview');
    const img = $('#dvImg');
    const errBox = $('#dvError');
    const title = $('#dvTitle');
    const count = $('#dvCount');
    const pdfFrame = $('#dvPdf');
    const originBtn = $('#dvOrigin');
    const backBtn = $('#dvBack');
    const toastEl = $('#toast');
    const pdfLoadingEl = () => $('#dvPdfLoading');
    let curDoc = null;
    let cur = 0;
    let loadTimer = null;
    let pdfBlobUrl = null;
    let pdfLoading = false;
    let toastTimer = null;
    /* PDF 模式状态：mode = 'image' | 'native' | 'canvas' */
    let mode = 'image';
    const pdfBytesCache = {};
    let pdfjsLoading = null;
    let canvasState = null;
    /* 原生尝试令牌：防止上一次未完成的 blob 探测在切换文档后误触发兜底 */
    let attemptToken = 0;

    function say(msg) {
      if (!toastEl) return;
      toastEl.textContent = msg;
      toastEl.classList.add('show');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2400);
    }

    function show(i) {
      if (!curDoc) return;
      cur = ((i % curDoc.pages.length) + curDoc.pages.length) % curDoc.pages.length;
      count.textContent = (cur + 1) + ' / ' + curDoc.pages.length;
      const single = curDoc.pages.length <= 1;
      $('#dvPrev').style.display = single ? 'none' : '';
      $('#dvNext').style.display = single ? 'none' : '';
      // 可见性完全由 CSS 控制（.docview.open .dv-stage img { opacity: 1 }）：
      // JS 绝不写内联 opacity——否则 onload 一旦不触发（重复同 src、
      // 旧内核、竞态），图片会永久停在不可见状态
      if (errBox) errBox.hidden = true;
      clearTimeout(loadTimer);

      // 源链：主源（文件）→ 兜底源（data URI）→ 错误提示
      const sources = [curDoc.pages[cur]];
      if (curDoc.fallback && curDoc.fallback[cur] && curDoc.fallback[cur] !== sources[0]) {
        sources.push(curDoc.fallback[cur]);
      }
      let idx = 0;

      function tryNext() {
        if (idx >= sources.length) {
          if (errBox) errBox.hidden = false; // 所有源都失败，显示提示
          return;
        }
        const s = sources[idx++];
        img.onload = () => {
          clearTimeout(loadTimer);
          if (errBox) errBox.hidden = true;
          // onload 触发但解码失败（natW=0）时也要继续走兜底
          if (img.naturalWidth === 0) { tryNext(); }
        };
        img.onerror = () => { clearTimeout(loadTimer); tryNext(); };
        img.src = s;
        // 1.5 秒仍未真正解码出像素（含「静默失败」：不触发任何事件、
        // complete 却已 true 的沙箱怪异态）→ 自动切换下一个源
        loadTimer = setTimeout(() => {
          if (!img.complete || img.naturalWidth === 0) tryNext();
        }, 1500);
      }
      tryNext();
    }

    /* ---------- 原档 PDF 模式 ---------- */
    function loadScript(src) {
      return new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = src;
        s.onload = () => resolve();
        s.onerror = () => reject(new Error('script load failed: ' + src));
        document.head.appendChild(s);
      });
    }

    function b64ToBytes(b64) {
      const bin = atob(b64);
      const n = bin.length;
      const bytes = new Uint8Array(n);
      for (let i = 0; i < n; i++) bytes[i] = bin.charCodeAt(i);
      return bytes;
    }

    function varNameOf(pdfJs) {
      // 'js/pdf-resume.js' => '__PDF_RESUME__'
      const base = pdfJs.replace(/\?.*$/, '').replace(/^.*\//, '').replace(/\.js$/, '').replace(/^pdf-/, '');
      return '__PDF_' + base.replace(/-/g, '_').toUpperCase() + '__';
    }

    /* 懒加载 + 解码 PDF base64（按文档缓存，避免重复解码大文件） */
    async function getPdfBytes(doc) {
      if (pdfBytesCache[doc.pdfJs]) return pdfBytesCache[doc.pdfJs];
      const varName = varNameOf(doc.pdfJs);
      if (!window[varName]) await loadScript(doc.pdfJs);
      const b64 = window[varName];
      if (!b64) throw new Error('empty payload');
      const bytes = b64ToBytes(b64);
      pdfBytesCache[doc.pdfJs] = bytes;
      return bytes;
    }

    /* ① 原生查看器：Blob → blob: URL → iframe（Chrome 内置 PDF 查看器）。
       沙箱环境会静默拦截 blob 导航（不报错、不触发事件、iframe 停在全灰
       错误页）。先用一个 HTML blob 探针探测环境是否允许 blob 框架导航
       （不能直接探测 PDF iframe——PDF 查看器会使 frame 跨源，读不到
       location 会误判）：
       - 探针 href 为 blob:            → 环境支持，加载真 PDF
       - 同源但 1.5s 后仍非 blob:      → CSP 拦截（frame-src 等）
       - 跨源不可读（沙箱 opaque 源）  → 导航被拦
       任一失败信号 → 自动切换到 pdf.js canvas 渲染 */
    function attemptNativePdf(bytes) {
      if (pdfBlobUrl) URL.revokeObjectURL(pdfBlobUrl);
      pdfBlobUrl = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }));
      mode = 'native';
      dv.classList.add('pdf-mode');
      pdfFrame.hidden = false;
      const loadingEl = pdfLoadingEl();
      if (loadingEl) loadingEl.hidden = false;
      originBtn.hidden = true;
      backBtn.hidden = false;
      count.textContent = '原档 PDF';

      const probeUrl = URL.createObjectURL(
        new Blob(['<!DOCTYPE html><meta charset="utf-8"><title>probe</title><p>ok</p>'], { type: 'text/html' })
      );
      const my = ++attemptToken;
      let settled = false;
      const t0 = Date.now();
      let pollTimer = null;
      const proceed = ok => {
        if (settled || my !== attemptToken) { URL.revokeObjectURL(probeUrl); return; }
        settled = true;
        clearInterval(pollTimer);
        pdfFrame.onload = null;
        URL.revokeObjectURL(probeUrl);
        if (ok) {
          // 环境支持 blob 导航 → 加载真 PDF（原生查看器自行显示加载态）
          pdfFrame.src = pdfBlobUrl;
          setTimeout(() => {
            if (my === attemptToken && loadingEl) loadingEl.hidden = true;
          }, 1200);
        } else {
          if (loadingEl) loadingEl.hidden = true;
          if (dv.classList.contains('open')) showCanvasPdfMode(bytes); // ② 沙箱兜底
        }
      };
      const check = () => {
        let href = null;
        let readable = true;
        try {
          href = pdfFrame.contentWindow && pdfFrame.contentWindow.location.href;
        } catch (e) { readable = false; }
        if (readable && typeof href === 'string' && href.indexOf('blob:') === 0) {
          proceed(true);
          return;
        }
        const el = Date.now() - t0;
        if (el > 6000) { proceed(false); return; }          // 兜底超时
        if (readable && el > 1500) { proceed(false); return; }  // 同源但未导航 = CSP 拦截
        if (!readable && el > 1000) { proceed(false); return; } // 跨源不可读 = 沙箱拦截
      };
      pollTimer = setInterval(check, 300);
      pdfFrame.onload = check;
      pdfFrame.src = probeUrl;
      check();
    }

    /* ② pdf.js canvas 渲染：不依赖 iframe 导航，任何沙箱/CSP 下均可用 */
    function loadPdfJs() {
      if (window.pdfjsLib) return Promise.resolve();
      if (!pdfjsLoading) {
        pdfjsLoading = loadScript('js/pdfjs.js').then(() => {
          if (!window.pdfjsLib) throw new Error('pdfjsLib missing');
          window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'js/pdfjs.worker.js';
        });
      }
      return pdfjsLoading;
    }

    async function showCanvasPdfMode(bytes) {
      if (!dv.classList.contains('open')) return;
      mode = 'canvas';
      dv.classList.remove('pdf-mode');
      dv.classList.add('canvas-mode');
      pdfFrame.hidden = true;
      pdfFrame.removeAttribute('src');
      if (pdfBlobUrl) { URL.revokeObjectURL(pdfBlobUrl); pdfBlobUrl = null; }
      const wrap = $('#dvCanvasWrap');
      const loadingEl = pdfLoadingEl();
      if (loadingEl) {
        loadingEl.hidden = false;
        loadingEl.querySelector('p').textContent = '正在渲染原档…';
      }
      if (wrap) wrap.hidden = false;
      originBtn.hidden = true;
      backBtn.hidden = false;
      count.textContent = '原档 PDF';
      try {
        await loadPdfJs();
        if (!dv.classList.contains('open')) return;
        const pdf = await window.pdfjsLib.getDocument({ data: bytes }).promise;
        if (!dv.classList.contains('open')) { pdf.destroy(); return; }
        canvasState = { pdf: pdf, page: 1, zoom: 1 };
        await renderCanvasPage();
        if (loadingEl) loadingEl.hidden = true;
      } catch (e) {
        console.error('canvas PDF failed:', e);
        if (loadingEl) loadingEl.hidden = true;
        if (dv.classList.contains('open')) {
          showImageMode();
          say('原档渲染失败，已返回图片版');
        }
      }
    }

    function updateCanvasCount() {
      const el = $('#dvCanvasCount');
      if (el && canvasState) el.textContent = canvasState.page + ' / ' + canvasState.pdf.numPages;
    }

    function renderCanvasPage() {
      if (!canvasState) return Promise.resolve();
      const st = canvasState;
      const canvas = $('#dvCanvas');
      const stage = $('#dvStage');
      if (!canvas || !stage) return Promise.resolve();
      return st.pdf.getPage(st.page).then(page => {
        const availW = Math.max(240, stage.clientWidth - 90);
        const availH = Math.max(320, stage.clientHeight - 28);
        const vp1 = page.getViewport({ scale: 1 });
        const fit = Math.min(availW / vp1.width, availH / vp1.height);
        const viewport = page.getViewport({ scale: fit * st.zoom });
        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);
        const ctx = canvas.getContext('2d');
        const task = page.render({ canvasContext: ctx, viewport: viewport });
        return task.promise.then(() => { updateCanvasCount(); });
      }).catch(e => {
        console.error('page render failed:', e);
        if (dv.classList.contains('open')) say('页面渲染失败，可重试');
      });
    }

    function canvasNav(delta) {
      if (!canvasState) return;
      const next = canvasState.page + delta;
      if (next < 1 || next > canvasState.pdf.numPages) return;
      canvasState.page = next;
      renderCanvasPage();
    }

    function canvasZoom(factor) {
      if (!canvasState) return;
      canvasState.zoom = Math.min(3, Math.max(0.4, canvasState.zoom * factor));
      renderCanvasPage();
    }

    function clearCanvasState() {
      if (canvasState) {
        try { canvasState.pdf.destroy(); } catch (e) { /* 渲染中销毁可能抛错，忽略 */ }
        canvasState = null;
      }
      const wrap = $('#dvCanvasWrap');
      if (wrap) wrap.hidden = true;
      const loadingEl = pdfLoadingEl();
      if (loadingEl) loadingEl.hidden = true;
    }

    async function showPdfMode() {
      if (!curDoc || !curDoc.pdfJs || pdfLoading) return;
      pdfLoading = true;
      originBtn.classList.add('is-loading');
      originBtn.textContent = '加载中…';
      try {
        const bytes = await getPdfBytes(curDoc);
        attemptNativePdf(bytes);
      } catch (e) {
        console.error('PDF mode failed:', e);
        say('原档加载失败，可重试或查看图片版');
        // 停留在图片模式
      } finally {
        pdfLoading = false;
        originBtn.classList.remove('is-loading');
        originBtn.textContent = '查看原档 ↗';
      }
    }

    function showImageMode() {
      attemptToken++;
      mode = 'image';
      dv.classList.remove('pdf-mode', 'canvas-mode');
      pdfFrame.hidden = true;
      pdfFrame.removeAttribute('src');
      if (pdfBlobUrl) { URL.revokeObjectURL(pdfBlobUrl); pdfBlobUrl = null; }
      clearCanvasState();
      backBtn.hidden = true;
      if (curDoc && curDoc.pdfJs) originBtn.hidden = false;
      if (curDoc) show(cur);
    }

    function open(key, page) {
      const d = DOCS[key];
      if (!d) return;
      attemptToken++;
      curDoc = d;
      title.textContent = d.title;
      // 默认回到图片模式
      mode = 'image';
      dv.classList.remove('pdf-mode', 'canvas-mode');
      pdfFrame.hidden = true;
      pdfFrame.removeAttribute('src');
      if (pdfBlobUrl) { URL.revokeObjectURL(pdfBlobUrl); pdfBlobUrl = null; }
      clearCanvasState();
      backBtn.hidden = true;
      // 原档按钮：有内嵌 PDF 数据的文档才显示（纯链接在预览环境会 404）
      if (originBtn) {
        if (d.pdfJs) { originBtn.hidden = false; }
        else { originBtn.hidden = true; }
      }
      // 先打开查看器再加载图片：容器可见时浏览器才会以正常优先级加载图片
      dv.classList.add('open');
      dv.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      show(page || 0);
    }
    function close() {
      clearTimeout(loadTimer);
      attemptToken++;
      mode = 'image';
      dv.classList.remove('open', 'pdf-mode', 'canvas-mode');
      dv.setAttribute('aria-hidden', 'true');
      pdfFrame.hidden = true;
      pdfFrame.removeAttribute('src');
      backBtn.hidden = true;
      // 若作品弹窗仍打开，保持页面锁定
      document.body.style.overflow = $('#modal').classList.contains('open') ? 'hidden' : '';
    }

    $('#dvClose').addEventListener('click', close);
    $('#dvPrev').addEventListener('click', () => {
      if (dv.classList.contains('canvas-mode')) canvasNav(-1); else show(cur - 1);
    });
    $('#dvNext').addEventListener('click', () => {
      if (dv.classList.contains('canvas-mode')) canvasNav(1); else show(cur + 1);
    });
    if (originBtn) originBtn.addEventListener('click', showPdfMode);
    if (backBtn) backBtn.addEventListener('click', showImageMode);
    // canvas 模式工具条
    const cvPrev = $('#dvCvPrev'), cvNext = $('#dvCvNext');
    const zoomOut = $('#dvZoomOut'), zoomIn = $('#dvZoomIn');
    if (cvPrev) cvPrev.addEventListener('click', () => canvasNav(-1));
    if (cvNext) cvNext.addEventListener('click', () => canvasNav(1));
    if (zoomOut) zoomOut.addEventListener('click', () => canvasZoom(1 / 1.25));
    if (zoomIn) zoomIn.addEventListener('click', () => canvasZoom(1.25));
    dv.addEventListener('click', e => { if (e.target === dv || e.target.classList.contains('dv-stage')) close(); });
    document.addEventListener('keydown', e => {
      if (!dv.classList.contains('open')) return;
      if (e.key === 'Escape') { close(); return; }
      if (dv.classList.contains('canvas-mode')) {
        // canvas 模式：方向键翻 PDF 页
        if (e.key === 'ArrowLeft') canvasNav(-1);
        if (e.key === 'ArrowRight') canvasNav(1);
        return;
      }
      if (e.key === 'ArrowLeft') show(cur - 1);
      if (e.key === 'ArrowRight') show(cur + 1);
    });

    // 所有 data-doc 按钮（含动态生成的作品原档按钮）
    document.addEventListener('click', e => {
      const btn = e.target.closest('[data-doc]');
      if (!btn) return;
      open(btn.dataset.doc, parseInt(btn.dataset.page || '0', 10));
    });
  })();

  /* ---------------------------------------------------------
     15. 移动端菜单 / 年份
  --------------------------------------------------------- */
  (function misc() {
    const burger = $('#burger');
    const menu = $('#mobileMenu');
    burger.addEventListener('click', () => {
      burger.classList.toggle('open');
      menu.classList.toggle('open');
      document.body.style.overflow = menu.classList.contains('open') ? 'hidden' : '';
    });
    $$('a, button', menu).forEach(a => a.addEventListener('click', () => {
      burger.classList.remove('open');
      menu.classList.remove('open');
      document.body.style.overflow = '';
    }));
    $('#year').textContent = new Date().getFullYear();
  })();
})();
