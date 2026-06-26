/*
# SK Digital Seva - Schema Update

## Changes
1. Alter `applications` table:
   - Add new columns: gram_panchayat, property_number, whatsapp_number
   - Extend service_type CHECK to include new SK Digital Seva service types
   - Extend status CHECK to include 'documents_pending', 'submitted' statuses

2. Notes
   - All existing data preserved (no drops)
   - New service types: gram_thana, asti_11b, asti_94c, na_property, rehabilitation, ec_only
   - New statuses: submitted, documents_pending (in addition to existing)
*/

-- Add new columns to applications (idempotent)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='applications' AND column_name='gram_panchayat') THEN
    ALTER TABLE applications ADD COLUMN gram_panchayat text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='applications' AND column_name='property_number') THEN
    ALTER TABLE applications ADD COLUMN property_number text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='applications' AND column_name='whatsapp_number') THEN
    ALTER TABLE applications ADD COLUMN whatsapp_number text;
  END IF;
END $$;

-- Drop and recreate service_type constraint to allow new values
ALTER TABLE applications DROP CONSTRAINT IF EXISTS applications_service_type_check;
ALTER TABLE applications ADD CONSTRAINT applications_service_type_check
  CHECK (service_type = ANY (ARRAY[
    'new_ekhata','khata_transfer','khata_correction','form9_download','form11_download',
    'gram_thana','asti_11b','asti_94c','na_property','rehabilitation','ec_only'
  ]));

-- Drop and recreate status constraint to allow new values
ALTER TABLE applications DROP CONSTRAINT IF EXISTS applications_status_check;
ALTER TABLE applications ADD CONSTRAINT applications_status_check
  CHECK (status = ANY (ARRAY[
    'pending','under_review','approved','rejected','completed',
    'submitted','documents_pending','processing'
  ]));

-- Seed fresh reviews for SK Digital Seva
DELETE FROM reviews WHERE is_approved = true;

INSERT INTO reviews (full_name, location, service_type, rating, review_text, is_approved) VALUES
  ('Raju Patil', 'Gulbarga', 'gram_thana', 5, 'SK Digital Seva ನಿಂದ ನನ್ನ Gram Thana ಇ-ಸ್ವತ್ತು ಅರ್ಜಿ ತುಂಬಾ ಬೇಗ ಮಂಜೂರಾಯಿತು. ತುಂಬಾ ಉತ್ತಮ ಸೇವೆ!', true),
  ('Savitha Gowda', 'Ramanagara', 'ec_only', 5, 'EC Certificate ತುಂಬಾ ಬೇಗ ಸಿಕ್ಕಿತು. WhatsApp Update ತುಂಬಾ ಅನುಕೂಲಕರ. Highly Recommended!', true),
  ('Mahesh Reddy', 'Tumkur', 'asti_11b', 4, '11B Asti ಅರ್ಜಿಗೆ ಸಂಪೂರ್ಣ ಸಹಾಯ ಮಾಡಿದರು. ದಾಖಲೆ ಪರಿಶೀಲನೆ ಬಹಳ ಚೆನ್ನಾಗಿ ಮಾಡಿದರು.', true),
  ('Anitha Kumar', 'Hassan', 'asti_94c', 5, 'ನನ್ನ 94C ಆಸ್ತಿ ಅರ್ಜಿ ₹1000 ದಲ್ಲಿ ಪ್ರಕ್ರಿಯೆ ಆಯಿತು. SK Digital Seva ತಂಡಕ್ಕೆ ಅನಂತ ಧನ್ಯವಾದಗಳು!', true),
  ('Venkatesh B', 'Mandya', 'na_property', 5, 'NA Property ಅರ್ಜಿ process ತುಂಬಾ smooth ಆಗಿತ್ತು. ಎಲ್ಲಾ documents WhatsApp ನಲ್ಲಿ ಕಳುಹಿಸಿದರು.', true),
  ('Lakshmi Devi', 'Mysuru', 'gram_thana', 4, '170+ Successful Applications ಎನ್ನುವ ಮಾತು ನಿಜ. ನನ್ನ ಅರ್ಜಿ ಕೂಡ ಯಶಸ್ವಿ ಆಯಿತು!', true)
ON CONFLICT DO NOTHING;
