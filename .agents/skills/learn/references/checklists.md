# Technology-Specific Diagnostic Checklists

Use these focused checklists during **Step 4 — Diagnose** to identify real defects, incomplete implementations, and architectural risks across diverse project types.

---

## 1. Web & Full-Stack Applications
- [ ] **Routing**: Are all client-side routes backed by valid component exports or protected guards?
- [ ] **State Lifecycle**: Do WebSocket/polling connections clean up on component unmount?
- [ ] **Data Flow**: Are form submissions sending validated payloads matching backend schemas?
- [ ] **Error UI**: Does every data-fetching component render loading, error, and empty states?
- [ ] **Responsiveness**: Does the UI render cleanly at 375px (mobile), 768px (tablet), and 1280px (desktop) with 0 horizontal overflow?

---

## 2. Backend APIs & Microservices
- [ ] **Validation**: Are all endpoint inputs parsed defensively (e.g., Zod, Pydantic, class-validator) before hitting services?
- [ ] **Transaction Atomicity**: Are multi-step database mutations wrapped in transactions with explicit commit/rollback?
- [ ] **Error Propagation**: Are errors caught by centralized middleware with standardized error codes (no stack trace leakage to clients)?
- [ ] **Auth Gates**: Are authorization middleware checks enforced on all mutation routes?
- [ ] **Graceful Shutdown**: Does the server close HTTP connections, database pools, and socket hubs on `SIGTERM` / `SIGINT`?

---

## 3. Database & Persistence Layer
- [ ] **Integrity Constraints**: Are foreign keys, unique indexes, and NOT NULL constraints enforced in the schema?
- [ ] **Concurrency & Locking**: Are atomic operations (stored procedures, row-level locks, Redis distributed locks) protected against race conditions?
- [ ] **Soft Deletes**: Are queries consistently filtering `deleted_at IS NULL` where soft deletion is practiced?
- [ ] **Migrations**: Can migrations roll back safely without catastrophic data loss?

---

## 4. CLI & Command-Line Tools
- [ ] **Exit Codes**: Does the CLI return standard exit code `0` on success and non-zero (`1`, `2`) on failure?
- [ ] **Help & Usage**: Does `--help` and `-h` display clear flag documentation and examples?
- [ ] **Piping & Streams**: Does the tool support stdin/stdout piping without emitting ANSI terminal color escapes when not a TTY?
- [ ] **Input Sanitization**: Are file paths, glob patterns, and arguments sanitized against directory traversal?

---

## 5. AI / ML & Data Engineering Projects
- [ ] **Reproducibility**: Are random seeds, dataset splits, and model hyperparameters explicitly logged?
- [ ] **Data Leakage**: Is preprocessing fitted strictly on training splits before evaluation?
- [ ] **Memory Management**: Are large tensors/dataframes freed or garbage-collected to prevent OOM errors?
- [ ] **Input Guardrails**: Are LLM inference prompts defended against prompt injection and malformed JSON output?

---

## 6. Systems & Compiled Software (Rust / Go / C++)
- [ ] **Memory & Resource Safety**: Are file descriptors, sockets, and heap allocations freed on all return branches?
- [ ] **Thread Safety**: Are shared states synchronized with mutexes, channels, or atomic primitives?
- [ ] **Error Handling**: Are `Result`, `Option`, or `error` values checked rather than unwrapped blindly?
