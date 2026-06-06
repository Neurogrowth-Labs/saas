from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class Modality(str, Enum):
    text = "text"
    audio = "audio"


class TranslationMode(str, Enum):
    text_to_text = "text_to_text"
    voice_to_text = "voice_to_text"
    voice_to_voice = "voice_to_voice"


class Language(BaseModel):
    code: str
    name: str
    region: str = "Africa"
    voice_supported: bool = True


class TextTranslationRequest(BaseModel):
    text: str = Field(..., min_length=1)
    source_language: str = Field(default="auto")
    target_language: str = Field(..., min_length=2)
    context: Optional[str] = None
    preserve_tone: bool = True


class TranslationResponse(BaseModel):
    id: str
    source_language: str
    target_language: str
    mode: TranslationMode
    original_text: Optional[str] = None
    translated_text: str
    confidence: float = 0.86
    provider: str
    audio_url: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)


class VoiceTranslationResponse(TranslationResponse):
    transcript: str
    audio_url: Optional[str] = None


class WebhookEvent(BaseModel):
    platform: str
    sender_id: str
    recipient_id: Optional[str] = None
    message_id: Optional[str] = None
    text: Optional[str] = None
    audio_url: Optional[str] = None
    source_language: str = "auto"
    target_language: str
    metadata: Dict[str, Any] = Field(default_factory=dict)


class ApiKeyCreateRequest(BaseModel):
    name: str
    scopes: List[str] = Field(default_factory=lambda: ["translate:text", "translate:voice"])
