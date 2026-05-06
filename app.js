const hoursEl     = document.getElementById('hours');
const hoursColon  = document.getElementById('hours-colon');
const minutesEl   = document.getElementById('minutes');
const secondsEl   = document.getElementById('seconds');
const msEl        = document.getElementById('milliseconds');
const startBtn    = document.getElementById('start-btn');
const startLabel  = document.getElementById('start-label');
const startIcon   = document.getElementById('start-icon');
const lapBtn      = document.getElementById('lap-btn');
const resetBtn    = document.getElementById('reset-btn');
const lapsList    = document.getElementById('laps');
const lapsSection = document.getElementById('laps-section');
const statsEl     = document.getElementById('stats');
const statBest    = document.getElementById('stat-best');
const statWorst   = document.getElementById('stat-worst');
const statCount   = document.getElementById('stat-count');
const ring        = document.getElementById('ring');

// Inject SVG gradient
const svgEl = document.querySelector('.ring-svg');
svgEl.insertAdjacentHTML('afterbegin', `
  <defs>
    <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#7c6ef7"/>
      <stop offset="100%" stop-color="#6ef7c8"/>
    </linearGradient>
  </defs>
`);

const RING_CIRC = 2 * Math.PI * 148;
ring.style.strokeDasharray  = RING_CIRC;
ring.style.strokeDashoffset = RING_CIRC;

let startTime  = 0;
let elapsed    = 0;
let rafId      = null;
let running    = false;
let lapStart   = 0;
let lapTimes   = [];

function pad(n, w = 2) {
  return String(Math.floor(n)).padStart(w, '0');
}

function fmtMs(ms) {
  const h  = Math.floor(ms / 3600000);
  const m  = Math.floor((ms % 3600000) / 60000);
  const s  = Math.floor((ms % 60000) / 1000);
  const cs = ms % 1000;
  return { h, m, s, cs };
}

function fmtStr(ms) {
  const { h, m, s, cs } = fmtMs(ms);
  const base = h > 0
    ? `${pad(h)}:${pad(m)}:${pad(s)}`
    : `${pad(m)}:${pad(s)}`;
  return `${base}.${pad(cs, 3)}`;
}

function updateRing(ms) {
  const period = 60000;
  const progress = (ms % period) / period;
  const offset = RING_CIRC * (1 - progress);
  ring.style.strokeDashoffset = offset;
}

function render(ms) {
  const { h, m, s, cs } = fmtMs(ms);

  if (h > 0) {
    hoursEl.classList.remove('hidden');
    hoursColon.classList.remove('hidden');
    hoursEl.textContent = pad(h);
  }

  minutesEl.textContent = pad(m);
  secondsEl.textContent = pad(s);
  msEl.textContent      = pad(cs, 3);
  updateRing(ms);
}

function tick() {
  elapsed = Date.now() - startTime;
  render(elapsed);
  rafId = requestAnimationFrame(tick);
}

function start() {
  startTime = Date.now() - elapsed;
  if (!lapStart) lapStart = Date.now() - elapsed;
  running = true;

  startLabel.textContent = 'ストップ';
  startIcon.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><rect x="5" y="4" width="4" height="16" rx="1"/><rect x="15" y="4" width="4" height="16" rx="1"/></svg>`;
  startBtn.classList.add('running');
  lapBtn.disabled   = false;
  resetBtn.disabled = true;

  rafId = requestAnimationFrame(tick);
}

function stop() {
  cancelAnimationFrame(rafId);
  running = false;

  startLabel.textContent = 'スタート';
  startIcon.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>`;
  startBtn.classList.remove('running');
  lapBtn.disabled   = true;
  resetBtn.disabled = false;
}

function reset() {
  cancelAnimationFrame(rafId);
  running  = false;
  elapsed  = 0;
  lapStart = 0;
  lapTimes = [];

  render(0);
  ring.style.strokeDashoffset = RING_CIRC;
  lapsList.innerHTML  = '';
  lapsSection.style.display = 'none';
  statsEl.style.display     = 'none';

  startLabel.textContent = 'スタート';
  startIcon.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>`;
  startBtn.classList.remove('running');
  lapBtn.disabled   = true;
  resetBtn.disabled = true;
  hoursEl.classList.add('hidden');
  hoursColon.classList.add('hidden');
}

function refreshLapClasses() {
  if (lapTimes.length < 2) return;
  const min = Math.min(...lapTimes);
  const max = Math.max(...lapTimes);
  const items = Array.from(lapsList.querySelectorAll('li'));
  lapTimes.forEach((t, i) => {
    const li = items[lapTimes.length - 1 - i];
    if (!li) return;
    li.classList.remove('best', 'worst');
    if (t === min) li.classList.add('best');
    else if (t === max) li.classList.add('worst');
  });
}

function updateStats() {
  if (!lapTimes.length) return;
  const min = Math.min(...lapTimes);
  const max = Math.max(...lapTimes);
  statBest.textContent  = fmtStr(min);
  statWorst.textContent = fmtStr(max);
  statCount.textContent = lapTimes.length;
}

function addLap() {
  const now     = Date.now();
  const lapMs   = now - lapStart;
  lapStart      = now;
  lapTimes.push(lapMs);

  const totalMs = elapsed;
  const num     = lapTimes.length;

  const li = document.createElement('li');
  li.innerHTML = `
    <span class="lap-num">LAP ${num}</span>
    <span class="lap-split">${fmtStr(lapMs)}</span>
    <span class="lap-total">${fmtStr(totalMs)}</span>
  `;
  lapsList.prepend(li);

  refreshLapClasses();
  updateStats();

  if (lapsSection.style.display === 'none') {
    lapsSection.style.display = 'block';
    statsEl.style.display     = 'flex';
  }
}

startBtn.addEventListener('click', () => {
  if (running) stop(); else start();
});
lapBtn.addEventListener('click', addLap);
resetBtn.addEventListener('click', reset);

document.addEventListener('keydown', e => {
  if (e.code === 'Space' && e.target === document.body) {
    e.preventDefault();
    if (running) stop(); else start();
  }
  if (e.code === 'KeyL' && running) addLap();
  if (e.code === 'KeyR' && !running && elapsed > 0) reset();
});
