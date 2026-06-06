# AfriLingua AI Translator SaaS

A full-stack starter for a real-time AI agent translator focused on African languages. It supports text-to-text, voice-to-text, voice-to-voice, browser extension translation, WhatsApp/Telegram/Messenger/Instagram webhook adapters, WebSocket realtime translation and a third-party REST API.

## Features

- Text translation REST API: `POST /api/v1/translate/text`
- Voice translation REST API: `POST /api/v1/translate/voice`
- Realtime WebSocket API: `/ws/translate`
- Messaging webhook route: `POST /api/v1/integrations/{platform}/webhook`
- API key generation starter endpoint
- React dashboard for live demos
- Manifest V3 browser extension for WhatsApp Web and other messaging apps
- African Language Foundation Model provider abstraction

## Local development

### Backend

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
uvicorn app.main:app --app-dir backend --reload
```

### Frontend

```bash
npm install
npm --workspace frontend run dev
```

### Browser extension

1. Open Chrome or Edge extensions.
2. Enable developer mode.
3. Load the `extension/` folder as an unpacked extension.
4. Set the API base URL to `http://localhost:8000`.
5. Select or double-click text in WhatsApp Web, Telegram Web, Messenger, Instagram or any supported website.

## Notes

The included translation service is a deterministic simulation with a small phrasebook so the platform is runnable without paid AI keys. Swap `backend/app/services/translation.py` for a production model gateway when connecting a real African language foundation model, ASR and TTS stack.
