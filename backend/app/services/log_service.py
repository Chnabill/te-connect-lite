from ..models.log import Log
from motor.motor_asyncio import AsyncIOMotorDatabase

async def create_log(db: AsyncIOMotorDatabase, log: Log):
    l = log.dict()
    result = await db.logs.insert_one(l)
    l["id"] = str(result.inserted_id)
    return l
