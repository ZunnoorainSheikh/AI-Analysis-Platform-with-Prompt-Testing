from fastapi import FastAPI, UploadFile, File, HTTPException, Depends, Body
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import uuid
import pdfplumber
import google.generativeai as genai
import os
from crud import create_document, get_all_documents, get_prompt_templates, save_ai_analysis, get_all_analyses
from database import get_db
from schemas import DocumentOut, PromptTemplateOut, AIAnalysisOut
from models import Document
from sse_starlette.sse import EventSourceResponse
import asyncio
import json

app = FastAPI()

# Allow all origins for CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "Welcome to the AI Document Analysis Platform API! Visit /docs for the API documentation."}

@app.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db)
):
    # Validate file type
    if not (file.filename.endswith('.pdf') or file.filename.endswith('.txt')):
        raise HTTPException(status_code=400, detail="Only .pdf and .txt files are allowed.")
    # Validate file size (max 5MB)
    contents = await file.read()
    if len(contents) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File size exceeds 5MB limit.")
    # Generate UUID
    file_id = uuid.uuid4()
    # Extract text
    extracted_text = None
    if file.filename.endswith('.pdf'):
        try:
            with pdfplumber.open(file.file) as pdf:
                extracted_text = " ".join(page.extract_text() or '' for page in pdf.pages)
        except Exception:
            raise HTTPException(status_code=400, detail="Failed to extract text from PDF.")
    else:  # .txt
        try:
            extracted_text = contents.decode(errors='ignore')
        except Exception:
            raise HTTPException(status_code=400, detail="Failed to decode TXT file.")
    # Save to DB
    doc = await create_document(db, filename=file.filename, file_size=len(contents), extracted_text=extracted_text)
    # Return file_id
    return {"file_id": str(doc.id)}

@app.get("/documents", response_model=list[DocumentOut])
async def list_documents(db: AsyncSession = Depends(get_db)):
    docs = await get_all_documents(db)
    return docs

@app.get("/prompt-templates", response_model=list[PromptTemplateOut])
async def list_prompt_templates(db: AsyncSession = Depends(get_db)):
    templates = await get_prompt_templates(db)
    return templates

@app.post("/analyze")
async def analyze_document(
    data: dict = Body(...),
    db: AsyncSession = Depends(get_db)
):
    file_id = data.get("file_id")
    prompt = data.get("prompt")
    if not file_id or not prompt:
        raise HTTPException(status_code=400, detail="file_id and prompt are required.")
    # Load document
    result = await db.execute(select(Document).where(Document.id == file_id))
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")
    if not doc.extracted_text:
        raise HTTPException(status_code=400, detail="No extracted text available for this document.")
    # Call Google Gemini API (async)
    try:
        genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
        model = genai.GenerativeModel("gemini-pro")
        full_prompt = f"{prompt}\n\n{doc.extracted_text}"
        response = await model.generate_content_async(full_prompt)
        ai_text = response.text if hasattr(response, 'text') else str(response)
    except Exception as e:
        # Optionally log the error here
        raise HTTPException(status_code=500, detail=f"AI API error: {str(e)}")
    return {"response": ai_text}

@app.post("/save-analysis", response_model=AIAnalysisOut)
async def save_analysis(data: dict = Body(...), db: AsyncSession = Depends(get_db)):
    analysis = await save_ai_analysis(db, data)
    return analysis

@app.get("/analyses", response_model=list[AIAnalysisOut])
async def list_analyses(db: AsyncSession = Depends(get_db)):
    analyses = await get_all_analyses(db)
    return analyses

@app.get("/stream/{file_id}")
async def stream_progress(file_id: str):
    async def event_generator():
        stages = [
            ("Extracting text", 0, 30),
            ("Preparing for analysis", 30, 70),
            ("Ready for AI analysis", 70, 100)
        ]
        for stage_name, start, end in stages:
            for percent in range(start, end + 1, 10):
                yield {
                    "event": "update",
                    "data": json.dumps({
                        "stage": stage_name,
                        "progress": percent
                    })
                }
                await asyncio.sleep(0.5)
    return EventSourceResponse(event_generator())
