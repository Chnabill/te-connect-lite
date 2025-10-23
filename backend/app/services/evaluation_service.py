from ..models.evaluation import Evaluation
from motor.motor_asyncio import AsyncIOMotorDatabase

async def create_evaluation(db: AsyncIOMotorDatabase, evaluation: Evaluation):
    ev = evaluation.dict()
    result = await db.evaluations.insert_one(ev)
    ev["id"] = str(result.inserted_id)
    return ev
