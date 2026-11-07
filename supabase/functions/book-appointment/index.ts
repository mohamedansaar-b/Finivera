import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { z } from 'npm:zod@3';

const ADMIN_EMAIL = 'bmansaar7680@gmail.com';
const TIME_SLOTS = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'];

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
});

const BookingSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.enum(TIME_SLOTS as [string, ...string[]]),
  message: z.string().trim().max(1000).optional().default(''),
});

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));

const sendEmail = async (apiKey: string, from: string, to: string, subject: string, html: string, replyTo?: string) => {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to: [to], subject, html, ...(replyTo ? { reply_to: replyTo } : {}) }),
  });
  if (!res.ok) {
    const body = await res.text();
    console.error(`Resend failed [${res.status}]: ${body}`);
    return 'failed';
  }
  return 'sent';
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Use POST.' }, 405);

  let body: unknown;
  try { body = await req.json(); } catch { return json({ error: 'Invalid request.' }, 400); }
  const parsed = BookingSchema.safeParse(body);
  if (!parsed.success) return json({ error: 'Please check your name, email, date and time.', fields: parsed.error.flatten().fieldErrors }, 400);
  const b = parsed.data;
  const today = new Date().toISOString().slice(0, 10);
  if (b.date < today) return json({ error: 'Please choose a date from today onwards.' }, 400);

  const url = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !serviceKey) return json({ error: 'Booking service is not configured.' }, 503);
  const db = createClient(url, serviceKey);

  const { data: row, error } = await db.from('bookings').insert({
    name: b.name, email: b.email, preferred_date: b.date, preferred_time: b.time, message: b.message || null,
  }).select('id').single();
  if (error || !row) {
    console.error('booking insert failed', error);
    return json({ error: 'Your booking could not be saved. Please try again.' }, 500);
  }

  const resendKey = Deno.env.get('RESEND_API_KEY');
  const from = Deno.env.get('BOOKING_FROM_EMAIL') ?? 'Finivera <onboarding@resend.dev>';
  let visitorStatus = 'not_configured';
  let adminStatus = 'not_configured';

  if (resendKey) {
    const details = `<p><b>Date:</b> ${esc(b.date)}<br/><b>Time:</b> ${esc(b.time)} IST</p>`;
    adminStatus = await sendEmail(resendKey, from, ADMIN_EMAIL, `New consultation booking: ${b.name}`,
      `<h2>New booking</h2><p><b>Name:</b> ${esc(b.name)}<br/><b>Email:</b> ${esc(b.email)}</p>${details}<p><b>Message:</b> ${esc(b.message || '—')}</p>`, b.email);
    visitorStatus = await sendEmail(resendKey, from, b.email, 'Your Finivera consultation request',
      `<p>Hi ${esc(b.name)},</p><p>Thank you for booking a consultation with Finivera. Your request has been received:</p>${details}<p>B. Mohamed Ansaar will reply from ${ADMIN_EMAIL} to confirm.</p><p>— Finivera</p>`, ADMIN_EMAIL);
  }

  await db.from('bookings').update({ visitor_email_status: visitorStatus, admin_email_status: adminStatus }).eq('id', row.id);
  return json({ data: { id: row.id, visitorEmail: visitorStatus, adminEmail: adminStatus } });
});
