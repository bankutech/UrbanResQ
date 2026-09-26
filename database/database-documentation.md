# UrbanResQ — Database Documentation

## Files & run order

```
schema.sql      -- tables, constraints, indexes
functions.sql   -- fn_haversine_km, fn_request_priority_score, fn_stock_status
procedures.sql  -- sp_generate_resource_allocation_plan, sp_admit_patient
triggers.sql    -- history/audit/shortage-detection triggers
views.sql       -- vw_* analytical views
seed.sql        -- structural seed data (locations, disasters, resources, hospitals, shelters, teams…)
```

`users` and `user_roles` are **not** in `seed.sql` — they're seeded by
`backend/src/database/seed-users.ts` because bcrypt hashing has to happen in
application code. Run:

```bash
mysql -u root -p < database/schema.sql
mysql -u root -p urbanresq < database/functions.sql
mysql -u root -p urbanresq < database/procedures.sql
mysql -u root -p urbanresq < database/triggers.sql
mysql -u root -p urbanresq < database/views.sql
mysql -u root -p urbanresq < database/seed.sql
cd backend && npm run db:seed:users
```

(`scripts/setup-db.sh` runs all of this in one command — see repo root.)

## Why each advanced feature exists

| Feature | Where | Why the project needs it (not decoration) |
|---|---|---|
| **Transactions + row locks** | `sp_generate_resource_allocation_plan`, `sp_admit_patient` | Allocation is a check-then-act operation on shared inventory. Without `FOR UPDATE` inside a transaction, two concurrent allocation runs (or two operators clicking "Allocate" at once) could both read the same available quantity and double-allocate it. |
| **Stored procedure** | Allocation engine | Centralizes the multi-step "score → rank → allocate → record → detect shortage → alert" workflow in the database itself, so it runs atomically regardless of which API route or script calls it, and so the *dry-run* (simulation) and *live* paths share exactly one implementation. |
| **Triggers** | `triggers.sql` | Keep derived counters (hospital bed counts, shelter occupancy, shortage records) correct **no matter which code path** wrote the row — a manual `INSERT` from a DB console stays consistent, not just inserts routed through the "correct" API function. |
| **Views + window functions** | `views.sql` | `RANK()`/`PERCENT_RANK()` power "rank within zone" and response-time percentiles — these are inherently comparative calculations that are awkward and slow to do in application code across paginated results. |
| **Recursive CTE** | `sample_queries.sql` (date spine), `seed.sql` (row generator) | Fills gaps in the daily emergency trend chart — a day with zero requests must still render as `0`, not be silently absent, which a plain `GROUP BY` cannot do without a generated date series. |
| **Generated columns** | `resource_inventory.is_below_threshold`, `resource_shortages.deficit` | Both are simple deterministic functions of other columns; storing them as generated+indexed columns lets the dashboard query "what's below threshold" with an index instead of recomputing across the whole table on every request. |
| **JSON columns** | `disasters.metadata`, `emergency_requests.required_resources_json` | Genuinely variable-shape data (a flood has rainfall_mm, a fire has cause) and small variable-length requirement lists — normalizing these into extra tables would add joins without adding query power, since they're always read as a unit. |
| **FULLTEXT index** | `emergency_requests.description`, `disasters(title, description)` | Powers the global search feature's free-text search over incident descriptions, which a `LIKE '%...%'` scan cannot do efficiently or relevantly-ranked. |
| **CHECK constraints** | inventory, hospitals, shelters, requests | Push data-integrity invariants (beds can't exceed total, vulnerable_count can't exceed people_affected) into the database itself so they hold even if an API bug or a raw SQL script tries to violate them. |

## Indexing rationale

Indexes were chosen from actual access patterns in the API/dashboard, not applied blanket:

- `disasters(status)`, `disasters(severity)`, composite `(status, severity)` — every
  dashboard query filters active disasters by status and often severity together.
- `emergency_requests(status)`, `(urgency)`, `(disaster_id, status)`, `(priority_score)`
  — the request queue is always filtered by status/urgency and sorted by priority.
- `resource_inventory(available_quantity)`, generated `is_below_threshold` — shortage
  and stock-status dashboards scan for "what's low" constantly.
- `hospitals(available_beds)`, `shelters(max_capacity, current_occupancy)` — capacity
  dashboards sort/filter on these directly.
- `audit_logs(entity_type, entity_id)`, `(created_at)`, `(user_id)` — the audit viewer
  filters by entity and by time range, and per-user history lookups are common.

Columns that are frequently *written* but rarely filtered/sorted on (e.g.
`updated_at` on most tables) were deliberately **not** indexed, to avoid write
amplification on a system that updates inventory rows very frequently during an
active disaster.

## Transaction isolation

MySQL's default `REPEATABLE READ` is used unchanged. The allocation procedure
avoids relying on snapshot reads for the inventory check — it explicitly uses
`SELECT ... FOR UPDATE` to take a row lock at read time, which is what actually
prevents the double-allocation race (isolation level alone does not).

## Known simplifications (documented, not hidden)

- Seed data volumes are realistic-but-reduced from the "500+ audit records / 100+
  personnel" ask, to keep the seed script fast and reviewable — the schema and
  triggers support arbitrary volume; increasing seed counts is a matter of widening
  the recursive-CTE row generators in `seed.sql`.
- `vw_disaster_impact` attributes shelter residents to a disaster via a shared
  `location_id` between `disaster_zones` and `shelters`, since
  `shelter_residents` doesn't carry a `disaster_id` directly (a resident could
  in principle be relocated across disasters). A future migration could add an
  optional `disaster_id` to `shelter_residents` for exact attribution. The
  view computes each metric as an independent scalar subquery rather than
  chaining `LEFT JOIN`s across `emergency_requests`, `resource_allocations`,
  `hospital_admissions`, and `shelter_residents` — joining those together
  directly would fan them out against each other into a cartesian product
  large enough to make the query slow or hang at real data volumes, even
  though `COUNT(DISTINCT ...)` would eventually report the right number.
