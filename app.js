const minutesEl      = document.getElementById('minutes');
const secondsEl      = document.getElementById('seconds');
const millisecondsEl = document.getElementById('milliseconds');
const startBtn       = document.getElementById('start-btn');
const lapBtn         = document.getElementById('lap-btn');
const resetBtn       = document.getElementById('reset-btn');
const lapsList       = document.getElementById('laps');

let startTime   = 0;
let elapsed     = 0;
let rafId       = null;
let running     = false;
let lapStart    = 0;
let lapTimes    = [];

function pad(n, w = 2) {
  return String(n).padStart(w, '0');
}

function formatTime(ms) {
  const m   = Math.floor(ms / 60000);
  const s   = Math.floor((ms % 60000) / 1000);
  const cs  = Math.floor((ms % 1000) / 10);
  return { m, s, cs };
}

function render(ms) {
  const { m, s, cs } = formatTime(ms);
  minutesEl.textContent      = pad(m);
  secondsEl.textContent      = pad(s);
  millisecondsEl.textContent = pad(cs);
}

function tick() {
  elapsed = Date.now() - startTime;
  render(elapsed);
  rafId = requestAnimationFrame(tick);
}

function start() {
  startTime = Date.now() - elapsed;
  lapStart  = lapStart || startTime;
  running   = true;
  startBtn.textContent = 'ストップ';
  startBtn.classList.add('running');
  lapBtn.disabled   = false;
  resetBtn.disabled = true;
  rafId = requestAnimationFrame(tick);
}

function stop() {
  cancelAnimationFrame(rafId);
  running = false;
  startBtn.textContent = 'スタート';
  startBtn.classList.remove('running');
  lapBtn.disabled   = true;
  resetBtn.disabled = false;
}

function reset() {
  cancelAnimationFrame(rafId);
  running   = false;
  elapsed   = 0;
  lapStart  = 0;
  lapTimes  = [];
  render(0);
  lapsList.innerHTML   = '';
  startBtn.textContent = 'スタート';
  startBtn.classList.remove('running');
  lapBtn.disabled   = true;
  resetBtn.disabled = true;
}

function addLap() {
  const now        = Date.now();
  const lapElapsed = now - lapStart;
  lapStart         = now;
  lapTimes.push(lapElapsed);

  const total   = lapTimes.length;
  const minTime = Math.min(...lapTimes);
  const maxTime = Math.max(...lapTimes);

  Array.from(lapsList.children).forEach(li => {
    li.classList.remove('best', 'worst');
  });

  lapTimes.forEach((t, i) => {
    const li = lapsList.children[total - 1 - i];
    if (!li) return;
    if (total > 1) {
      if (t === minTime) li.classList.add('best');
      else if (t === maxTime) li.classList.add('worst');
    }
  });

  const { m, s, cs } = formatTime(lapElapsed);
  const splitStr = `${pad(m)}:${pad(s)}.${pad(cs)}`;

  const totalMs = lapTimes.reduce((a, b) => a + b, 0);
  const { m: tm, s: ts, cs: tcs } = formatTime(totalMs);
  const totalStr = `${pad(tm)}:${pad(ts)}.${pad(tcs)}`;

  const li = document.createElement('li');
  li.innerHTML = `
    <span class="lap-num">ラップ ${total}</span>
    <span class="lap-time">${splitStr}</span>
    <span class="lap-split">${totalStr}</span>
  `;
  lapsList.prepend(li);
}

startBtn.addEventListener('click', () => {
  if (running) stop(); else start();
});

lapBtn.addEventListener('click', addLap);
resetBtn.addEventListener('click', reset);
