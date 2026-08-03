import os
import uuid
import datetime
from dotenv import load_dotenv
import sqlite3

# Load env variables
load_dotenv()

# We will use SQLite by default for the Hackathon MVP if Supabase is not provided,
# to ensure it works completely out of the box without network dependencies.
DB_PATH = "post_office.db"

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # 1. Office Registry
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS office_registry (
        office_id TEXT PRIMARY KEY,
        office_name TEXT NOT NULL,
        office_type TEXT NOT NULL,
        parent_ndc_id TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(parent_ndc_id) REFERENCES office_registry(office_id)
    )
    ''')
    
    # 2. PIN Office Mapping
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS pin_office_mapping (
        id TEXT PRIMARY KEY,
        pin TEXT NOT NULL,
        office_id TEXT NOT NULL,
        effective_from TIMESTAMP NOT NULL,
        effective_to TIMESTAMP,
        is_current BOOLEAN DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(office_id) REFERENCES office_registry(office_id)
    )
    ''')
    
    # 3. Routing Decisions
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS routing_decisions (
        id TEXT PRIMARY KEY,
        address_input TEXT,
        extracted_pin TEXT,
        extracted_locality TEXT,
        ocr_confidence REAL,
        nlp_score REAL,
        final_office_id TEXT,
        final_confidence REAL,
        is_conflict BOOLEAN DEFAULT 0,
        user_corrected_office_id TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(final_office_id) REFERENCES office_registry(office_id),
        FOREIGN KEY(user_corrected_office_id) REFERENCES office_registry(office_id)
    )
    ''')
    
    conn.commit()
    conn.close()

def get_db_connection():
    return sqlite3.connect(DB_PATH)

# Resolver Function (SQLite adaptation)
def resolve_post_office(query_pin, as_of_date=None):
    if as_of_date is None:
        as_of_date = datetime.datetime.now().isoformat()
        
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Step 1: Find active mapping
    cursor.execute('''
        SELECT office_id 
        FROM pin_office_mapping 
        WHERE pin = ? 
        AND effective_from <= ?
        AND (effective_to IS NULL OR effective_to > ?)
        ORDER BY effective_from DESC LIMIT 1
    ''', (query_pin, as_of_date, as_of_date))
    
    result = cursor.fetchone()
    if not result:
        conn.close()
        return None
        
    current_office_id = result[0]
    was_merged = False
    
    # Step 2: Follow merge chain
    while True:
        cursor.execute('SELECT parent_ndc_id, office_name, office_type FROM office_registry WHERE office_id = ?', (current_office_id,))
        office_row = cursor.fetchone()
        
        if not office_row:
            break
            
        parent_ndc_id, v_office_name, v_office_type = office_row
        
        if not parent_ndc_id:
            break
        else:
            current_office_id = parent_ndc_id
            was_merged = True
            
    conn.close()
    
    return {
        "resolved_office_id": current_office_id,
        "office_name": v_office_name,
        "office_type": v_office_type,
        "was_merged": was_merged
    }
