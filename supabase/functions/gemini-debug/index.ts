import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const apiKey = Deno.env.get('GEMINI_API_KEY');
  if (!apiKey) return new Response(JSON.stringify({ error: 'no key' }), { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  const log = (stage: string, info: unknown) => console.error(`debug ${stage}:`, JSON.stringify(String(info)));

  const results: Record<string, unknown> = {};
  const model = 'gemini-3.8-flash';

  log('step', 'start non-stream');
  const testRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: 'POST',
    headers: { 'x-goog-api-key': apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: 'Say OK' }] }] }),
  }).catch((e) => ({ status: 0, body: () => `fetch threw ${e}`, ok: false, text: () => Promise.resolve(`threw ${e}`) }) as unknown as Response);
  log('non-stream status', testRes.status);
  const testBody = await testRes.text();
  results[`${model}-nonstream`] = { status: testRes.status, body: testBody.slice(0, 200) };

  log('step', 'start stream fetch');
  const streamRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse`, {
    method: 'POST',
    headers: { 'x-goog-api-key': apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: 'Say OK' }] }] }),
    signal: AbortSignal.timeout(20000),
  }).catch((e) => {
    log('stream fetch threw', String(e));
    return undefined;
  });
  if (!streamRes) {
    return new Response(JSON.stringify({ results, note: 'stream fetch threw' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
  log('stream status', streamRes.status);
  let streamed = '';
  const reader = streamRes.body?.getReader();
  if (reader) {
    for (let i = 0; i < 20; i++) {
      const { done, value } = await reader.read();
      log('stream chunk', `done=${done} bytes=${value?.byteLength ?? 0}`);
      if (done) break;
      streamed += new TextDecoder().decode(value);
      if (streamed.length > 400) break;
    }
    log('step', 'cancelling reader');
    await reader.cancel().catch((e) => log('cancel threw', String(e)));
  }
  results[`${model}-stream`] = { status: streamRes.status, body: streamed.slice(0, 400) };

  return new Response(JSON.stringify(results), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
});
