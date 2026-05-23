import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const port = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const state = {
  channels: [
    { id: 'finance-team', name: 'finance-team' },
    { id: 'q4-budget-review', name: 'q4-budget-review' },
    { id: 'general', name: 'general' }
  ],
  directMessages: [
    { id: 'alice-finance', name: 'Alice Finance', initials: 'AF' },
    { id: 'bob-ops', name: 'Bob Ops', initials: 'BO' },
    { id: 'charlie-audit', name: 'Charlie Audit', initials: 'CA' }
  ],
  messages: {
    'finance-team': [
      { id: 'm1', sender: 'Alice Finance', initials: 'AL', time: '15:21', text: 'Did we approve the Q4 budget?' },
      { id: 'm2', sender: 'Bob Ops', initials: 'BO', time: '15:23', text: 'Yes, but there is a slight cash flow issue projected for November.', aiRisk: true, aiLabel: 'Risk Flagged by AI' },
      { id: 'm3', sender: 'Charlie Audit', initials: 'CH', time: '15:25', text: 'Please see attached report.', attachment: { type: 'PDF Document', name: 'q4-cashflow-risk.pdf' } }
    ]
  }
};

const mime = { '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript' };
const json = (res, code, obj) => { res.writeHead(code, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(obj)); };

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === 'GET' && url.pathname === '/api/chat-index') return json(res, 200, { channels: state.channels, directMessages: state.directMessages });
  if (req.method === 'GET' && url.pathname.startsWith('/api/messages/')) {
    const chatId = decodeURIComponent(url.pathname.split('/').pop());
    return json(res, 200, { chatId, messages: state.messages[chatId] || [] });
  }
  if (req.method === 'POST' && url.pathname.startsWith('/api/messages/')) {
    const chatId = decodeURIComponent(url.pathname.split('/').pop());
    let raw = '';
    req.on('data', (c) => raw += c);
    req.on('end', () => {
      let body = {};
      try { body = JSON.parse(raw || '{}'); } catch { return json(res, 400, { error: 'invalid json' }); }
      if (!body.sender || !body.text) return json(res, 400, { error: 'sender and text are required' });
      if (!state.messages[chatId]) state.messages[chatId] = [];
      const message = { id: `m${Date.now()}`, sender: body.sender, initials: body.initials || body.sender.slice(0,2).toUpperCase(), time: new Date().toISOString().slice(11,16), text: body.text, attachment: body.attachment || null };
      if (/risk|cash flow issue|projected/i.test(body.text)) { message.aiRisk = true; message.aiLabel = 'Risk Flagged by AI'; }
      state.messages[chatId].push(message);
      return json(res, 201, message);
    });
    return;
  }

  const target = url.pathname === '/' ? '/index.html' : url.pathname;
  const filePath = path.join(__dirname, 'public', target);
  if (filePath.startsWith(path.join(__dirname, 'public')) && fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': mime[ext] || 'text/plain' });
    fs.createReadStream(filePath).pipe(res);
    return;
  }

  res.writeHead(404);
  res.end('Not Found');
});

server.listen(port, () => console.log(`Neuro Ops Finance chat server running on http://localhost:${port}`));
