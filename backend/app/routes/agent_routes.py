from fastapi import APIRouter
from fastapi.responses import JSONResponse
from ..agent_logic import process_medical_query, get_symptom_guidance

agent_router = APIRouter(prefix="/api/agent", tags=["agent"])

@agent_router.post("/query")
async def handle_agent_query(body: dict):
    user_query = body.get("query", "")
    if not user_query:
        return JSONResponse({"error": "Query is required"}, status_code=400)
    return process_medical_query(user_query)

@agent_router.post("/symptom-guidance")
async def get_symptom_help(body: dict):
    symptom = body.get("symptom")
    organ_system = body.get("organ_system")
    if not symptom or not organ_system:
        return JSONResponse({"error": "Symptom and organ_system required"}, status_code=400)
    return get_symptom_guidance(symptom, organ_system)
