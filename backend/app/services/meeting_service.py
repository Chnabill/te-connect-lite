from ..models.meeting import Meeting
from motor.motor_asyncio import AsyncIOMotorDatabase

async def create_meeting(db: AsyncIOMotorDatabase, meeting: Meeting):
    m = meeting.dict()
    result = await db.meetings.insert_one(m)
    m["id"] = str(result.inserted_id)
    return m
