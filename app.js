/* ─── DATA ─── */
const SUBJECTS = [
  { id: 'physics', name: 'Physics HL', color: '#f87171', grade: '3', target: '4', uag: '4', taskCount: 0 },
  { id: 'design', name: 'BTEC Digital Design', color: '#fbbf24', grade: 'P', target: 'M', uag: 'P', taskCount: 0 },
  { id: 'engineering', name: 'Engineering BTEC', color: '#818cf8', grade: 'M', target: 'D', uag: 'M', taskCount: 0 },
  { id: 'maths', name: 'Maths AA SL', color: '#34d399', grade: '4', target: '4', uag: '4', taskCount: 0 },
  { id: 'multimedia', name: 'BTEC Multimedia', color: '#a78bfa', grade: 'M', target: 'M', uag: 'M', taskCount: 0 },
];

const STUDENT_NAME = 'Gerald';
const SCHOOL = 'West Island School, Hong Kong';

const DEFAULT_TASKS = {
  physics: [
    'Review Cycle 2-3 topics (where grade dropped)',
    'Complete 5 past IB Physics HL Paper 1s',
    'Complete 3 past IB Physics HL Paper 2s',
    'Make formula flashcards for all HL topics',
    'Focus session: Mechanics & Motion',
    'Focus session: Waves & Oscillations',
    'Focus session: Electricity & Magnetism',
    'Focus session: Thermal Physics',
    'Watch 3 topic review videos and take notes',
    'Tutor session: weak areas review',
  ],
  design: [
    'Build a portfolio project from scratch',
    'Practice Adobe Creative Suite (Photoshop, Illustrator)',
    'Learn Figma fundamentals (tutorial project)',
    'Document design process for one project',
    'Create mood boards for 3 different briefs',
    'Experiment with motion graphics (After Effects)',
    'Redesign a past project at M-grade standard',
    'Study typography & colour theory',
  ],
  engineering: [
    'Practise CAD modelling 3 hours/week',
    'Re-do engineering report for past project at D-grade',
    'Study D-grade exemplar reports',
    'Learn one new CAD technique per week',
    'Research engineering materials and properties',
    'Complete a small build project with documentation',
    'Study mechanical principles (levers, gears, forces)',
  ],
  maths: [
    'Complete 1 past paper section per week',
    'Review algebra & functions topic',
    'Review trigonometry topic',
    'Review calculus basics',
    'Flashcard drill: key formulas',
    'Focus session: Statistics & Probability',
    'Complete 2 non-calculator practice papers',
  ],
  multimedia: [
    'Edit a short video project (skill maintenance)',
    'Explore one new multimedia tool',
    'Review audio production basics',
    'Analyse 3 examples of professional multimedia work',
    'Create a storyboard for a short project',
  ],
};

/* ─── STATE ─── */
let state = loadState();

function defaultState() {
  const tasks = {};
  for (const s of SUBJECTS) {
    tasks[s.id] = (DEFAULT_TASKS[s.id] || []).map((t, i) => ({
      id: `${s.id}-${i}`, text: t, done: false, date: null
    }));
  }
  return {
    tasks,
    streak: 0, lastDate: null,
    pomodoros: 0, pomoDate: null,
    weekPlan: {},
    subjects: SUBJECTS.map(s => ({ ...s })),
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem('summerPlanner');
    if (!raw) return defaultState();
    const s = JSON.parse(raw);
    // ensure all subjects exist
    for (const sub of SUBJECTS) {
      if (!s.tasks[sub.id]) s.tasks[sub.id] = [];
    }
    return s;
  } catch { return defaultState(); }
}

function saveState() { localStorage.setItem('summerPlanner', JSON.stringify(state)); }

/* ─── HELPERS ─── */
function gradeColor(g, t) {
  if (g === t) return 'met';
  if (typeof g === 'string' && typeof t === 'string' && g.length === 1 && t.length === 1) {
    const order = ['P', 'M', 'D', 'D*'];
    return order.indexOf(g) >= order.indexOf(t) ? 'met' : 'gap';
  }
  return parseInt(g) >= parseInt(t) ? 'met' : 'gap';
}

