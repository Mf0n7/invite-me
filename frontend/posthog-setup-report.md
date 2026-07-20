# PostHog post-wizard report

The wizard integrated PostHog into this Next.js App Router application using `posthog-js` and `instrumentation-client.ts`. It configured environment-backed initialization with default autocapture, session recording, and exception autocapture; identifies authenticated users on login and returning sessions; resets identity on logout; and instruments core account, event-management, invitation, RSVP, gift, and checkout journeys without placing user-entered PII in event properties. Type checking and the production build completed successfully.

| Event | Description | File |
|---|---|---|
| `user_signed_up` | A visitor successfully creates an account using email authentication. | `context/auth.tsx` |
| `user_logged_in` | A user successfully signs in using email or Google authentication. | `context/auth.tsx` |
| `user_logged_out` | An authenticated user signs out of the application. | `context/auth.tsx` |
| `event_created` | An organizer successfully creates a new event. | `app/dashboard/events/new/page-content.tsx` |
| `event_updated` | An organizer successfully updates an existing event. | `app/dashboard/events/[uuid]/edit/page-content.tsx` |
| `event_deleted` | An organizer permanently deletes an event. | `app/dashboard/events/[uuid]/edit/page-content.tsx` |
| `rsvp_confirmed` | A guest confirms attendance from a public invitation. | `app/invite/[token]/page-content.tsx` |
| `nominal_rsvp_confirmed` | A named guest confirms attendance from a nominal invitation. | `app/convite/[token]/page-content.tsx` |
| `invitation_created` | An organizer creates a nominal invitation. | `components/events/nominal-invites-panel.tsx` |
| `invitations_imported` | An organizer imports nominal invitations from a spreadsheet. | `components/events/nominal-invites-panel.tsx` |
| `gift_added` | An organizer adds an item to an event gift list. | `components/events/gift-manager.tsx` |
| `gift_claimed` | A guest reserves an item from an event gift list. | `components/invite/gift-section.tsx` |
| `invite_link_copied` | An organizer copies a public invitation link. | `components/events/invite-panel.tsx` |
| `checkout_started` | An organizer starts an event or subscription checkout. | `hooks/use-billing.ts` |

## Next steps

We've built insights and a dashboard to monitor the instrumented journeys:

- [Analytics basics dashboard (wizard)](https://us.posthog.com/project/521243/dashboard/1878436)
- [Signup to event creation funnel (wizard)](https://us.posthog.com/project/521243/insights/F0Up51lO)
- [RSVP confirmations (wizard)](https://us.posthog.com/project/521243/insights/NtRxB8XM)
- [Organizer engagement (wizard)](https://us.posthog.com/project/521243/insights/zfsnM3dy)
- [Checkout starts by type (wizard)](https://us.posthog.com/project/521243/insights/2MtXd5tT)
- [Account and event deletion signals (wizard)](https://us.posthog.com/project/521243/insights/g7ensA1k)

## Verify before merging

- [ ] Run a full production build and fix any lint or type errors introduced by the generated code.
- [ ] Run the test suite — call sites that were rewritten or instrumented may need updated mocks or fixtures.
- [ ] Add `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` and `NEXT_PUBLIC_POSTHOG_HOST` to `.env.example` and any monorepo/bootstrap scripts so collaborators know what to set.
- [ ] Wire source-map upload (`posthog-cli sourcemap` or the bundler upload step) into CI so production stack traces de-minify.
- [ ] Confirm the returning-visitor path calls `identify` after the authenticated user query resolves.

### Agent skill

An agent skill folder remains in the project under `.claude/skills/integration-nextjs-app-router`. It provides current framework-specific context for further PostHog development with Claude Code.
