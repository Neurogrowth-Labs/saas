import base64
import hashlib
import uuid
from dataclasses import dataclass
from typing import Optional

from app.core.config import get_settings
from app.models.schemas import TranslationMode, TranslationResponse, VoiceTranslationResponse
from app.services.languages import LANGUAGE_MAP

PHRASEBOOK = {
    ("en", "yo", "hello"): "báwo",
    ("en", "sw", "hello"): "hujambo",
    ("en", "ha", "hello"): "sannu",
    ("en", "ig", "hello"): "ndewo",
    ("yo", "en", "báwo"): "hello",
    ("sw", "en", "hujambo"): "hello",
    ("ha", "en", "sannu"): "hello",
    ("ig", "en", "ndewo"): "hello",
    ("en", "fr", "thank you"): "merci",
    ("en", "sw", "thank you"): "asante",
    ("sw", "en", "asante"): "thank you",
}


@dataclass
class TranslationProvider:
    name: str = "african-foundation-sim"

    def detect_language(self, text: str) -> str:
        lowered = text.lower().strip()
        markers = {
            "yo": ["ẹ", "ọ", "ṣ", "báwo"],
            "ig": ["ndewo", "ị", "ọ"],
            "ha": ["sannu", "ina", "ƙ"],
            "sw": ["hujambo", "asante", "habari"],
            "am": ["ሰ", "አ", "ም"],
            "ar": ["مرحبا", "شكرا"],
        }
        for code, clues in markers.items():
            if any(clue in lowered for clue in clues):
                return code
        return "en"

    def translate_text(self, text: str, source_language: str, target_language: str, context: Optional[str] = None) -> TranslationResponse:
        detected = self.detect_language(text) if source_language == "auto" else source_language
        normalized = text.lower().strip()
        translated = PHRASEBOOK.get((detected, target_language, normalized))
        if not translated:
            source_name = LANGUAGE_MAP.get(detected).name if detected in LANGUAGE_MAP else detected
            target_name = LANGUAGE_MAP.get(target_language).name if target_language in LANGUAGE_MAP else target_language
            translated = f"[{target_name} translation of {source_name}: {text}]"
            if context:
                translated += f" (context: {context})"
        confidence = 0.96 if (detected, target_language, normalized) in PHRASEBOOK else 0.74
        return TranslationResponse(
            id=str(uuid.uuid4()),
            source_language=detected,
            target_language=target_language,
            mode=TranslationMode.text_to_text,
            original_text=text,
            translated_text=translated,
            confidence=confidence,
            provider=self.name,
            metadata={"model_family": "african-language-foundation", "realtime_ready": True},
        )

    def transcribe_audio(self, audio_bytes: bytes, source_language: str) -> str:
        digest = hashlib.sha256(audio_bytes).hexdigest()[:8]
        language = source_language if source_language != "auto" else "en"
        return f"transcript:{language}:{digest}"

    def synthesize_speech(self, text: str, target_language: str) -> str:
        payload = base64.urlsafe_b64encode(text.encode()).decode()[:48]
        base = get_settings().public_base_url.rstrip("/")
        return f"{base}/media/synthetic/{target_language}/{payload}.wav"

    def translate_voice(self, audio_bytes: bytes, source_language: str, target_language: str, voice_output: bool) -> VoiceTranslationResponse:
        transcript = self.transcribe_audio(audio_bytes, source_language)
        text_result = self.translate_text(transcript, source_language, target_language)
        return VoiceTranslationResponse(
            **text_result.model_dump(exclude={"mode", "audio_url"}),
            mode=TranslationMode.voice_to_voice if voice_output else TranslationMode.voice_to_text,
            transcript=transcript,
            audio_url=self.synthesize_speech(text_result.translated_text, target_language) if voice_output else None,
        )


provider = TranslationProvider()
