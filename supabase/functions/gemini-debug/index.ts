import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const apiKey = Deno.env.get('GEMINI_API_KEY');
  if (!apiKey) return new Response(JSON.stringify({ error: 'no key' }), { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  const out: Record<string, unknown> = { keyLength: apiKey.length };

  try {
    const listRes = await fetch('https://generativelanguage.googleapis.com/v1beta/models?pageSize=100', {
      headers: { 'x-goog-api-key': apiKey },
    });
    const listBody = await listRes.text();
    out.listStatus = listRes.status;
    try {
      const parsed = JSON.parse(listBody) as { models?: { name?: string }[] };
      out.models = parsed.models?.map((m) => m.name) ?? listBody.slice(0, 500);
    } catch {
      out.listBody = listBody.slice(0, 500);
    }
  } catch (error) {
    out.listError = String(error);
  }

  const testRes = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent', {
    method: 'POST',
    headers: { 'x-goog-api-key': apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: 'Say OK' }] }] }),
  });
  const testBody = await testRes.text();
  out.testStatus = testRes.status;
  out.testBody = testBody.slice(0, 800);

  return new Response(JSON.stringify(out), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
});
