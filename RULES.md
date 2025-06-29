# StyleWell AI Instance Governance Rules
_These RULES must be followed at all times. This document defines the mandatory operating principles for all AI instances to ensure consistent behavior, robust execution, and secure collaboration._

---

## Ⅰ. Core Operational Mandates & Command Protocol

### AI Instance Workflow
1.  **Directive-Based Operation**: All work begins with a directive from the Project Lead.
2.  **Zen Thinking (`/zen`)**: For tasks requiring architectural design, complex problem decomposition, or UX strategy, you **must** use `/zen` to enter a deep thinking mode.
3.  **Gemini Cross-Reference (`@ClaudeCode(gemini_review=true)`)**: For critical backend logic, especially involving security, complex database queries, or performance-sensitive algorithms, you **must** request a review from Gemini 2.5 Pro via your available tooling.
4.  **Context Management (`context7`)**: You **must** use context management commands (`context7`, etc.) to keep your working memory focused on the current task and its direct dependencies, referencing these rules and the development plan as foundational context.
5.  **Evidence over Assumption**: All decisions must be traceable to logs, data, the development plan, or this rulebook. Never assume.

### SuperClaude Command & Persona Usage

**Cognitive Persona Flags (`--persona-*`)**: Personas are modes of thinking to be applied to commands. The choice of persona must align with the nature of the task.
*   `--persona-architect`: Use for system design, database schema, API contracts, and high-level planning.
*   `--persona-frontend`: Use for all UI/UX development (`SwiftUI`), component design, and adherence to HIG.
*   `--persona-security`: Use for any task involving authentication, authorization (RLS), data sanitization, or external APIs.
*   `--persona-qa`: Use for writing tests, reviewing code for edge cases, and ensuring features meet their acceptance criteria.
*   `--persona-analyzer`: Use for root cause analysis of bugs and performance bottlenecks.

**Development Commands**:
*   `/build`: Use for generating new code. Must be flagged with a persona. *Ex: `/build --swift --persona-frontend`*
*   `/dev-setup`: Use for configuring environments or new tool integrations.
*   `/test`: Use to generate unit, integration, or E2E tests. Mandatory for repositories, services, and complex business logic. *Ex: `/test --coverage --persona-qa`*

**Analysis & Quality Commands**:
*   `/review`: Use for code reviews against the rules in this document.
*   `/analyze`: Use for architectural breakdown, sequence diagrams, and system analysis before building. *Ex: `/analyze --architecture --persona-architect`*
*   `/troubleshoot`: Use for debugging. Must specify persona (e.g., `--persona-security` for an RLS bug, `--persona-analyzer` for performance).
*   `/improve`: Use for refactoring and optimization.
*   `/explain`: Use for generating documentation or explaining complex code.

**Operations & Security Commands**:
*   `/deploy`: Use to generate deployment plans and scripts.
*   `/scan --security`: Mandatory for all backend Edge Functions and code handling user authentication or data.
*   `/migrate`: Use to generate and plan database migrations. Always use `--dry-run` and `--plan` first.
*   `/cleanup`: Use for maintenance tasks like code linting or removing unused assets.

## Ⅱ. Code Quality Standards
*   **Structured Error Handling**: All functions that can fail **must** implement structured error handling (e.g., `do-catch` in Swift, `try...catch` in TypeScript). Errors must be specific, typed, and provide clear messages.
*   **Comprehensive Docstrings**: Every function, class, and struct **must** include a concise, purpose-driven docstring.
*   **Precondition Verification**: Scripts **must** verify preconditions before executing critical operations (e.g., checking user auth status before data modification).

## Ⅲ. Documentation Protocols
*   **Synchronized Docs**: All documentation (this plan, PRDs) must be kept in sync with code changes.
*   **Markdown Standards**: Use consistent heading hierarchies (`#`, `##`, `###`), bullet points, and code block formatting.
*   **Executable Examples**: Code snippets in documentation must be executable and tested.

## Ⅳ. Security Compliance Guidelines
*   **No Hardcoded Credentials**: This is a strict, zero-tolerance rule. Use secure environment variable storage mechanisms (Supabase Secrets).
*   **Input Validation**: All API inputs (Edge Functions, etc.) must be validated, sanitized, and type-checked before processing.
*   **Principle of Least Privilege**: RLS policies **must** be enforced on all tables. Supabase client instances in Swift should use the `anon` key, not the service role key.

## Ⅴ. Core Design Philosophy
*   **KISS (Keep It Simple, Stupid)**: Prioritize code readability and straightforward solutions.
*   **YAGNI (You Aren't Gonna Need It)**: Do not add speculative features. Focus on immediate requirements from the development plan.
*   **SOLID Principles**: Adhere to SOLID principles in Swift code, especially for ViewModels, Repositories, and Services to ensure modularity and testability.

## Ⅵ. Testing & Simulation Rules
*   **Mandatory Testing**: All new business logic (Repositories, complex ViewModel logic) **must** include unit tests. New features require end-to-end thinking, even if manual tests are used for the MVP.
*   **Test Data Separation**: Simulated or test data must be clearly marked and never enter the production database.

---
_These rules are living and may be updated via a documented change request process._