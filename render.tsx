/**
 * Render the whole Ledgerline kit from src/invoice.ts:
 *
 *   out/invoice-{due,overdue,paid}.pdf   the invoice at three moments
 *   out/invoice-overdue.html             its print HTML
 *   out/reminder-{due,overdue,final}.*   the reminder ladder (Email)
 *   out/receipt-paid.*                   the receipt (Email)
 *   out/card-{due,overdue,paid}.png      the summary card (Canvas)
 *   out/clients/                         per-client email previews
 *
 * Every template is validated first (the emails with the
 * email-clients plugin, so Outlook/Gmail/Apple Mail findings count
 * too). Any error diagnostic stops the build — warnings are
 * printed, never hidden.
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { emailClients, renderInEmailClients } from "@hyper-elements/email-clients";
import { ElementsError, formatDiagnostics, outline, render, validate } from "@hyper-elements/react";
import { renderImage } from "@hyper-elements/react/image";
import { renderPdf } from "@hyper-elements/react/pdf";
import SummaryCard from "./src/card";
import InvoiceDoc from "./src/invoice-doc";
import { invoiceStates } from "./src/invoice";
import ReceiptEmail from "./src/receipt";
import ReminderEmail from "./src/reminder";

const fontFiles: [string, string, number][] = [
  ["Space Grotesk", "assets/fonts/SpaceGrotesk-500.ttf", 500],
  ["Space Grotesk", "assets/fonts/SpaceGrotesk-700.ttf", 700],
  ["Archivo", "assets/fonts/Archivo-400.ttf", 400],
  ["Archivo", "assets/fonts/Archivo-500.ttf", 500],
  ["Archivo", "assets/fonts/Archivo-700.ttf", 700],
  ["Archivo", "assets/fonts/Archivo-900.ttf", 900],
  ["Space Mono", "assets/fonts/SpaceMono-400.ttf", 400],
  ["Space Mono", "assets/fonts/SpaceMono-700.ttf", 700],
];

async function loadFonts() {
  return Promise.all(
    fontFiles.map(async ([family, path, weight]) => ({
      family,
      src: await readFile(path),
      weight,
    })),
  );
}

function report(name: string, diagnostics: { severity?: string }[] | undefined) {
  if (diagnostics?.length) {
    console.log(`\n${name}:\n${formatDiagnostics(diagnostics as never)}`);
  }
  return diagnostics?.some((d) => d.severity === "error") ?? false;
}

async function main() {
  await mkdir("out/clients", { recursive: true });
  const fonts = await loadFonts();
  let failed = false;

  // ── The invoice, at three moments (Document → PDF) ───────
  for (const state of ["due", "overdue", "paid"] as const) {
    const doc = <InvoiceDoc inv={invoiceStates[state]} />;
    failed = report(`invoice-${state} validate`, validate(doc).diagnostics) || failed;
    const { pdf, diagnostics } = await renderPdf(doc, { fonts });
    failed = report(`invoice-${state} pdf`, diagnostics) || failed;
    await writeFile(`out/invoice-${state}.pdf`, pdf);
    console.log(`invoice-${state}: out/invoice-${state}.pdf`);
    if (state === "overdue") {
      const { html } = await render(doc);
      await writeFile("out/invoice-overdue.html", html);
    }
  }

  // ── The reminder ladder + the receipt (Email) ────────────
  const emails: [string, React.ReactElement, boolean][] = [
    ["reminder-due", <ReminderEmail inv={invoiceStates.due} />, false],
    ["reminder-overdue", <ReminderEmail inv={invoiceStates.overdue} />, true],
    ["reminder-final", <ReminderEmail inv={invoiceStates.finalNotice} />, false],
    ["receipt-paid", <ReceiptEmail inv={invoiceStates.paid} />, true],
  ];
  for (const [name, email, previews] of emails) {
    const emailReport = validate(email, { plugins: [await emailClients()] });
    failed = report(`${name} validate`, emailReport.diagnostics) || failed;
    if (!emailReport.valid) continue;
    const { html, text, diagnostics } = await render(email);
    failed = report(`${name} render`, diagnostics) || failed;
    await writeFile(`out/${name}.html`, html);
    await writeFile(`out/${name}.txt`, text);
    console.log(`${name}: out/${name}.html + .txt`);
    if (previews) {
      const { previews: clientPreviews, diagnostics: previewDiags } =
        await renderInEmailClients(email);
      report(`${name} client previews`, previewDiags);
      for (const preview of clientPreviews) {
        await writeFile(`out/clients/${name}-${preview.filename}`, preview.html);
      }
      console.log(`${name}: ${clientPreviews.length} client previews in out/clients/`);
    }
  }

  // ── The summary card, at three moments (Canvas → PNG) ────
  for (const state of ["due", "overdue", "paid"] as const) {
    const card = <SummaryCard inv={invoiceStates[state]} />;
    failed = report(`card-${state} validate`, validate(card).diagnostics) || failed;
    const png = await renderImage(card, { fonts });
    failed = report(`card-${state} png`, png.diagnostics) || failed;
    await writeFile(`out/card-${state}.png`, png.image);
    console.log(`card-${state}: out/card-${state}.png (${png.width}×${png.height})`);
    if (state === "overdue") {
      const svg = await renderImage(card, { fonts, format: "svg" });
      await writeFile("out/card-overdue.svg", svg.image);
    }
  }

  console.log("\n── invoice (overdue) outline ──\n" + outline(<InvoiceDoc />));
  if (failed) process.exitCode = 1;
}

main().catch((e) => {
  if (e instanceof ElementsError) {
    console.error(formatDiagnostics(e.diagnostics));
  } else {
    console.error(e);
  }
  process.exitCode = 1;
});