/* ─── NAVIGATION ─── */
document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById(`view-${btn.dataset.view}`).classList.add('active');
  });
});

/* ─── DASHBOARD ─── */
function renderDashboard() {
  const container = document.getElementById('subjectCards');
  let totalAll = 0, doneAll = 0;
  container.innerHTML = '';

  for (const sub of SUBJECTS) {
    const tasks = state.tasks[sub.id] || [];
    const done = tasks.filter(t => t.done).length;
    const total = tasks.length;
    totalAll += total; doneAll += done;
    const pct = total ? Math.round(done / total * 100) : 0;

    const card = document.createElement('div');
    card.className = 'subject-card';
    card.innerHTML = `
      <div class="accent-bar" style="background:${sub.color}"></div>
      <h3>${sub.name}</h3>
      <div class="grade-row">
        <div class="grade-item"><span class="label">Current</span><span class="value ${gradeColor(sub.grade, sub.target)}">${sub.grade}</span></div>
        <div class="grade-item"><span class="label">UAG</span><span class="value ${gradeColor(sub.uag, sub.uag)}">${sub.uag}</span></div>
        <div class="grade-item"><span class="label">Target</span><span class="value">${sub.target}</span></div>
      </div>
      <div class="sub-progress">
        <span>${done}/${total}</span>
        <div class="sub-progress-bar">
          <div class="sub-progress-fill" style="width:${pct}%;background:${sub.color}"></div>
        </div>
      </div>
      <div class="task-preview">${pct}% complete</div>
    `;
    card.addEventListener('click', () => {
      document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
      document.querySelector('[data-view="tasks"]').classList.add('active');
      document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
      document.getElementById('view-tasks').classList.add('active');
      renderTasks(sub.id);
    });
    container.appendChild(card);
  }

  // Overall ring
  const ring = document.querySelector('.ring-fg');
  const overallPct = totalAll ? Math.round(doneAll / totalAll * 100) : 0;
  const circ = 377;
  ring.style.strokeDashoffset = circ - (overallPct / 100) * circ;
  document.getElementById('overallPct').textContent = `${overallPct}%`;
  document.getElementById('statDone').textContent = doneAll;
  document.getElementById('statTotal').textContent = totalAll;

  // Streak
  updateStreak();
}

/* ─── TASKS ─── */
let activeSubject = 'physics';

function renderTaskTabs() {
  const tabs = document.getElementById('subjectTabs');
  tabs.innerHTML = '';
  for (const sub of SUBJECTS) {
    const btn = document.createElement('button');
    btn.className = `subject-tab${sub.id === activeSubject ? ' active' : ''}`;
    btn.textContent = sub.name;
    btn.addEventListener('click', () => renderTasks(sub.id));
    tabs.appendChild(btn);
  }
}

function renderTasks(subId) {
  activeSubject = subId;
  renderTaskTabs();
  const sub = SUBJECTS.find(s => s.id === subId);
  const tasks = state.tasks[subId] || [];
  const done = tasks.filter(t => t.done).length;
  const total = tasks.length;
  const pct = total ? Math.round(done / total * 100) : 0;

  document.getElementById('taskSubjectTitle').textContent = `${sub.name} — Tasks`;
  document.getElementById('taskProgressFill').style.width = `${pct}%`;
  document.getElementById('taskProgressFill').style.background = sub.color;
  document.getElementById('taskProgressText').textContent = `${done}/${total}`;

  const list = document.getElementById('taskList');
  list.innerHTML = '';
  if (!tasks.length) {
    list.innerHTML = '<li class="empty-tasks">No tasks yet. Add one below!</li>';
    return;
  }
  tasks.forEach(t => {
    const li = document.createElement('li');
    li.className = 'task-item';
    li.innerHTML = `
      <div class="task-check${t.done ? ' done' : ''}" data-id="${t.id}">${t.done ? '✓' : ''}</div>
      <span class="task-text${t.done ? ' done' : ''}">${escHtml(t.text)}</span>
      <button class="task-del" data-id="${t.id}">✕</button>
    `;
    li.querySelector('.task-check').addEventListener('click', () => toggleTask(subId, t.id));
    li.querySelector('.task-del').addEventListener('click', () => deleteTask(subId, t.id));
    list.appendChild(li);
  });
}

