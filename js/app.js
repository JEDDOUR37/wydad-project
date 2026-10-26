"use strict";
/* =====================================================
   app.js  —  main script of the site (plain JavaScript, no build step).
===================================================== */
/* =========================
   HELPERS
========================= */
const $ = (id) => document.getElementById(id);
function setText(id, text) {
    const el = $(id);
    if (el)
        el.textContent = text;
}
/** Sets text and hides the element when the text is empty. */
function setLine(id, text) {
    const el = $(id);
    if (!el)
        return;
    el.textContent = text;
    el.classList.toggle("hidden", text === "");
}
const HTML_ESCAPES = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
};
function esc(value) {
    return value.replace(/[&<>"']/g, (c) => HTML_ESCAPES[c] ?? c);
}
function shuffle(arr) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}
/* =========================
   THEME TOGGLE
========================= */
const themeToggleBtn = $("themeToggle");
const themeIcon = themeToggleBtn?.querySelector(".theme-icon") ?? null;
function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    try {
        localStorage.setItem("wydad-theme", theme);
    }
    catch {
        /* storage unavailable */
    }
    if (themeIcon)
        themeIcon.textContent = theme === "dark" ? "🌙" : "☀️";
}
function initTheme() {
    let saved = null;
    try {
        saved = localStorage.getItem("wydad-theme");
    }
    catch {
        /* storage unavailable */
    }
    applyTheme(saved === "light" ? "light" : "dark");
}
themeToggleBtn?.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme");
    applyTheme(current === "dark" ? "light" : "dark");
});
/* =========================
   MOBILE MENU
========================= */
const mainNav = $("mainNav");
const menuToggle = $("menuToggle");
function toggleMenu(force) {
    if (!mainNav || !menuToggle)
        return;
    const open = force ?? !mainNav.classList.contains("open");
    mainNav.classList.toggle("open", open);
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.textContent = open ? "✕" : "☰";
}
menuToggle?.addEventListener("click", () => toggleMenu());
mainNav?.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => toggleMenu(false)));
/* =========================
   SCROLL REVEAL ANIMATION
========================= */
function initScrollReveal() {
    const items = document.querySelectorAll(".reveal-item:not(.visible)");
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting)
                return;
            const target = entry.target;
            const parent = target.parentElement;
            const siblings = parent ? Array.from(parent.querySelectorAll(".reveal-item")) : [];
            const idx = Math.max(siblings.indexOf(target), 0);
            const delay = Math.min(idx, 8) * 80;
            target.style.transitionDelay = `${delay}ms`;
            target.classList.add("visible");
            observer.unobserve(target);
            // remove the delay afterwards so hover effects stay instant
            window.setTimeout(() => {
                target.style.transitionDelay = "";
            }, delay + 800);
        });
    }, { threshold: 0.12 });
    items.forEach((el) => observer.observe(el));
}
/* =========================
   NAV SCROLL-SPY (active link)
========================= */
function initScrollSpy() {
    const links = Array.from(document.querySelectorAll("header nav a[href^='#']"));
    const byId = new Map();
    links.forEach((link) => {
        const id = link.getAttribute("href")?.slice(1);
        if (id)
            byId.set(id, link);
    });
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting)
                return;
            links.forEach((l) => l.classList.remove("active"));
            byId.get(entry.target.id)?.classList.add("active");
        });
    }, { rootMargin: "-40% 0px -55% 0px" });
    byId.forEach((_link, id) => {
        const section = document.getElementById(id);
        if (section)
            observer.observe(section);
    });
}
/* =========================
   LATEST RESULTS (single source for ticker + results section)
   Source: FotMob, Botola Pro 2026. Update when new matches are played.
========================= */
let RESULTS = [
    { home: "Wydad", away: "CODM Meknès", score: "0 – 0", result: "draw", comp: "Botola Pro", date: "11 Oct 2026" },
    { home: "Difaâ El Jadida", away: "Wydad", score: "0 – 2", result: "win", comp: "Botola Pro", date: "3 Oct 2026" },
    { home: "Wydad", away: "Widad Temara", score: "1 – 3", result: "loss", comp: "Botola Pro", date: "26 Sep 2026" },
    { home: "Wydad", away: "Union Touarga", score: "1 – 2", result: "loss", comp: "Botola Pro", date: "5 Jul 2026" },
];
const RESULT_LABEL = { win: "Win", draw: "Draw", loss: "Loss" };
function renderResults() {
    const container = $("resultsContainer");
    if (container) {
        container.innerHTML = RESULTS.map((m) => `
            <div class="match-card ${m.result} reveal-item">
                <h3>${esc(m.home)} ${esc(m.score)} ${esc(m.away)}</h3>
                <span>${RESULT_LABEL[m.result]}</span>
                <small>${esc(m.comp)} · ${esc(m.date)}</small>
            </div>`).join("");
    }
    setText("tickerText", RESULTS.map((m) => `${m.home} ${m.score} ${m.away}`).join("  ·  "));
    initScrollReveal();
}
/* =========================
   HERO 3D MOVE
========================= */
const heroBox = document.querySelector(".hero-box");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
document.addEventListener("mousemove", (e) => {
    if (!heroBox || reduceMotion)
        return;
    const x = (window.innerWidth / 2 - e.pageX) / 45;
    const y = (window.innerHeight / 2 - e.pageY) / 45;
    heroBox.style.transform = `rotateY(${x}deg) rotateX(${-y}deg)`;
});
/* =========================
   FILTER PLAYERS  (called from HTML onclick)
========================= */
function filterPlayers(type, btn) {
    document
        .querySelectorAll(".filter button")
        .forEach((b) => b.classList.remove("active"));
    btn?.classList.add("active");
    document.querySelectorAll("#playersGrid .player-card").forEach((card) => {
        const show = type === "all" ||
            (type === "new" ? card.dataset.new === "true" : card.getAttribute("data-type") === type);
        card.style.display = show ? "block" : "none";
        if (show)
            card.classList.add("visible");
    });
}
/* =========================
   TROPHY POPUP  (called from HTML onclick)
========================= */
function showPopup(title, text) {
    setText("popup-title", title);
    setText("popup-text", text);
    const popup = $("popup");
    if (popup)
        popup.style.display = "flex";
}
function closePopup() {
    document.querySelectorAll(".popup").forEach((p) => {
        p.style.display = "none";
    });
}
/* =========================
   QUIZ
========================= */
const QUESTIONS = [
    { q: "Fin ta2assas Wydad Athletic Club?", opts: ["1937", "1929", "1945", "1952"], ans: 0, fact: "Wydad ta2asas f 1937 f Casablanca." },
    { q: "Chhal marra rbe7 Wydad Botola Pro?", opts: ["18", "20", "22", "25"], ans: 2, fact: "22 btoula — akthar nadi f tarikh lkora lmaghribiya." },
    { q: "Fin kat-l3ab Wydad matches dialo?", opts: ["Stade Mohamed V", "Stade d'Honneur", "Complexe Prince Moulay Abdellah", "Stade de Fès"], ans: 0, fact: "Stade Mohamed V f Casablanca — dar Wydad." },
    { q: "Chhal marra rbe7 Wydad CAF Champions League?", opts: ["1", "2", "3", "4"], ans: 2, fact: "3 marrat: 1992, 2017, 2022." },
    { q: "Ach hiya couleur dial Wydad?", opts: ["Zra9 w byed", "A7mar w byed", "Khdra w byed", "A7mar w lkhdar"], ans: 1, fact: "A7mar w byed — couleurs dial Wydad." },
    { q: "Chkoun houa l attaquant Francawi li ja l Wydad?", opts: ["Karim Benzema", "Wissam Ben Yedder", "Moussa Dembélé", "Alexandre Lacazette"], ans: 1, fact: "Wissam Ben Yedder — ex-Monaco w France NT, ja l Wydad f 2025." },
    { q: "Fin kan Wydad finals dial CAF Champions League 2022?", opts: ["Cairo", "Casablanca", "Dakar", "Johannesburg"], ans: 1, fact: "Final 2022 l3bat f Stade Mohamed V — derby africain m3a Al Ahly." },
    { q: "Chkoun houa l milieu défensif l maghribi li ja l Wydad?", opts: ["Amine Harit", "Sofiane Amrabat", "Azzedine Ounahi", "Selim Amallah"], ans: 1, fact: "Sofiane Amrabat — star dial Mondial 2022, CDM qawi bzaf." },
    { q: "Chhal marra rbe7 Wydad Coupe du Trône?", opts: ["6", "7", "9", "11"], ans: 2, fact: "9 Coupes du Trône — trophée presti9i f lkora lmaghribiya." },
    { q: "Chkoun houa l ailier droit l maghribi l machi3 li ja l Wydad?", opts: ["Nordin Amrabat", "Hakim Ziyach", "Zakaria Aboukhlal", "Youssef En-Nesyri"], ans: 1, fact: "Hakim Ziyach — international Maroc, ja l Wydad f 2025." },
];
const QUESTION_SECONDS = 15;
const NEXT_DELAY_MS = 2200;
let currentQ = 0;
let score = 0;
let answered = false;
let timerInterval;
let timeLeft = QUESTION_SECONDS;
let shuffled = [];
function showPanel(id) {
    ["quiz-start", "quiz-question", "quiz-result"].forEach((s) => {
        $(s)?.classList.toggle("hidden", s !== id);
    });
}
function startQuiz() {
    shuffled = shuffle(QUESTIONS);
    currentQ = 0;
    score = 0;
    showPanel("quiz-question");
    loadQuestion();
}
function loadQuestion() {
    const q = shuffled[currentQ];
    if (!q)
        return;
    answered = false;
    timeLeft = QUESTION_SECONDS;
    setText("q-counter", `Question ${currentQ + 1}/${shuffled.length}`);
    setText("q-score-live", String(score));
    setText("q-text", q.q);
    setText("q-timer", String(timeLeft));
    const progress = $("q-progress");
    if (progress)
        progress.style.width = `${(currentQ / shuffled.length) * 100}%`;
    $("q-timer-ring")?.classList.remove("urgent");
    const feedback = $("q-feedback");
    if (feedback) {
        feedback.className = "quiz-feedback";
        feedback.textContent = "";
    }
    const optsEl = $("q-options");
    if (optsEl) {
        optsEl.innerHTML = "";
        q.opts.forEach((opt, i) => {
            const btn = document.createElement("button");
            btn.className = "quiz-opt";
            btn.textContent = opt;
            btn.addEventListener("click", () => selectAnswer(i));
            optsEl.appendChild(btn);
        });
    }
    window.clearInterval(timerInterval);
    timerInterval = window.setInterval(() => {
        timeLeft--;
        setText("q-timer", String(timeLeft));
        if (timeLeft <= 5)
            $("q-timer-ring")?.classList.add("urgent");
        if (timeLeft <= 0) {
            window.clearInterval(timerInterval);
            if (!answered)
                forceTimeout();
        }
    }, 1000);
}
function selectAnswer(idx) {
    if (answered)
        return;
    const q = shuffled[currentQ];
    if (!q)
        return;
    answered = true;
    window.clearInterval(timerInterval);
    const opts = document.querySelectorAll(".quiz-opt");
    opts.forEach((b) => (b.disabled = true));
    const feedback = $("q-feedback");
    if (idx === q.ans) {
        opts[idx]?.classList.add("correct");
        score++;
        setText("q-score-live", String(score));
        if (feedback) {
            feedback.className = "quiz-feedback show correct-fb";
            feedback.textContent = "✓ Correct! " + q.fact;
        }
    }
    else {
        opts[idx]?.classList.add("wrong");
        opts[q.ans]?.classList.add("correct");
        if (feedback) {
            feedback.className = "quiz-feedback show wrong-fb";
            feedback.textContent = "✗ Ghalta. " + q.fact;
        }
    }
    window.setTimeout(nextQuestion, NEXT_DELAY_MS);
}
function forceTimeout() {
    const q = shuffled[currentQ];
    if (!q)
        return;
    answered = true;
    const opts = document.querySelectorAll(".quiz-opt");
    opts.forEach((b) => (b.disabled = true));
    opts[q.ans]?.classList.add("correct");
    const feedback = $("q-feedback");
    if (feedback) {
        feedback.className = "quiz-feedback show wrong-fb";
        feedback.textContent = "⏱ Wqt inte9a! " + q.fact;
    }
    window.setTimeout(nextQuestion, NEXT_DELAY_MS);
}
function nextQuestion() {
    currentQ++;
    if (currentQ < shuffled.length)
        loadQuestion();
    else
        showResult();
}
function showResult() {
    const progress = $("q-progress");
    if (progress)
        progress.style.width = "100%";
    showPanel("quiz-result");
    const total = shuffled.length;
    const pct = score / total;
    let emoji = "😔";
    let title = "Mzyan, 3awd 3awel!";
    let msg = "Ma3endakch bzzaf d lma3lomat 3la Wydad. Qra zwidan!";
    if (pct === 1) {
        emoji = "🏆";
        title = "Wydadi 100%!";
        msg = "Perfect! Nta mochaji3 asil dial Wydad, ma kaynch 7aja khasak tat3llmha!";
    }
    else if (pct >= 0.8) {
        emoji = "🔥";
        title = "Chwiya dak she!";
        msg = "Bra3ti! Ma baghalakch ghir su2elin b9aw.";
    }
    else if (pct >= 0.6) {
        emoji = "👏";
        title = "Mzyan bzaf!";
        msg = "Des bonnes connaissances mais zid t9ra 3la Wydad!";
    }
    else if (pct >= 0.4) {
        emoji = "⚽";
        title = "Ma ybas!";
        msg = "Noss noss — hssn shwiya w 3awd 3awel.";
    }
    setText("result-emoji", emoji);
    setText("result-title", title);
    setText("result-score", `${score}/${total}`);
    setText("result-msg", msg);
    const badgesEl = $("result-badges");
    if (!badgesEl)
        return;
    badgesEl.innerHTML = "";
    const earned = [];
    if (score === total)
        earned.push({ label: "Perfect Score", gold: true });
    if (score >= Math.ceil(total * 0.8))
        earned.push({ label: "Wydadi 3arif", gold: true });
    if (score >= 1)
        earned.push({ label: "Joueur", gold: false });
    earned.push({ label: `${score} Correct`, gold: score >= 7 });
    earned.forEach((b) => {
        const el = document.createElement("span");
        el.className = "result-badge" + (b.gold ? " gold" : "");
        el.textContent = b.label;
        badgesEl.appendChild(el);
    });
}
function resetQuiz() {
    showPanel("quiz-start");
}
/* =========================
   SHOP: CART (saved in localStorage), WISHLIST, CHECKOUT NOTE
========================= */
const CART_KEY = "wydad-cart";
function isCartItem(x) {
    if (typeof x !== "object" || x === null)
        return false;
    const o = x;
    return typeof o.name === "string" && typeof o.price === "number";
}
function loadCart() {
    try {
        const raw = localStorage.getItem(CART_KEY);
        if (!raw)
            return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed.filter(isCartItem) : [];
    }
    catch {
        return [];
    }
}
function saveCart() {
    try {
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
    }
    catch {
        /* storage unavailable */
    }
}
let cart = loadCart();
function addToCart(name, price) {
    cart.push({ name, price });
    saveCart();
    setText("cartNote", "");
    updateCart();
}
function removeItem(index) {
    cart.splice(index, 1);
    saveCart();
    updateCart();
}
function updateCart() {
    const list = $("cartItems");
    if (!list)
        return;
    list.innerHTML = "";
    let total = 0;
    cart.forEach((item, index) => {
        total += item.price;
        const row = document.createElement("div");
        row.className = "cart-item";
        const info = document.createElement("div");
        const title = document.createElement("h4");
        title.textContent = item.name;
        const price = document.createElement("p");
        price.textContent = `$${item.price}`;
        info.append(title, price);
        const remove = document.createElement("button");
        remove.type = "button";
        remove.setAttribute("aria-label", `Remove ${item.name}`);
        remove.textContent = "✕";
        remove.addEventListener("click", () => removeItem(index));
        row.append(info, remove);
        list.appendChild(row);
    });
    setText("cartTotal", String(total));
    setText("cartCount", String(cart.length));
}
function toggleCart() {
    $("cartPanel")?.classList.toggle("active");
}
function initShop() {
    document.querySelectorAll(".wishlist-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            const on = btn.classList.toggle("active");
            btn.setAttribute("aria-pressed", String(on));
        });
    });
    $("checkoutBtn")?.addEventListener("click", () => {
        setText("cartNote", cart.length === 0
            ? "Your cart is empty."
            : "Demo shop: online checkout is not available yet.");
    });
}
/* =========================
   PLAYER POPUP (real info only, no invented stats)
========================= */
const playerPopup = $("playerPopup");
document.addEventListener("click", (e) => {
    if (!(e.target instanceof Element) || !playerPopup)
        return;
    const card = e.target.closest("#playersGrid .player-card");
    if (!card)
        return;
    const img = card.querySelector("img");
    const popupImg = $("popupImg");
    if (popupImg && img)
        popupImg.src = img.src;
    setText("popupName", card.querySelector("h3")?.textContent ?? "");
    setLine("popupPosition", card.querySelector("p")?.textContent ?? "");
    setLine("popupCountry", card.querySelector("small")?.textContent ?? "");
    if (card.dataset.new === "true") {
        setLine("popupGoals", card.dataset.from ? "From : " + card.dataset.from : "");
        setLine("popupAssists", card.dataset.note ?? "");
    }
    else {
        setLine("popupGoals", "");
        setLine("popupAssists", "");
    }
    playerPopup.classList.add("active");
});
playerPopup?.querySelector(".close-popup")?.addEventListener("click", () => {
    playerPopup?.classList.remove("active");
});
playerPopup?.addEventListener("click", (e) => {
    if (e.target === playerPopup)
        playerPopup?.classList.remove("active");
});
document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape")
        return;
    closePopup();
    playerPopup?.classList.remove("active");
    $("cartPanel")?.classList.remove("active");
    toggleMenu(false);
});
/* =========================
   TRANSFERS 2026
========================= */
const TRANSFERS_IN = [
    { name: "Adil El Khalloufi", pos: "", from: "Ittihad Yaacoub El Mansour", note: "3-year deal" },
    { name: "Rachid Ghanimi", pos: "Goalkeeper", from: "FUS Rabat", note: "3-year deal" },
    { name: "Aymane El Hassouni", pos: "Midfielder", from: "Return", note: "1-year deal" },
    { name: "Yahya Jabrane", pos: "", from: "Return", note: "" },
    { name: "Yahya Attiat-Allah", pos: "", from: "Return", note: "" },
    { name: "Hamza Jnan Allah", pos: "Left Back", from: "", note: "" },
    { name: "Nizar Al-Rashdan", pos: "", from: "Jordan", note: "Aug 2026" },
    { name: "Salaheddine Cofi", pos: "", from: "", note: "" },
];
const TRANSFERS_OUT = [
    { name: "Hakim Ziyech", pos: "Midfielder / Winger", to: "Botafogo", note: "Mutual exit" },
    { name: "Noureddine Amrabat", pos: "Forward / Midfielder", to: "FC Utrecht", note: "End of contract" },
    { name: "Zouhair El Moutaraji", pos: "Winger", to: "", note: "End of contract" },
    { name: "Hamza Sakhi", pos: "Midfielder", to: "", note: "Contract terminated" },
    { name: "Wissam Ben Yedder", pos: "Striker", to: "", note: "Departed" },
    { name: "Mohamed Rayhi", pos: "Striker", to: "", note: "Departed" },
    { name: "Amine Aboulfath", pos: "Defender", to: "Al Ahly Benghazi", note: "Transfer" },
    { name: "Ayoub Boucheta", pos: "Defender", to: "", note: "Departed" },
    { name: "Abdelali Mhamdi", pos: "Goalkeeper", to: "", note: "Departed" },
    { name: "Bart Meijers", pos: "Defender", to: "Netherlands", note: "Departed" },
    { name: "Arthur", pos: "Midfielder", to: "Brazil", note: "Departed" },
    { name: "Abdelghafour Lamirat", pos: "Midfielder", to: "RS Berkane", note: "Transfer" },
    { name: "Nabil Khali", pos: "Midfielder", to: "Kawkab Marrakech", note: "Transfer" },
    { name: "Mohamed Bouchouari", pos: "Defender", to: "", note: "Departed / Transfer" },
    { name: "Walid Sabbar", pos: "Midfielder", to: "", note: "Transfer" },
    { name: "Mohamed El Ouardi", pos: "", to: "", note: "Released" },
];
function renderTransferList(list, type, containerId) {
    const el = $(containerId);
    if (!el) {
        console.warn(`[WYDAD] #${containerId} not found in the HTML`);
        return;
    }
    if (list.length === 0) {
        el.innerHTML = '<p class="tr-empty">Ma kayn walo f had l-wa9t.</p>';
        return;
    }
    el.innerHTML = list
        .map((p) => {
        const meta = [p.pos, type === "in" ? p.from : p.to]
            .filter((s) => Boolean(s))
            .map(esc)
            .join(" · ");
        return `
            <div class="tr-card ${type} reveal-item">
                <div>
                    <h4>${esc(p.name)}</h4>
                    <small>${meta}</small>
                </div>
                ${p.note ? `<span class="tr-tag">${esc(p.note)}</span>` : ""}
            </div>`;
    })
        .join("");
}
function renderTransfers() {
    renderTransferList(TRANSFERS_IN, "in", "transfersIn");
    renderTransferList(TRANSFERS_OUT, "out", "transfersOut");
    initScrollReveal();
}
/* =========================
   MATCH CENTER (next match + live countdown)
   The match is set in data/match.json (window.WYDAD_NEXT_MATCH)
========================= */
function pad(n) {
    return String(n).padStart(2, "0");
}
function showMatchMessage(text) {
    setText("mcOver", text);
    $("mcOver")?.classList.remove("hidden");
    $("mcCountdown")?.classList.add("hidden");
}
function initMatchCenter() {
    if (!$("matchcenter"))
        return;
    const match = window.WYDAD_NEXT_MATCH ?? null;
    if (!match) {
        showMatchMessage("Next match date coming soon — check the Fixtures link.");
        return;
    }
    const target = new Date(match.dateISO).getTime();
    if (Number.isNaN(target)) {
        showMatchMessage("Invalid match date in data/match.json (dateISO).");
        return;
    }
    setText("mcCompetition", match.competition);
    setText("mcHome", match.home);
    setText("mcAway", match.away);
    setText("mcVenue", match.venue);
    setText("mcDate", new Date(target).toLocaleString("en-GB", { dateStyle: "full", timeStyle: "short" }));
    const tick = () => {
        const diff = target - Date.now();
        if (diff <= 0) {
            showMatchMessage("Kick-off time has passed — update data/match.json with the next match.");
            return false;
        }
        const s = Math.floor(diff / 1000);
        setText("mcD", String(Math.floor(s / 86400)));
        setText("mcH", pad(Math.floor((s % 86400) / 3600)));
        setText("mcM", pad(Math.floor((s % 3600) / 60)));
        setText("mcS", pad(s % 60));
        return true;
    };
    if (tick()) {
        const id = window.setInterval(() => {
            if (!tick())
                window.clearInterval(id);
        }, 1000);
    }
}
/* =========================
   GUESS THE PLAYER
   Players come automatically from the cards in #playersGrid
   (only those whose photo file really exists).
========================= */
const GUESS_ALIASES = {
    "img/hannouri.jpg": ["hannouri", "hanouri"],
};
const GUESS_MAX_TRIES = 5;
const GUESS_BEST_KEY = "wydad-guess-best";
const GUESS_FALLBACK_IMG = "https://placehold.co/320x320/161616/CC0000?text=%3F";
function normalizeName(value) {
    return value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, " ")
        .trim();
}
function isCorrectGuess(player, guess) {
    const g = normalizeName(guess);
    if (!g)
        return false;
    const full = normalizeName(player.name);
    const parts = full.split(" ");
    const keys = new Set([full, ...(player.aliases ?? []).map(normalizeName)]);
    const last = parts[parts.length - 1];
    if (last && last.length >= 4)
        keys.add(last);
    return keys.has(g);
}
function loadGuessBest() {
    try {
        const n = Number(localStorage.getItem(GUESS_BEST_KEY));
        return Number.isFinite(n) && n > 0 ? n : 0;
    }
    catch {
        return 0;
    }
}
function saveGuessBest(n) {
    try {
        localStorage.setItem(GUESS_BEST_KEY, String(n));
    }
    catch {
        /* storage unavailable */
    }
}
function getGuessPool() {
    const pool = [];
    document.querySelectorAll("#playersGrid .player-card").forEach((card) => {
        const name = card.querySelector("h3")?.textContent?.trim();
        const src = card.querySelector("img")?.getAttribute("src");
        if (!name || !src)
            return;
        pool.push({ name, img: src, aliases: GUESS_ALIASES[src] });
    });
    return pool;
}
function canLoadImage(src) {
    return new Promise((resolve) => {
        const probe = new Image();
        const timer = window.setTimeout(() => resolve(false), 4000);
        probe.onload = () => { window.clearTimeout(timer); resolve(true); };
        probe.onerror = () => { window.clearTimeout(timer); resolve(false); };
        probe.src = src;
    });
}
async function initGuessGame() {
    const img = $("gpImg");
    const input = $("gpInput");
    const guessBtn = $("gpGuess");
    const nextBtn = $("gpNext");
    const form = $("gpForm");
    if (!img || !input || !guessBtn || !nextBtn || !form)
        return;
    const candidates = getGuessPool();
    const loadable = await Promise.all(candidates.map((p) => canLoadImage(p.img)));
    const pool = candidates.filter((_p, i) => loadable[i]);
    if (pool.length === 0) {
        setText("gpMsg", "Zid sowar dial l-joueurs f img/ bach tkhdem l-lo3ba.");
        form.classList.add("hidden");
        return;
    }
    let best = loadGuessBest();
    let streak = 0;
    let tries = 0;
    let done = false;
    let bag = [];
    let current;
    const blurFor = (t) => Math.max(0, 24 - t * 5);
    const updateStats = () => {
        setText("gpTries", String(tries));
        setText("gpStreak", String(streak));
        setText("gpBest", String(best));
    };
    const finishRound = () => {
        done = true;
        img.style.filter = "none";
        input.disabled = true;
        guessBtn.disabled = true;
        form.classList.add("hidden");
        nextBtn.classList.remove("hidden");
        updateStats();
    };
    const newRound = () => {
        if (bag.length === 0)
            bag = shuffle(pool);
        current = bag.pop();
        if (!current)
            return;
        tries = 0;
        done = false;
        img.src = current.img;
        img.style.filter = `blur(${blurFor(0)}px) grayscale(1)`;
        input.value = "";
        input.disabled = false;
        guessBtn.disabled = false;
        form.classList.remove("hidden");
        nextBtn.classList.add("hidden");
        setText("gpMsg", "Chkoun had l-joueur?");
        updateStats();
    };
    const submit = () => {
        if (done || !current)
            return;
        const value = input.value;
        if (!value.trim()) {
            setText("gpMsg", "Ktb ism l-joueur.");
            return;
        }
        if (isCorrectGuess(current, value)) {
            streak++;
            if (streak > best) {
                best = streak;
                saveGuessBest(best);
            }
            setText("gpMsg", `✓ Brav! Howa ${current.name}`);
            finishRound();
            return;
        }
        tries++;
        if (tries >= GUESS_MAX_TRIES) {
            streak = 0;
            setText("gpMsg", `✗ Salat l-m7awalat. L-jawab: ${current.name}`);
            finishRound();
            return;
        }
        img.style.filter = `blur(${blurFor(tries)}px) grayscale(1)`;
        setText("gpMsg", `✗ Ghalat. Bqa lik ${GUESS_MAX_TRIES - tries} m7awalat.`);
        updateStats();
        input.select();
    };
    img.addEventListener("error", () => {
        if (!img.src.includes("placehold.co"))
            img.src = GUESS_FALLBACK_IMG;
    });
    guessBtn.addEventListener("click", submit);
    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            submit();
        }
    });
    nextBtn.addEventListener("click", newRound);
    newRound();
}
/* =========================
   LOAD DATA FROM JSON  (fetch + fallback)
   Needs a server (Live Server / GitHub Pages). On file:// it falls back to the built-in data.
========================= */
async function loadJSON(path, fallback) {
    try {
        const res = await fetch(path);
        if (!res.ok)
            throw new Error(`HTTP ${res.status}`);
        return await res.json();
    }
    catch (err) {
        console.warn(`[WYDAD] could not load ${path}, using built-in data.`, err);
        return fallback;
    }
}
/* =========================
   INIT  (each step is isolated: one failure never stops the others)
========================= */
function safe(label, fn) {
    try {
        fn();
    }
    catch (err) {
        console.error(`[WYDAD] ${label} failed:`, err);
    }
}
document.addEventListener("DOMContentLoaded", async () => {
    safe("theme", initTheme);
    RESULTS = await loadJSON("data/results.json", RESULTS);
    const matchData = await loadJSON("data/match.json", { next: null });
    window.WYDAD_NEXT_MATCH = matchData.next ?? null;
    safe("results", renderResults);
    safe("transfers", renderTransfers);
    safe("match center", initMatchCenter);
    safe("shop", initShop);
    safe("cart", updateCart);
    safe("scroll reveal", initScrollReveal);
    safe("scroll spy", initScrollSpy);
    void initGuessGame().catch((err) => console.error("[WYDAD] guess game failed:", err));
});// =====================================================
//  NEXT MATCH  -  the only thing you edit for Match Center
// -----------------------------------------------------
//  1) Find the real date/time of the next match (see the "Fixtures" link on the site).
//  2) Replace the line "window.WYDAD_NEXT_MATCH = null;" by the block in the example below.
//  3) dateISO format:  YYYY-MM-DDTHH:MM:SS+01:00   (Morocco time; +00:00 during Ramadan)
//  Until you do, the Match Center shows "date coming soon" (no fake data).
// =====================================================

window.WYDAD_NEXT_MATCH = null;

// EXAMPLE (NOT a real fixture - replace with the real one):
//
// window.WYDAD_NEXT_MATCH = {
//     competition: "Botola Pro",
//     home: "Wydad",
//     away: "Opponent name",
//     dateISO: "2026-11-01T18:00:00+01:00",
//     venue: "Stade Mohamed V, Casablanca"
// };