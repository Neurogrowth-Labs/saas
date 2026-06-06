from app.models.schemas import Language

SUPPORTED_LANGUAGES = [
    Language(code="yo", name="Yoruba"),
    Language(code="ig", name="Igbo"),
    Language(code="ha", name="Hausa"),
    Language(code="sw", name="Swahili"),
    Language(code="am", name="Amharic"),
    Language(code="om", name="Oromo"),
    Language(code="so", name="Somali"),
    Language(code="zu", name="Zulu"),
    Language(code="xh", name="Xhosa"),
    Language(code="af", name="Afrikaans"),
    Language(code="rw", name="Kinyarwanda"),
    Language(code="ln", name="Lingala"),
    Language(code="wo", name="Wolof"),
    Language(code="tw", name="Twi"),
    Language(code="en", name="English"),
    Language(code="fr", name="French"),
    Language(code="ar", name="Arabic"),
]

LANGUAGE_MAP = {language.code: language for language in SUPPORTED_LANGUAGES}
