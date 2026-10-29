(function () {
  /* ========== TRADUCTIONS ========== */
  const XT = {
    fr: {
      histTitle: 'Histoire du Wydad',
      h1937: 'Fondation du Wydad Athletic Club à Casablanca.',
      h1992: 'Premier sacre africain du club.',
      h2017: 'Nouveau titre de champion d\'Afrique.',
      h2022: 'Encore une fois champion d\'Afrique.',
      fansTitle: 'Les Fans et les Ultras',
      fansSub: 'Les images des supporters qui font vivre le club.',
      tabAll: 'Tout', tabFans: 'Supporters', tabUltras: 'Ultras', tab2005: 'Champions 2005',
      capFans: 'Les supporters du Wydad', capUltras: 'Les Ultras en action', cap2005: 'Champions 2005',
      winTitle: 'Les Champions 2005',
      winText: 'Écris ici l\'histoire de la saison 2005 : le parcours, les joueurs, les matchs importants et la fête avec les supporters.',
      voteTitle: 'Hall of Fame : vote pour ton joueur',
      voteBtn: 'Voter', voteThanks: 'Merci pour ton vote !', voteOnce: 'Un seul vote par personne.',
      gbTitle: 'Livre d\'or', gbName: 'Ton nom', gbMsg: 'Écris ton message...',
      gbSend: 'Envoyer', gbAlert: 'Écris ton nom et ton message'
    },
    en: {
      histTitle: 'History of Wydad',
      h1937: 'Foundation of Wydad Athletic Club in Casablanca.',
      h1992: 'The club\'s first African title.',
      h2017: 'Another African champions title.',
      h2022: 'African champions once again.',
      fansTitle: 'Fans and Ultras',
      fansSub: 'Pictures of the supporters who keep the club alive.',
      tabAll: 'All', tabFans: 'Fans', tabUltras: 'Ultras', tab2005: '2005 Champions',
      capFans: 'Wydad supporters', capUltras: 'Ultras in action', cap2005: '2005 Champions',
      winTitle: 'The 2005 Champions',
      winText: 'Write the story of the 2005 season here: the journey, the players, the key matches and the celebration with the fans.',
      voteTitle: 'Hall of Fame: vote for your player',
      voteBtn: 'Vote', voteThanks: 'Thanks for your vote!', voteOnce: 'One vote per person.',
      gbTitle: 'Guestbook', gbName: 'Your name', gbMsg: 'Write your message...',
      gbSend: 'Send', gbAlert: 'Enter your name and message'
    },
    ar: {
      histTitle: 'تاريخ الوداد',
      h1937: 'تأسيس نادي الوداد الرياضي بالدار البيضاء.',
      h1992: 'أول لقب إفريقي للنادي.',
      h2017: 'لقب إفريقي جديد.',
      h2022: 'بطل إفريقيا مرة أخرى.',
      fansTitle: 'الجماهير والألتراس',
      fansSub: 'صور الجماهير التي تُحيي النادي.',
      tabAll: 'الكل', tabFans: 'الجماهير', tabUltras: 'الألتراس', tab2005: 'أبطال 2005',
      capFans: 'جماهير الوداد', capUltras: 'الألتراس في الميدان', cap2005: 'أبطال 2005',
      winTitle: 'أبطال 2005',
      winText: 'اكتب هنا قصة موسم 2005: المسار، اللاعبون، المباريات المهمة، والاحتفال مع الجماهير.',
      voteTitle: 'قاعة المشاهير: صوّت للاعبك',
      voteBtn: 'صوّت', voteThanks: 'شكراً على تصويتك!', voteOnce: 'صوت واحد لكل شخص.',
      gbTitle: 'سجل الزوار', gbName: 'اسمك', gbMsg: 'اكتب رسالتك...',
      gbSend: 'إرسال', gbAlert: 'اكتب اسمك ورسالتك'
    }
  };
  const LOCALE = { fr: 'fr-FR', en: 'en-GB', ar: 'ar-MA' };

  function getLang() {
    let l = (document.documentElement.lang || '').slice(0, 2).toLowerCase();
    return XT[l] ? l : 'en';
  }
  let LANG = getLang();
  const t = (k) => (XT[LANG] && XT[LANG][k]) || XT.en[k] || k;

  function applyLang() {
    document.querySelectorAll('[data-xi]').forEach((el) => { el.textContent = t(el.dataset.xi); });
    document.querySelectorAll('[data-xi-ph]').forEach((el) => { el.placeholder = t(el.dataset.xiPh); });
    document.querySelectorAll('.x-section').forEach((el) => { el.setAttribute('dir', LANG === 'ar' ? 'rtl' : 'ltr'); });
    document.dispatchEvent(new CustomEvent('x-lang'));
  }
  function syncLang() {
    const n = getLang();
    if (n !== LANG) { LANG = n; applyLang(); }
  }
  // kaykhdm m3a sélecteur dial langue dialek (langchange + html lang)
  document.addEventListener('langchange', syncLang);
  new MutationObserver(syncLang).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });

  /* ========== LOADER + PROGRESS BAR ========== */
  const loader = document.getElementById('x-loader');
  const bar = document.getElementById('x-progress');
  function hideLoader() { if (loader) setTimeout(() => loader.classList.add('x-hide'), 400); }
  if (document.readyState === 'complete') hideLoader();
  else window.addEventListener('load', hideLoader);
  setTimeout(hideLoader, 4000); // sécurité: ma kaybqach l'loader 3alaq

  window.addEventListener('scroll', () => {
    const h = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    if (bar) bar.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + '%';
  }, { passive: true });

  /* ========== REVEAL ANIMATION ========== */
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.style.transitionDelay = (e.target.dataset.delay || 0) + 'ms';
        e.target.classList.add('x-visible');
        revealObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.x-tl-item').forEach((el) => revealObs.observe(el));

  /* ========== GALERIE: FANS / ULTRAS / 2005 ========== */
  // Kol tswira f star wa7ed. Types: 'fans' | 'ultras' | 'y2005'
  const PHOTOS = [
    { type: 'fans',   src: 'img/WYDAD/FANS1.JPEG',   cap: 'capFans' },
    { type: 'ultras', src: 'img/WYDAD/FANS2.JPEG', cap: 'capUltras' },
    { type: 'ultras', src: 'img/WYDAD/FANS3.JPEG', cap: 'capUltras' }
    
  ];
  const gallery = document.getElementById('x-gallery');
  const lightbox = document.getElementById('x-lightbox');
  const tabs = document.querySelectorAll('#x-tabs button');

  if (gallery) {
    PHOTOS.forEach((g, i) => {
      const fig = document.createElement('figure');
      fig.dataset.type = g.type;
      fig.dataset.delay = (i % 6) * 100;
      const img = document.createElement('img');
      img.src = g.src; img.loading = 'lazy'; img.alt = '';
      img.onerror = () => fig.remove();   // ila tswira ma kaynach, kat7yed
      const cap = document.createElement('figcaption');
      cap.dataset.xi = g.cap;
      cap.textContent = t(g.cap);
      fig.append(img, cap);
      fig.addEventListener('click', () => {
        lightbox.querySelector('img').src = g.src;
        lightbox.classList.add('x-open');
      });
      gallery.appendChild(fig);
      revealObs.observe(fig);
    });

    tabs.forEach((btn) => {
      btn.addEventListener('click', () => {
        tabs.forEach((b) => b.classList.toggle('active', b === btn));
        const f = btn.dataset.f;
        gallery.querySelectorAll('figure').forEach((fig) => {
          const show = f === 'all' || fig.dataset.type === f;
          fig.hidden = !show;
          if (show) fig.classList.add('x-visible');
        });
      });
    });
  }
  if (lightbox) {
    lightbox.addEventListener('click', () => lightbox.classList.remove('x-open'));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') lightbox.classList.remove('x-open'); });
  }

  /* ========== LIVRE D'OR ========== */
  const GB_KEY = 'wydad_guestbook';
  const gbName = document.getElementById('x-gb-name');
  const gbMsg = document.getElementById('x-gb-msg');
  const gbBtn = document.getElementById('x-gb-send');
  const gbList = document.getElementById('x-gb-list');

  function gbLoad() {
    try { return JSON.parse(localStorage.getItem(GB_KEY)) || []; } catch (e) { return []; }
  }
  function gbRender() {
    if (!gbList) return;
    gbList.innerHTML = '';
    gbLoad().slice().reverse().forEach((m) => {
      const li = document.createElement('li');
      const b = document.createElement('b'); b.textContent = m.name;
      const p = document.createElement('p'); p.textContent = m.msg;
      const s = document.createElement('small');
      s.textContent = new Date(m.date).toLocaleString(LOCALE[LANG]);
      li.append(b, p, s);
      gbList.appendChild(li);
    });
  }
  if (gbBtn) {
    gbBtn.addEventListener('click', () => {
      const name = gbName.value.trim();
      const msg = gbMsg.value.trim();
      if (!name || !msg) { alert(t('gbAlert')); return; }
      const arr = gbLoad();
      arr.push({ name, msg, date: Date.now() });
      try { localStorage.setItem(GB_KEY, JSON.stringify(arr.slice(-50))); } catch (e) {}
      gbName.value = ''; gbMsg.value = '';
      gbRender();
    });
  }

  /* ========== VOTE HALL OF FAME ========== */
  const PLAYERS = ['Walid Azaro', 'Mohamed Nahiri', 'Salaheddine Bassir', 'Abdelilah Hafidi', 'Zouhair Naim'];
  const V_KEY = 'wydad_hof_votes';
  const V_DONE = 'wydad_hof_voted';
  const voteBox = document.getElementById('x-vote-list');
  const voteInfo = document.getElementById('x-vote-info');

  function getVotes() {
    try { return JSON.parse(localStorage.getItem(V_KEY)) || {}; } catch (e) { return {}; }
  }
  function hasVoted() {
    try { return !!localStorage.getItem(V_DONE); } catch (e) { return false; }
  }
  function voteRender() {
    if (!voteBox) return;
    const votes = getVotes();
    const total = PLAYERS.reduce((s, p) => s + (votes[p] || 0), 0);
    voteBox.innerHTML = '';
    PLAYERS.forEach((p) => {
      const n = votes[p] || 0;
      const pct = total ? Math.round((n / total) * 100) : 0;
      const row = document.createElement('div'); row.className = 'x-vote-row';
      const barEl = document.createElement('div'); barEl.className = 'x-vote-bar';
      const content = document.createElement('div'); content.className = 'x-vote-content';
      const label = document.createElement('span');
      label.textContent = p + ' — ' + n + ' (' + pct + '%)';
      const btn = document.createElement('button');
      btn.className = 'x-vote-btn'; btn.textContent = t('voteBtn'); btn.disabled = hasVoted();
      btn.addEventListener('click', () => {
        const v = getVotes(); v[p] = (v[p] || 0) + 1;
        try {
          localStorage.setItem(V_KEY, JSON.stringify(v));
          localStorage.setItem(V_DONE, '1');
        } catch (e) {}
        voteRender();
      });
      content.append(label, btn);
      row.append(barEl, content);
      voteBox.appendChild(row);
      setTimeout(() => { barEl.style.width = pct + '%'; }, 50);
    });
    if (voteInfo) voteInfo.textContent = hasVoted() ? t('voteThanks') : t('voteOnce');
  }

  /* ========== INIT ========== */
  document.addEventListener('x-lang', () => { gbRender(); voteRender(); });
  applyLang();
})();