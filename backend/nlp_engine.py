from rapidfuzz import process, fuzz
import sqlite3
from database import get_db_connection

def fuzzy_match_locality(locality_text, threshold=60.0):
    """
    Finds the best matching office from the office_registry based on address locality string.
    """
    if not locality_text:
        return None
        
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT office_id, office_name FROM office_registry')
    offices = cursor.fetchall()
    conn.close()
    
    office_names = [o[1] for o in offices]
    office_dict = {o[1]: o[0] for o in offices}
    
    # Use RapidFuzz for fuzzy matching
    result = process.extractOne(locality_text, office_names, scorer=fuzz.token_sort_ratio)
    
    if result:
        match_str, score, _ = result
        if score >= threshold:
            return {
                "office_id": office_dict[match_str],
                "office_name": match_str,
                "confidence": score
            }
            
    return None

def generate_digipin(lat, lon):
    """
    Mock function to generate a DIGIPIN (10 character alphanumeric geospatial code)
    Real implementation would use India Post's specific grid algorithm.
    """
    # Simple hash based on lat/lon to simulate a consistent DIGIPIN
    lat_str = f"{abs(lat):.4f}".replace(".", "")
    lon_str = f"{abs(lon):.4f}".replace(".", "")
    return f"DP-{lat_str[:4]}{lon_str[:3]}"
