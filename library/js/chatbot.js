// ════════════════════════════════════════════════════════════
//  Smart Library – LibraBot  (Powered by Google Gemini AI)
// ════════════════════════════════════════════════════════════
(function () {
  'use strict';

  // ── Conversation history (sent to Gemini for context) ───
  const history = [];   // [{role:'user'|'assistant', content:string}]

  // ── Quick action chips ────────────────────────────────────
  const QUICK_REPLIES = [
    { label: '📚 Search a book', msg: 'What books do you have on Python programming?' },
    { label: '📖 My issued books', msg: 'What books do I currently have issued?' },
    { label: '⚠️ Overdue check', msg: 'Do I have any overdue books?' },
    { label: '📄 Question Papers', msg: 'How can I access question papers?' },
    { label: '🎓 Free Courses', msg: 'What free courses are available?' },
    { label: '🎯 CGPA Help', msg: 'How does the CGPA calculator work?' },
    { label: '📰 Daily News', msg: 'Tell me about the daily news section' },
    { label: '💡 Study tips', msg: 'Give me 5 effective study tips for college students' },
  ];

  // ── State ─────────────────────────────────────────────────
  let isOpen    = false;
  let isLoading = false;

  // ── Markdown → HTML (supports bold, italic, code, bullets) ─
  function md(text) {
    return text
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')   // escape HTML
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code class="lb-code">$1</code>')
      .replace(/^#{1,3} (.+)$/gm, '<strong style="font-size:1.05em;display:block;margin-bottom:4px">$1</strong>')
      .replace(/^\* (.+)$/gm, '<span class="lb-li">• $1</span>')
      .replace(/^- (.+)$/gm, '<span class="lb-li">• $1</span>')
      .replace(/^\d+\. (.+)$/gm, (m, p1, offset, str) => {
        const n = str.slice(0, offset).split('\n').filter(l => /^\d+\./.test(l)).length + 1;
        return `<span class="lb-li">${n}. ${p1}</span>`;
      })
      .replace(/\n{2,}/g, '</p><p class="lb-p">')
      .replace(/\n/g, '<br>');
  }

  // ── Build DOM ─────────────────────────────────────────────
  function buildChatbot() {
    if (document.getElementById('librabot-root')) return;
    const root = document.createElement('div');
    root.id = 'librabot-root';
    root.innerHTML = `
      <button id="lbToggle" class="lb-toggle" title="LibraBot – AI Assistant">
        <span class="lb-mic-wrap lb-ti-show">
          <svg viewBox="0 0 24 24" fill="currentColor" width="26" height="26">
            <path d="M12 1a4 4 0 0 1 4 4v6a4 4 0 0 1-8 0V5a4 4 0 0 1 4-4z"/>
            <path d="M19 10a1 1 0 0 0-2 0 5 5 0 0 1-10 0 1 1 0 0 0-2 0 7 7 0 0 0 6 6.93V19H9a1 1 0 0 0 0 2h6a1 1 0 0 0 0-2h-2v-2.07A7 7 0 0 0 19 10z"/>
          </svg>
        </span>
        <span class="lb-close-wrap lb-ti-hide">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="22" height="22">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </span>
        <span class="lb-badge" id="lbBadge">1</span>
      </button>

      <div id="lbPanel" class="lb-panel" aria-hidden="true">
        <div class="lb-header">
          <div class="lb-hdr-left">
            <div class="lb-avatar">
              <svg viewBox="0 0 36 36" fill="none" width="22" height="22">
                <circle cx="18" cy="18" r="18" fill="rgba(255,255,255,0.2)"/>
                <path d="M10 14h16M10 18h10M10 22h13" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
              </svg>
            </div>
            <div>
              <div class="lb-name">LibraBot <span class="lb-ai-pill">AI</span></div>
              <div class="lb-status"><span class="lb-dot"></span> Powered by Gemini</div>
            </div>
          </div>
          <div class="lb-hdr-right">
            <button class="lb-hbtn" id="lbClearBtn" title="New chat">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15">
                <path d="M12 5v14M5 12h14"/>
              </svg>
            </button>
            <button class="lb-hbtn" id="lbCloseBtn" title="Close">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="15" height="15">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        <div class="lb-messages" id="lbMessages"></div>
        <div class="lb-quick" id="lbQuick"></div>

        <div class="lb-input-wrap">
          <textarea id="lbInput" placeholder="Ask me anything… (Shift+Enter for newline)" rows="1" maxlength="1000"></textarea>
          <button id="lbSend" class="lb-send-btn" title="Send">
            <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </button>
        </div>
        <div class="lb-footer-note">Smart Library AI · Gemini 1.5 Flash</div>
      </div>`;
    document.body.appendChild(root);
    wireEvents();
    // Show badge after 4s
    setTimeout(() => { if (!isOpen) document.getElementById('lbBadge').classList.add('lb-badge-show'); }, 4000);
  }

  // ── Toggle panel ──────────────────────────────────────────
  function toggleChat(force) {
    isOpen = force !== undefined ? force : !isOpen;
    const panel   = document.getElementById('lbPanel');
    const micWrap = document.querySelector('.lb-mic-wrap');
    const cloWrap = document.querySelector('.lb-close-wrap');
    const badge   = document.getElementById('lbBadge');
    const toggle  = document.getElementById('lbToggle');

    if (isOpen) {
      panel.classList.add('lb-open');
      panel.setAttribute('aria-hidden', 'false');
      micWrap.classList.add('lb-ti-hide');    micWrap.classList.remove('lb-ti-show');
      cloWrap.classList.remove('lb-ti-hide'); cloWrap.classList.add('lb-ti-show');
      badge.classList.remove('lb-badge-show');
      toggle.classList.add('lb-active');
      if (!document.getElementById('lbMessages').children.length) showWelcome();
      setTimeout(() => document.getElementById('lbInput').focus(), 300);
    } else {
      panel.classList.remove('lb-open');
      panel.setAttribute('aria-hidden', 'true');
      micWrap.classList.remove('lb-ti-hide'); micWrap.classList.add('lb-ti-show');
      cloWrap.classList.add('lb-ti-hide');    cloWrap.classList.remove('lb-ti-show');
      toggle.classList.remove('lb-active');
    }
  }

  // ── Welcome message ───────────────────────────────────────
  function showWelcome() {
    const user = typeof DB !== 'undefined' ? DB.getCurrentUser() : null;
    const name = user ? user.name.split(' ')[0] : 'there';
    addBotMessage(
      `Hi **${name}**! 👋 I'm **LibraBot**, your AI library assistant powered by **Google Gemini**.\n\nI can answer **any question** — about books, your account, study tips, coding, science, math, or anything else!\n\nWhat can I help you with?`,
      QUICK_REPLIES.slice(0, 4)
    );
  }

  // ── Append messages ───────────────────────────────────────
  function addUserMessage(text) {
    const msgs = document.getElementById('lbMessages');
    const time = new Date().toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' });
    const div = document.createElement('div');
    div.className = 'lb-msg-row lb-user';
    div.innerHTML = `<div class="lb-bubble lb-ububble">${md(text)}</div><div class="lb-time">${time}</div>`;
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
    document.getElementById('lbQuick').innerHTML = '';
  }

  function addBotMessage(text, quickReplies = []) {
    const msgs = document.getElementById('lbMessages');
    const time = new Date().toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' });
    const div = document.createElement('div');
    div.className = 'lb-msg-row lb-bot';
    div.innerHTML = `
      <div class="lb-bot-icon">🤖</div>
      <div>
        <div class="lb-bubble lb-bbubble"><p class="lb-p">${md(text)}</p></div>
        <div class="lb-time">${time}</div>
      </div>`;
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;

    if (quickReplies.length) {
      const qEl = document.getElementById('lbQuick');
      qEl.innerHTML = quickReplies.map(r =>
        `<button class="lb-qr" data-msg="${r.msg.replace(/"/g,'&quot;')}">${r.label}</button>`
      ).join('');
      qEl.querySelectorAll('.lb-qr').forEach(btn => {
        btn.onclick = () => sendMessage(btn.dataset.msg);
      });
    }
  }

  // ── Streaming typewriter effect ───────────────────────────
  function addTypingIndicator() {
    const msgs = document.getElementById('lbMessages');
    const div  = document.createElement('div');
    div.id = 'lbTyping';
    div.className = 'lb-msg-row lb-bot';
    div.innerHTML  = `
      <div class="lb-bot-icon">🤖</div>
      <div class="lb-bubble lb-bbubble lb-typing">
        <span></span><span></span><span></span>
      </div>`;
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function removeTyping() {
    document.getElementById('lbTyping')?.remove();
  }

  // ── Simulate typewriter reveal ─────────────────────────────
  function typewriterReveal(el, html) {
    el.innerHTML = '';
    const temp = document.createElement('div');
    temp.innerHTML = html;
    const fullText = temp.textContent || temp.innerText || '';
    let i = 0;
    const speed = Math.max(8, Math.min(20, Math.floor(2000 / fullText.length)));
    const interval = setInterval(() => {
      if (i >= fullText.length) {
        clearInterval(interval);
        el.innerHTML = html; // Set final formatted HTML
        document.getElementById('lbMessages').scrollTop = document.getElementById('lbMessages').scrollHeight;
        return;
      }
      el.textContent = fullText.slice(0, ++i);
      document.getElementById('lbMessages').scrollTop = document.getElementById('lbMessages').scrollHeight;
    }, speed);
  }

  // ── Send to Gemini backend ────────────────────────────────
  async function sendMessage(text) {
    text = text.trim();
    if (!text || isLoading) return;

    isLoading = true;
    document.getElementById('lbInput').value = '';
    document.getElementById('lbInput').style.height = 'auto';
    document.getElementById('lbSend').disabled = true;

    addUserMessage(text);
    history.push({ role: 'user', content: text });

    addTypingIndicator();

    try {
      const user = typeof DB !== 'undefined' ? DB.getCurrentUser() : null;
      const token = user?.token || '';

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ messages: history })
      });

      const data = await res.json();
      const reply = data.reply || '⚠️ No response received. Please try again.';

      removeTyping();
      history.push({ role: 'assistant', content: reply });

      // Render with typewriter
      const msgs = document.getElementById('lbMessages');
      const time = new Date().toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' });
      const div  = document.createElement('div');
      div.className = 'lb-msg-row lb-bot';
      const bubbleId = 'lbb_' + Date.now();
      div.innerHTML = `
        <div class="lb-bot-icon">🤖</div>
        <div>
          <div class="lb-bubble lb-bbubble" id="${bubbleId}"></div>
          <div class="lb-time">${time}</div>
        </div>`;
      msgs.appendChild(div);
      msgs.scrollTop = msgs.scrollHeight;

      const bubbleEl = document.getElementById(bubbleId);
      const finalHtml = `<p class="lb-p">${md(reply)}</p>`;
      typewriterReveal(bubbleEl, finalHtml);

      // Context-aware quick replies
      const lower = reply.toLowerCase() + text.toLowerCase();
      let qr = [];
      if (lower.includes('book') || lower.includes('search') || lower.includes('available')) {
        qr = [
          { label: '📚 My issued books', msg: 'What books do I have issued?' },
          { label: '🔍 Search books', msg: 'Search for programming books' }
        ];
      } else if (lower.includes('cgpa') || lower.includes('gpa') || lower.includes('grade')) {
        qr = [{ label: '🎯 Open CGPA Calc', msg: 'How do I open the CGPA calculator?' }];
      } else if (lower.includes('course') || lower.includes('certif')) {
        qr = [{ label: '🎓 View Courses', msg: 'What free courses are available?' }];
      } else if (lower.includes('paper') || lower.includes('exam')) {
        qr = [{ label: '📄 Question Papers', msg: 'How do I download question papers?' }];
      }

      if (qr.length) {
        setTimeout(() => {
          const qEl = document.getElementById('lbQuick');
          qEl.innerHTML = qr.map(r => `<button class="lb-qr" data-msg="${r.msg}">${r.label}</button>`).join('');
          qEl.querySelectorAll('.lb-qr').forEach(btn => { btn.onclick = () => sendMessage(btn.dataset.msg); });
        }, 800);
      }

    } catch (e) {
      removeTyping();
      addBotMessage('⚠️ Could not reach the AI. Please check your connection and try again.');
    } finally {
      isLoading = false;
      document.getElementById('lbSend').disabled = false;
      document.getElementById('lbInput').focus();
    }
  }

  // ── Wire events ───────────────────────────────────────────
  function wireEvents() {
    document.getElementById('lbToggle').onclick = () => toggleChat();
    document.getElementById('lbCloseBtn').onclick = () => toggleChat(false);

    document.getElementById('lbClearBtn').onclick = () => {
      history.length = 0;
      document.getElementById('lbMessages').innerHTML = '';
      document.getElementById('lbQuick').innerHTML = '';
      isLoading = false;
      setTimeout(showWelcome, 100);
    };

    const input = document.getElementById('lbInput');
    const send  = document.getElementById('lbSend');

    send.onclick = () => sendMessage(input.value);

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage(input.value);
      }
    });

    // Auto-grow textarea
    input.addEventListener('input', () => {
      input.style.height = 'auto';
      input.style.height = Math.min(input.scrollHeight, 120) + 'px';
    });
  }

  // ── Init ──────────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildChatbot);
  } else {
    buildChatbot();
  }
})();
