import sqlite3
import uuid
import datetime
import random
from database import init_db, get_db_connection

def generate_baseline_data():
    init_db()
    conn = get_db_connection()
    cursor = conn.cursor()

    # Clear existing
    cursor.execute('DELETE FROM pin_office_mapping')
    cursor.execute('DELETE FROM office_registry')

    # Some mock post offices and PINs
    base_data = [
        {"pin": "600001", "name": "Chennai G.P.O", "type": "HO"},
        {"pin": "600002", "name": "Anna Road H.O", "type": "HO"},
        {"pin": "600003", "name": "Park Town S.O", "type": "SO"},
        {"pin": "600004", "name": "Mylapore H.O", "type": "HO"},
        {"pin": "600005", "name": "Triplicane S.O", "type": "SO"},
        {"pin": "110001", "name": "New Delhi G.P.O", "type": "HO"},
        {"pin": "110002", "name": "Indraprastha H.O", "type": "HO"}
    ]

    for item in base_data:
        office_id = str(uuid.uuid4())
        cursor.execute(
            'INSERT INTO office_registry (office_id, office_name, office_type) VALUES (?, ?, ?)',
            (office_id, item["name"], item["type"])
        )
        
        mapping_id = str(uuid.uuid4())
        effective_from = (datetime.datetime.now() - datetime.timedelta(days=365*5)).isoformat() # 5 years ago
        cursor.execute(
            'INSERT INTO pin_office_mapping (id, pin, office_id, effective_from, is_current) VALUES (?, ?, ?, ?, ?)',
            (mapping_id, item["pin"], office_id, effective_from, True)
        )

    conn.commit()
    conn.close()
    print("Baseline data generated successfully.")

def simulate_reorganization(pins_to_merge, new_ndc_name):
    """
    Simulates merging multiple PINs into a new Nodal Delivery Centre (NDC).
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 1. Create the new NDC
    new_ndc_id = str(uuid.uuid4())
    cursor.execute(
        'INSERT INTO office_registry (office_id, office_name, office_type) VALUES (?, ?, ?)',
        (new_ndc_id, new_ndc_name, 'NDC')
    )
    
    now = datetime.datetime.now().isoformat()
    
    for pin in pins_to_merge:
        # Find current active office for this PIN
        cursor.execute('SELECT office_id FROM pin_office_mapping WHERE pin = ? AND is_current = 1', (pin,))
        row = cursor.fetchone()
        if not row:
            continue
            
        old_office_id = row[0]
        
        # 2. Update old office's parent_ndc_id (Merge it)
        cursor.execute('UPDATE office_registry SET parent_ndc_id = ? WHERE office_id = ?', (new_ndc_id, old_office_id))
        
        # 3. Close the old mapping
        cursor.execute('UPDATE pin_office_mapping SET effective_to = ?, is_current = 0 WHERE pin = ? AND is_current = 1', (now, pin))
        
        # 4. Insert new mapping pointing to NDC
        new_mapping_id = str(uuid.uuid4())
        cursor.execute(
            'INSERT INTO pin_office_mapping (id, pin, office_id, effective_from, is_current) VALUES (?, ?, ?, ?, ?)',
            (new_mapping_id, pin, new_ndc_id, now, True)
        )
        
    conn.commit()
    conn.close()
    print(f"Reorganization simulated: {pins_to_merge} merged into {new_ndc_name}")

if __name__ == "__main__":
    generate_baseline_data()
    # Simulate a reorganization right away for testing
    simulate_reorganization(["600001", "600002", "600003"], "Chennai Central NDC")
