-- Set sequences to continue after current max values
SELECT setval('businesses_short_id_seq', GREATEST((SELECT MAX(short_id) FROM businesses), 200));
SELECT setval('customers_short_id_seq', GREATEST((SELECT MAX(short_id) FROM customers), 100));