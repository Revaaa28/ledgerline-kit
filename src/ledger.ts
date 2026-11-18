/**
 * Ledgerline's arithmetic and judgement.
 *
 * Everything the templates print that is not raw data is decided
 * here: line totals, VAT, the grand total, the late fee, the status
 * (DUE / OVERDUE / PAID), and which of the three reminder tones the
 * calendar has earned. The templates only lay out what this file
 * hands them — change the data and the judgement changes with it.
 */
import type { InvoiceData } from "./invoice";

/* ── Money ─────────────────────────────────────────────────── */

/** €11,894.30 — always two decimals, thousands grouped, no Intl
 *  locale surprises between machines. */
export function money(n: number): string {
  const [whole, cents] = Math.abs(n).toFixed(2).split(".");
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${n < 0 ? "−" : ""}€${grouped}.${cents}`;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

/* ── Dates ─────────────────────────────────────────────────── */

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const MONTHS_SHORT = MONTHS.map((m) => m.slice(0, 3));

function parse(iso: string): [number, number, number] {
  const [y, m, d] = iso.split("-").map(Number);
  return [y, m, d];
}

/** "5 November 2026" */
export function fmtDate(iso: string): string {
  const [y, m, d] = parse(iso);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

/** "5 NOV 2026" — for stamps, cards and other tight corners. */
export function fmtDateShort(iso: string): string {
  const [y, m, d] = parse(iso);
  return `${d} ${MONTHS_SHORT[m - 1]} ${y}`.toUpperCase();
}

/** Whole days from a to b (b − a), computed on UTC midnights so a
 *  daylight-saving wobble can never invent a day of lateness. */
export function daysBetween(a: string, b: string): number {
  const [ay, am, ad] = parse(a);
  const [by, bm, bd] = parse(b);
  return Math.round((Date.UTC(by, bm - 1, bd) - Date.UTC(ay, am - 1, ad)) / 86_400_000);
}

/* ── The view of an invoice ────────────────────────────────── */

export type Status = "due" | "overdue" | "paid";

/** The reminder ladder. The calendar picks the rung:
 *  1 friendly — not yet due, or the first week past it
 *  2 firm     — 8 to 27 days past due
 *  3 final    — 28+ days past due */
export type ToneTier = 1 | 2 | 3;

export interface InvoiceLine {
  title: string;
  detail: string;
  qty: number;
  rate: number;
  amount: number;
}

export interface InvoiceView {
  data: InvoiceData;
  lines: InvoiceLine[];
  subtotal: number;
  tax: number;
  total: number;
  /** Late fee accrued so far. Zero unless overdue. */
  lateFee: number;
  /** What the client actually owes right now: total + late fee,
   *  or zero once paid. */
  balance: number;
  status: Status;
  daysOverdue: number;
  daysUntilDue: number;
  /** Days from issue to payment (paid invoices only). */
  daysToPay: number | null;
  tier: ToneTier;
}

export function view(data: InvoiceData): InvoiceView {
  const lines = data.items.map((it) => ({ ...it, amount: round2(it.qty * it.rate) }));
  const subtotal = round2(lines.reduce((s, l) => s + l.amount, 0));
  const tax = round2(subtotal * data.vatRate);
  const total = round2(subtotal + tax);

  const paid = data.paidOn !== null;
  const daysOverdue = paid ? 0 : Math.max(0, daysBetween(data.dueOn, data.today));
  const daysUntilDue = paid ? 0 : Math.max(0, daysBetween(data.today, data.dueOn));
  const status: Status = paid ? "paid" : daysOverdue > 0 ? "overdue" : "due";

  const lateFee =
    status === "overdue" ? round2(total * data.lateFeeMonthly * (daysOverdue / 30)) : 0;
  const balance = paid ? 0 : round2(total + lateFee);
  const tier: ToneTier = daysOverdue >= 28 ? 3 : daysOverdue >= 8 ? 2 : 1;

  return {
    data,
    lines,
    subtotal,
    tax,
    total,
    lateFee,
    balance,
    status,
    daysOverdue,
    daysUntilDue,
    daysToPay: paid ? daysBetween(data.issuedOn, data.paidOn as string) : null,
    tier,
  };
}

/* ── Words the status earns ────────────────────────────────── */

/** The one-line status strip printed across the invoice PDF. */
export function statusLine(v: InvoiceView): string {
  const d = v.data;
  if (v.status === "paid")
    return `PAID IN FULL — ${fmtDate(d.paidOn as string).toUpperCase()} · THANK YOU`;
  if (v.status === "overdue")
    return `OVERDUE — ${v.daysOverdue} DAYS PAST DUE · PLEASE PAY TODAY`;
  return `DUE IN ${v.daysUntilDue} DAYS — ${fmtDate(d.dueOn).toUpperCase()}`;
}

export interface ReminderCopy {
  kicker: string;
  headline: string;
  paragraphs: string[];
  cta: string;
  /** A line only some rungs of the ladder carry (the soft
   *  "ignore this" of tier 1, the paused-work line of tier 2,
   *  the escalation line of tier 3). */
  footnote: string;
}

/** The reminder email's copy, chosen by the tier the calendar
 *  picked. Every number in it is computed above. */
export function reminderCopy(v: InvoiceView): ReminderCopy {
  const d = v.data;
  const total = money(v.total);
  const due = fmtDate(d.dueOn);

  if (v.status === "due" || v.tier === 1) {
    return {
      kicker: "A friendly heads-up",
      headline:
        v.status === "due"
          ? `Invoice ${d.number} falls due in ${v.daysUntilDue} days`
          : `Invoice ${d.number} fell due on ${due}`,
      paragraphs: [
        `No drama — this is the polite tap on the shoulder. Invoice ${d.number} for ${total}, covering the autumn relaunch work, is due on ${due}. Everything you need is in the invoice itself: the bank details are on page two, and the payment reference is the invoice number.`,
        `Paying takes about a minute, and then neither of us has to think about this again.`,
      ],
      cta: `Pay ${total}`,
      footnote: "Already paid? Then this email and your payment crossed in the post — ignore it, and thank you.",
    };
  }

  if (v.tier === 2) {
    return {
      kicker: "Payment reminder",
      headline: `Invoice ${d.number} is ${v.daysOverdue} days overdue`,
      paragraphs: [
        `Invoice ${d.number} for ${total} was due on ${due}, and it is still open. Per the terms we both agreed, a late fee has been accruing at 1.5% per month — ${money(v.lateFee)} so far — which brings the balance to ${money(v.balance)}.`,
        `If something is wrong with the invoice, tell us today and we will fix it today. If it is simply stuck in a queue somewhere, please unstick it this week.`,
      ],
      cta: `Pay ${money(v.balance)} now`,
      footnote: "New work for Kova is paused until this invoice is settled — not as a threat, just so the pile doesn't grow.",
    };
  }

  return {
    kicker: "Final notice",
    headline: `${v.daysOverdue} days overdue — invoice ${d.number}`,
    paragraphs: [
      `This is the third and last reminder we send ourselves. Invoice ${d.number} for ${total}, due ${due}, remains unpaid. With the late fee at ${money(v.lateFee)}, the balance now stands at ${money(v.balance)}.`,
      `Please pay within seven days, or write back within seven days with a date you will pay. Either one closes this out. Silence, unfortunately, means we hand the file to a collections agency — which costs everyone more than the invoice is worth.`,
    ],
    cta: `Pay ${money(v.balance)} today`,
    footnote: "If we've made an error somewhere, this is the moment to tell us — we would rather fix it than escalate it.",
  };
}
