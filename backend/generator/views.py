import os
import jwt
import logging
from dotenv import load_dotenv
from typing import Optional
from fastapi import FastAPI, HTTPException, status, Request, Depends
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from fastapi.responses import JSONResponse
from transformers import pipeline, T5Tokenizer, T5ForConditionalGeneration

# Load environment variables
load_dotenv()

# Initialize FastAPI
app = FastAPI()

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
    jwt_secret = os.getenv("JWT_SECRET")
    if jwt_secret is None:
        logger.error("JWT_SECRET environment variable is not set")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error",
        )
    authorization_header = request.headers.get("Authorization")
    if authorization_header is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authentication token",
        )
    token = authorization_header.split()[1]
    try:
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

@app.on_event("startup")
async def startup():
    global generator
    model_name = "t5-small"
    tokenizer = T5Tokenizer.from_pretrained(model_name)
    model = T5ForConditionalGeneration.from_pretrained(model_name)
    generator = pipeline("text2text-generation", model=model_name, tokenizer=tokenizer)
    logger.info("Model loaded successfully")

# Request Model
class GenerateRequest(BaseModel):
    text: str
    type: Optional[str] = None

# Content Types
CONTENT_TYPES = ["summary", "uppercase", "lowercase", "reverse", "paraphrase"]

@app.post("/api/generate")
async def generate_content(body: GenerateRequest, _: Optional[str] = Depends(authenticate_user)):
    """
    Generate content based on the given input text and content type.

    Args:
        body (GenerateRequest): The request body containing the input text and content type.
        _: Optional[str]: The user authentication token.

    Returns:
        dict: A dictionary containing the generated content.

    Raises:
        HTTPException: If the model is not loaded, the text input is missing, or the content type is invalid.
        JSONResponse: If an error occurs while generating or processing the text.
    """
    if generator is None:
        raise HTTPException(status_code=500, detail="Model is not loaded")
    if not body.text:
        raise HTTPException(status_code=400, detail="Missing text input")
    if body.type and body.type not in CONTENT_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid content type. Choose from: {', '.join(CONTENT_TYPES)}",
        )
    try:
        output = generator(body.text, max_length=200, do_sample=True, temperature=0.9, top_k=60)
        if not output:
            raise HTTPException(status_code=500, detail="Error generating text")
        
        # Ensure the output format is consistent and process the generated text
        if isinstance(output, list) and len(output) > 0:
            content = output[0].get("generated_text", "")
        
        if body.type == "uppercase":
            content = content.upper()
        elif body.type == "lowercase":
            content = content.lower()
        elif body.type == "reverse":
            content = content[::-1]
        
        return {"content": content}
    except Exception as e:
        logger.error(f"Error generating text: {e} | Request: {body.json()}")
        return JSONResponse(
            {"error": "An error occurred while processing the text."},
            status_code=500,
        )
