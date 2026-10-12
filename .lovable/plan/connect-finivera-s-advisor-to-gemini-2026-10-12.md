# Connect Finivera’s Advisor to Gemini

## What will change
- Replace the existing hardcoded/OpenAI function with a secure Supabase Edge Function that calls Google Gemini using the saved `GEMINI_API_KEY`.
- Keep separate conversations in browser storage, with a chat list, a new-chat action, and a dedicated URL for each conversation.
- Send each conversation’s complete message history to Gemini; show real connection errors instead of fabricated fallback answers.
- Preserve the existing Finivera chat styling, suggested prompts, loading state, and educational-finance disclaimer.
- Verify the function deployment, a real advisor response, conversation switching/reload, and the app preview.

## Technical details
- Use the existing React + Vite and Supabase Edge Function setup; never expose the Gemini secret to browser code.
- Validate chat input and history at the function boundary, preserve provider error details safely, and remove the exposed legacy credential reference.
- Use route-derived conversation IDs and per-conversation localStorage records, matching the selected multiple-chats/browser-history preferences.
- This scope connects the AI advisor only; market-data feeds and other APIs in the uploaded broader brief remain separate work.
