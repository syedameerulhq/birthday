/* ═══════════════════════════════════════════════════════════
   app.js  —  Ruhi Birthday Interactive Site
   Put music.mp3 in the same folder as this file.
═══════════════════════════════════════════════════════════ */

'use strict';

/* ─────────────────────────────────
   CURSOR
───────────────────────────────── */
const cursorRing = document.getElementById('cursor');
const cursorDot  = document.getElementById('cursor-dot');
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;

document.addEventListener('mousemove', e => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  cursorRing.style.left = mouseX + 'px';
  cursorRing.style.top  = mouseY + 'px';
  cursorDot.style.left  = mouseX + 'px';
  cursorDot.style.top   = mouseY + 'px';
  maybeSparkle(mouseX, mouseY);
});

document.addEventListener('mousedown', () => cursorRing.classList.add('clicking'));
document.addEventListener('mouseup',   () => cursorRing.classList.remove('clicking'));

// Larger cursor on interactive elements
document.querySelectorAll('button, .wish-card, .memory-tile, .clap-btn, .cake-wrap, .quiz-opt, .balloon')
  .forEach(el => {
    el.addEventListener('mouseenter', () => cursorRing.classList.add('hovering'));
    el.addEventListener('mouseleave', () => cursorRing.classList.remove('hovering'));
  });

// Click ripple
document.addEventListener('click', e => {
  spawnRipple(e.clientX, e.clientY);
});
document.addEventListener('touchstart', e => {
  const t = e.touches[0];
  spawnRipple(t.clientX, t.clientY);
}, { passive: true });

function spawnRipple(x, y) {
  const r = document.createElement('div');
  r.className = 'ripple';
  r.style.left = x + 'px';
  r.style.top  = y + 'px';
  document.body.appendChild(r);
  setTimeout(() => r.remove(), 700);
}

/* ─────────────────────────────────
   SPARKLE TRAIL
───────────────────────────────── */
const sparkEmojis = ['✨','⭐','🌟','💫','🎊','🎉','🌸','🎈','💥'];
let sparkCooldown = false;

function maybeSparkle(x, y) {
  if (sparkCooldown) return;
  sparkCooldown = true;
  setTimeout(() => sparkCooldown = false, 70);
  if (Math.random() > 0.55) return;

  const s = document.createElement('div');
  s.className = 'spark';
  s.textContent = sparkEmojis[Math.floor(Math.random() * sparkEmojis.length)];
  s.style.left = x + 'px';
  s.style.top  = y + 'px';
  const ang  = Math.random() * Math.PI * 2;
  const dist = 18 + Math.random() * 42;
  s.style.setProperty('--dx', Math.cos(ang) * dist + 'px');
  s.style.setProperty('--dy', Math.sin(ang) * dist + 'px');
  s.style.animationDuration = (0.45 + Math.random() * 0.5) + 's';
  document.body.appendChild(s);
  setTimeout(() => s.remove(), 950);
}

/* ─────────────────────────────────
   BACKGROUND CANVAS PARTICLES
───────────────────────────────── */
const cv = document.getElementById('canvas');
const cx = cv.getContext('2d');

