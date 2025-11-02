
from fastapi import APIRouter
from pydantic import BaseModel
from ..services.psir_validator import parse_psir, validate_psir

router = APIRouter()

class PSIRBody(BaseModel):
    text: str

@router.post("/validate")
def validate(body: PSIRBody):
    ast = parse_psir(body.text)
    validate_psir(ast)  # raises on error
    return {"ok": True, "entities": len(ast["entities"]), "forces": len(ast["forces"]), "invariants": len(ast["invariants"]) }
