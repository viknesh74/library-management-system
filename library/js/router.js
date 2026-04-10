// ════════════════════════════════════════
// Smart Library – Router
// ════════════════════════════════════════

const Router = {
  routes: {},
  currentRoute: null,

  register(name, renderFn) {
    this.routes[name] = renderFn;
  },

  navigate(name, params = {}) {
    // Check auth guards
    if (name !== 'splash' && name !== 'login' && name !== 'signup') {
      const user = DB.getCurrentUser();
      if (!user) { this.navigate('login'); return; }
      if (name.startsWith('admin') && user.role !== 'admin') { this.navigate('student-dashboard'); return; }
      if (name.startsWith('student') && user.role === 'admin') { this.navigate('admin-dashboard'); return; }
    }

    this.currentRoute = { name, params };
    const renderFn = this.routes[name];
    if (!renderFn) { console.error('Route not found:', name); return; }

    const app = document.getElementById('app');
    app.innerHTML = '';
    app.className = 'app-container';

    // Apply dark mode
    document.body.classList.toggle('dark', DB.getDarkMode());

    renderFn(params);

    // Scroll to top
    window.scrollTo(0, 0);
  },

  back() {
    window.history.back();
  },
};