function resizeCanvas() {
  cv.width  = window.innerWidth;
  cv.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

const bgEmojis = ['🎉','✨','🎊','💫','🌟','🎈','🎀','⭐','🌸'];
const bgParticles = Array.from({ length: 30 }, () => makeBgParticle());

function makeBgParticle() {
  return {
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    e: bgEmojis[Math.floor(Math.random() * bgEmojis.length)],
    s:  9 + Math.random() * 18,
    sp: 0.15 + Math.random() * 0.55,
    o:  0.08 + Math.random() * 0.3,
    w:  Math.random() * Math.PI * 2,
    ws: 0.012 + Math.random() * 0.022,
    d:  (Math.random() - 0.5) * 0.35,
  };
}

(function drawBg() {
  cx.clearRect(0, 0, cv.width, cv.height);
  bgParticles.forEach(p => {
    p.y -= p.sp;
    p.w += p.ws;
    p.x += Math.sin(p.w) * 0.7 + p.d;
    if (p.y < -40) { Object.assign(p, makeBgParticle()); p.y = cv.height + 30; p.x = Math.random() * cv.width; }
    cx.save();
    cx.globalAlpha = p.o;
    cx.font = p.s + 'px serif';
    cx.fillText(p.e, p.x, p.y);
    cx.restore();
  });
  requestAnimationFrame(drawBg);
})();

/* ─────────────────────────────────
   MUSIC  (mp3)
───────────────────────────────── */
const audio     = document.getElementById('bg-audio');
const badge     = document.getElementById('music-badge');
const badgeText = document.getElementById('badge-text');
let musicOn = false;

document.getElementById('gate-btn').addEventListener('click', startExperience);

function startExperience() {
  // Play mp3
  audio.volume = 0.55;
  audio.play().then(() => {
    musicOn = true;
    badge.classList.remove('paused');
    badgeText.textContent = 'Jannat Theme ♫';
  }).catch(() => {
    // If still blocked (very rare after user tap), show badge anyway
    badgeText.textContent = 'Tap badge to play ♫';
  });

  // Hide gate
  document.getElementById('music-gate').classList.add('gone');

  // Confetti burst
  spawnConfetti(110);

  // Show badge after animation
  setTimeout(() => badge.classList.add('visible'), 900);
}

badge.addEventListener('click', toggleMusic);

function toggleMusic() {
  if (musicOn) {
    audio.pause();
    musicOn = false;
    badge.classList.add('paused');
    badgeText.textContent = 'Paused';
  } else {
    audio.play();
    musicOn = true;
    badge.classList.remove('paused');
    badgeText.textContent = 'Jannat Theme ♫';
  }
}

/* ─────────────────────────────────
   CONFETTI
───────────────────────────────── */
const confColors = ['#ff4d8d','#a855f7','#fbbf24','#22d3ee','#4ade80','#fff','#f97316','#ec4899'];

function spawnConfetti(n = 60) {
  for (let i = 0; i < n; i++) {
    const c = document.createElement('div');
    c.className = 'confetto';
    c.style.left    = (Math.random() * 100) + 'vw';
    c.style.top     = '-12px';
    c.style.width   = (5 + Math.random() * 9)  + 'px';
    c.style.height  = (5 + Math.random() * 9)  + 'px';
    c.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
    c.style.background   = confColors[Math.floor(Math.random() * confColors.length)];
    c.style.setProperty('--cx', (Math.random() * 90 - 45) + 'px');
    c.style.animationDuration = (2.2 + Math.random() * 2.8) + 's';
    c.style.animationDelay    = (Math.random() * 1.2) + 's';
    document.body.appendChild(c);
    setTimeout(() => c.remove(), 6500);
  }
}

/* ─────────────────────────────────
   WEB AUDIO  (UI tones)
───────────────────────────────── */
let audioCtx;
function playTone(freq = 440, vol = 0.12, dur = 0.18, type = 'sine') {
  try {
    if (!audioCtx) audioCtx = new AudioContext();
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.connect(g); g.connect(audioCtx.destination);
    o.type = type;
    o.frequency.value = freq;
    g.gain.setValueAtTime(vol, audioCtx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
    o.start(); o.stop(audioCtx.currentTime + dur);
  } catch(_) {}
}

/* ─────────────────────────────────
   TYPEWRITER (hero subtitle)
───────────────────────────────── */
const typeEl  = document.getElementById('typewriter-el');
const typeMsg = "Today is all about you, Ruhi ✨";
let ti = 0;

// inject blinking cursor span
const blinkSpan = document.createElement('span');
blinkSpan.className = 'cursor-blink';
typeEl.appendChild(blinkSpan);

function typeChar() {
  if (ti < typeMsg.length) {
    typeEl.insertBefore(document.createTextNode(typeMsg[ti++]), blinkSpan);
    setTimeout(typeChar, 55 + Math.random() * 45);
  }
}
setTimeout(typeChar, 1600);

/* ─────────────────────────────────
   SCROLL CTA
───────────────────────────────── */
document.getElementById('scroll-cta').addEventListener('click', () => {
  document.getElementById('balloon-section').scrollIntoView({ behavior: 'smooth' });
});

/* ─────────────────────────────────
   CAKE CLICK
───────────────────────────────── */
const cakeEmojis  = ['🎂','🎉','🎊','🥳','✨','💃','🎈','🌟','🔥','🎁'];
const popEmojis   = ['🕯️','✨','🎉','💫','🌟','🎊','🥳','🫧','💥'];
let cakeClicks    = 0;

document.getElementById('cake-wrap').addEventListener('click', () => {
  cakeClicks++;
  const emojiEl = document.getElementById('cake-emoji');
  const hint    = document.getElementById('cake-hint');

  emojiEl.textContent = cakeEmojis[cakeClicks % cakeEmojis.length];

  // update hint
  const hints = ['tap again!', 'keep going!', 'you\'re on fire 🔥', 'legend!', '🎂 keep tapping!'];
  hint.textContent = hints[cakeClicks % hints.length];

  // floating popup
  const wrap = document.getElementById('cake-wrap');
  const pop  = document.createElement('div');
  pop.className   = 'candle-popup';
  pop.textContent = popEmojis[Math.floor(Math.random() * popEmojis.length)];
  wrap.appendChild(pop);
  setTimeout(() => pop.remove(), 1500);

  playTone(380 + cakeClicks * 18, 0.13, 0.18);
  if (cakeClicks % 5 === 0) spawnConfetti(35);
});

/* ─────────────────────────────────
   BALLOON POP GAME
───────────────────────────────── */
const arena       = document.getElementById('balloon-arena');
const scoreEl     = document.getElementById('balloon-score');
let   balloonPops = 0;
const balloonFaces = ['🎈','🎀','🎁','🎊','🎉','💜','💖','💛','🌟','✨'];

function spawnBalloon() {
  const b = document.createElement('div');
  b.className   = 'balloon';
  b.textContent = balloonFaces[Math.floor(Math.random() * balloonFaces.length)];

  const leftPct  = 5 + Math.random() * 88;
  const duration = 4 + Math.random() * 5;
  const tilt     = (Math.random() - 0.5) * 20;

  b.style.left   = leftPct + '%';
  b.style.bottom = '-60px';
  b.style.setProperty('--tilt', tilt + 'deg');
  b.style.animationDuration = duration + 's';

  b.addEventListener('click',      () => popBalloon(b));
  b.addEventListener('touchstart', e => { e.preventDefault(); popBalloon(b); }, { passive: false });

  arena.appendChild(b);

  // auto-remove when off screen
  setTimeout(() => { if (b.parentNode) b.remove(); }, (duration + 0.5) * 1000);
}

function popBalloon(el) {
  if (el.classList.contains('popped')) return;
  el.classList.add('popped');
  balloonPops++;
  scoreEl.textContent = balloonPops;
  playTone(500 + Math.random() * 300, 0.14, 0.15);
  spawnConfetti(8);
  if (balloonPops % 10 === 0) spawnConfetti(50);
  setTimeout(() => el.remove(), 350);
}

// Spawn balloons on a staggered interval
function scheduleBalloon() {
  spawnBalloon();
  setTimeout(scheduleBalloon, 800 + Math.random() * 1200);
}
scheduleBalloon();

/* ─────────────────────────────────
   WISH CARDS
───────────────────────────────── */
document.querySelectorAll('.wish-card').forEach(card => {
  card.addEventListener('click', () => {
    card.style.transform = 'translateY(-10px) scale(0.96)';
    setTimeout(() => card.style.transform = '', 220);
    spawnConfetti(12);
    playTone(520, 0.1, 0.2);
  });
});

/* ─────────────────────────────────
   SCRATCH CARD
───────────────────────────────── */
(function initScratch() {
  const sc   = document.getElementById('scratchCanvas');
  const sctx = sc.getContext('2d');

  // Responsive canvas width
  const maxW = Math.min(360, window.innerWidth - 48);
  sc.width  = maxW;
  sc.height = Math.round(maxW * (200 / 360));

  // Draw overlay
  const grad = sctx.createLinearGradient(0, 0, sc.width, sc.height);
  grad.addColorStop(0,   '#6b21a8');
  grad.addColorStop(0.5, '#9333ea');
  grad.addColorStop(1,   '#7c3aed');
  sctx.fillStyle = grad;
  sctx.fillRect(0, 0, sc.width, sc.height);

  // Overlay text
  sctx.fillStyle    = 'rgba(255,255,255,0.55)';
  sctx.textAlign    = 'center';
  sctx.textBaseline = 'middle';
  sctx.font         = `bold ${Math.round(sc.width * 0.05)}px DM Sans, sans-serif`;
  sctx.fillText('✨ Scratch Here ✨', sc.width / 2, sc.height / 2 - sc.height * 0.1);
  sctx.font = `${Math.round(sc.width * 0.038)}px DM Sans, sans-serif`;
  sctx.fillText('Your secret birthday message awaits', sc.width / 2, sc.height / 2 + sc.height * 0.12);

  let scratching = false;
  let scratchPct = 0;
  const hintEl   = document.getElementById('scratch-hint');

  function scratch(x, y) {
    sctx.globalCompositeOperation = 'destination-out';
    sctx.beginPath();
    sctx.arc(x, y, sc.width * 0.072, 0, Math.PI * 2);
    sctx.fill();
    scratchPct = Math.min(scratchPct + 1.1, 100);
    if (scratchPct > 60) {
      hintEl.textContent = '🎉 You found the message!';
      hintEl.style.color = '#fbbf24';
    }
    if (scratchPct > 90) {
      sctx.clearRect(0, 0, sc.width, sc.height);
      scratchPct = 100;
    }
  }

  sc.addEventListener('mousedown',  ()  => scratching = true);
  sc.addEventListener('mouseup',    ()  => scratching = false);
  sc.addEventListener('mouseleave', ()  => scratching = false);
  sc.addEventListener('mousemove',  e   => {
    if (!scratching) return;
    const r = sc.getBoundingClientRect();
    scratch(e.clientX - r.left, e.clientY - r.top);
  });
  sc.addEventListener('touchstart', e   => { scratching = true; e.preventDefault(); }, { passive: false });
  sc.addEventListener('touchend',   ()  => scratching = false);
  sc.addEventListener('touchmove',  e   => {
    if (!scratching) return;
    e.preventDefault();
    const t = e.touches[0], r = sc.getBoundingClientRect();
    scratch(t.clientX - r.left, t.clientY - r.top);
  }, { passive: false });
})();

/* ─────────────────────────────────
   MEMORY TILES  (touch support)
───────────────────────────────── */
document.querySelectorAll('.memory-tile').forEach(tile => {
  tile.addEventListener('touchstart', () => {
    tile.classList.toggle('tapped');
  }, { passive: true });
});

/* ─────────────────────────────────
   AGE CALCULATOR  (FIXED ✅)
   Shows exact age since birth date
───────────────────────────────── */

// Default: born 22 April, year unknown — we'll use 2003 as a placeholder
// The user can enter the real year via the input below.
let birthYear = 2005; // ← CHANGE THIS to Ruhi's real birth year!

function calcAge() {
  // Birth date: use the birth year + April 22
  const born = new Date(birthYear, 3, 22, 0, 0, 0); // month is 0-indexed, 3 = April
  const now  = new Date();

  let diff = now - born; // ms
  if (diff < 0) diff = 0;

  // Years
  let years = now.getFullYear() - born.getFullYear();
  const hadBirthdayThisYear =
    now.getMonth() > born.getMonth() ||
    (now.getMonth() === born.getMonth() && now.getDate() >= born.getDate());
  if (!hadBirthdayThisYear) years--;

  // Months since last birthday
  const lastBirthday = new Date(
    now.getFullYear() - (hadBirthdayThisYear ? 0 : 1),
    born.getMonth(),
    born.getDate()
  );
  let months = now.getMonth() - lastBirthday.getMonth();
  if (now.getDate() < lastBirthday.getDate()) months--;
  if (months < 0) months += 12;

  // Total days alive
  const totalDays  = Math.floor(diff / 86400000);
  // Days since last month-birthday
  const lastMonthBday = new Date(now.getFullYear(), now.getMonth() - (now.getDate() < born.getDate() ? 1 : 0), born.getDate());
  const daysThisMonth = Math.floor((now - lastMonthBday) / 86400000);

  // Hours / mins / secs (current time of day)
  const hours = now.getHours();
  const mins  = now.getMinutes();
  const secs  = now.getSeconds();

  // Headline
  document.getElementById('age-headline').textContent =
    `She's been amazing for ${years} year${years !== 1 ? 's' : ''}, ${months} month${months !== 1 ? 's' : ''} & ${daysThisMonth} days!`;

  // Update boxes with tick animation
  function setVal(id, val) {
    const el = document.getElementById(id);
    if (el.textContent !== String(val)) {
      el.textContent = val;
      el.classList.remove('tick');
      void el.offsetWidth; // reflow
      el.classList.add('tick');
      setTimeout(() => el.classList.remove('tick'), 200);
    }
  }

  setVal('a-years',  years);
  setVal('a-months', months);
  setVal('a-days',   daysThisMonth);
  setVal('a-hours',  hours);
  setVal('a-mins',   mins);
  setVal('a-secs',   secs);
}

calcAge();
setInterval(calcAge, 1000); // live seconds!

// Birth year input
document.getElementById('set-year-btn').addEventListener('click', () => {
  const val = parseInt(document.getElementById('birth-year').value, 10);
  if (val >= 1990 && val <= 2015) {
    birthYear = val;
    calcAge();
    playTone(550, 0.12, 0.2);
    spawnConfetti(20);
  } else {
    document.getElementById('birth-year').style.borderColor = '#ef4444';
    setTimeout(() => document.getElementById('birth-year').style.borderColor = '', 1500);
  }
});

/* ─────────────────────────────────
   CLAP BUTTON
───────────────────────────────── */
let clapN = 0;
const clapEmojisArr = ['👏','🎉','🌟','✨','💯','🙌','🔥','🎊','💃','🥳'];
const milestones = {
  1:'First clap! 🎉',
  5:'5 wishes sent! 🌟',
  10:'10! She feels it 🔥',
  25:'25 claps! Legendary 🏆',
  50:'50!! You really care 💯',
  100:'100 CLAPS! Absolute icon 🎊',
  200:'200!!! What a champion 🏅',
};

document.getElementById('clap-btn').addEventListener('click', doClap);
document.getElementById('clap-btn').addEventListener('touchstart', e => {
  e.preventDefault(); doClap();
}, { passive: false });

function doClap() {
  clapN++;
  document.getElementById('clap-count').textContent = clapN;

  // Milestone text
  if (milestones[clapN]) {
    const ms = document.getElementById('clap-milestones');
    ms.textContent = milestones[clapN];
    ms.style.animation = 'none';
    void ms.offsetWidth;
    ms.style.animation = 'milestoneFlash .5s ease';
  }

  // label
  document.getElementById('clap-label').textContent =
    clapN >= 100 ? 'You\'re a legend 🏅' :
    clapN >= 50  ? 'Ruhi can feel it! 🔥' :
    clapN >= 20  ? 'Keep going! 🌟' :
    'Every clap is a wish ✨';

  // Burst particles
  const btn = document.getElementById('clap-btn');
  for (let i = 0; i < 6; i++) {
    const b = document.createElement('div');
    b.className   = 'clap-burst';
    b.textContent = clapEmojisArr[Math.floor(Math.random() * clapEmojisArr.length)];
    const ang = Math.random() * Math.PI * 2;
    const d   = 45 + Math.random() * 70;
    b.style.setProperty('--bx', Math.cos(ang) * d + 'px');
    b.style.setProperty('--by', (Math.sin(ang) * d - 80) + 'px');
    b.style.animationDelay = (Math.random() * 0.12) + 's';
    btn.appendChild(b);
    setTimeout(() => b.remove(), 950);
  }

  playTone(280 + clapN * 1.5, 0.1, 0.14, 'triangle');
  if (clapN % 10 === 0) spawnConfetti(28);
}

/* ─────────────────────────────────
   QUIZ
───────────────────────────────── */
const quizData = [
  {
    q: '🎂 What is Ruhi\'s birthday date?',
    opts: ['15 March', '22 April', '10 May', '5 June'],
    ans: 1,
    fb: { right: '🎉 You know her birthday!', wrong: 'It\'s 22 April! Mark it in your calendar 📅' }
  },
  {
    q: '🌟 Which word best describes Ruhi\'s vibe?',
    opts: ['Boring', 'Chaotic neutral', 'Effortlessly cool', 'Mysterious'],
    ans: 2,
    fb: { right: '✅ Effortlessly cool — couldn\'t be more true!', wrong: 'Come on, she\'s effortlessly cool! 😄' }
  },
  {
    q: '🎈 How many candles does Ruhi deserve on her cake?',
    opts: ['Just one, keep it simple', 'As many as stars in the sky', 'Exactly 22', 'None — she\'s ice cold 😎'],
    ans: 1,
    fb: { right: '⭐ Exactly — infinite candles!', wrong: 'She deserves one for every star! 🌟' }
  },
  {
    q: '💪 What is Ruhi most likely doing on her birthday?',
    opts: ['Sleeping all day', 'Making it unforgettable', 'Pretending she forgot', 'Studying 😅'],
    ans: 1,
    fb: { right: '🔥 Making it unforgettable — obviously!', wrong: 'Ruhi is absolutely making it unforgettable 🎉' }
  },
  {
    q: '🎯 What does Ruhi deserve this year?',
    opts: ['Nothing special', 'A little luck', 'Everything she\'s ever wanted', 'A quiet year'],
    ans: 2,
    fb: { right: '💯 Everything she\'s ever wanted — 100%!', wrong: 'She deserves EVERYTHING she\'s ever wanted 💖' }
  },
];

let quizIdx   = 0;
let quizScore = 0;
let quizAnswered = false;

const quizQ       = document.getElementById('quiz-q');
const quizOpts    = document.getElementById('quiz-options');
const quizFb      = document.getElementById('quiz-feedback');
const quizCount   = document.getElementById('quiz-count');
const quizNext    = document.getElementById('quiz-next');
const quizProg    = document.getElementById('quiz-progress');
const quizCard    = document.getElementById('quiz-card');
const quizResult  = document.getElementById('quiz-result');

function loadQuestion(idx) {
  const q = quizData[idx];
  quizAnswered = false;
  quizQ.textContent = q.q;
  quizFb.textContent = '';
  quizNext.style.display  = 'none';
  quizNext.classList.remove('show');
  quizCount.textContent   = `${idx + 1} / ${quizData.length}`;
  quizProg.style.width    = ((idx + 1) / quizData.length * 100) + '%';
  quizOpts.innerHTML      = '';

  q.opts.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.className   = 'quiz-opt';
    btn.textContent = opt;
    btn.addEventListener('click', () => answerQuiz(i, q, btn));
    quizOpts.appendChild(btn);
  });
}

