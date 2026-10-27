"use strict";

/* Translation helper (see js/i18n.js) */
const T = (key, vars) => (window.I18N ? window.I18N.t(key, vars) : key);

/* =========================
   SETTINGS
========================= */
// DEMO ONLY: these checks run in the browser, so anyone can read or bypass them.
// A real login (and the lockout) must be done on a server.
const DEMO_USERNAME = "wydad";
const DEMO_PASSWORD = "1234";
const REDIRECT_TO = "index.html";

const MAX_ATTEMPTS = 2;      // wrong tries before the ball explodes
const LOCK_SECONDS = 30;     // how long the form stays locked after the explosion
const LOCK_KEY = "wydadLockUntil";
const REMEMBER_KEY = "wydadRememberedUser";
const SOUND = true;          // short "boom" sound when the ball explodes

/* =========================
   ELEMENTS
========================= */
const scene = document.getElementById("scene");
const lamp = document.getElementById("lamp");
const switchLight = document.getElementById("switchLight");
const loginCard = document.getElementById("loginCard");
const form = document.getElementById("loginForm");
const username = document.getElementById("username");
const password = document.getElementById("password");
const message = document.getElementById("message");
const showPassword = document.getElementById("showPassword");
const remember = document.getElementById("remember");
const fillDemo = document.getElementById("fillDemo");
const submitBtn = form.querySelector(".submit-btn");
const socialBtns = Array.from(document.querySelectorAll(".social-btn"));
const ball = document.getElementById("ball");
const ballStage = document.getElementById("ballStage");
const attemptsEl = document.getElementById("attempts");
const lightBeam = document.querySelector(".light-beam");

let attemptsLeft = MAX_ATTEMPTS;
let lockTimer = null;

/* =========================
   MESSAGES
========================= */
let msgState = null; // last translated message, so it can be re-translated
function setMessage(text, type) {
  msgState = null;
  message.textContent = text;
  message.className = type || "";
}
function setMessageKey(key, vars, type) {
  setMessage(T(key, vars), type);
  msgState = { key, vars, type };
}

function shakeCard() {
  loginCard.classList.remove("shake");
  void loginCard.offsetWidth; // restart the animation
  loginCard.classList.add("shake");
}

/* =========================
   LAMP: light ON shows the login, light OFF hides it
========================= */
function updateLightLabels(on) {
  lamp.setAttribute("aria-label", T(on ? "lamp.aria.off" : "lamp.aria.on"));
  switchLight.textContent = T(on ? "login.off" : "login.on");
}

function setLight(on) {
  scene.classList.toggle("is-on", on);
  loginCard.toggleAttribute("inert", !on); // form is locked while the light is off

  lamp.setAttribute("aria-pressed", String(on));
  switchLight.setAttribute("aria-pressed", String(on));
  updateLightLabels(on);

  if (on) {
    window.setTimeout(() => {
      if (scene.classList.contains("is-on") && !username.disabled) {
        username.focus({ preventScroll: true });
      }
    }, 700);
  } else {
    if (!isLocked()) setMessage("", "");
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
  }
}

function toggleLight() {
  lamp.classList.remove("pulled");
  void lamp.offsetWidth;
  lamp.classList.add("pulled"); // chain-pull animation
  window.setTimeout(() => lamp.classList.remove("pulled"), 450);
  setLight(!scene.classList.contains("is-on"));
}

lamp.addEventListener("click", toggleLight);
switchLight.addEventListener("click", toggleLight);

/* dust floating in the light beam */
function buildDust() {
  if (!lightBeam) return;
  for (let i = 0; i < 22; i++) {
    const mote = document.createElement("i");
    const size = 2 + Math.random() * 3;
    mote.className = "mote";
    mote.style.left = 8 + Math.random() * 84 + "%";
    mote.style.top = Math.random() * 90 + "%";
    mote.style.width = mote.style.height = size + "px";
    mote.style.setProperty("--d", 7 + Math.random() * 8 + "s");
    mote.style.setProperty("--delay", -Math.random() * 10 + "s");
    mote.style.setProperty("--x", (Math.random() - 0.5) * 70 + "px");
    mote.style.setProperty("--y", -(30 + Math.random() * 90) + "px");
    lightBeam.appendChild(mote);
  }
}
buildDust();

