# AI provider / Hack Club proxy setup

This project supports two ways to call large models:

- Server-side proxy to Hack Club (recommended for using Hack Club keys) — use the `HACKCLUB_API_KEY` server env var.
- Built-in Google Generative AI client (existing `VITE_GOOGLE_AI_API_KEY`) for local/dev usage.

How to enable the Hack Club proxy (server-side):

1. Add the `HACKCLUB_API_KEY` to your deployment environment (do NOT commit this to source control):
   - Example (Vercel): set `HACKCLUB_API_KEY` in Project -> Environment Variables
   - Example (local development): set `HACKCLUB_API_KEY` in a secure env manager or your host shell

2. The app exposes a secure server route at `/api/hackclub` which forwards requests to `https://ai.hackclub.com/proxy/v1/chat/completions`.
   - Client code should call `geminiService` helpers which prefer the server proxy automatically.

Notes:
- Never commit raw API keys into the repository.
- The proxy keeps the key secret on the server and prevents leaking it to browser bundles.

