# Task roadmap

- [x] Chat advisor fixed: `gemini-3.6-flash` (3.8-flash was returning 503 high-demand) — verified streaming real replies via curl.
- [ ] `market-data` edge function: forex (ECB via Frankfurter), stocks (Yahoo Finance), crypto (CoinGecko), GDP (World Bank), events (ForexFactory weekly JSON).
- [ ] `market-summary` edge function: Gemini analysis strictly from verified data (summary + weekly takeaways + event notes).
- [ ] `book-appointment` edge function: bookings table (migration with GRANTs + RLS), Resend emails to visitor + admin; honest failure if email service unconfigured.
- [ ] Add RESEND_API_KEY secret (user must supply) / report if missing.
- [ ] Rewrite EnhancedForexDashboard: real rates, source + last-updated, real volatility meter, no fake AI confidence.
- [ ] Rewrite AIMarketSummary: live forex/stocks/crypto tables from market-data, AI summary from verified data, no fabricated opportunities.
- [ ] Rewrite RiskMonitor: World Bank annual GDP growth, latest available year, 5 countries.
- [ ] Rewrite EconomicEventCalendar: real upcoming events + AI notes, real takeaways.
- [ ] Rewrite SmartExpenseBreakdown: parse input/CSV, persist, dynamic pie + categories + top-3 suggestions from real data only.
- [ ] Rewrite FinancialGoalTracker: persist goals, edit saved amount, delete, deterministic insights.
- [ ] Rewrite BookingForm: real submission via book-appointment, honest email status.
- [ ] Delete gemini-debug function before final deploy.
- [ ] Verify: curl each function, Playwright chat + dashboards, completion report (tested vs needs-credentials).
