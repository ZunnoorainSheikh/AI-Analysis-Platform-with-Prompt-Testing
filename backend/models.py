from sqlalchemy import Column, String, Integer, Text, TIMESTAMP, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
from sqlalchemy.orm import Mapped
import uuid
from database import Base

class Document(Base):
    __tablename__ = "documents"

    id: Mapped[uuid.UUID] = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, unique=True, nullable=False)
    filename: Mapped[str] = Column(String(255), nullable=False)
    file_size: Mapped[int] = Column(Integer, nullable=False)
    upload_time: Mapped = Column(TIMESTAMP(timezone=True), server_default=func.now(), nullable=False)
    status: Mapped[str] = Column(String(50), nullable=False, default="uploaded", server_default="uploaded")
    current_stage: Mapped[str | None] = Column(String(100), nullable=True)
    progress: Mapped[int] = Column(Integer, nullable=False, default=0, server_default="0")
    extracted_text: Mapped[str | None] = Column(Text, nullable=True)
    text_length: Mapped[int | None] = Column(Integer, nullable=True)
    language: Mapped[str | None] = Column(String(50), nullable=True)

class PromptTemplate(Base):
    __tablename__ = "prompt_templates"

    id: Mapped[uuid.UUID] = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, unique=True, nullable=False)
    name: Mapped[str] = Column(String(255), nullable=False)
    description: Mapped[str] = Column(Text, nullable=True)
    prompt_text: Mapped[str] = Column(Text, nullable=False)
    category: Mapped[str] = Column(String(100), nullable=True)
    variables: Mapped = Column(JSONB, nullable=True)
    example_output: Mapped[str] = Column(Text, nullable=True)
    usage_count: Mapped[int] = Column(Integer, nullable=False, default=0, server_default="0")
    created_at: Mapped = Column(TIMESTAMP(timezone=True), server_default=func.now(), nullable=False)
    is_public: Mapped[bool] = Column(Boolean, nullable=False, default=False, server_default="false")

class AIAnalysis(Base):
    __tablename__ = "ai_analyses"

    id: Mapped[uuid.UUID] = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, unique=True, nullable=False)
    document_id: Mapped[uuid.UUID] = Column(UUID(as_uuid=True), ForeignKey("documents.id"), nullable=False)
    prompt_template_id: Mapped[uuid.UUID | None] = Column(UUID(as_uuid=True), ForeignKey("prompt_templates.id"), nullable=True)
    final_prompt: Mapped[str] = Column(Text, nullable=False)
    gemini_response: Mapped[str] = Column(Text, nullable=False)
    response_metadata: Mapped = Column(JSONB, nullable=True)
    execution_time_ms: Mapped[int] = Column(Integer, nullable=True)
    error_message: Mapped[str] = Column(Text, nullable=True)
    created_at: Mapped = Column(TIMESTAMP(timezone=True), server_default=func.now(), nullable=False)
