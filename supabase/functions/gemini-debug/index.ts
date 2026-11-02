import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const apiKey = Deno.env.get('GEMINI_API_KEY');
  if (!apiKey) return new Response(JSON.stringify({ error: 'no key' }), { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models?pageSize=100', {
    headers: { 'x-goog-api-key': apiKey },
    signal: AbortSignal.timeout(15000),
  });
  const body = await res.json();
  const models = Array.isArray((body as { models?: unknown }).models)
    ? ((body as { models: { name?: string; supportedGenerationMethods?: string[] }[] }).models
        .filter((m) => m.supportedGenerationMethods?.includes('generateContent'))
        .map((m) => m.name))
    : body;
  return new Response(JSON.stringify({ status: res.status, models }, null, 1), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
});
