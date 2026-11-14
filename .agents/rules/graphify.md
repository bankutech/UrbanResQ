---
trigger: always_on
description: Permanent codebase learning, architectural dependency checking, and Graphify workflow enforcement.
---

# Codebase Intelligence & Graphify Architecture Standards

## Mandatory Pre-Modification Rule
**Before modifying existing code, consult the current Graphify knowledge graph when available, inspect the relevant source files, and trace the affected dependencies. After significant structural changes, update the graph and verify that the resulting graph represents the current codebase.**

This rule applies strictly across all development tasks:
- **Bug Fixes**: Trace caller paths and error propagation before patching symptoms.
- **New Features**: Identify existing abstractions, models, and shared utilities before writing new components.
- **Refactoring**: Verify all callers, imports, and downstream consumers across frontend and backend.
- **UI & UX Changes**: Inspect components in `frontend/src/components/`, `frontend/src/layouts/`, and pages before altering layouts or styles.
- **Backend Development**: Check route handlers, middleware pipelines, and services in `backend/src/`.
- **Database Changes**: Verify relations across `database/schema.sql`, stored procedures (`procedures.sql`), triggers (`triggers.sql`), and service queries.
- **Authentication & RBAC**: Verify role permissions and token validations in `backend/src/middleware/auth.ts`.
- **API Integrations**: Confirm request/response schemas, DTOs, and client wrappers in `frontend/src/api/client.ts`.
- **Performance Optimization**: Check query indexes, lock contention, and WebSocket message frequencies.
- **Security Reviews**: Trace inputs through validation schemas, authorization gates, and SQL execution.
- **Testing & Deployment**: Inspect test suites (`backend/tests/`) and docker orchestration configs.
- **File Cleanup & Deprecation**: Check dependency edges before removing or relocating any file. Never delete files based solely on graph results.

---

## Operational Execution Cycle

### 1. Before Editing
1. **Understand Request**: Clarify the specific functionality, bug, or architectural requirement.
2. **Query Graphify**:
   - For architecture & relationships: `python -m graphify query "<concept or question>"`
   - For dependency paths: `python -m graphify path "<source_symbol>" "<target_symbol>"`
   - For focused module details: `python -m graphify explain "<symbol>"`
3. **Inspect Source Code**: Verify the actual source files, types, and logic flagged by the graph.
4. **Trace Dependencies**: Check upstream callers, downstream consumers, database queries, and socket events.
5. **Formulate Smallest Safe Change**: Design the minimal disruption path that preserves system stability.

### 2. During Implementation
1. **Preserve Established Architecture**: Do not rewrite working modules or change conventions arbitrarily.
2. **Check Shared Abstractions**: If modifying core utilities (`backend/src/config/db.ts`, `frontend/src/components/ui.tsx`, etc.), ensure backward compatibility.
3. **Avoid Code Duplication**: Reuse existing database queries, helper functions, and components.

### 3. After Implementation
1. **Run Tests & Validation**: Execute relevant Jest tests, TypeScript builds (`tsc --noEmit`), and frontend builds (`npm run build`).
2. **Synchronize Graph**: Run `python -m graphify update .` after structural changes (AST-only, zero LLM cost).
3. **Verify Integrity**: Confirm graph metrics and report what was changed and verified.

---

## Graphify Failure & Fallback Protocol
If Graphify encounters an issue:
1. Check the active environment with `python --version` and `python -m graphify --version`.
2. Inspect error messages (e.g. missing language parser extras like `tree-sitter-sql`).
3. If an extra parser is missing, install it (e.g. `pip install "graphifyy[sql]"`).
4. If Graphify is temporarily unavailable, fall back to disciplined manual source-code inspection (`read_file`, `run_command` with targeted search) and state the limitation honestly.
5. Never hallucinate or pretend Graphify was executed when it was not.
