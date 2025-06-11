-- ====================================================
-- Database Cleanup Script
-- Remove unnecessary tables and optimize structure
-- ====================================================

-- WARNING: This script will delete data. Make sure to backup first!
-- Run: pg_dump $DATABASE_URL > backup-before-cleanup.sql

BEGIN;

-- ====================================================
-- REMOVE UNNECESSARY TABLES
-- ====================================================

-- Drop test/temporary tables if they exist
DROP TABLE IF EXISTS test_table CASCADE;
DROP TABLE IF EXISTS temp_data CASCADE;
DROP TABLE IF EXISTS migration_test CASCADE;
DROP TABLE IF EXISTS backup_table CASCADE;

-- Drop legacy/unused tables (verify these are not needed)
DROP TABLE IF EXISTS old_questions CASCADE;
DROP TABLE IF EXISTS legacy_products CASCADE;
DROP TABLE IF EXISTS unused_mappings CASCADE;

-- ====================================================
-- REMOVE DUPLICATE/REDUNDANT COLUMNS
-- ====================================================

-- Clean up questions table - remove redundant columns
-- Keep the new standardized columns, remove legacy ones
ALTER TABLE questions 
DROP COLUMN IF EXISTS question_text,
DROP COLUMN IF EXISTS question_type,
DROP COLUMN IF EXISTS group_id,
DROP COLUMN IF EXISTS tooltip,
DROP COLUMN IF EXISTS "order";

-- Clean up answer_choices table - remove redundant columns
ALTER TABLE answer_choices 
DROP COLUMN IF EXISTS answer_text,
DROP COLUMN IF EXISTS impact,
DROP COLUMN IF EXISTS icon,
DROP COLUMN IF EXISTS weightage,
DROP COLUMN IF EXISTS repair_cost,
DROP COLUMN IF EXISTS follow_up_action,
DROP COLUMN IF EXISTS is_default,
DROP COLUMN IF EXISTS "order";

-- Clean up question_groups table - remove legacy columns
ALTER TABLE question_groups 
DROP COLUMN IF EXISTS device_type_id,
DROP COLUMN IF EXISTS icon;

-- ====================================================
-- STANDARDIZE COLUMN NAMES
-- ====================================================

-- Ensure consistent naming conventions
-- questions.text is the standard column name
UPDATE questions SET text = question_text WHERE text IS NULL AND question_text IS NOT NULL;

-- answer_choices.text is the standard column name  
UPDATE answer_choices SET text = answer_text WHERE text IS NULL AND answer_text IS NOT NULL;

-- ====================================================
-- REMOVE ORPHANED RECORDS
-- ====================================================

-- Remove questions without valid question groups
DELETE FROM questions 
WHERE question_group_id NOT IN (SELECT id FROM question_groups);

-- Remove answer choices without valid questions
DELETE FROM answer_choices 
WHERE question_id NOT IN (SELECT id FROM questions);

-- Remove device mappings for non-existent models
DELETE FROM device_question_mappings 
WHERE device_model_id NOT IN (SELECT id FROM device_models);

-- Remove device mappings for non-existent questions
DELETE FROM device_question_mappings 
WHERE question_id NOT IN (SELECT id FROM questions);

-- Remove partner staff for non-existent partners
DELETE FROM partner_staff 
WHERE partner_id NOT IN (SELECT id FROM partners);

-- Remove wallet transactions for non-existent wallets
DELETE FROM wallet_transactions 
WHERE wallet_id NOT IN (SELECT id FROM partner_wallets);

-- ====================================================
-- CONSOLIDATE DUPLICATE DATA
-- ====================================================

-- Remove duplicate brand-device type relationships
DELETE FROM brand_device_types a 
USING brand_device_types b 
WHERE a.id > b.id 
AND a.brand_id = b.brand_id 
AND a.device_type_id = b.device_type_id;

-- Remove duplicate device question mappings
DELETE FROM device_question_mappings a 
USING device_question_mappings b 
WHERE a.id > b.id 
AND a.device_model_id = b.device_model_id 
AND a.question_id = b.question_id;

-- ====================================================
-- OPTIMIZE SEQUENCES
-- ====================================================

-- Reset sequences to match current max IDs
SELECT setval('users_id_seq', COALESCE((SELECT MAX(id) FROM users), 1));
SELECT setval('partners_id_seq', COALESCE((SELECT MAX(id) FROM partners), 1));
SELECT setval('device_types_id_seq', COALESCE((SELECT MAX(id) FROM device_types), 1));
SELECT setval('brands_id_seq', COALESCE((SELECT MAX(id) FROM brands), 1));
SELECT setval('device_models_id_seq', COALESCE((SELECT MAX(id) FROM device_models), 1));
SELECT setval('question_groups_id_seq', COALESCE((SELECT MAX(id) FROM question_groups), 1));
SELECT setval('questions_id_seq', COALESCE((SELECT MAX(id) FROM questions), 1));
SELECT setval('answer_choices_id_seq', COALESCE((SELECT MAX(id) FROM answer_choices), 1));
SELECT setval('buyback_requests_id_seq', COALESCE((SELECT MAX(id) FROM buyback_requests), 1));

-- ====================================================
-- UPDATE STATISTICS AND VACUUM
-- ====================================================

-- Update table statistics for better query planning
ANALYZE;

-- Vacuum to reclaim space
VACUUM;

-- ====================================================
-- VERIFY CLEANUP RESULTS
-- ====================================================

-- Show remaining table sizes
SELECT 
    schemaname,
    tablename,
    attname,
    n_distinct,
    null_frac,
    avg_width,
    correlation
FROM pg_stats 
WHERE schemaname = 'public' 
ORDER BY tablename, attname;

-- Show table row counts after cleanup
SELECT 
    t.table_name,
    (xpath('/row/cnt/text()', xml_count))[1]::text::int as row_count
FROM (
    SELECT 
        table_name, 
        query_to_xml(format('SELECT count(*) as cnt FROM %I.%I', table_schema, table_name), false, true, '') as xml_count
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
) t
ORDER BY row_count DESC;

-- ====================================================
-- FINAL RECOMMENDATIONS
-- ====================================================

/*
Post-cleanup recommendations:

1. BACKUP: Always maintain regular backups
   pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

2. MONITORING: Set up monitoring for:
   - Table sizes and growth
   - Query performance
   - Index usage

3. MAINTENANCE: Schedule regular maintenance:
   - Weekly VACUUM ANALYZE
   - Monthly REINDEX
   - Quarterly cleanup of old data

4. CONSTRAINTS: Consider adding constraints for data integrity:
   - Foreign key constraints
   - Check constraints for valid values
   - Unique constraints where needed

5. PARTITIONING: For large tables (buyback_requests, wallet_transactions):
   - Consider partitioning by date
   - Archive old data to separate tables

6. INDEXES: Review and optimize indexes:
   - Remove unused indexes
   - Add composite indexes for common queries
   - Monitor index usage statistics
*/

COMMIT;

-- Show final status
SELECT 'Database cleanup completed successfully!' as status;