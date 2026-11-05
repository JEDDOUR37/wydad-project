(function () {
  /* ========== TRADUCTIONS ========== */
  const XT = {
    fr: {
      navStandings: 'Classement',
      histTitle: 'Histoire du Wydad',
      h1937: 'Fondation du Wydad Athletic Club à Casablanca.',
      h1992: 'Premier sacre africain du club.',
      h2017: 'Nouveau titre de champion d\'Afrique.',
      h2022: 'Encore une fois champion d\'Afrique.',
      stTitle: 'Classement Botola Pro', stSub: 'Saison 2026/2027',
      stTeam: 'Équipe', stP: 'J', stW: 'G', stD: 'N', stL: 'D', stGF: 'BP', stGA: 'BC', stGD: 'Diff', stPts: 'Pts',
      stUpdated: 'Dernière mise à jour :', stSource: 'Source :',
      stError: 'Classement indisponible pour le moment.',
      voteTitle: 'Hall of Fame : vote pour ton joueur',
      voteBtn: 'Voter', voteThanks: 'Merci pour ton vote !', voteOnce: 'Un seul vote par personne.',
      gbTitle: 'Livre d\'or', gbName: 'Ton nom', gbMsg: 'Écris ton message...',
      gbSend: 'Envoyer', gbAlert: 'Écris ton nom et ton message'
    },
    en: {
      navStandings: 'Table',
      histTitle: 'History of Wydad',
      h1937: 'Foundation of Wydad Athletic Club in Casablanca.',
      h1992: 'The club\'s first African title.',
      h2017: 'Another African champions title.',
      h2022: 'African champions once again.',
      stTitle: 'Botola Pro Table', stSub: 'Season 2026/2027',
      stTeam: 'Team', stP: 'P', stW: 'W', stD: 'D', stL: 'L', stGF: 'GF', stGA: 'GA', stGD: 'GD', stPts: 'Pts',
      stUpdated: 'Last update:', stSource: 'Source:',
      stError: 'Standings unavailable right now.',
      voteTitle: 'Hall of Fame: vote for your player',
      voteBtn: 'Vote', voteThanks: 'Thanks for your vote!', voteOnce: 'One vote per person.',
      gbTitle: 'Guestbook', gbName: 'Your name', gbMsg: 'Write your message...',
      gbSend: 'Send', gbAlert: 'Enter your name and message'
    },
    ar: {
      navStandings: 'الترتيب',
      histTitle: 'تاريخ الوداد',
      h1937: 'تأسيس نادي الوداد الرياضي بالدار البيضاء.',
      h1992: 'أول لقب إفريقي للنادي.',
      h2017: 'لقب إفريقي جديد.',
      h2022: 'بطل إفريقيا مرة أخرى.',
      stTitle: 'ترتيب البطولة الاحترافية', stSub: 'موسم 2026/2027',
      stTeam: 'الفريق', stP: 'لعب', stW: 'فوز', stD: 'تعادل', stL: 'خسارة', stGF: 'له', stGA: 'عليه', stGD: 'فارق', stPts: 'نقاط',
      stUpdated: 'آخر تحديث:', stSource: 'المصدر:',
      stError: 'الترتيب غير متاح حاليا.',
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

  /* ========== REVEAL ANIMATION (timeline) ========== */
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

  /* ========== CLASSEMENT BOTOLA PRO (data/standings.json) ========== */
  const stBody = document.getElementById('x-st-body');
  const stUpdated = document.getElementById('x-st-updated');
  let ST = null;

  function stRender() {
    if (!stBody) return;
    stBody.innerHTML = '';

    if (!ST || !Array.isArray(ST.table)) {
      const tr = document.createElement('tr');
      const td = document.createElement('td');
      td.colSpan = 10;
      td.textContent = t('stError');
      tr.appendChild(td);
      stBody.appendChild(tr);
      if (stUpdated) stUpdated.textContent = '';
      return;
    }

    ST.table.slice().sort((a, b) => a.pos - b.pos).forEach((row) => {
      const tr = document.createElement('tr');
      if (/^wydad( casablanca)?$/i.test(row.team)) tr.className = 'x-me';
      const cell = (txt, cls) => {
        const td = document.createElement('td');
        td.textContent = txt;
        if (cls) td.className = cls;
        tr.appendChild(td);
      };
      const gd = row.gf - row.ga;
      cell(row.pos);
      cell(row.team);
      cell(row.p); cell(row.w); cell(row.d); cell(row.l);
      cell(row.gf); cell(row.ga);
      cell(gd > 0 ? '+' + gd : String(gd), gd > 0 ? 'x-gd-pos' : (gd < 0 ? 'x-gd-neg' : ''));
      cell(row.pts, 'x-pts');
      stBody.appendChild(tr);
    });

    if (stUpdated) {
      let txt = '';
      if (ST.updated) {
        const d = new Date(ST.updated + 'T12:00:00');
        const when = isNaN(d) ? ST.updated : d.toLocaleDateString(LOCALE[LANG], { day: 'numeric', month: 'long', year: 'numeric' });
        txt = t('stUpdated') + ' ' + when;
      }
      if (ST.source) txt += (txt ? ' · ' : '') + t('stSource') + ' ' + ST.source;
      stUpdated.textContent = txt;
    }
  }

  if (stBody) {
    fetch('data/standings.json', { cache: 'no-store' })
      .then((r) => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then((j) => { ST = j; stRender(); })
      .catch((e) => { console.warn('[X] standings.json:', e); stRender(); });
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
  document.addEventListener('x-lang', () => { gbRender(); voteRender(); stRender(); });
  applyLang();
})();