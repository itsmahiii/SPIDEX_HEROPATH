def resolve_conflict(ocr_pin_office_id, ocr_confidence, nlp_office_id, nlp_confidence):
    """
    Decides between the OCR-extracted PIN's office and the NLP-extracted locality's office.
    In a real system, this would be a trained model (e.g., Logistic Regression or Gradient Boosted Tree)
    trained on historical user corrections.
    For the MVP, we use a weighted confidence logic.
    """
    if ocr_pin_office_id == nlp_office_id:
        # They agree
        return {
            "resolved_office_id": ocr_pin_office_id,
            "final_confidence": max(ocr_confidence, nlp_confidence),
            "is_conflict": False,
            "reasoning": "OCR and NLP resolved to the same office."
        }
        
    # They disagree (Address vs PIN mismatch)
    # Give slight precedence to NLP if handwriting OCR is notoriously flaky,
    # but weight it by the actual confidence scores.
    
    ocr_weight = 1.0
    nlp_weight = 1.2 # NLP is slightly more trustworthy if OCR missed a digit
    
    weighted_ocr = ocr_confidence * ocr_weight
    weighted_nlp = nlp_confidence * nlp_weight
    
    if weighted_nlp > weighted_ocr:
        return {
            "resolved_office_id": nlp_office_id,
            "final_confidence": nlp_confidence,
            "is_conflict": True,
            "reasoning": f"Conflict detected. NLP locality match ({nlp_confidence}%) outweighed OCR PIN match ({ocr_confidence}%)."
        }
    else:
        return {
            "resolved_office_id": ocr_pin_office_id,
            "final_confidence": ocr_confidence,
            "is_conflict": True,
            "reasoning": f"Conflict detected. OCR PIN match ({ocr_confidence}%) outweighed NLP locality match ({nlp_confidence}%)."
        }
