/**
 * Ledgerline — the single source of truth for the whole kit.
 *
 * One invoice, issued by one studio to one client. The invoice PDF
 * (Document), the reminder email (Email), the receipt email (Email)
 * and the summary card (Canvas) all read from this file, and every
 * number they print is computed from these rows by src/ledger.ts —
 * nothing in the templates is a hard-coded total.
 *
 * The same invoice is captured at four moments of its life, because
 * that is what a get-paid kit is for: about to fall due, overdue,
 * at final notice, and paid. Each moment is the same data with a
 * different `today` (and, for the paid moment, a `paidOn`). Move
 * `today` and the status, the reminder's tone and the balance all
 * follow — that behaviour is the kit.
 */

export const studio = {
  name: "Forma Studio",
  wordmark: "FORMA",
  descriptor: "Brand & digital studio",
  city: "Amsterdam",
  address: "Herengracht 420, 1017 BZ Amsterdam",
  email: "studio@formastudio.example",
  site: "formastudio.example",
  bank: {
    bank: "ABN AMRO",
    accountName: "Forma Studio BV",
    iban: "NL21 ABNA 0123 4567 89",
    swift: "ABNANL2A",
  },
} as const;

export const client = {
  company: "Kova Cycles BV",
  contactName: "Marta Vos",
  contactFirstName: "Marta",
  email: "marta@kovacycles.example",
  address: "Keizersgracht 214, 1015 HD Amsterdam",
  project: "Brand identity & website — the autumn relaunch",
} as const;

export interface LineItem {
  title: string;
  detail: string;
  qty: number;
  /** Unit price in EUR. Line totals, tax and the grand total are
   *  computed from qty × rate in src/ledger.ts. */
  rate: number;
}

export interface InvoiceData {
  number: string;
  /** ISO dates (yyyy-mm-dd). `today` is the day the kit is looking
   *  at the invoice — Hyper Elements output is deterministic, so the
   *  "current" day is data, not a clock read. */
  issuedOn: string;
  dueOn: string;
  today: string;
  paidOn: string | null;
  paidMethod: string | null;
  paidRef: string | null;
  vatRate: number;
  /** Late fee per month, as a fraction of the total (0.015 = 1.5%),
   *  pro-rated daily from the due date. Stated in the terms. */
  lateFeeMonthly: number;
  payUrl: string;
  /** Where the rendered invoice PDF lives, for the receipt email. */
  invoiceUrl: string;
  items: LineItem[];
  terms: string[];
}

const base: Omit<InvoiceData, "today" | "paidOn" | "paidMethod" | "paidRef"> = {
  number: "FS-2026-014",
  issuedOn: "2026-10-06",
  dueOn: "2026-11-05",
  vatRate: 0.21,
  lateFeeMonthly: 0.015,
  payUrl: "https://pay.formastudio.example/FS-2026-014",
  invoiceUrl: "https://formastudio.example/invoices/FS-2026-014",
  items: [
    {
      title: "Brand identity",
      detail: "Logo suite, colour system and a 42-page brand book",
      qty: 1,
      rate: 4600,
    },
    {
      title: "Website design",
      detail: "Art direction and interface design for the new Kova site — 14 screens",
      qty: 1,
      rate: 3900,
    },
    {
      title: "Revision rounds",
      detail: "Two extra rounds beyond the three included, billed hourly",
      qty: 14,
      rate: 95,
    },
  ],
  terms: [
    "Payment is due 30 days from the invoice date. Quote the invoice number as your payment reference — it is how the payment finds its way home.",
    "Overdue balances accrue a late fee of 1.5% per month, pro-rated daily, from the due date until the day payment lands.",
    "Work delivered under this invoice transfers to the client in full on payment. Until then, usage rights stay with Forma Studio.",
    "Questions about this invoice: studio@formastudio.example. A human answers, usually the same day.",
  ],
};

/** The four moments. Same invoice — only the calendar (and, at the
 *  end, the payment) moves. */
export const invoiceStates = {
  /** Three days before the due date: the friendly heads-up. */
  due: { ...base, today: "2026-11-02", paidOn: null, paidMethod: null, paidRef: null },
  /** Twenty-four days past due: the firm reminder, late fee running. */
  overdue: { ...base, today: "2026-11-29", paidOn: null, paidMethod: null, paidRef: null },
  /** Forty-five days past due: the final notice. */
  finalNotice: { ...base, today: "2026-12-20", paidOn: null, paidMethod: null, paidRef: null },
  /** Paid two days early. The story ends well. */
  paid: {
    ...base,
    today: "2026-11-13",
    paidOn: "2026-11-03",
    paidMethod: "Bank transfer",
    paidRef: "TRX-88412",
  },
} satisfies Record<string, InvoiceData>;