/* =========================
   SHOW / HIDE PASSWORD
========================= */
function updateShowLabels() {
  const hidden = password.type === "password";
  showPassword.textContent = T(hidden ? "login.show" : "login.hide");
  showPassword.setAttribute("aria-label", T(hidden ? "login.showAria" : "login.hideAria"));
}

showPassword.addEventListener("click", () => {
  const isHidden = password.type === "password";
  password.type = isHidden ? "text" : "password";
  updateShowLabels();
});

/* =========================
   REMEMBER ME + DEMO ACCOUNT
========================= */
try {
  const savedUser = localStorage.getItem(REMEMBER_KEY);
  if (savedUser) {
    username.value = savedUser;
    remember.checked = true;
  }
} catch (err) {
  /* storage unavailable */
}

fillDemo.addEventListener("click", () => {
  username.value = DEMO_USERNAME;
  password.value = DEMO_PASSWORD;
  setMessage("", "");
  submitBtn.focus();
});

/* =========================
   FOOTBALL: attempts, cracks, explosion
========================= */
function renderAttempts() {
  attemptsEl.querySelectorAll("i").forEach((dot, i) => {
    dot.classList.toggle("lost", i >= attemptsLeft);
  });
  attemptsEl.setAttribute("aria-label", T("login.attemptsAria", { n: attemptsLeft }));
  ball.classList.toggle("cracked", attemptsLeft > 0 && attemptsLeft < MAX_ATTEMPTS);
}

/* short synthesized "boom" (no audio file needed) */
function playBoom() {
  if (!SOUND) return;
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    const length = Math.floor(ctx.sampleRate * 0.8);
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 3);
    }
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 650;
    const gain = ctx.createGain();
    gain.gain.value = 0.55;
    src.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    src.start();
    window.setTimeout(() => ctx.close(), 1200);
  } catch (err) {
    /* audio not available */
  }
}

/* pieces of the ball flying everywhere */
function burstAt(x, y) {
  const layer = document.createElement("div");
  layer.className = "fx-layer";
  document.body.appendChild(layer);

  const shardColors = ["#f4f4f4", "#151515", "#e10613", "#f4f4f4", "#151515"];
  const sparkColors = ["#ffd78a", "#ff7a18", "#ff3b30", "#fff3cf"];

  for (let i = 0; i < 40; i++) {
    const isShard = i < 16;
    const piece = document.createElement("i");
    piece.className = isShard ? "shard" : "spark";
    const color = isShard
      ? shardColors[i % shardColors.length]
      : sparkColors[i % sparkColors.length];
    piece.style.background = color;
    piece.style.color = color;
    piece.style.left = x + "px";
    piece.style.top = y + "px";
    if (isShard) {
      const size = 10 + Math.random() * 16;
      piece.style.width = piece.style.height = size + "px";
    }
    layer.appendChild(piece);

    const angle = Math.random() * Math.PI * 2;
    const distance = (isShard ? 140 : 90) + Math.random() * (isShard ? 360 : 300);
    const dx = Math.cos(angle) * distance;
    const dy = Math.sin(angle) * distance + (isShard ? 120 : 40); // a bit of gravity
    const spin = (Math.random() - 0.5) * 900;

    if (typeof piece.animate === "function") {
      piece.animate(
        [
          { transform: "translate(0,0) rotate(0deg) scale(1)", opacity: 1 },
          { transform: `translate(${dx}px,${dy}px) rotate(${spin}deg) scale(${isShard ? 0.7 : 0.2})`, opacity: 0 }
        ],
        {
          duration: 900 + Math.random() * 700,
          easing: "cubic-bezier(.1,.75,.3,1)",
          fill: "forwards"
        }
      );
    }
  }

  const flash = document.createElement("div");
  flash.className = "flash";
  document.body.appendChild(flash);

  window.setTimeout(() => {
    layer.remove();
    flash.remove();
  }, 1800);
}

function explodeBall() {
  const rect = ball.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;

  ball.classList.remove("cracked", "reform", "goal");
  ball.classList.add("exploded");

  ballStage.classList.remove("boom");
  void ballStage.offsetWidth;
  ballStage.classList.add("boom");

  scene.classList.remove("rumble");
  void scene.offsetWidth;
  scene.classList.add("rumble");

  burstAt(x, y);
  playBoom();
}

