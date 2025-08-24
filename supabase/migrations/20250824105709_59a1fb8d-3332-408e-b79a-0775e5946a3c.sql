-- Remove extensions from public schema if they exist there
DROP EXTENSION IF EXISTS pg_cron;
DROP EXTENSION IF EXISTS pg_net;

-- Create dedicated schema for cron operations
CREATE SCHEMA IF NOT EXISTS cron;

-- Create pg_cron extension in cron schema
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA cron;

-- Create pg_net extension (it goes to its default schema)
CREATE EXTENSION IF NOT EXISTS pg_net;