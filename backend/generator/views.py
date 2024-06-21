import os
import jwt
import logging
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
from sentry_sdk.integrations.logging import LoggingIntegration

# Initialize FastAPI
app = FastAPI()

# Initialize Sentry for error monitoring
sentry_logging = LoggingIntegration(
    level=logging.INFO,  # Capture info and above as breadcrumbs
    event_level=logging.ERROR,  # Send errors as events
)
sentry_sdk.init(
    dsn="YOUR_SENTRY_DSN",
    integrations=[sentry_logging],
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


def authenticate_user(request: Request):
    try:
        # Ensure JWT_SECRET is not None
        jwt_secret = os.getenv("JWT_SECRET")
        if jwt_secret is None:
            raise ValueError("JWT_SECRET environment variable is not set")
        authorization_header = request.headers.get("Authorization")
        if authorization_header is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Missing authentication token",
            )
        token = authorization_header.split()[1]
        payload = jwt.decode(token, jwt_secret, algorithms=["HS256"])
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


@app.on_event("startup")
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
    body: GenerateRequest, _: Optional[str] = Depends(authenticate_user)
):
    """
    Generate content using the BART model.

    Args:
        body (GenerateRequest): The request body containing the text and content type.
        _ (Optional[str], optional): The authenticated user. Defaults to None. The user variable is not used in this function, hence renamed to _.

    Returns:
        dict: A dictionary containing the generated content.

    Raises:
        HTTPException: If the model is not loaded or if there are input validation errors.
        JSONResponse: If there is an error generating or processing the text.
    """
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
            output = list(
                generator(text, max_length=100, min_length=30, do_sample=False)
            )
            content = output[0]["summary_text"]

        elif content_type == "paraphrase":
            # Use text-generation pipeline for paraphrasing
            paraphrase_generator = pipeline(
                "text-generation", model=model, tokenizer=tokenizer
            )
            output = list(
                paraphrase_generator(
                    text,
                    max_length=len(text) + 20,
                    do_sample=True,
                    temperature=0.8,
                    top_k=50,
                )
            )
            content = output[0]["generated_text"]

        else:
            # Default generation logic
            output = list(
                generator(
                    text, max_length=200, do_sample=True, temperature=0.9, top_k=60
                )
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
        logger.error(f"Error generating text: {e} | Request: {body.json()}")
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
