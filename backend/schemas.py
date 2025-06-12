from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID
from datetime import datetime

class DocumentCreate(BaseModel):
    filename: str = Field(..., max_length=255)
    file_size: int

class DocumentOut(BaseModel):
    id: UUID
    filename: str
    file_size: int
    upload_time: datetime
    status: str
    current_stage: Optional[str] = None
    progress: int
    text_length: Optional[int] = None
    language: Optional[str] = None

    class Config:
        from_attributes = True

class PromptTemplateOut(BaseModel):
    id: UUID
    name: str
    description: Optional[str] = None
    prompt_text: str
    category: Optional[str] = None
    variables: Optional[dict] = None
    example_output: Optional[str] = None
    usage_count: int
    created_at: datetime
    is_public: bool

    class Config:
        from_attributes = True

class AIAnalysisOut(BaseModel):
    id: UUID
    document_id: UUID
    prompt_template_id: Optional[UUID] = None
    final_prompt: str
    gemini_response: str
    response_metadata: Optional[dict] = None
    execution_time_ms: Optional[int] = None
    error_message: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
