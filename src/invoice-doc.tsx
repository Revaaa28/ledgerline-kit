import {
  Column,
  Divider,
  Document,
  Heading,
  PageBreak,
  PageFooter,
  PageNumber,
  Row,
  Span,
  Text,
} from "@hyper-elements/react";
import { DoubleRule, StatusStamp, StatusStrip, TotalsBlock, Wordmark } from "./components";
import { client, invoiceStates, studio, type InvoiceData } from "./invoice";
import { fontFaces } from "./fonts";
import { daysBetween, fmtDateShort, money, view, type InvoiceView } from "./ledger";
import { display, ink, ledgerline, mono, muted, pine } from "./theme";

function PartyBlock({ label, lines }: { label: string; lines: [string, boolean][] }) {
  return (
    <Column style={{ gap: 3, flex: 1 }}>
      <Text style={{ fontFamily: mono, fontSize: 9.5, letterSpacing: 2.5, color: muted }}>
        {label}
      </Text>
      {lines.map(([line, strong], i) => (
        <Text key={i} style={{ fontSize: 13, fontWeight: strong ? 700 : 400, color: ink }}>
          {line}
        </Text>
      ))}
    </Column>
  );
}

function DateFact({ label, value }: { label: string; value: string }) {
  return (
    <Column style={{ gap: 3 }}>
      <Text style={{ fontFamily: mono, fontSize: 9.5, letterSpacing: 2.5, color: muted }}>
        {label}
      </Text>
      <Text style={{ fontFamily: mono, fontSize: 13.5, fontWeight: 700, color: ink }}>{value}</Text>
    </Column>
  );
}

/** One invoice line, drawn as a row (fixed columns + hairlines)
 *  rather than a Table: identical in the print HTML and the PDF,
 *  which is where invoices get read. */
function ItemRow({ v, index }: { v: InvoiceView; index: number }) {
  const line = v.lines[index];
  return (
    <Column style={{ gap: 0 }}>
      <Row stackOnMobile={false} style={{ gap: 14, alignItems: "start", padding: [11, 0] }}>
        <Column style={{ flex: 1, gap: 2 }}>
          <Text style={{ fontSize: 14.5, fontWeight: 700, color: ink }}>{line.title}</Text>
          <Text style={{ fontSize: 12.5, color: muted }}>{line.detail}</Text>
        </Column>
        <Column style={{ width: 40, alignItems: "end" }}>
          <Text style={{ fontFamily: mono, fontSize: 13 }}>{line.qty}</Text>
        </Column>
        <Column style={{ width: 78, alignItems: "end" }}>
          <Text style={{ fontFamily: mono, fontSize: 13 }}>{money(line.rate)}</Text>
        </Column>
        <Column style={{ width: 92, alignItems: "end" }}>
          <Text style={{ fontFamily: mono, fontSize: 13.5, fontWeight: 700 }}>{money(line.amount)}</Text>
        </Column>
      </Row>
      <Divider style={{ borderTop: { width: 1, style: "solid", color: "#e7e0cd" } }} />
    </Column>
  );
}

function NumberedRows({ items }: { items: string[] }) {
  return (
    <Column style={{ gap: 9 }}>
      {items.map((item, i) => (
        <Row key={i} stackOnMobile={false} style={{ gap: 12, alignItems: "start" }}>
          <Column style={{ width: 24 }}>
            <Text style={{ fontFamily: mono, fontSize: 13, fontWeight: 700, color: pine }}>
              {String(i + 1).padStart(2, "0")}
            </Text>
          </Column>
          <Column style={{ flex: 1 }}>
            <Text style={{ fontSize: 13.5 }}>{item}</Text>
          </Column>
        </Row>
      ))}
    </Column>
  );
}

/**
 * The invoice itself — a two-page A4 Document rendered to PDF.
 *
 * Page one is the bill: parties, the computed lines, the totals, a
 * status stamp that says whatever src/ledger.ts decided, and the
 * tear-off payment slip along the bottom. Page two is how to pay,
 * the terms, and the invoice's vital statistics — every one of them
 * computed from the same data file.
 *
 * The template takes the invoice as a prop; render.tsx feeds it the
 * overdue and paid moments, and the CLI check reads the default
 * (overdue) one.
 */
