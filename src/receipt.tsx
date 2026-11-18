import {
  Button,
  Column,
  Divider,
  Email,
  Heading,
  Link,
  MergeTag,
  Row,
  Section,
  Text,
  token,
} from "@hyper-elements/react";
import { StatusStamp, SummaryTable, Wordmark } from "./components";
import { client, invoiceStates, studio, type InvoiceData } from "./invoice";
import { daysBetween, fmtDate, money, view } from "./ledger";
import { ledgerline } from "./theme";

/**
 * The receipt email — the one clients actually like getting.
 *
 * Sent the moment an invoice is marked paid. It thanks the client,
 * restates the settled figures (all computed from the same data
 * file as the invoice and the reminders), and points at the paid
 * invoice PDF, which doubles as the formal receipt. If the reminder
 * ladder is the kit's stick, this is its carrot — and the proof the
 * story ends.
 */
export default function ReceiptEmail({ inv = invoiceStates.paid }: { inv?: InvoiceData }) {
  const v = view(inv);
  const d = v.data;

  return (
    <Email
      theme={ledgerline}
      lang="en"
      width={600}
      previewText={`Payment received — invoice ${d.number} is settled in full. Thank you.`}
      title={`Receipt — invoice ${d.number} paid`}
      style={{ gap: 0 }}
    >
      {/* Header band */}
      <Section style={{ backgroundColor: token("colors.pine"), padding: [28, 36, 24, 36], gap: 18 }}>
        <Row stackOnMobile={false} style={{ alignItems: "start" }}>
          <Column style={{ flex: 1 }}>
            <Wordmark dark size={25} />
          </Column>
          <Column style={{ alignItems: "end", gap: 3, textAlign: "right" }}>
            <Text
              style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: 12,
                fontWeight: 700,
                color: token("colors.lime"),
                letterSpacing: 2,
              }}
            >
              PAYMENT RECEIVED
            </Text>
            <Text
              style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: 11,
                color: token("colors.faintOnPine"),
                letterSpacing: 1,
              }}
            >
              INVOICE {d.number} · {fmtDate(d.paidOn as string).toUpperCase()}
            </Text>
          </Column>
        </Row>
      </Section>

      {/* Body */}
      <Column style={{ padding: [30, 36], gap: 22 }}>
        <Column style={{ apply: ["card"], gap: 16 }}>
          <Row stackOnMobile={false} style={{ alignItems: "start" }}>
            <Column style={{ flex: 1 }}>
              <Text style={{ apply: ["eyebrow"], color: token("colors.emerald") }}>
                Receipt
              </Text>
            </Column>
            <StatusStamp v={v} />
          </Row>
          <Heading level={1}>
            Thank you, <MergeTag name="first_name" /> — that&rsquo;s settled.
          </Heading>
          <Text>
            Your payment of {money(v.total)} landed on {fmtDate(d.paidOn as string)}
            {(() => {
              const early = daysBetween(d.paidOn as string, d.dueOn);
              return early > 0
                ? `, ${early} day${early === 1 ? "" : "s"} ahead of the due date,`
                : early < 0
                  ? `, ${-early} day${early === -1 ? "" : "s"} after the due date,`
                  : ", right on the due date,";
            })()}{" "}
            and invoice {d.number} is now closed. The paid invoice is attached as a PDF — it doubles
            as the formal receipt for your books, stamp and all.
          </Text>
          <SummaryTable v={v} />
          <Button href={d.invoiceUrl}>Download the paid invoice (PDF)</Button>
          <Text>
            Working with the Kova team on the relaunch was a pleasure — the brand book is already
            the most-opened file in the studio. When the next project comes up, the door is open.
          </Text>
          <Text style={{ fontSize: 13, color: token("colors.muted") }}>
            — The {studio.name} team
          </Text>
        </Column>

        <Divider />
        <Text style={{ fontSize: 12, color: token("colors.muted"), textAlign: "center" }}>
          {studio.name}, {studio.address}. This receipt concerns invoice {d.number} issued to{" "}
          {client.company}. Questions: {studio.email} ·{" "}
          <Link href={`https://${studio.site}/email-preferences`}>Email preferences</Link>
        </Text>
      </Column>
    </Email>
  );
}
