-- Supabase Schema for AI Delivery Post Office Identification

-- 1. Office Registry
-- Stores all post offices, including NDCs (Nodal Delivery Centres).
CREATE TABLE office_registry (
    office_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    office_name VARCHAR(255) NOT NULL,
    office_type VARCHAR(50) NOT NULL CHECK (office_type IN ('SO', 'HO', 'BO', 'NDC', 'IDC')),
    parent_ndc_id UUID REFERENCES office_registry(office_id), -- If this office was merged into an NDC
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Time-Aware PIN Mapping
-- Maps a PIN code to an office, but with effective dates to handle reorganizations.
CREATE TABLE pin_office_mapping (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pin VARCHAR(10) NOT NULL,
    office_id UUID NOT NULL REFERENCES office_registry(office_id),
    effective_from TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    effective_to TIMESTAMP WITH TIME ZONE, -- NULL means it's currently active
    is_current BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for fast lookup by PIN and date
CREATE INDEX idx_pin_office_active ON pin_office_mapping(pin) WHERE is_current = TRUE;

-- 3. Routing Decisions (Audit Log)
-- Stores the trace of every AI routing decision for explainability.
CREATE TABLE routing_decisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    address_input TEXT,
    extracted_pin VARCHAR(10),
    extracted_locality VARCHAR(255),
    ocr_confidence FLOAT,
    nlp_score FLOAT,
    final_office_id UUID REFERENCES office_registry(office_id),
    final_confidence FLOAT,
    is_conflict BOOLEAN DEFAULT FALSE,
    user_corrected_office_id UUID REFERENCES office_registry(office_id), -- For feedback loop
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Resolver Function (PL/pgSQL)
-- Given a PIN and an optional date, finds the correct current delivery office,
-- following the parent_ndc_id chain if the office was merged.
CREATE OR REPLACE FUNCTION resolve_post_office(query_pin VARCHAR(10), as_of_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP)
RETURNS TABLE (
    resolved_office_id UUID,
    office_name VARCHAR,
    office_type VARCHAR,
    was_merged BOOLEAN
) AS $$
DECLARE
    initial_office_id UUID;
    current_office_id UUID;
    next_office_id UUID;
    v_office_name VARCHAR;
    v_office_type VARCHAR;
    v_was_merged BOOLEAN := FALSE;
BEGIN
    -- Step 1: Find the mapping for the PIN at the given date
    SELECT office_id INTO initial_office_id
    FROM pin_office_mapping
    WHERE pin = query_pin
      AND effective_from <= as_of_date
      AND (effective_to IS NULL OR effective_to > as_of_date)
    ORDER BY effective_from DESC
    LIMIT 1;

    IF initial_office_id IS NULL THEN
        RETURN; -- No mapping found
    END IF;

    current_office_id := initial_office_id;

    -- Step 2: Follow the merge chain (if the office was absorbed by an NDC)
    LOOP
        SELECT parent_ndc_id, office_registry.office_name, office_registry.office_type 
        INTO next_office_id, v_office_name, v_office_type
        FROM office_registry
        WHERE office_id = current_office_id;

        IF next_office_id IS NULL THEN
            EXIT; -- We reached the terminal/current delivery centre
        ELSE
            current_office_id := next_office_id;
            v_was_merged := TRUE;
        END IF;
    END LOOP;

    -- Return the final resolved office
    RETURN QUERY SELECT current_office_id, v_office_name, v_office_type, v_was_merged;
END;
$$ LANGUAGE plpgsql;
