from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_text_translation_phrasebook():
    response = client.post("/api/v1/translate/text", json={"text": "hello", "source_language": "en", "target_language": "yo"})
    assert response.status_code == 200
    body = response.json()
    assert body["translated_text"] == "báwo"
    assert body["source_language"] == "en"


def test_languages_include_african_languages():
    response = client.get("/api/v1/languages")
    assert response.status_code == 200
    codes = {item["code"] for item in response.json()}
    assert {"yo", "ig", "ha", "sw"}.issubset(codes)
