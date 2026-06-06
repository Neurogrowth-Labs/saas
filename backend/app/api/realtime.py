from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.services.translation import provider

router = APIRouter()


@router.websocket("/ws/translate")
async def websocket_translate(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            payload = await websocket.receive_json()
            modality = payload.get("modality", "text")
            target = payload.get("target_language", "en")
            source = payload.get("source_language", "auto")
            if modality == "audio":
                audio_text = payload.get("audio_base64", "").encode()
                result = provider.translate_voice(audio_text, source, target, payload.get("voice_output", False))
            else:
                result = provider.translate_text(payload.get("text", ""), source, target, payload.get("context"))
            await websocket.send_json(result.model_dump())
    except WebSocketDisconnect:
        return
