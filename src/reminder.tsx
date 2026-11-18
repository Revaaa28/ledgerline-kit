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
import { fmtDate, reminderCopy, view } from "./ledger";
import { ledgerline } from "./theme";

/**
 * The payment-reminder email — one template, three voices.
 *
 * The email does not decide how it sounds. src/ledger.ts reads the
 * calendar (due in 3 days / 24 days overdue / 45 days overdue),
 * picks the rung of the ladder, and hands this template the copy:
 * friendly heads-up, firm reminder, or final notice. The figures in
 * every version — total, late fee, balance — are computed from the
 * same invoice data as the PDF.
 *
 * Personalisation is a merge tag (`first_name`), so the rendered
 * file is the send-ready template for whatever provider sends it.
 * There is no Svg in an email: the artwork is the pine band, the
 * status stamp and the double rule, all plain layout.
 */
export default function ReminderEmail({ inv = invoiceStates.due }: { inv?: InvoiceData }) {
  const v = view(inv);
  const d = v.data;
  const copy = reminderCopy(v);

  return (
    <Email
      theme={ledgerline}
      lang="en"
      width={600}
      previewText={`${copy.kicker}: invoice ${d.number} — ${copy.headline}`}
      title={`Invoice ${d.number} — ${copy.kicker}`}
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
              {copy.kicker.toUpperCase()}
            </Text>
            <Text
              style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: 11,
                color: token("colors.faintOnPine"),
                letterSpacing: 1,
              }}
            >
              INVOICE {d.number} · DUE {fmtDate(d.dueOn).toUpperCase()}
            </Text>
          </Column>
        </Row>
      </Section>

      {/* Body */}
      <Column style={{ padding: [30, 36], gap: 22 }}>
        <Column style={{ apply: ["card"], gap: 16 }}>
          <Row stackOnMobile={false} style={{ alignItems: "start" }}>
            <Column style={{ flex: 1 }}>
              <Text style={{ apply: ["eyebrow"], color: token("colors.redDeep") }}>
                {copy.kicker}
              </Text>
            </Column>
            <StatusStamp v={v} />
          </Row>
          <Heading level={1}>{copy.headline}</Heading>
          <Text>
            Hi <MergeTag name="first_name" />,
          </Text>
          {copy.paragraphs.map((p, i) => (
            <Text key={i}>{p}</Text>
          ))}
          <SummaryTable v={v} />
          <Button href={d.payUrl}>{copy.cta}</Button>
          <Text style={{ fontSize: 13, color: token("colors.muted") }}>
            Paying by transfer instead? The bank details are on page two of the invoice — quote{" "}
            {d.number} as the reference.
          </Text>
        </Column>

        <Text style={{ fontSize: 13.5, color: token("colors.muted") }}>{copy.footnote}</Text>

        <Divider />
        <Text style={{ fontSize: 12, color: token("colors.muted"), textAlign: "center" }}>
          {studio.name}, {studio.address}. This reminder concerns invoice {d.number} issued to{" "}
          {client.company}. Questions: {studio.email} ·{" "}
          <Link href={`https://${studio.site}/email-preferences`}>Email preferences</Link>
        </Text>
      </Column>
    </Email>
  );
}
