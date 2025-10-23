from ..models.document import Document
from motor.motor_asyncio import AsyncIOMotorDatabase

async def create_document(db: AsyncIOMotorDatabase, document: Document):
    doc = document.dict()
    result = await db.documents.insert_one(doc)
    doc["id"] = str(result.inserted_id)
    return doc
