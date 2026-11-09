export interface Expense { date: string | null; description: string; amount: number; category: string }

const CATEGORY_RULES: [string, RegExp][] = [
  ['Food & Dining', /food|grocer|restaurant|swiggy|zomato|dining|cafe|coffee|meal|lunch|dinner|snack/i],
  ['Transportation', /transport|fuel|petrol|diesel|uber|ola|metro|bus|train|cab|taxi|parking|travel/i],
  ['Bills & Utilities', /bill|electric|water|gas|internet|wifi|phone|mobile|recharge|utility|rent|emi|loan/i],
  ['Shopping', /shop|amazon|flipkart|myntra|cloth|apparel|electronics|purchase/i],
  ['Entertainment', /entertain|movie|netflix|prime|hotstar|spotify|game|subscription|party|outing/i],
  ['Healthcare', /health|medic|doctor|hospital|pharma|pharmacy|insurance|gym|fitness/i],
  ['Education', /education|school|college|tuition|course|book|fees/i],
];

export const categorize = (text: string): string => CATEGORY_RULES.find(([, re]) => re.test(text))?.[0] ?? 'Other';

const parseAmount = (raw: string): number | null => {
  const n = Number(raw.replace(/[₹,\s]|rs\.?|inr/gi, ''));
  return Number.isFinite(n) && n > 0 ? n : null;
};

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Accepts lines like "Food: 2800", "Uber 450", or CSV rows "2026-10-01,Swiggy dinner,450[,category]".
 * Returns parsed expenses and the lines that could not be read.
 */
export const parseExpenses = (input: string): { expenses: Expense[]; rejected: string[] } => {
  const expenses: Expense[] = [];
  const rejected: string[] = [];
  for (const rawLine of input.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;
    if (line.includes(',')) {
      const cells = line.split(',').map((c) => c.trim().replace(/^"|"$/g, ''));
      let date: string | null = null;
      if (DATE_RE.test(cells[0])) date = cells.shift() ?? null;
      const amountIdx = cells.findIndex((c) => parseAmount(c) !== null);
      if (amountIdx === -1) { rejected.push(line); continue; }
      const amount = parseAmount(cells[amountIdx])!;
      const rest = cells.filter((_, i) => i !== amountIdx);
      const description = rest[0] || 'Expense';
      const category = rest[1] ? categorize(rest[1]) === 'Other' ? rest[1] : categorize(rest[1]) : categorize(description);
      expenses.push({ date, description, amount, category });
      continue;
    }
    const match = /^(.*?)[\s:=-]+(?:₹|rs\.?|inr)?\s*([\d,]+(?:\.\d+)?)\s*$/i.exec(line);
    const amount = match ? parseAmount(match[2]) : null;
    if (!match || amount === null || !match[1].trim()) { rejected.push(line); continue; }
    expenses.push({ date: null, description: match[1].trim(), amount, category: categorize(match[1]) });
  }
  return { expenses, rejected };
};

export const totalsByCategory = (expenses: Expense[]) => {
  const map = new Map<string, number>();
  for (const e of expenses) map.set(e.category, (map.get(e.category) ?? 0) + e.amount);
  const total = [...map.values()].reduce((a, b) => a + b, 0);
  return {
    total,
    categories: [...map.entries()].map(([name, value]) => ({ name, value, percent: total ? (value / total) * 100 : 0 })).sort((a, b) => b.value - a.value),
  };
};

/** Whole months from `from` until the target date (minimum 0). */
export const monthsUntil = (targetDate: string, from = new Date()): number => {
  const t = new Date(targetDate);
  const months = (t.getFullYear() - from.getFullYear()) * 12 + (t.getMonth() - from.getMonth()) - (t.getDate() < from.getDate() ? 1 : 0);
  return Math.max(months, 0);
};

/** Monthly amount needed to reach the target by the date. With 0 months left, the full remainder is due now. */
export const requiredMonthly = (target: number, saved: number, targetDate: string, from = new Date()): number => {
  const remaining = Math.max(target - saved, 0);
  const months = monthsUntil(targetDate, from);
  return months === 0 ? remaining : remaining / months;
};
