-- Fix business sequence to start at 201
SELECT setval('businesses_short_id_seq', 200, false);

-- Fix customer sequence to start at 101
SELECT setval('customers_short_id_seq', 100, false);