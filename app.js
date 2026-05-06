const clockEl   = document.getElementById('clock');
const alarmInput = document.getElementById('alarm-time');
const setBtn     = document.getElementById('set-btn');
const alarmList  = document.getElementById('alarm-list');
const modal      = document.getElementById('modal');
const modalTime  = document.getElementById('modal-time');
const stopBtn    = document.getElementById('stop-btn');

let alarms = [];
let audioCtx = null;
let alarmInterval = null;

function pad(n) {
  return String(n).padStart(2, '0');
}

function updateClock() {
  const now = new Date();
  clockEl.textContent =
    pad(now.getHours()) + ':' +
    pad(now.getMinutes()) + ':' +
    pad(now.getSeconds());

  const hhmm = pad(now.getHours()) + ':' + pad(now.getMinutes());
  const ss   = now.getSeconds();

  if (ss === 0 && alarms.includes(hhmm)) {
    triggerAlarm(hhmm);
  }
}

function renderAlarms() {
  alarmList.innerHTML = '';
  alarms.forEach(t => {
    const item = document.createElement('div');
    item.className = 'alarm-item';
    item.innerHTML = `
      <span class="time">${t}</span>
      <button class="delete-btn" data-time="${t}">✕</button>
    `;
    alarmList.appendChild(item);
  });
}

function addAlarm() {
  const val = alarmInput.value;
  if (!val) return;
  if (alarms.includes(val)) return;
  alarms.push(val);
  alarms.sort();
  renderAlarms();
  alarmInput.value = '';
}

function deleteAlarm(time) {
  alarms = alarms.filter(t => t !== time);
  renderAlarms();
}

function beep() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const osc  = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.type = 'sine';
  osc.frequency.setValueAtTime(880, audioCtx.currentTime);
  gain.gain.setValueAtTime(0.4, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.8);
  osc.start(audioCtx.currentTime);
  osc.stop(audioCtx.currentTime + 0.8);
}

function triggerAlarm(time) {
  modalTime.textContent = time;
  modal.classList.remove('hidden');
  beep();
  alarmInterval = setInterval(beep, 1000);
}

function stopAlarm() {
  modal.classList.add('hidden');
  clearInterval(alarmInterval);
  alarmInterval = null;
}

setBtn.addEventListener('click', addAlarm);
alarmInput.addEventListener('keydown', e => { if (e.key === 'Enter') addAlarm(); });

alarmList.addEventListener('click', e => {
  if (e.target.classList.contains('delete-btn')) {
    deleteAlarm(e.target.dataset.time);
  }
});

stopBtn.addEventListener('click', stopAlarm);

setInterval(updateClock, 1000);
updateClock();
