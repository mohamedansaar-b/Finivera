import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const apiKey = Deno.env.get('GEMINI_API_KEY');
  if (!apiKey) return new Response(JSON.stringify({ error: 'no key' }), { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  const results: Record<string, unknown> = {};
  for (const model of ['gemini-3.8-flash']) {
    const testRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: 'POST',
      headers: { 'x-goog-api-key': apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: 'Say OK' }] }] }),
    });
    const testBody = await testRes.text();
    results[`${model}-nonstream`] = { status: testRes.status, body: testBody.slice(0, 400) };

    const streamRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse`, {
      method: 'POST',
      headers: { 'x-goog-api-key': apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: 'Say OK' }] }] }),
    });
    let streamTextResult = '';
    const reader = streamRes.body?.getReader();
    if (reader) {
      const start = Date.now();
      while (streamTextResult.length < 400) {
        const { done, value } = await reader.read();
        if (done) break;
        streamTextResult += new TextDecoder().decode(value);
        if (Date.now() - start > 20000) { streamTextResult += ' [TIMEOUT]'; break; }
      }
      await reader.cancel().catch(() => {});
    }
    results[`${model}-stream`] = { status: streamRes.status, body: streamTextResult.slice(0, 400) };
  }

  return new Response(JSON.stringify(results), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
});
