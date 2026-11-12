# Architecture rules

- Keep Gemini calls and provider credentials inside Supabase Edge Functions so no third-party secret reaches browser code.
- Store visitor chat threads in browser localStorage and use the React Router thread URL as the active-thread source so links and reloads restore the same conversation.
- Fetch all market/economic data through the `market-data` edge function and AI analysis through `market-summary`, which only analyses data passed to it, so the UI never shows invented figures.
- Bookings are written only by the `book-appointment` edge function (table has no visitor access); it reports real email delivery status back to the form.
