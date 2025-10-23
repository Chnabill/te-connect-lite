from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.models.document import Document
from app.models.user import User
from app.schemas.document import DocumentCreate, DocumentOut
from database import get_db
from app.auth.jwt import get_current_user
from datetime import datetime

router = APIRouter(tags=["Documents"])

@router.post("/", response_model=DocumentOut)
def create_document(
    document: DocumentCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    # Only authenticated users can create
    user = db.query(User).filter(User.id == current_user.get("user_id")).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    db_document = Document(
        title=document.title,
        file_url=document.file_url,
        owner_id=user.id,
        uploaded_at=datetime.utcnow(),
        category=document.category,
        type=document.type,
        size=document.size,
        version=document.version,
        tags=",".join(document.tags) if document.tags else None
    )
    db.add(db_document)
    db.commit()
    db.refresh(db_document)
    return DocumentOut(
        id=db_document.id,
        title=db_document.title,
        file_url=db_document.file_url,
        owner_id=db_document.owner_id,
        uploaded_at=db_document.uploaded_at,
        category=db_document.category,
        type=db_document.type,
        size=db_document.size,
        version=db_document.version,
        tags=db_document.tags.split(",") if db_document.tags else []
    )

@router.get("/", response_model=List[DocumentOut])
def list_documents(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
    owner_id: Optional[int] = Query(None),
    category: Optional[str] = Query(None),
    type: Optional[str] = Query(None),
    search: Optional[str] = Query(None)
):
    query = db.query(Document)
    if owner_id:
        query = query.filter(Document.owner_id == owner_id)
    if category:
        query = query.filter(Document.category == category)
    if type:
        query = query.filter(Document.type == type)
    if search:
        search_lower = f"%{search.lower()}%"
        query = query.filter(Document.title.ilike(search_lower) | Document.tags.ilike(search_lower))
    documents = query.order_by(Document.uploaded_at.desc()).all()
    return [
        DocumentOut(
            id=doc.id,
            title=doc.title,
            file_url=doc.file_url,
            owner_id=doc.owner_id,
            uploaded_at=doc.uploaded_at,
            category=doc.category,
            type=doc.type,
            size=doc.size,
            version=doc.version,
            tags=doc.tags.split(",") if doc.tags else []
        ) for doc in documents
    ]

@router.delete("/{document_id}")
def delete_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    # Only allow owner or admin (assuming user has 'is_admin' attribute)
    user = db.query(User).filter(User.id == current_user.get("user_id")).first()
    if not user or (doc.owner_id != user.id and not getattr(user, 'is_admin', False)):
        raise HTTPException(status_code=403, detail="Not authorized to delete this document")
    db.delete(doc)
    db.commit()
    return {"detail": "Document deleted successfully"}
