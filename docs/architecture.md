# AfriLingua AI Translator Architecture

AfriLingua is structured as a deployable SaaS starter with three client surfaces and one backend API.

## Components

- **FastAPI backend**: REST endpoints for text translation, voice translation, integration webhooks, API key creation and a WebSocket realtime endpoint.
- **Translation provider abstraction**: `TranslationProvider` simulates an African Language Foundation Model today and is designed to be replaced by a production model gateway.
- **React frontend**: web console for text, voice and realtime translation demos.
- **Browser extension**: Manifest V3 extension that translates selected text on WhatsApp Web, Telegram Web, Messenger, Instagram and general websites.
- **Messaging integrations**: webhook adapters normalize WhatsApp, Telegram, Messenger and Instagram DM payloads into translation jobs.

## Production model path

Replace `backend/app/services/translation.py` with calls to your preferred model gateway for:

1. language identification,
2. automatic speech recognition,
3. machine translation,
4. speech synthesis,
5. moderation and personally identifiable information controls.

## Running locally

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
uvicorn app.main:app --app-dir backend --reload
npm install
npm --workspace frontend run dev
```

Load `extension/` as an unpacked extension in Chrome or Edge, then configure the API base URL in the popup.
