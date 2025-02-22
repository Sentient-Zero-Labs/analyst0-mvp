## How to setup timescaledb's pgvector and pgvectorscale extension

1. Run timescale db docker compose up

2. Run the following command in postgres to create the extension:
```bash
CREATE EXTENSION IF NOT EXISTS vectorscale CASCADE;
```

3. Check if vector and vector scale extensions are created:
```sql
SELECT * FROM pg_available_extensions WHERE name = 'vector' or name = 'vectorscale';
```

4. Index `embeddings` column for `data_entity`, `charter_example`, `charter_metric` and `charter_metric_example`.
```sql
CREATE INDEX data_entity_embeddings_idx ON data_entity USING diskann (embeddings);
CREATE INDEX charter_example_embeddings_idx ON charter_example USING diskann (embeddings);
CREATE INDEX charter_metric_embeddings_idx ON charter_metric USING diskann (embeddings);
CREATE INDEX charter_metric_example_embeddings_idx ON charter_metric_example USING diskann (embeddings);
```
