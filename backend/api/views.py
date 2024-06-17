import os
import jwt
import logging
import asyncio
from typing import Optional
from fastapi import FastAPI, HTTPException, status, Request, Depends
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from fastapi.responses import JSONResponse
from fastapi.openapi.docs import get_swagger_ui_html
from fastapi.openapi.utils import get_openapi
from transformers import pipeline, AutoTokenizer, AutoModelForSeq2SeqLM
import sentry_sdk
from sentry_sdk.integrations.asgi import SentryAsgiMiddleware

# Initialize FastAPI
app = FastAPI()

# Initialize Sentry for error monitoring
sentry_sdk.init(
    dsn="YOUR_SENTRY_DSN",
    integrations=[SentryAsgiMiddleware()],
    traces_sample_rate=1.0,
)
app.add_middleware(SentryAsgiMiddleware)

# JWT Authentication
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Logger setup
logger = logging.getLogger("uvicorn")
handler = logging.StreamHandler()
formatter = logging.Formatter("%(asctime)s - %(name)s - %(levelname)s - %(message)s")
handler.setFormatter(formatter)
logger.addHandler(handler)
logger.setLevel(logging.INFO)


def authenticate_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, os.getenv("JWT_SECRET"), algorithms=["HS256"])
        return payload
    except jwt.PyJWTError as e:
        logger.error(f"Invalid JWT token: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
        )


# Model Loading
generator = None
tokenizer = None
model = None


@app.lifespan("startup")
async def load_model():
    global generator, tokenizer, model
    try:
        model_name = "facebook/bart-large-cnn"  # Using BART model
        tokenizer = AutoTokenizer.from_pretrained(model_name)
        model = AutoModelForSeq2SeqLM.from_pretrained(model_name)
        generator = pipeline("summarization", model=model, tokenizer=tokenizer)
        logger.info("Model loaded successfully")
    except Exception as e:
        logger.error(f"Error loading the model: {e}")
        raise RuntimeError("Failed to load model on startup")


# Request Model
class GenerateRequest(BaseModel):
    text: str
    type: Optional[str] = None


# Content Types
CONTENT_TYPES = ["summary", "uppercase", "lowercase", "reverse", "paraphrase"]


# Generate Content Endpoint
@app.post(
    "/api/generate",
    tags=["Content Generation"],
    summary="Generate content using BART model",
)
async def generate_content(
    request: Request, body: GenerateRequest, user=Depends(authenticate_user)
):
    if generator is None:
        raise HTTPException(status_code=500, detail="Model is not loaded")
    try:
        text = body.text
        content_type = body.type

        # Input validation
        if not text:
            raise HTTPException(status_code=400, detail="Missing text input")
        if content_type and content_type not in CONTENT_TYPES:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid content type. Choose from: {', '.join(CONTENT_TYPES)}",
            )

        # Text Generation
        if content_type == "summary":
            # Using the 'summarization' pipeline directly for summaries
            output = generator(text, max_length=100, min_length=30, do_sample=False)
            content = output[0]["summary_text"]

        elif content_type == "paraphrase":
            # Use text-generation pipeline for paraphrasing
            paraphrase_generator = pipeline(
                "text-generation", model=model, tokenizer=tokenizer
            )
            output = paraphrase_generator(
                text,
                max_length=len(text) + 20,
                do_sample=True,
                temperature=0.8,
                top_k=50,
            )
            content = output[0]["generated_text"]

        else:
            # Default generation logic
            output = generator(
                text, max_length=200, do_sample=True, temperature=0.9, top_k=60
            )
            content = output[0]["generated_text"]

        # Post-processing
        if content_type == "uppercase":
            content = content.upper()
        elif content_type == "lowercase":
            content = content.lower()
        elif content_type == "reverse":
            content = content[::-1]

        return {"content": content}

    except Exception as e:
        logger.error(f"Error generating text: {e} | Request: {body.dict()}")
        if "is too long" in str(e):
            return JSONResponse({"error": "Text input is too long"}, status_code=400)
        else:
            return JSONResponse(
                {"error": "An error occurred while processing the text."},
                status_code=500,
            )


# Swagger UI
@app.get("/docs", include_in_schema=False)
async def custom_swagger_ui_html():
    return get_swagger_ui_html(openapi_url="/openapi.json", title="API docs")


@app.get("/openapi.json", include_in_schema=False)
async def custom_openapi():
    return get_openapi(
        title="Content Generation API", version="1.0.0", routes=app.routes
    )
