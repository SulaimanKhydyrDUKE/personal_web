# sulaiman.dev

Sulaiman Khydyr's portfolio: a Next.js 16 App Router site with React 19, TypeScript, and Tailwind CSS 4, deployed on Vercel.

## Run it

```bash
npm ci
cp .env.example .env.local   # then fill in what you need
npm run dev                  # http://localhost:3000
```

Checks that must pass before a change is done:

```bash
npm run lint
npx tsc --noEmit
npm run build
```

## Where things live

| Path | What |
|---|---|
| `app/data/site.ts`, `experience.ts`, `projects.ts` | The only source of public facts. Nothing biographical is hard-coded in components. |
| `app/page.tsx`, `app/projects/`, `app/writing/` | Routes. |
| `app/components/` | UI: header nav, command palette (⌘K), theme toggle, contribution graph, experience timeline, chat widget. |
| `app/lib/github.ts` | Contribution calendar and latest-commit fetches, revalidated hourly, with public fallbacks. |
| `app/lib/chat-context.ts` | Builds the assistant's system prompt from the data files above. |
| `app/api/chat/route.ts` | Streams assistant replies and runs its one tool, `send_message_to_sulaiman`. |
| `app/lib/contact.ts` | Delivers a visitor's message by email (Resend) or webhook. |
| `app/opengraph-image.tsx`, `sitemap.ts`, `robots.ts` | Social card, sitemap, and crawler rules. |

## Environment variables

See `.env.example`. In short:

- `ANTHROPIC_API_KEY` powers the chat assistant. Locally an `ant auth login` profile also works. Without either, the widget shows "The assistant isn't configured on this deployment yet."
- `CHAT_MODEL` overrides the model (default `claude-opus-5`).
- `RESEND_API_KEY` + `CONTACT_TO_EMAIL` deliver visitor messages by email; `CONTACT_WEBHOOK_URL` is an alternative or fallback. With neither set, the assistant tells the visitor the message was not sent.
- `GITHUB_TOKEN` raises GitHub API limits for the contribution graph; optional.
- `NEXT_PUBLIC_SITE_URL` sets the canonical origin for metadata and the sitemap once the custom domain is live.

## The chat assistant

The floating button (and "Message Sulaiman" in the command palette) opens an assistant that answers only from the data files and can pass a message to Sulaiman. Requests are rate-limited per IP (20 per 10 minutes per server instance), capped at 40 turns and 4,000 characters per message, and the system prompt is prompt-cached. Visitor messages are processed by Anthropic's API; the widget says so.
