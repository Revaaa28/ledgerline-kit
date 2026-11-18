import { Canvas, Column, Layer, Rect, Row, Svg, Text } from "@hyper-elements/react";
import { Wordmark, statusColors } from "./components";
import { client, invoiceStates, studio, type InvoiceData } from "./invoice";
import { fontFaces } from "./fonts";
import { fmtDateShort, money, view } from "./ledger";
import { display, faintOnPine, ink, ledgerline, lime, mono, paper, pine } from "./theme";

/** Ledger columns — faint vertical hairlines across the card, the
 *  grid of an account book, drawn in Svg. Canvas and Document only;
 *  this card is a Canvas, so it is allowed its artwork. */
function LedgerGrid({ width = 1080, height = 1080 }: { width?: number; height?: number }) {
  const cols = [150, 330, 510, 690, 870];
  return (
    <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      {cols.map((x) => (
        <Rect key={x} x={x} y={0} width={1.5} height={height} style={{ fill: "#1d4a3a" }} />
      ))}
      <Rect x={0} y={height - 210} width={width} height={1.5} style={{ fill: "#1d4a3a" }} />
      <Rect x={0} y={height - 204} width={width} height={4} style={{ fill: lime, opacity: 0.9 }} />
    </Svg>
  );
}

/** A row of ruler ticks — the edge of the ledger page. Pure layout. */
function RulerTicks({ count = 64 }: { count?: number }) {
  return (
    <Row stackOnMobile={false} style={{ gap: 12, alignItems: "start" }}>
      {Array.from({ length: count }, (_, i) => (
        <Column
          key={i}
          style={{ width: 2, height: i % 6 === 0 ? 22 : 11, backgroundColor: "#2a5a48" }}
        />
      ))}
    </Row>
  );
}

/**
 * The invoice summary card — a 1080×1080 Canvas rendered to PNG.
 *
 * The card that travels with the PDF: dropped into a chat, attached
 * to the reminder, pinned in the project channel. One glance gives
 * the amount, the due date and the status — the same computed
 * figures as the invoice itself, because it renders from the same
 * view of the same data. When the invoice is paid, the card turns
 * into the thank-you.
 */
export default function SummaryCard({ inv = invoiceStates.overdue }: { inv?: InvoiceData }) {
  const v = view(inv);
  const d = v.data;
  const c = statusColors[v.status];
  const amount = v.status === "paid" ? v.total : v.balance;
  const pillWord =
    v.status === "paid"
      ? "PAID — THANK YOU"
      : v.status === "overdue"
        ? `OVERDUE — ${v.daysOverdue} DAYS PAST DUE`
        : `DUE IN ${v.daysUntilDue} DAYS`;

  return (
    <Canvas
      theme={ledgerline}
      width={1080}
      height={1080}
      title={`Invoice ${d.number} summary card — ${v.status}`}
      fonts={fontFaces}
      style={{ backgroundColor: pine }}
    >
      <Layer>
        <LedgerGrid />
        <Column style={{ height: 1080, padding: [62, 72, 54, 72], justifyContent: "space-between" }}>
          <Row stackOnMobile={false} style={{ justifyContent: "space-between", alignItems: "start" }}>
            <Wordmark dark size={30} />
            <Column style={{ alignItems: "end", gap: 4, textAlign: "right" }}>
              <Text style={{ fontFamily: mono, fontSize: 15, fontWeight: 700, letterSpacing: 2, color: lime }}>
                INVOICE {d.number}
              </Text>
              <Text style={{ fontFamily: mono, fontSize: 13, letterSpacing: 1.5, color: faintOnPine }}>
                {client.company.toUpperCase()}
              </Text>
            </Column>
          </Row>

          <Column style={{ gap: 26 }}>
            <Text style={{ fontFamily: mono, fontSize: 16, letterSpacing: 3, color: lime }}>
              {v.status === "paid" ? "AMOUNT PAID" : "BALANCE DUE"} — {client.project.toUpperCase()}
            </Text>
            <Text
              style={{
                fontFamily: display,
                fontWeight: 700,
                fontSize: 124,
                lineHeight: 1,
                color: paper,
                letterSpacing: 0.5,
              }}
            >
              {money(amount)}
            </Text>
            <Row stackOnMobile={false} style={{ gap: 34 }}>
              {[
                ["ISSUED", fmtDateShort(d.issuedOn)],
                ["DUE", fmtDateShort(d.dueOn)],
                v.status === "paid"
                  ? ["PAID", fmtDateShort(d.paidOn as string)]
                  : ["STATUS", v.status.toUpperCase()],
              ].map(([label, value]) => (
                <Column key={label} style={{ gap: 3 }}>
                  <Text style={{ fontFamily: mono, fontSize: 12, letterSpacing: 2.5, color: faintOnPine }}>
                    {label}
                  </Text>
                  <Text
                    style={{ fontFamily: display, fontSize: 20, fontWeight: 700, color: paper, letterSpacing: 0.5 }}
                  >
                    {value}
                  </Text>
                </Column>
              ))}
            </Row>
            <Column
              style={{
                backgroundColor: v.status === "paid" ? lime : c.main,
                borderRadius: 10,
                padding: [16, 22],
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontFamily: mono,
                  fontSize: 21,
                  fontWeight: 700,
                  letterSpacing: 3,
                  color: v.status === "overdue" ? paper : ink,
                }}
              >
                {pillWord}
              </Text>
            </Column>
          </Column>

          <Column style={{ gap: 20 }}>
            <RulerTicks />
            <Row stackOnMobile={false} style={{ justifyContent: "space-between", alignItems: "center" }}>
              <Text style={{ fontFamily: mono, fontSize: 13, letterSpacing: 2, color: faintOnPine }}>
                {studio.site.toUpperCase()}
              </Text>
              <Text style={{ fontFamily: mono, fontSize: 13, letterSpacing: 2, color: faintOnPine }}>
                ONE INVOICE · EVERY DOCUMENT
              </Text>
            </Row>
          </Column>
        </Column>
      </Layer>
    </Canvas>
  );
}
