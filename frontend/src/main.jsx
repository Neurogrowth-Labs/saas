import React, { useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Mic, Send, Globe2, Radio, Plug } from 'lucide-react';
import './styles.css';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';
const languages = [
  ['yo', 'Yoruba'], ['ig', 'Igbo'], ['ha', 'Hausa'], ['sw', 'Swahili'], ['am', 'Amharic'],
  ['om', 'Oromo'], ['so', 'Somali'], ['zu', 'Zulu'], ['xh', 'Xhosa'], ['rw', 'Kinyarwanda'],
  ['wo', 'Wolof'], ['tw', 'Twi'], ['en', 'English'], ['fr', 'French'], ['ar', 'Arabic']
];

function App() {
  const [source, setSource] = useState('auto');
  const [target, setTarget] = useState('yo');
  const [text, setText] = useState('hello');
  const [result, setResult] = useState(null);
  const [events, setEvents] = useState([]);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef(null);

  const wsUrl = useMemo(() => API_BASE.replace('http://', 'ws://').replace('https://', 'wss://') + '/ws/translate', []);

  async function translateText() {
    const response = await fetch(`${API_BASE}/api/v1/translate/text`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, source_language: source, target_language: target })
    });
    const payload = await response.json();
    setResult(payload);
    setEvents((old) => [`Text translated via ${payload.provider}`, ...old].slice(0, 6));
  }

  function connectRealtime() {
    const socket = new WebSocket(wsUrl);
    socket.onopen = () => {
      setConnected(true);
      socket.send(JSON.stringify({ text, source_language: source, target_language: target, modality: 'text' }));
    };
    socket.onmessage = (message) => {
      const payload = JSON.parse(message.data);
      setResult(payload);
      setEvents((old) => [`Realtime update: ${payload.translated_text}`, ...old].slice(0, 6));
    };
    socket.onclose = () => setConnected(false);
    wsRef.current = socket;
  }

  async function translateVoice(file) {
    if (!file) return;
    const body = new FormData();
    body.append('file', file);
    const response = await fetch(`${API_BASE}/api/v1/translate/voice?source_language=${source}&target_language=${target}&voice_output=true`, {
      method: 'POST',
      body
    });
    const payload = await response.json();
    setResult(payload);
    setEvents((old) => [`Voice translated: ${payload.transcript}`, ...old].slice(0, 6));
  }

  return <main className="shell">
    <section className="hero">
      <div>
        <p className="eyebrow"><Globe2 size={16}/> African Language Foundation Model</p>
        <h1>Real-time AI translation for WhatsApp, Telegram, Messenger, Instagram DM and any browser.</h1>
        <p>Translate text, speech-to-text and speech-to-speech across high-demand African languages with platform webhooks and a third-party API.</p>
        <div className="actions"><button onClick={translateText}><Send size={18}/> Translate now</button><button className="secondary" onClick={connectRealtime}><Radio size={18}/> {connected ? 'Connected' : 'Realtime demo'}</button></div>
      </div>
      <div className="panel">
        <label>Source language</label>
        <select value={source} onChange={(e) => setSource(e.target.value)}><option value="auto">Auto detect</option>{languages.map(([code, name]) => <option key={code} value={code}>{name}</option>)}</select>
        <label>Target language</label>
        <select value={target} onChange={(e) => setTarget(e.target.value)}>{languages.map(([code, name]) => <option key={code} value={code}>{name}</option>)}</select>
        <label>Message</label>
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows="5" />
        <label className="upload"><Mic size={18}/> Upload audio for voice-to-voice<input type="file" accept="audio/*" onChange={(e) => translateVoice(e.target.files?.[0])}/></label>
      </div>
    </section>
    <section className="grid">
      <article><h2>Translation result</h2><p className="translation">{result?.translated_text || 'Run a translation to see output.'}</p>{result?.audio_url && <a href={result.audio_url}>Synthetic voice URL</a>}<small>{result ? `Confidence ${Math.round(result.confidence * 100)}% · ${result.mode}` : 'Text-to-text · voice-to-text · voice-to-voice'}</small></article>
      <article><h2><Plug size={18}/> Integrations</h2><ul><li>WhatsApp Cloud API webhook adapter</li><li>Telegram bot webhook adapter</li><li>Messenger and Instagram DM adapter</li><li>Browser extension content script</li><li>REST and WebSocket APIs</li></ul></article>
      <article><h2>Realtime events</h2>{events.length ? events.map((event) => <p key={event}>{event}</p>) : <p>No events yet.</p>}</article>
    </section>
  </main>;
}

createRoot(document.getElementById('root')).render(<App />);