export default function InvoiceDoc({ inv = invoiceStates.overdue }: { inv?: InvoiceData }) {
  const v = view(inv);
  const d = v.data;

  const facts: [string, string][] = [
    ["PAYMENT WINDOW", `${daysBetween(d.issuedOn, d.dueOn)} DAYS`],
    v.status === "paid"
      ? ["PAID AFTER", `${v.daysToPay} DAYS`]
      : ["DAYS OUTSTANDING", `${daysBetween(d.issuedOn, d.today)}`],
    v.status === "paid"
      ? ["SETTLED", `${fmtDateShort(d.paidOn as string)} — ${v.daysToPay !== null && v.daysToPay < daysBetween(d.issuedOn, d.dueOn) ? "EARLY" : "ON TIME"}`]
      : ["LATE FEE ACCRUED", v.lateFee > 0 ? money(v.lateFee).toUpperCase() : "NONE YET"],
  ];

  return (
    <Document
      theme={ledgerline}
      size="A4"
      margin={46}
      title={`Forma Studio invoice ${d.number} — ${v.status}`}
      fonts={fontFaces}
    >
      <PageFooter>
        <Row stackOnMobile={false} style={{ justifyContent: "space-between", padding: [10, 0, 0, 0] }}>
          <Text style={{ fontFamily: mono, fontSize: 9, letterSpacing: 1.5, color: "#8a8574" }}>
            FORMA STUDIO — INVOICE {d.number} · {client.company.toUpperCase()}
          </Text>
          <Text style={{ fontFamily: mono, fontSize: 9, color: "#8a8574", textAlign: "right" }}>
            PAGE <PageNumber /> OF <PageNumber total />
          </Text>
        </Row>
      </PageFooter>

      {/* ── Page 1: the bill ─────────────────────────────────── */}
      <Row
        stackOnMobile={false}
        style={{ justifyContent: "space-between", alignItems: "start", padding: [0, 0, 20, 0] }}
      >
        <Wordmark size={27} />
        <Column style={{ alignItems: "end", gap: 3, textAlign: "right" }}>
          <Text style={{ fontFamily: display, fontWeight: 700, fontSize: 31, color: ink, letterSpacing: 0.5 }}>
            INVOICE
          </Text>
          <Text style={{ fontFamily: mono, fontSize: 12.5, fontWeight: 700, letterSpacing: 1.5, color: pine }}>
            {d.number}
          </Text>
          <Text style={{ fontFamily: mono, fontSize: 10.5, color: muted, letterSpacing: 1 }}>
            ISSUED {fmtDateShort(d.issuedOn)}
          </Text>
        </Column>
      </Row>

      <StatusStrip v={v} />

      <Row stackOnMobile={false} style={{ gap: 28, alignItems: "start", padding: [24, 0, 6, 0] }}>
        <PartyBlock
          label="BILLED TO"
          lines={[
            [client.company, true],
            [client.contactName, false],
            ["Keizersgracht 214", false],
            ["1015 HD Amsterdam", false],
          ]}
        />
        <PartyBlock
          label="FROM"
          lines={[
            [studio.name, true],
            ["Herengracht 420", false],
            ["1017 BZ Amsterdam", false],
            [studio.email, false],
          ]}
        />
        <Column style={{ gap: 12 }}>
          <DateFact label="ISSUED" value={fmtDateShort(d.issuedOn)} />
          <DateFact label="DUE" value={fmtDateShort(d.dueOn)} />
          {v.status === "paid" && <DateFact label="PAID" value={fmtDateShort(d.paidOn as string)} />}
        </Column>
      </Row>

      <Column style={{ padding: [16, 0, 0, 0] }}>
        <Row stackOnMobile={false} style={{ gap: 14, padding: [0, 0, 8, 0] }}>
          <Column style={{ flex: 1 }}>
            <Text style={{ fontFamily: mono, fontSize: 9.5, letterSpacing: 2, color: muted }}>DESCRIPTION</Text>
          </Column>
          <Column style={{ width: 40, alignItems: "end" }}>
            <Text style={{ fontFamily: mono, fontSize: 9.5, letterSpacing: 2, color: muted }}>QTY</Text>
          </Column>
          <Column style={{ width: 78, alignItems: "end" }}>
            <Text style={{ fontFamily: mono, fontSize: 9.5, letterSpacing: 2, color: muted }}>RATE</Text>
          </Column>
          <Column style={{ width: 92, alignItems: "end" }}>
            <Text style={{ fontFamily: mono, fontSize: 9.5, letterSpacing: 2, color: muted }}>AMOUNT</Text>
          </Column>
        </Row>
        <DoubleRule />
        {v.lines.map((_, i) => (
          <ItemRow key={i} v={v} index={i} />
        ))}
      </Column>

      <Row stackOnMobile={false} style={{ gap: 18, alignItems: "start", padding: [20, 0, 0, 0] }}>
        <Column style={{ width: 185, padding: [4, 0, 0, 0], alignItems: "start" }}>
          <StatusStamp v={v} />
          <Text style={{ fontSize: 11.5, color: muted, padding: [10, 0, 0, 0], width: 185 }}>
            {v.status === "paid"
              ? "Settled in full. The paid invoice doubles as your receipt for this payment."
              : "Bank details and the payment link are on page two. The reference is the invoice number."}
          </Text>
        </Column>
        <Column style={{ flex: 1, alignItems: "end", gap: 10 }}>
          <DoubleRule width={300} />
          <TotalsBlock v={v} />
        </Column>
      </Row>

      {/* The tear-off slip */}
      <Column style={{ padding: [30, 0, 0, 0], gap: 12 }}>
        <Divider style={{ borderTop: { width: 1.5, style: "dashed", color: "#b9b094" } }} />
        <Text style={{ fontFamily: mono, fontSize: 9.5, letterSpacing: 2.5, color: muted }}>
          {v.status === "paid"
            ? "PAYMENT SLIP — SETTLED · KEEP FOR YOUR RECORDS"
            : "PAYMENT SLIP — RETURN WITH YOUR PAYMENT"}
        </Text>
        <Row stackOnMobile={false} style={{ gap: 24 }}>
          <DateFact label="INVOICE" value={d.number} />
          <DateFact
            label={v.status === "paid" ? "AMOUNT PAID" : "AMOUNT DUE"}
            value={money(v.status === "paid" ? v.total : v.balance)}
          />
          <DateFact label="REFERENCE" value={d.number} />
          <Column style={{ gap: 3, flex: 1 }}>
            <Text style={{ fontFamily: mono, fontSize: 9.5, letterSpacing: 2.5, color: muted }}>BANK</Text>
            <Text style={{ fontFamily: mono, fontSize: 11.5, fontWeight: 700, color: ink }}>
              {studio.bank.iban}
            </Text>
          </Column>
        </Row>
      </Column>

      <PageBreak />

      {/* ── Page 2: how to pay, terms, facts ─────────────────── */}
      <Column style={{ gap: 30 }}>
        <Column style={{ gap: 12 }}>
          <Heading level={2} style={{ fontFamily: display, fontWeight: 700, fontSize: 23, color: ink }}>
            How to pay
          </Heading>
          <Text style={{ maxWidth: 460 }}>
            Bank transfer is fastest — the money usually lands the same day, and the invoice number
            as reference means it is matched to this bill automatically.
          </Text>
          <Column style={{ gap: 7, padding: [4, 0, 0, 0] }}>
            {[
              ["BANK", studio.bank.bank],
              ["ACCOUNT NAME", studio.bank.accountName],
              ["IBAN", studio.bank.iban],
              ["SWIFT / BIC", studio.bank.swift],
              ["REFERENCE", d.number],
            ].map(([label, value]) => (
              <Row key={label} stackOnMobile={false} style={{ gap: 16 }}>
                <Column style={{ width: 120 }}>
                  <Text style={{ fontFamily: mono, fontSize: 10.5, letterSpacing: 2, color: muted }}>{label}</Text>
                </Column>
                <Text style={{ fontFamily: mono, fontSize: 13.5, fontWeight: 700, color: ink }}>{value}</Text>
              </Row>
            ))}
          </Column>
          <Text style={{ fontSize: 13.5 }}>
            Prefer card? Pay this invoice online:{" "}
            <Span style={{ fontFamily: mono, fontSize: 12.5, fontWeight: 700, color: pine }}>{d.payUrl}</Span>
          </Text>
        </Column>

        <Column style={{ gap: 12 }}>
          <Heading level={2} style={{ fontFamily: display, fontWeight: 700, fontSize: 23, color: ink }}>
            Terms
          </Heading>
          <NumberedRows items={d.terms} />
        </Column>

        <Column style={{ gap: 12 }}>
          <Heading level={2} style={{ fontFamily: display, fontWeight: 700, fontSize: 23, color: ink }}>
            This invoice, in numbers
          </Heading>
          <Row stackOnMobile={false} style={{ gap: 14 }}>
            {facts.map(([label, value]) => (
              <Column
                key={label}
                style={{ flex: 1, backgroundColor: pine, borderRadius: 10, padding: [14, 16], gap: 3 }}
              >
                <Text style={{ fontFamily: mono, fontSize: 9.5, letterSpacing: 2, color: "#d9f45c" }}>
                  {label}
                </Text>
                <Text style={{ fontFamily: mono, fontSize: 14.5, fontWeight: 700, color: "#f6f1e5" }}>
                  {value}
                </Text>
              </Column>
            ))}
          </Row>
          <Text style={{ fontSize: 12, color: muted }}>
            Every figure on this page is computed from the invoice data — the lines, the dates and
            the terms above. Change the data and the invoice, its reminders and its card all tell
            the new story, together.
          </Text>
        </Column>
      </Column>
    </Document>
  );
}
