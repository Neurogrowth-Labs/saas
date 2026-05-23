let activeChatId = 'finance-team';
let indexData = { channels: [], directMessages: [] };

function row(label, value = '') {
  return `<div class="meta"><strong>${label}</strong><span>${value}</span></div>`;
}

function renderMessages(messages) {
  const root = document.getElementById('messages');
  root.innerHTML = messages.map((m) => `
    <article class="msg">
      ${row(m.initials, `${m.sender} • ${m.time}`)}
      <div>${m.text}</div>
      ${m.aiRisk ? `<div class="badge">${m.aiLabel}</div>` : ''}
      ${m.attachment ? `<div class="attachment">${m.attachment.type}</div>` : ''}
    </article>
  `).join('');
}

async function loadMessages(chatId) {
  const res = await fetch(`/api/messages/${chatId}`);
  const payload = await res.json();
  renderMessages(payload.messages);
  document.getElementById('chatTitle').textContent = chatId;
}

function renderChatList(items, targetId) {
  const list = document.getElementById(targetId);
  list.innerHTML = items.map((c) => `<li data-id="${c.id}" class="${c.id === activeChatId ? 'active' : ''}">${c.initials ? c.initials + ' ' : ''}${c.name}</li>`).join('');
  list.querySelectorAll('li').forEach((node) => {
    node.onclick = async () => {
      activeChatId = node.dataset.id;
      await refresh();
    };
  });
}

function filterAndRender(term = '') {
  const q = term.toLowerCase();
  renderChatList(indexData.channels.filter((c) => c.name.includes(q)), 'channels');
  renderChatList(indexData.directMessages.filter((d) => d.name.toLowerCase().includes(q)), 'directMessages');
}

async function refresh() {
  filterAndRender(document.getElementById('chatSearch').value);
  await loadMessages(activeChatId);
}

async function init() {
  const res = await fetch('/api/chat-index');
  indexData = await res.json();
  document.getElementById('chatSearch').addEventListener('input', (e) => filterAndRender(e.target.value));

  document.getElementById('composer').addEventListener('submit', async (e) => {
    e.preventDefault();
    const sender = document.getElementById('sender').value.trim();
    const text = document.getElementById('messageText').value.trim();
    if (!text) return;

    await fetch(`/api/messages/${activeChatId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sender, text })
    });

    document.getElementById('messageText').value = '';
    await loadMessages(activeChatId);
  });

  await refresh();
}

init();
