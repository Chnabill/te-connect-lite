from ..models.role import Role
from motor.motor_asyncio import AsyncIOMotorDatabase

async def create_role(db: AsyncIOMotorDatabase, role: Role):
    r = role.dict()
    result = await db.roles.insert_one(r)
    r["id"] = str(result.inserted_id)
    return r
