import secrets
from fastapi import APIRouter, File, Query, UploadFile

from app.models.schemas import ApiKeyCreateRequest, TextTranslationRequest, WebhookEvent
from app.services.integrations import integration_router
from app.services.languages import SUPPORTED_LANGUAGES
from app.services.translation import provider

router = APIRouter()


@router.get("/health")
def health() -> dict:
    return {"status": "ok", "service": "afrilingua-ai-translator"}


@router.get("/languages")
def languages():
    return SUPPORTED_LANGUAGES


@router.post("/translate/text")
def translate_text(request: TextTranslationRequest):
    return provider.translate_text(
        request.text,
        request.source_language,
        request.target_language,
        request.context,
    )


@router.post("/translate/voice")
async def translate_voice(
    file: UploadFile = File(...),
    source_language: str = Query(default="auto"),
    target_language: str = Query(...),
    voice_output: bool = Query(default=False),
):
    audio = await file.read()
    return provider.translate_voice(audio, source_language, target_language, voice_output)


@router.post("/integrations/{platform}/webhook")
async def platform_webhook(platform: str, event: WebhookEvent):
    normalized = event.model_copy(update={"platform": platform})
    return await integration_router.handle_event(normalized)


@router.post("/api-keys")
def create_api_key(request: ApiKeyCreateRequest):
    return {
        "name": request.name,
        "key": f"afl_{secrets.token_urlsafe(24)}",
        "scopes": request.scopes,
        "warning": "Store this key securely; this demo does not persist keys.",
    }
