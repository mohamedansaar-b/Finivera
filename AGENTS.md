# Architecture rules

- Keep Gemini calls and provider credentials inside Supabase Edge Functions so no third-party secret reaches browser code.
- Store visitor chat threads in browser localStorage and use the React Router thread URL as the active-thread source so links and reloads restore the same conversation.
