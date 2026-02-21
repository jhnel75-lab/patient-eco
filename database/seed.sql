-- Patient Ecosystem POC - Seed Data
-- Run after schema.sql: psql -U postgres -d patient_ecosystem -f database/seed.sql

INSERT INTO patients (first_name, last_name, date_of_birth, email, phone, address, medical_record_number, insurance_provider, insurance_id, notes)
VALUES
  ('Jane',  'Doe',    '1985-03-12', 'jane.doe@example.com',   '555-0101', '123 Maple St, Springfield, IL 62701', 'MRN-00001', 'BlueCross',   'BC-123456', 'No known allergies'),
  ('John',  'Smith',  '1972-07-04', 'john.smith@example.com', '555-0102', '456 Oak Ave, Springfield, IL 62702',  'MRN-00002', 'Aetna',       'AE-789012', 'Penicillin allergy'),
  ('Alice', 'Johnson','1990-11-23', 'alice.j@example.com',    '555-0103', '789 Pine Rd, Springfield, IL 62703',  'MRN-00003', 'UnitedHealth','UH-345678', NULL)
ON CONFLICT (email) DO NOTHING;

SELECT 'Seed data inserted: ' || COUNT(*) || ' patients' AS status FROM patients;
