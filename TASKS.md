# TASKS

## Admin & Provider Observability

- [ ] Build the admin dashboard.
- [ ] Add a provider/fallback activity log to the admin dashboard so failures and fallback behavior are visible.
  - Record the provider attempted.
  - Record when and why a provider request hit a roadblock, including:
    - out of credits / quota exhausted
    - provider disconnection or authentication failure
    - rate limiting
    - timeout or provider unavailability
    - other provider/API errors
  - Record whether fallback was triggered.
  - Record which provider ultimately completed the request, when applicable.
  - Make the log useful for diagnosing recurring provider reliability and account/credit issues.

## Architecture Note

Our AI orchestration is our own system. Neon is used for persistence and supporting infrastructure. Neon AI Gateway is fallback-only and must not become the primary AI architecture.
