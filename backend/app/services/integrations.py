from app.models.schemas import TranslationResponse, WebhookEvent
from app.services.translation import provider


class IntegrationRouter:
    """Normalizes messaging-platform webhooks into translation jobs."""

    async def handle_event(self, event: WebhookEvent) -> TranslationResponse:
        text = event.text or f"Audio message from {event.audio_url}"
        result = provider.translate_text(text, event.source_language, event.target_language)
        result.metadata.update(
            {
                "platform": event.platform,
                "sender_id": event.sender_id,
                "recipient_id": event.recipient_id,
                "message_id": event.message_id,
                "delivery_status": "ready_to_send",
            }
        )
        return result


integration_router = IntegrationRouter()
