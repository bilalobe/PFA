import pytest
@pytest.mark.django_db
def test_correct_text_success(api_client):
    data = {"text": "I havv good speling!"}
    response = api_client.post("/correct_text/", data)
    assert response.status_code == 200
    assert "corrected_text" in response.data

@pytest.mark.django_db
def test_correct_text_no_text_provided(api_client):
    data = {}
    response = api_client.post("/correct_text/", data)
    assert response.status_code == 400

@pytest.mark.django_db
def test_summarize_text_success(api_client):
    text = "This is a long text. " * 20  # Making sure the text is long enough to be summarized
    data = {"text": text}
    response = api_client.post("/summarize_text/", data)
    assert response.status_code == 200
    assert "summary" in response.data

@pytest.mark.django_db
def test_summarize_text_no_text_provided(api_client):
    data = {}
    response = api_client.post("/summarize_text/", data)
    assert response.status_code == 400

@pytest.mark.django_db
def test_sentiment_analysis_positive(api_client):
    data = {"text": "I love sunny days!"}
    response = api_client.post("/sentiment_analysis/", data)
    assert response.status_code == 200
    assert response.data["sentiment"]["polarity"] > 0

@pytest.mark.django_db
def test_sentiment_analysis_negative(api_client):
    data = {"text": "I hate rainy days!"}
    response = api_client.post("/sentiment_analysis/", data)
    assert response.status_code == 200
    assert response.data["sentiment"]["polarity"] < 0

@pytest.mark.django_db
def test_sentiment_analysis_no_text_provided(api_client):
    data = {}
    response = api_client.post("/sentiment_analysis/", data)
    assert response.status_code == 400

@pytest.mark.django_db
def test_detect_language_success(api_client):
    data = {"text": "Hello, world!"}
    response = api_client.post("/detect_language/", data)
    assert response.status_code == 200
    assert "language" in response.data

@pytest.mark.django_db
def test_detect_language_no_text_provided(api_client):
    data = {}
    response = api_client.post("/detect_language/", data)
    assert response.status_code == 400

@pytest.mark.django_db
def test_translate_text_success(api_client):
    data = {"text": "Hello", "language": "es"}
    response = api_client.post("/translate_text/", data)
    assert response.status_code == 200
    assert "translated_text" in response.data

@pytest.mark.django_db
def test_translate_text_invalid_language(api_client):
    data = {"text": "Hello", "language": "xx"}
    response = api_client.post("/translate_text/", data)
    assert response.status_code == 400

@pytest.mark.django_db
def test_translate_text_no_text_provided(api_client):
    data = {"language": "es"}
    response = api_client.post("/translate_text/", data)
    assert response.status_code == 400

@pytest.mark.django_db
def test_translate_text_no_language_provided(api_client):
    data = {"text": "Hello"}
    response = api_client.post("/translate_text/", data)
    assert response.status_code == 400

@pytest.mark.django_db
def test_translate_text_no_text_or_language_provided(api_client):
    data = {}
    response = api_client.post("/translate_text/", data)
    assert response.status_code == 400