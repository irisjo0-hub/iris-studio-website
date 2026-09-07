-- Keep PostgreSQL extensions out of the public API schema.
-- btree_gist backs the bookings exclusion constraint and is relocatable;
-- moving the extension preserves the existing constraint/object dependencies.
CREATE SCHEMA IF NOT EXISTS extensions;
ALTER EXTENSION btree_gist SET SCHEMA extensions;