/* =========================
   LOCKOUT (after the explosion)
========================= */
function isLocked() {
  try {
    return Number(localStorage.getItem(LOCK_KEY)) > Date.now();
  } catch (err) {
    return lockTimer !== null;
  }
}

function setControlsDisabled(disabled) {
  [username, password, remember, showPassword, fillDemo, submitBtn, ...socialBtns].forEach((el) => {
    el.disabled = disabled;
  });
  loginCard.classList.toggle("locked", disabled);
}

function startLockout(until, withEffects) {
  try {
    localStorage.setItem(LOCK_KEY, String(until));
  } catch (err) {
    /* storage unavailable */
  }
  setControlsDisabled(true);

  if (withEffects) {
    explodeBall();
  } else {
    ball.classList.remove("cracked");
    ball.classList.add("exploded");
  }
  attemptsLeft = 0;
  renderAttempts();

  window.clearInterval(lockTimer);
  const tick = () => {
    const secondsLeft = Math.ceil((until - Date.now()) / 1000);
    if (secondsLeft <= 0) {
      endLockout();
      return;
    }
    setMessageKey("login.locked", { s: secondsLeft }, "error");
  };
  tick();
  lockTimer = window.setInterval(tick, 1000);
}

function endLockout() {
  window.clearInterval(lockTimer);
  lockTimer = null;
  try {
    localStorage.removeItem(LOCK_KEY);
  } catch (err) {
    /* storage unavailable */
  }

  attemptsLeft = MAX_ATTEMPTS;
  ball.classList.remove("exploded", "cracked");
  ball.classList.remove("reform");
  void ball.getBoundingClientRect();
  ball.classList.add("reform"); // a fresh ball appears
  window.setTimeout(() => ball.classList.remove("reform"), 900);

  renderAttempts();
  setControlsDisabled(false);
  setMessageKey("login.newBall", null, "info");
}

/* =========================
   LOGIN
========================= */
form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (isLocked()) return;

  const user = username.value.trim();

  if (!user || !password.value) {
    setMessageKey("login.err.empty", null, "error");
    shakeCard();
    return;
  }

  if (user.toLowerCase() === DEMO_USERNAME && password.value === DEMO_PASSWORD) {
    try {
      sessionStorage.setItem("wydadDemoLoggedIn", "true");
      if (remember.checked) localStorage.setItem(REMEMBER_KEY, user);
      else localStorage.removeItem(REMEMBER_KEY);
    } catch (err) {
      /* storage unavailable: continue anyway */
    }
    ball.classList.remove("cracked");
    ball.classList.add("goal"); // GOAL!
    setMessageKey("login.goal", null, "success");
    setControlsDisabled(true);
    window.setTimeout(() => {
      window.location.href = REDIRECT_TO;
    }, 1300);
    return;
  }

  // wrong credentials
  attemptsLeft -= 1;
  password.value = "";
  shakeCard();

  if (attemptsLeft <= 0) {
    startLockout(Date.now() + LOCK_SECONDS * 1000, true);
  } else {
    renderAttempts();
    setMessageKey("login.err.wrong", { n: attemptsLeft }, "warn");
    password.focus();
  }
});

/* =========================
   SOCIAL BUTTONS (demo: not connected to any real provider)
========================= */
socialBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    if (isLocked()) return;
    const provider = btn.dataset.provider || "This provider";
    setMessageKey("login.social", { provider }, "info");
  });
});

/* =========================
   START: restore an unfinished lockout, draw the dots
========================= */
renderAttempts();
try {
  const until = Number(localStorage.getItem(LOCK_KEY));
  if (until > Date.now()) startLockout(until, false);
} catch (err) {
  /* storage unavailable */
}

/* =========================
   GUEST ACCESS (so visitors of the GitHub demo are not blocked)
========================= */
document.getElementById("guestBtn")?.addEventListener("click", () => {
  try {
    sessionStorage.setItem("wydadDemoLoggedIn", "true");
  } catch (err) {
    /* storage unavailable */
  }
  window.location.href = REDIRECT_TO;
});

/* =========================
   LANGUAGE (EN / FR / AR)
========================= */
function refreshLoginLanguage() {
  updateLightLabels(scene.classList.contains("is-on"));
  updateShowLabels();
  renderAttempts();
  if (msgState) setMessageKey(msgState.key, msgState.vars, msgState.type);
}
document.addEventListener("langchange", refreshLoginLanguage);
if (window.I18N) window.I18N.init();