function escHtml(s) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

function toggleTask(subId, taskId) {
  const t = state.tasks[subId].find(x => x.id === taskId);
  if (t) {
    t.done = !t.done;
    if (t.done) {
      const today = datestamp();
      if (state.lastDate !== today) {
        state.lastDate = today;
        state.streak++;
      }
    }
    saveState();
    renderTasks(activeSubject);
    renderDashboard();
  }
}

function deleteTask(subId, taskId) {
  state.tasks[subId] = state.tasks[subId].filter(x => x.id !== taskId);
  saveState();
  renderTasks(activeSubject);
  renderDashboard();
}

function datestamp() { return new Date().toISOString().split('T')[0]; }

document.getElementById('taskAddBtn').addEventListener('click', () => {
  const input = document.getElementById('taskInput');
  const text = input.value.trim();
  if (!text) return;
  const subId = activeSubject;
  const id = `${subId}-${Date.now()}`;
  state.tasks[subId].push({ id, text, done: false, date: null });
  input.value = '';
  saveState();
  renderTasks(subId);
  renderDashboard();
});
document.getElementById('taskInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') document.getElementById('taskAddBtn').click();
});

/* ─── POMODORO ─── */
const POMO = { focus: 25, short: 5, long: 15 };
let pomoMode = 'pomo';
let pomoSeconds = POMO.focus * 60;
let pomoRunning = false;
let pomoTimer = null;

function updatePomoDisplay() {
  const m = String(Math.floor(pomoSeconds / 60)).padStart(2, '0');
  const s = String(pomoSeconds % 60).padStart(2, '0');
  document.getElementById('timerDisplay').textContent = `${m}:${s}`;
  // Update ring
  const total = POMO[pomoMode === 'pomo' ? 'focus' : pomoMode] * 60;
  const circ = 723;
  const offset = circ - (pomoSeconds / total) * circ;
  document.querySelector('.timer-fg').style.strokeDashoffset = offset;
}

function startPomo() {
  if (pomoRunning) { clearInterval(pomoTimer); pomoRunning = false; document.getElementById('timerStartBtn').textContent = '▶ Start'; return; }
  pomoRunning = true;
  document.getElementById('timerStartBtn').textContent = '⏸ Pause';
  pomoTimer = setInterval(() => {
    pomoSeconds--;
    updatePomoDisplay();
    if (pomoSeconds <= 0) {
      clearInterval(pomoTimer);
      pomoRunning = false;
      document.getElementById('timerStartBtn').textContent = '▶ Start';
      if (pomoMode === 'pomo') {
        state.pomodoros++;
        const today = datestamp();
        state.pomoDate = today;
        saveState();
        document.getElementById('pomoCount').textContent = state.pomodoros;
        if (Notification.permission === 'granted') new Notification('Focus session complete! Time for a break.');
      }
      // Auto-switch
      if (pomoMode === 'pomo') { setPomoMode('short'); }
      else { setPomoMode('pomo'); }
      // Play a sound effect via beep
      setTimeout(() => beep(), 100);
    }
  }, 1000);
}

function beep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = 'sine'; osc.frequency.value = 880;
    gain.gain.value = .3;
    osc.start(); osc.stop(ctx.currentTime + .3);
  } catch {}
}

function setPomoMode(mode) {
  pomoMode = mode;
  clearInterval(pomoTimer); pomoRunning = false;
  document.getElementById('timerStartBtn').textContent = '▶ Start';
  const m = mode === 'pomo' ? 'focus' : mode;
  pomoSeconds = POMO[m] * 60;
  updatePomoDisplay();
  document.getElementById('timerLabel').textContent = m === 'focus' ? 'Focus' : m === 'short' ? 'Short Break' : 'Long Break';
  document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
  document.querySelector(`[data-mode="${mode}"]`).classList.add('active');
}

