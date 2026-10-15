import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { google } from 'npm:@ai-sdk/google@4';
import { convertToModelMessages, streamText, validateUIMessages } from 'npm:ai@7';

const MODEL_ID = 'gemini-3.8-flash';
const MAX_MESSAGES = 40;
const MAX_TOTAL_CHARACTERS = 20_000;
const MAX_MESSAGE_CHARACTERS = 5_000;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const jsonResponse = (body: Record<string, unknown>, status: number) => new Response(
  JSON.stringify(body),
  { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
);

const providerMessage = (error: unknown): string => {
  const providerError = error as { statusCode?: unknown; responseBody?: unknown };
  const status = typeof providerError.statusCode === 'number' ? providerError.statusCode : 0;

  if (status === 401 || status === 403) {
    return 'Gemini could not authorize this request. Check that the saved API key is active and has Gemini API access.';
  }
  if (status === 429) return 'Gemini is receiving too many requests right now. Please wait a moment and try again.';
  if (status >= 500) return 'Gemini is temporarily unavailable. Please try again shortly.';

  if (typeof providerError.responseBody === 'string') {
    try {
      const parsed = JSON.parse(providerError.responseBody) as { error?: { message?: unknown } };
      if (typeof parsed.error?.message === 'string') return `Gemini request failed: ${parsed.error.message}`;
    } catch {
      // Use the safe generic response below when the provider error is not JSON.
    }
  }

  return 'Gemini could not answer this request. Please check your message and try again.';
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return jsonResponse({ error: 'Use POST to send a chat message.' }, 405);

  const authorization = req.headers.get('Authorization');
  if (!authorization?.startsWith('Bearer ')) {
    return jsonResponse({ error: 'This chat request is missing its Supabase access token.' }, 401);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
  if (!supabaseUrl || !supabaseAnonKey) {
    return jsonResponse({ error: 'Finivera’s secure chat service is not configured correctly.' }, 503);
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const token = authorization.slice('Bearer '.length);
  const publishableKey = req.headers.get('apikey');
  const isPublicAnonRequest = token === supabaseAnonKey && publishableKey === supabaseAnonKey;
  if (!isPublicAnonRequest) {
    const { data: claimData, error: claimError } = await supabase.auth.getClaims(token);
    if (claimError || !claimData?.claims || !['anon', 'authenticated'].includes(String(claimData.claims.role))) {
      return jsonResponse({ error: 'This chat request could not be verified. Refresh the page and try again.' }, 401);
    }
  }
  if (publishableKey !== supabaseAnonKey) {
    return jsonResponse({ error: 'This chat request could not be verified. Refresh the page and try again.' }, 401);
  }

  const apiKey = Deno.env.get('GEMINI_API_KEY');
  if (!apiKey) {
    return jsonResponse({ error: 'Gemini is not configured yet. Add GEMINI_API_KEY in the project’s secure secrets.' }, 503);
  }

  const contentLength = Number(req.headers.get('content-length') ?? 0);
  if (contentLength > 100_000) return jsonResponse({ error: 'This conversation is too large. Start a new chat to continue.' }, 413);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: 'The chat request was not valid JSON.' }, 400);
  }

  if (!body || typeof body !== 'object') return jsonResponse({ error: 'A chat message is required.' }, 400);
  const payload = body as { threadId?: unknown; messages?: unknown };
  if (typeof payload.threadId !== 'string' || !UUID_PATTERN.test(payload.threadId)) {
    return jsonResponse({ error: 'This conversation link is not valid. Start a new conversation and try again.' }, 400);
  }
  if (!Array.isArray(payload.messages) || payload.messages.length === 0 || payload.messages.length > MAX_MESSAGES) {
    return jsonResponse({ error: `Please send between 1 and ${MAX_MESSAGES} messages at a time.` }, 400);
  }

  let validatedMessages;
  try {
    validatedMessages = await validateUIMessages({ messages: payload.messages });
  } catch {
    return jsonResponse({ error: 'The conversation contains an unsupported message. Please start a new chat.' }, 400);
  }

  let totalCharacters = 0;
  for (const message of validatedMessages) {
    if (message.role !== 'user' && message.role !== 'assistant') {
      return jsonResponse({ error: 'This chat only accepts visitor and advisor messages.' }, 400);
    }
    for (const part of message.parts) {
      if (part.type !== 'text') return jsonResponse({ error: 'Please send text messages only.' }, 400);
      const textLength = part.text.length;
      if (textLength > MAX_MESSAGE_CHARACTERS) {
        return jsonResponse({ error: 'A single message is too long. Please shorten it and try again.' }, 413);
      }
      totalCharacters += textLength;
    }
  }

  const finalMessage = validatedMessages[validatedMessages.length - 1];
  const finalUserText = finalMessage?.parts
    .filter((part) => part.type === 'text')
    .map((part) => part.text.trim())
    .join('');
  if (finalMessage?.role !== 'user' || !finalUserText) {
    return jsonResponse({ error: 'Send a new message before requesting an advisor response.' }, 400);
  }
  if (totalCharacters > MAX_TOTAL_CHARACTERS) {
    return jsonResponse({ error: 'This conversation is too long to continue. Start a new chat to keep going.' }, 413);
  }

  try {
    const model = google(MODEL_ID, { apiKey });
    const result = streamText({
      model,
      system: [
        'You are Finivera’s personal finance advisor, managed by B. MOHAMED ANSAAR.',
        'Offer clear, helpful, friendly educational guidance in natural conversation, using Indian financial context and INR when relevant.',
        'Ask focused follow-up questions when the user needs a personalized plan. Explain trade-offs, risk, uncertainty, and alternatives; never guarantee returns or claim to be a regulated financial professional.',
        'Do not invent live market prices, news, economic releases, exchange rates, or other current facts. If verified current data was not supplied in the conversation, say that live data is unavailable and offer to explain general context instead.',
        'Do not claim you checked a real-time data source unless one was actually provided. AI-generated financial information is educational and is not a guarantee of investment returns.',
      ].join(' '),
      messages: await convertToModelMessages(validatedMessages),
      abortSignal: req.signal,
    });

    return result.toUIMessageStreamResponse({
      originalMessages: validatedMessages,
      headers: corsHeaders,
      onError: providerMessage,
    });
  } catch (error) {
    return jsonResponse({ error: providerMessage(error) }, 502);
  }
});