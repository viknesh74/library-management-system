// ════════════════════════════════════════
// Smart Library – UI Helpers
// ════════════════════════════════════════

const UI = {
  // ── Toast notifications ────────────────
  toast(msg, type = 'success') {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();
    const t = document.createElement('div');
    t.className = `toast toast-${type}`;
    t.innerHTML = `<span class="toast-icon">${type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}</span><span>${msg}</span>`;
    document.body.appendChild(t);
    requestAnimationFrame(() => { t.classList.add('show'); });
    setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 400); }, 3000);
  },

  // ── Modal ──────────────────────────────
  modal({ title, body, actions }) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal-box animate-pop">
        <div class="modal-header">
          <h3>${title}</h3>
          <button class="modal-close" id="modalClose">✕</button>
        </div>
        <div class="modal-body">${body}</div>
        <div class="modal-actions">${actions.map((a, i) =>
          `<button class="btn ${a.cls || 'btn-outline'}" id="modalAction${i}">${a.label}</button>`
        ).join('')}</div>
      </div>`;
    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('show'));

    const close = () => { overlay.classList.remove('show'); setTimeout(() => overlay.remove(), 300); };
    document.getElementById('modalClose').onclick = close;
    overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
    actions.forEach((a, i) => {
      document.getElementById(`modalAction${i}`).onclick = () => { close(); a.fn?.(); };
    });
    return close;
  },

  // ── Confirm dialog ─────────────────────
  confirm(title, message, onConfirm) {
    return this.modal({
      title,
      body: `<p>${message}</p>`,
      actions: [
        { label: 'Cancel', cls: 'btn-outline' },
        { label: 'Confirm', cls: 'btn-primary', fn: onConfirm },
      ],
    });
  },

  // ── Loading spinner ────────────────────
  loading(container, show) {
    if (show) {
      const el = document.createElement('div');
      el.className = 'loading-spinner'; el.id = 'loadingSpinner';
      el.innerHTML = '<div class="spinner"></div>';
      container.appendChild(el);
    } else {
      document.getElementById('loadingSpinner')?.remove();
    }
  },

  // ── Status badge ──────────────────────
  statusBadge(status) {
    const map = {
      issued: { cls: 'badge-blue', label: 'Issued' },
      returned: { cls: 'badge-green', label: 'Returned' },
      overdue: { cls: 'badge-red', label: 'Overdue' },
      pending: { cls: 'badge-orange', label: 'Pending' },
      approved: { cls: 'badge-green', label: 'Approved' },
      rejected: { cls: 'badge-red', label: 'Rejected' },
    };
    const s = map[status] || { cls: 'badge-gray', label: status };
    return `<span class="badge ${s.cls}">${s.label}</span>`;
  },

  // ── Availability badge ─────────────────
  availBadge(available, total) {
    const cls = available > 0 ? 'badge-green' : 'badge-red';
    const label = available > 0 ? `${available}/${total} Available` : 'Unavailable';
    return `<span class="badge ${cls}">${label}</span>`;
  },

  // ── Format date ────────────────────────
  fmtDate(d) {
    if (!d) return '-';
    return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  },

  // ── Category icon ─────────────────────
  catIcon(cat) {
    const icons = {
      Science: '🔬', Technology: '💻', Engineering: '⚙️', Mathematics: '📐',
      Literature: '📖', History: '🏛️', Philosophy: '🤔', Arts: '🎨',
      Medicine: '⚕️', Law: '⚖️', Economics: '📊', Other: '📚',
    };
    return icons[cat] || '📚';
  },

  // ── Back button ────────────────────────
  backBtn(label = 'Back', route = null) {
    return `<button class="back-btn" onclick="Router.${route ? `navigate('${route}')` : 'back()'}">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
      <span>${label}</span>
    </button>`;
  },

  // ── Empty state ───────────────────────
  emptyState(icon, title, subtitle = '') {
    return `<div class="empty-state">
      <div class="empty-icon">${icon}</div>
      <h3>${title}</h3>
      ${subtitle ? `<p>${subtitle}</p>` : ''}
    </div>`;
  },

  // ── Section header ────────────────────
  sectionHeader(title, subtitle = '') {
    return `<div class="section-header">
      <h2>${title}</h2>
      ${subtitle ? `<p>${subtitle}</p>` : ''}
    </div>`;
  },
};
