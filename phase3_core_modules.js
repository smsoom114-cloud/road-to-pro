/**
 * ROAD TO PRO — CORE ATHLETIC & PRODUCTIVITY MODULES
 */

class TaskManager {
  addTask(title, category = 'CUSTOM', type = 'SECONDARY', xp = 30) {
    if (!title || title.trim() === '') return false;
    const newTask = {
      id: 'task_' + Date.now(),
      title: title.trim(),
      category: category.toUpperCase(),
      type: type.toUpperCase(),
      xp: parseInt(xp, 10) || 30,
      isCompleted: false
    };

    if (!appState.tasks) appState.tasks = [];
    appState.tasks.push(newTask);
    this.saveAndRender();
    return newTask;
  }

  removeTask(taskId) {
    if (!appState.tasks) return;
    appState.tasks = appState.tasks.filter(t => t.id !== taskId);
    this.saveAndRender();
  }

  toggleTaskCompletion(taskId) {
    const task = appState.tasks.find(t => t.id === taskId);
    if (!task) return;
    task.isCompleted = !task.isCompleted;

    if (task.isCompleted) {
      appState.stats.xp += task.xp;
      this.checkLevelUp();
      if (window.audioFX) window.audioFX.playTaskComplete();
    } else {
      appState.stats.xp = Math.max(0, appState.stats.xp - task.xp);
    }

    this.saveAndRender();
  }

  checkLevelUp() {
    const reqXP = appState.stats.level * 200;
    if (appState.stats.xp >= reqXP) {
      appState.stats.level += 1;
      if (window.audioFX) window.audioFX.playLevelUp();
    }
  }

  saveAndRender() {
    saveState();
    this.renderTasks();
  }

  renderTasks() {
    const primaryContainer = document.getElementById('primaryTasksContainer');
    const secondaryContainer = document.getElementById('secondaryTasksContainer');
    if (!primaryContainer || !secondaryContainer) return;

    primaryContainer.innerHTML = '';
    secondaryContainer.innerHTML = '';

    (appState.tasks || []).forEach(task => {
      const card = document.createElement('div');
      card.className = `flex items-center justify-between p-3.5 rounded-xl border transition-all ${
        task.isCompleted ? 'bg-slate-900/40 border-slate-800 opacity-60' : 'bg-slate-800/80 border-slate-700/80 hover:border-gold-500/50'
      }`;

      card.innerHTML = `
        <div class="flex items-center gap-3">
          <button onclick="window.taskManager.toggleTaskCompletion('${task.id}')" 
                  class="w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                    task.isCompleted ? 'bg-pitch-500 text-black font-bold' : 'border border-slate-600 hover:border-gold-400'
                  }">
            ${task.isCompleted ? '<i class="fa-solid fa-check text-xs"></i>' : ''}
          </button>
          <div>
            <p class="text-xs font-bold ${task.isCompleted ? 'line-through text-slate-500' : 'text-white'}">${task.title}</p>
            <div class="flex items-center gap-2 mt-0.5">
              <span class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-gold-400 border border-slate-700">${task.category}</span>
              <span class="text-[10px] font-mono text-slate-400">+${task.xp} XP</span>
            </div>
          </div>
        </div>
        <button onclick="window.taskManager.removeTask('${task.id}')" class="text-slate-500 hover:text-red-400 p-1.5" title="حذف">
          <i class="fa-solid fa-trash-can text-xs"></i>
        </button>
      `;

      if (task.type === 'PRIMARY') primaryContainer.appendChild(card);
      else secondaryContainer.appendChild(card);
    });

    this.updateProgressSummary();
  }

  updateProgressSummary() {
    const total = (appState.tasks || []).length;
    const completed = (appState.tasks || []).filter(t => t.isCompleted).length;
    const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

    const bar = document.getElementById('dailyProgressBar');
    const text = document.getElementById('dailyProgressText');
    const xpEl = document.getElementById('userXPDisplay');
    const lvlEl = document.getElementById('userLevelDisplay');

    if (bar) bar.style.width = `${percent}%`;
    if (text) text.textContent = `${percent}% (${completed}/${total})`;
    if (xpEl) xpEl.textContent = appState.stats.xp;
    if (lvlEl) lvlEl.textContent = `المستوى ${appState.stats.level}`;
  }
}

class FootballMatrixManager {
  renderRadarChart() {
    const canvas = document.getElementById('fifaRadarChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const skills = appState.footballSkills || {};
    const labels = ['التسديد', 'التمرير', 'الرؤية', 'المراوغة', 'التحكم', 'السرعة', 'التحمل', 'القوة'];
    const values = Object.values(skills);
    const num = labels.length;

    const w = canvas.width, h = canvas.height;
    const cx = w / 2, cy = h / 2, radius = Math.min(cx, cy) - 40;

    ctx.clearRect(0, 0, w, h);

    // Draw Web
    for (let l = 1; l <= 5; l++) {
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      for (let i = 0; i < num; i++) {
        const angle = (Math.PI * 2 / num) * i - Math.PI / 2;
        const r = (radius / 5) * l;
        const x = cx + r * Math.cos(angle), y = cy + r * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();
    }

    // Draw Polygon
    ctx.beginPath();
    for (let i = 0; i < num; i++) {
      const angle = (Math.PI * 2 / num) * i - Math.PI / 2;
      const r = radius * (values[i] / 100);
      const x = cx + r * Math.cos(angle), y = cy + r * Math.sin(angle);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = 'rgba(234, 179, 8, 0.35)';
    ctx.fill();
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  logMatch(opponent, result, goals, assists, rating) {
    if (!appState.footballMatches) appState.footballMatches = [];
    appState.footballMatches.unshift({
      id: Date.now(), opponent, result, goals: parseInt(goals, 10) || 0, assists: parseInt(assists, 10) || 0, rating: parseFloat(rating) || 7.0
    });
    saveState();
    this.renderMatchHistory();
  }

  renderMatchHistory() {
    const container = document.getElementById('matchHistoryContainer');
    if (!container || !appState.footballMatches) return;
    container.innerHTML = appState.footballMatches.map(m => `
      <div class="flex items-center justify-between p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs font-mono">
        <div>
          <span class="font-bold text-white">ضد ${m.opponent}</span>
          <span class="mr-2 text-[10px] ${m.result === 'WIN' ? 'text-pitch-400' : 'text-red-400'}">[${m.result}]</span>
        </div>
        <div class="flex items-center gap-3 text-slate-300">
          <span>⚽ ${m.goals}</span>
          <span>🅰️ ${m.assists}</span>
          <span class="px-2 py-0.5 rounded bg-gold-500/10 text-gold-400 border border-gold-500/30">${m.rating}</span>
        </div>
      </div>
    `).join('');
  }
}

window.taskManager = new TaskManager();
window.footballMatrix = new FootballMatrixManager();

document.addEventListener('DOMContentLoaded', () => {
  window.taskManager.renderTasks();
  window.footballMatrix.renderRadarChart();
  window.footballMatrix.renderMatchHistory();
});