function answerQuiz(chosen, q, chosenBtn) {
  if (quizAnswered) return;
  quizAnswered = true;

  const allOpts = quizOpts.querySelectorAll('.quiz-opt');
  allOpts.forEach(b => b.disabled = true);

  if (chosen === q.ans) {
    chosenBtn.classList.add('correct');
    quizFb.textContent = q.fb.right;
    quizScore++;
    playTone(660, 0.12, 0.2);
    spawnConfetti(20);
  } else {
    chosenBtn.classList.add('wrong');
    allOpts[q.ans].classList.add('correct');
    quizFb.textContent = q.fb.wrong;
    playTone(200, 0.1, 0.25, 'sawtooth');
  }

  quizNext.style.display = 'inline-block';
  setTimeout(() => quizNext.classList.add('show'), 50);
}

quizNext.addEventListener('click', () => {
  quizIdx++;
  if (quizIdx < quizData.length) {
    loadQuestion(quizIdx);
  } else {
    showQuizResult();
  }
});

document.getElementById('quiz-retry').addEventListener('click', () => {
  quizIdx   = 0;
  quizScore = 0;
  quizResult.style.display = 'none';
  quizCard.style.display   = 'block';
  loadQuestion(0);
});

function showQuizResult() {
  quizCard.style.display   = 'none';
  quizResult.style.display = 'block';

  const pct = quizScore / quizData.length;
  document.getElementById('qr-score').textContent = `${quizScore} / ${quizData.length}`;

  if (pct === 1) {
    document.getElementById('qr-emoji').textContent = '🏆';
    document.getElementById('qr-msg').textContent   = 'Perfect score! You know Ruhi is legendary 🌟';
    spawnConfetti(100);
  } else if (pct >= 0.6) {
    document.getElementById('qr-emoji').textContent = '🎉';
    document.getElementById('qr-msg').textContent   = 'Not bad! You definitely know she\'s something special.';
    spawnConfetti(40);
  } else {
    document.getElementById('qr-emoji').textContent = '😅';
    document.getElementById('qr-msg').textContent   = 'Study up! One thing\'s for sure — Ruhi\'s amazing regardless.';
  }
}

loadQuestion(0);

/* ─────────────────────────────────
   SCROLL FADE-UP (IntersectionObserver)
───────────────────────────────── */
const fadeEls = document.querySelectorAll('.fade-up');
const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const delay = e.target.dataset.delay || 0;
      setTimeout(() => e.target.classList.add('visible'), Number(delay));
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });

fadeEls.forEach(el => io.observe(el));