document.querySelectorAll('.mode-btn').forEach(btn => {
  btn.addEventListener('click', () => setPomoMode(btn.dataset.mode));
});
document.getElementById('timerStartBtn').addEventListener('click', startPomo);
document.getElementById('timerResetBtn').addEventListener('click', () => {
  clearInterval(pomoTimer); pomoRunning = false;
  document.getElementById('timerStartBtn').textContent = '▶ Start';
  setPomoMode(pomoMode);
});

/* ─── WEEK PLANNER ─── */
function renderWeek() {
  const grid = document.getElementById('weekGrid');
  const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay() + 1);

  grid.innerHTML = '';
  for (let i = 0; i < 7; i++) {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const dayName = days[i];
    const dayNum = d.getDate();
    const month = d.toLocaleString('en', { month: 'short' });

    const col = document.createElement('div');
    col.className = 'week-day';
    const slots = state.weekPlan[dateStr] || [];
    let slotsHtml = slots.map(s => {
      const sub = SUBJECTS.find(x => x.id === s);
      return `<div class="slot color-${s}">${sub ? sub.name : s} <span class="slot-del" data-date="${dateStr}" data-sub="${s}">✕</span></div>`;
    }).join('');
    slotsHtml += `<div class="slot add" data-date="${dateStr}">+ Add subject</div>`;
    col.innerHTML = `
      <div class="day-name">${dayName}</div>
      <div class="day-date">${month} ${dayNum}</div>
      <div class="day-slots">${slotsHtml}</div>
    `;
    // Delete slot
    col.querySelectorAll('.slot-del').forEach(el => {
      el.addEventListener('click', e => {
        e.stopPropagation();
        const date = el.dataset.date;
        const sub = el.dataset.sub;
        if (!state.weekPlan[date]) state.weekPlan[date] = [];
        state.weekPlan[date] = state.weekPlan[date].filter(x => x !== sub);
        saveState();
        renderWeek();
      });
    });
    // Add slot
    col.querySelector('.slot.add').addEventListener('click', () => {
      showWeekModal(dateStr);
    });
    grid.appendChild(col);
  }
}

function showWeekModal(dateStr) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay active';
  overlay.innerHTML = `
    <div class="modal">
      <h3>Add subject for ${dateStr}</h3>
      <select id="weekSubjectSelect">
        ${SUBJECTS.map(s => `<option value="${s.id}">${s.name}</option>`).join('')}
      </select>
      <div class="modal-actions">
        <button class="modal-confirm" id="weekModalOk">Add</button>
        <button class="modal-cancel" id="weekModalCancel">Cancel</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  overlay.querySelector('#weekModalOk').addEventListener('click', () => {
    const sub = overlay.querySelector('#weekSubjectSelect').value;
    if (!state.weekPlan[dateStr]) state.weekPlan[dateStr] = [];
    if (!state.weekPlan[dateStr].includes(sub)) {
      state.weekPlan[dateStr].push(sub);
      saveState();
      renderWeek();
    }
    overlay.remove();
  });
  overlay.querySelector('#weekModalCancel').addEventListener('click', () => overlay.remove());
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
}

/* ─── STREAK ─── */
function updateStreak() {
  const today = datestamp();
  // Check if any task was done today
  let anyDone = false;
  for (const subId in state.tasks) {
    if (state.tasks[subId].some(t => t.done)) anyDone = true;
  }
  if (anyDone && state.lastDate !== today) {
    state.lastDate = today;
    state.streak++;
    saveState();
  }
  document.getElementById('statStreak').textContent = state.streak;
}

/* ─── RESET ─── */
document.getElementById('resetBtn').addEventListener('click', () => {
  if (confirm('Reset all progress and tasks?')) {
    state = defaultState();
    saveState();
    renderDashboard();
    renderTasks('physics');
    renderWeek();
  }
});

/* ─── NOTIFICATIONS ─── */
if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission();

/* ─── INIT ─── */
renderDashboard();
renderTaskTabs();
renderTasks('physics');
renderWeek();
setPomoMode('pomo');

// Quick initial state save
if (!localStorage.getItem('summerPlanner')) saveState();
