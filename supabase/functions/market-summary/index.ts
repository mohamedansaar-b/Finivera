import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createGoogle } from 'npm:@ai-sdk/google@4';
import { generateObject } from 'npm:ai@7';
import { z } from 'npm:zod@3';

const MODEL_ID = 'gemini-3.6-flash';
const MAX_PAYLOAD_CHARS = 30_000;

const jsonResponse = (body: unknown, status = 200) => new Response(
  JSON.stringify(body),
  { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
);

const providerMessage = (error: unknown): string => {
  const providerError = error as { statusCode?: unknown };
  const status = typeof providerError.statusCode === 'number' ? providerError.statusCode : 0;
  if (status === 429 || status === 503) return 'The analysis service is busy right now. Please try again in a minute.';
  return 'The analysis service could not complete this request. Please try again shortly.';
};

const RequestSchema = z.object({
  kind: z.enum(['daily-summary', 'weekly-takeaways', 'event-notes']),
  payload: z.unknown(),
});

const verifiedData = z.record(z.string(), z.unknown());

const DailySummarySchema = z.object({
  sentiment: z.string(),
  summary: z.array(z.string()).max(5),
  risks: z.array(z.string()).max(4),
});

const WeeklyTakeawaysSchema = z.object({
  takeaways: z.array(z.string()).max(6),
  watchpoints: z.array(z.string()).max(4),
});

const EventNotesSchema = z.object({
  notes: z.array(z.object({ title: z.string(), note: z.string().max(400) })).max(12),
});

const BASE_RULES = [
  'You are Finivera’s market analysis assistant. You will be given verified market data that was retrieved from real providers (ECB via Frankfurter, Yahoo Finance, CoinGecko, World Bank, ForexFactory).',
  'Use ONLY the numbers and events in the supplied data. Never invent prices, percentages, events, forecasts, or guaranteed returns.',
  'If the data is incomplete or empty, say what is missing instead of guessing.',
  'Write for retail investors in India: clear, friendly, factual. Educational only; not investment advice; never guarantee returns.',
  'Label your output as AI-generated analysis based on the supplied data.',
].join(' ');

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return jsonResponse({ error: 'Use POST.' }, 405);

  const apiKey = Deno.env.get('GEMINI_API_KEY');
  if (!apiKey) return jsonResponse({ error: 'The analysis service is not configured yet.' }, 503);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: 'Request body was not valid JSON.' }, 400);
  }

  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) return jsonResponse({ error: 'Invalid request.' }, 400);
  const { kind } = parsed.data;

  const payloadCheck = verifiedData.safeParse(parsed.data.payload);
  if (!payloadCheck.success) return jsonResponse({ error: 'Payload must be a data object.' }, 400);
  if (JSON.stringify(parsed.data.payload).length > MAX_PAYLOAD_CHARS) {
    return jsonResponse({ error: 'Supplied data is too large to analyze.' }, 413);
  }

  try {
    const provider = createGoogle({ apiKey });
    const model = provider(MODEL_ID);

    if (kind === 'daily-summary') {
      const { object } = await generateObject({
        model,
        schema: DailySummarySchema,
        system: `${BASE_RULES} Summarise the overall market picture across the supplied forex, stock and crypto data. sentiment: one short phrase. summary: 2-4 factual paragraphs (each a string). risks: 2-3 short risk notes.`,
        prompt: JSON.stringify(parsed.data.payload),
      });
      return jsonResponse({ data: object });
    }

    if (kind === 'weekly-takeaways') {
      const { object } = await generateObject({
        model,
        schema: WeeklyTakeawaysSchema,
        system: `${BASE_RULES} From the supplied upcoming economic events, write 3-5 key takeaways for the week and 2-3 watchpoints. Reference only these events; mention which country/currency each concerns.`,
        prompt: JSON.stringify(parsed.data.payload),
      });
      return jsonResponse({ data: object });
    }

    const notesPayload = parsed.data.payload as { events?: { title?: unknown }[] };
    const requestedTitles = Array.isArray(notesPayload.events)
      ? notesPayload.events.map((e) => (typeof e?.title === 'string' ? e.title : '')).filter(Boolean)
      : [];
    const { object } = await generateObject({
      model,
      schema: EventNotesSchema,
      system: `${BASE_RULES} For each supplied economic event, write one short note (max 2 sentences) explaining, in general terms, how such a release typically moves currency or market sentiment. Ground the note in the event's own supplied details (country, forecast, previous). Do not invent numbers that were not supplied.`,
      prompt: JSON.stringify(parsed.data.payload),
    });
    const supplied = new Set(requestedTitles);
    const notes = object.notes.filter((n) => supplied.has(n.title)).slice(0, 12);
    return jsonResponse({ data: { notes } });
  } catch (error) {
    console.error('market-summary error:', JSON.stringify(String(error), Object.getOwnPropertyNames(error as object)));
    return jsonResponse({ error: providerMessage(error) }, 502);
  }
});
