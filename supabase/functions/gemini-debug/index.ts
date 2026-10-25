import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const apiKey = Deno.env.get('GEMINI_API_KEY');
  if (!apiKey) return new Response(JSON.stringify({ error: 'no key' }), { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  const results: Record<string, unknown> = {};
  for (const model of ['gemini-3.8-flash', 'gemini-3.5-flash', 'gemini-flash-latest']) {
    const testRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: 'POST',
      headers: { 'x-goog-api-key': apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: 'Say OK' }] }] }),
    });
    const testBody = await testRes.text();
    results[model] = { status: testRes.status, body: testBody.slice(0, 400) };
  }

  return new Response(JSON.stringify(results), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
});
