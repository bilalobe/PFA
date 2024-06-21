from fastapi.testclient import TestClient
from fastapi import FastAPI, HTTPException, Request

app = FastAPI()

client = TestClient(app)


def test_generate_content_summary():
    payload = {"text": "This is a test.", "type": "summary"}
    response = client.post("/api/generate", json=payload)
    assert response.status_code == 200
    assert "content" in response.json()
    assert isinstance(response.json()["content"], str)


def test_generate_content_paraphrase():
    payload = {"text": "This is a test.", "type": "paraphrase"}
    response = client.post("/api/generate", json=payload)
    assert response.status_code == 200
    assert "content" in response.json()
    assert isinstance(response.json()["content"], str)


def test_generate_content_default():
    payload = {"text": "This is a test."}
    response = client.post("/api/generate", json=payload)
    assert response.status_code == 200
    assert "content" in response.json()
    assert isinstance(response.json()["content"], str)


def test_generate_content_invalid_type():
    payload = {"text": "This is a test.", "type": "invalid"}
    response = client.post("/api/generate", json=payload)
    assert response.status_code == 400
    assert "detail" in response.json()
    assert (
        response.json()["detail"]
        == "Invalid content type. Choose from: summary, uppercase, lowercase, reverse, paraphrase"
    )


def test_generate_content_missing_text():
    payload = {"type": "summary"}
    response = client.post("/api/generate", json=payload)
    assert response.status_code == 400
    assert "detail" in response.json()
    assert response.json()["detail"] == "Missing text input"


@app.middleware("http")
async def add_generator(request, call_next):
    request.state.generator = "your_generator_value"
    response = await call_next(request)
    return response


@app.post("/api/generate")
async def generate_content(request: Request, payload: dict):
    if not hasattr(request.state, "generator") or request.state.generator is None:
        raise HTTPException(status_code=500, detail="Model is not loaded")
    # Your content generation logic here
    return {"message": "Content generated"}


# Adjusted test to use TestClient and include setup for generator attribute if needed


def test_generate_content_model_not_loaded():
    client = TestClient(app)
    payload = {"text": "This is a test.", "type": "summary"}
    response = client.post("/api/generate", json=payload)
    assert response.status_code == 500
    assert "detail" in response.json()
    assert response.json()["detail"] == "Model is not loaded"
