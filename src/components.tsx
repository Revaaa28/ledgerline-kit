import { Column, Divider, Row, Table, TableCell, TableRow, Text } from "@hyper-elements/react";
import { client, studio } from "./invoice";
import { fmtDate, money, statusLine, type InvoiceView, type Status } from "./ledger";
import { display, emerald, faintOnPine, gold, ink, lime, mono, muted, paper, pine, red, redDeep } from "./theme";

/**
 * Shared building blocks for the Ledgerline kit.
 *
 * Everything visual that more than one surface needs lives here, so
 * the invoice, the emails and the card are built from the same parts
 * — not four lookalikes that drift apart. Everything here is plain
 * layout and type (no Svg), so every piece works in every root,
 * including Email, where Svg does not exist.
 */

/** Status colours, in three registers: the strong colour for shapes,
 *  the deep colour for small text on cream, and the pale tint for
 *  the status strip's ground. One status, one colour, everywhere. */
export const statusColors: Record<Status, { main: string; deep: string; tint: string }> = {
  due: { main: gold, deep: "#7a5205", tint: "#f6e8c8" },
  overdue: { main: red, deep: redDeep, tint: "#f8e2da" },
  paid: { main: emerald, deep: "#0a5c40", tint: "#dcefe4" },
};

/** The studio lockup: FORMA in the display face, the descriptor
 *  tracked out under it in mono. */
export function Wordmark({ dark = false, size = 26 }: { dark?: boolean; size?: number }) {
  return (
    <Column style={{ gap: 1 }}>
      <Row stackOnMobile={false} style={{ gap: 8, alignItems: "center" }}>
        <Column style={{ width: 11, height: 11, backgroundColor: dark ? lime : pine }} />
        <Text
          style={{
            fontFamily: display,
            fontWeight: 700,
            fontSize: size,
            letterSpacing: 1.5,
            color: dark ? paper : ink,
            lineHeight: 1,
          }}
        >
          {studio.wordmark}
        </Text>
      </Row>
      <Text
        style={{
          fontFamily: mono,
          fontSize: 9,
          letterSpacing: 2.1,
          color: dark ? faintOnPine : muted,
        }}
      >
        {studio.descriptor.toUpperCase()} — {studio.city.toUpperCase()}
      </Text>
    </Column>
  );
}

/** The accounting double rule — a thick line over a hairline, the
 *  way ledgers have closed a column of figures for centuries. The
 *  kit's motif: it sits under headings and above totals. */
export function DoubleRule({ color = ink, width }: { color?: string; width?: number }) {
  return (
    <Column style={{ gap: 3, width }}>
      <Divider style={{ borderTop: { width: 2.5, style: "solid", color } }} />
      <Divider style={{ borderTop: { width: 1, style: "solid", color } }} />
    </Column>
  );
}

/** The rubber stamp: a bordered two-line label whose word and
 *  colour are whatever src/ledger.ts says the status is. */
export function StatusStamp({ v }: { v: InvoiceView }) {
  const c = statusColors[v.status];
  const word =
    v.status === "paid" ? "PAID" : v.status === "overdue" ? "OVERDUE" : "DUE";
  const sub =
    v.status === "paid"
      ? fmtDate(v.data.paidOn as string).toUpperCase()
      : v.status === "overdue"
        ? `${v.daysOverdue} DAYS PAST DUE`
        : fmtDate(v.data.dueOn).toUpperCase();
  return (
    <Column
      style={{
        border: { width: 2, style: "solid", color: c.main },
        borderRadius: 6,
        padding: [9, 16],
        alignItems: "center",
        gap: 2,
      }}
    >
      <Text style={{ fontFamily: mono, fontSize: 16, fontWeight: 700, letterSpacing: 3.5, color: c.deep }}>
        {word}
      </Text>
      <Text style={{ fontFamily: mono, fontSize: 9, letterSpacing: 1.8, color: c.deep }}>
        {sub}
      </Text>
    </Column>
  );
}

/** The full-width status strip across the invoice: pale tint ground,
 *  deep status text — colour-coded without ever risking contrast. */
export function StatusStrip({ v }: { v: InvoiceView }) {
  const c = statusColors[v.status];
  return (
    <Row
      stackOnMobile={false}
      style={{
        backgroundColor: c.tint,
        padding: [11, 16],
        alignItems: "center",
        borderRadius: 8,
      }}
    >
      <Text style={{ fontFamily: mono, fontSize: 11.5, fontWeight: 700, letterSpacing: 1.2, color: c.deep }}>
        {statusLine(v)}
      </Text>
    </Row>
  );
}

/** The totals column of the invoice — subtotal, VAT, late fee when
 *  the calendar has earned one, and the figure that matters. Every
 *  value arrives computed; this only lays them out. */
export function TotalsBlock({ v }: { v: InvoiceView }) {
  const rows: [string, string, boolean][] = [
    ["Subtotal", money(v.subtotal), false],
    [`VAT ${(v.data.vatRate * 100).toFixed(0)}%`, money(v.tax), false],
  ];
  if (v.lateFee > 0) rows.push([`Late fee — ${v.daysOverdue} days`, money(v.lateFee), false]);
  rows.push([
    v.status === "paid" ? "Total paid" : "Balance due",
    money(v.status === "paid" ? v.total : v.balance),
    true,
  ]);
  return (
    <Column style={{ width: 300, gap: 7 }}>
      {rows.map(([label, value, strong]) => (
        <Row
          key={label}
          stackOnMobile={false}
          style={{ justifyContent: "space-between", alignItems: "end" }}
        >
          <Text
            style={{
              fontFamily: mono,
              fontSize: strong ? 12 : 11.5,
              letterSpacing: 1,
              color: strong ? ink : muted,
              fontWeight: strong ? 700 : 400,
            }}
          >
            {label.toUpperCase()}
          </Text>
          <Text
            style={{
              fontFamily: mono,
              fontSize: strong ? 19 : 13.5,
              fontWeight: 700,
              color: strong ? statusColors[v.status].deep : ink,
              textAlign: "right",
            }}
          >
            {value}
          </Text>
        </Row>
      ))}
    </Column>
  );
}

/** The summary table both emails carry — the invoice in five lines,
 *  so the reader never has to open the PDF to know where they stand. */
export function SummaryTable({ v }: { v: InvoiceView }) {
  const d = v.data;
  const rows: [string, string][] = [
    ["Invoice", d.number],
    ["Project", client.project],
    ["Issued", fmtDate(d.issuedOn)],
    ["Due", fmtDate(d.dueOn)],
  ];
  if (v.status === "paid") {
    rows.push(["Amount paid", money(v.total)]);
    rows.push(["Paid on", fmtDate(d.paidOn as string)]);
    rows.push(["Method", `${d.paidMethod} · ref ${d.paidRef}`]);
  } else {
    rows.push(["Invoice total", money(v.total)]);
    if (v.lateFee > 0) rows.push(["Late fee so far", money(v.lateFee)]);
    rows.push(["Balance due", money(v.balance)]);
  }
  return (
    <Table
      style={{
        cellPadding: [8, 0],
        rowBorder: { width: 1, style: "solid", color: "#e7e0cd" },
      }}
    >
      {rows.map(([label, value]) => (
        <TableRow key={label}>
          <TableCell style={{ width: 130, color: muted, fontSize: 13.5 }}>{label}</TableCell>
          <TableCell style={{ fontWeight: 700, fontSize: 13.5 }}>{value}</TableCell>
        </TableRow>
      ))}
    </Table>
  );
}
