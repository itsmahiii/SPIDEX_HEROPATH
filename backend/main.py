import uuid
import datetime
import re
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from database import resolve_post_office, get_db_connection
from nlp_engine import fuzzy_match_locality, generate_digipin
from ml_model import resolve_conflict
from synthetic_data import simulate_reorganization

app = FastAPI(title="India Post AI Routing API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ExtractRequest(BaseModel):
    address_text: str

class ResolveRequest(BaseModel):
    pin: str = None
    locality: str = None
    ocr_confidence: float = 0.0
    
class ReorgRequest(BaseModel):
    pins: list[str]
    new_ndc_name: str

@app.post("/api/extract")
def extract_address(req: ExtractRequest):
    """
    Simulates OCR/Text extraction from a messy address.
    """
    text = req.address_text
    
    # 1. Try to extract PIN
    pin_match = re.search(r'\b\d{6}\b', text)
    extracted_pin = pin_match.group(0) if pin_match else None
    
    # Simulate OCR confidence: If it looks perfectly typed, high confidence.
    ocr_conf = 95.0 if extracted_pin else 0.0
    
    # 2. Extract Locality (Naive simulation for MVP: assume everything before the PIN is locality)
    extracted_locality = text.replace(extracted_pin, "").strip() if extracted_pin else text.strip()
    
    return {
        "extracted_pin": extracted_pin,
        "extracted_locality": extracted_locality,
        "ocr_confidence": ocr_conf
    }

@app.post("/api/resolve")
def resolve_address(req: ResolveRequest):
    """
    The core resolution engine combining Time-Aware Mapping and NLP Fuzzy Matching.
    """
    ocr_office_id = None
    ocr_office_name = None
    ocr_was_merged = False
    
    # 1. Time-Aware PIN Resolution
    if req.pin:
        pin_result = resolve_post_office(req.pin)
        if pin_result:
            ocr_office_id = pin_result["resolved_office_id"]
            ocr_office_name = pin_result["office_name"]
            ocr_was_merged = pin_result["was_merged"]
            
    # 2. NLP Locality Resolution
    nlp_result = fuzzy_match_locality(req.locality)
    
    nlp_office_id = nlp_result["office_id"] if nlp_result else None
    nlp_office_name = nlp_result["office_name"] if nlp_result else None
    nlp_conf = nlp_result["confidence"] if nlp_result else 0.0
    
    # 3. Conflict Resolution Layer
    if not ocr_office_id and not nlp_office_id:
        raise HTTPException(status_code=400, detail="Could not resolve address.")
        
    final_decision = None
    if ocr_office_id and not nlp_office_id:
        final_decision = {
            "resolved_office_id": ocr_office_id,
            "office_name": ocr_office_name,
            "final_confidence": req.ocr_confidence,
            "is_conflict": False,
            "reasoning": "Only PIN was detected."
        }
    elif nlp_office_id and not ocr_office_id:
        final_decision = {
            "resolved_office_id": nlp_office_id,
            "office_name": nlp_office_name,
            "final_confidence": nlp_conf,
            "is_conflict": False,
            "reasoning": "Only locality was detected (Missing PIN box fallback handled)."
        }
    else:
        # Both present, use ML Conflict Resolver
        ml_decision = resolve_conflict(ocr_office_id, req.ocr_confidence, nlp_office_id, nlp_conf)
        final_name = ocr_office_name if ml_decision["resolved_office_id"] == ocr_office_id else nlp_office_name
        final_decision = {
            **ml_decision,
            "office_name": final_name
        }
        
    # 4. Generate candidate DIGIPIN (mocked for demo)
    # Using dummy coordinates based on string length to simulate variety
    dummy_lat = 13.0 + (len(final_decision["office_name"]) * 0.01)
    dummy_lon = 80.0 + (len(final_decision["office_name"]) * 0.01)
    digipin = generate_digipin(dummy_lat, dummy_lon)
    
    return {
        **final_decision,
        "pin_was_merged": ocr_was_merged,
        "candidate_digipin": digipin
    }

@app.post("/api/simulate-reorg")
def simulate_reorg(req: ReorgRequest):
    simulate_reorganization(req.pins, req.new_ndc_name)
    return {"status": "success", "message": f"Merged into {req.new_ndc_name}"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
