from sqlalchemy import select, update, desc
from sqlalchemy.ext.asyncio import AsyncSession
from models import Document, PromptTemplate, AIAnalysis
import uuid

async def create_document(db: AsyncSession, filename: str, file_size: int, extracted_text: str | None = None) -> Document:
    new_doc = Document(filename=filename, file_size=file_size, extracted_text=extracted_text)
    db.add(new_doc)
    await db.commit()
    await db.refresh(new_doc)
    return new_doc

async def update_document_stage(db: AsyncSession, file_id: uuid.UUID, stage: str, progress: int, status: str) -> Document | None:
    q = (
        update(Document)
        .where(Document.id == file_id)
        .values(current_stage=stage, progress=progress, status=status)
        .returning(Document)
    )
    result = await db.execute(q)
    await db.commit()
    updated_doc = result.fetchone()
    return updated_doc[0] if updated_doc else None

async def get_all_documents(db: AsyncSession) -> list[Document]:
    q = select(Document).order_by(desc(Document.upload_time))
    result = await db.execute(q)
    return result.scalars().all()

async def get_prompt_templates(db: AsyncSession):
    q = select(PromptTemplate).order_by(desc(PromptTemplate.created_at))
    result = await db.execute(q)
    return result.scalars().all()

async def save_ai_analysis(db: AsyncSession, data: dict):
    new_analysis = AIAnalysis(**data)
    db.add(new_analysis)
    await db.commit()
    await db.refresh(new_analysis)
    return new_analysis

async def get_all_analyses(db: AsyncSession):
    q = select(AIAnalysis).order_by(desc(AIAnalysis.created_at))
    result = await db.execute(q)
    return result.scalars().all()
