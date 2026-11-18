# [Challenge Submission] Ledgerline — the Get-Paid Kit

### Which challenge are you entering?

Hyper Elements Template Challenge (November 2026)

### Project name

Ledgerline — the Get-Paid Kit

### Project description

A get-paid kit for freelance studios, built with Hyper Elements. One invoice data file (src/invoice.ts) and one defineTheme drive four templates: a two-page Document invoice rendered to PDF (computed line totals, VAT, tear-off payment slip, bank details and terms on page two), an Email reminder whose voice is chosen by the calendar — friendly heads-up before the due date, firm reminder at 24 days overdue, final notice at 45 — an Email receipt for the paid state, and a Canvas summary card (1080×1080) that travels with the PDF. Nothing is hard-coded: src/ledger.ts computes the totals, the status (DUE / OVERDUE / PAID), the late fee accruing at the terms' own 1.5% per month, and which rung of the reminder ladder the invoice has reached. The repo renders the same invoice at four moments — due, overdue, final notice, paid — and every surface retells the story: the stamp flips, the totals grow a late-fee line, the reminder changes its tone, the card changes its pill. Hyper Elements CLI check: 0 errors, 0 warnings.

### Public GitHub repository URL

https://github.com/Revaaa28/ledgerline-kit

### How did you use Hyper Elements?

All four templates are Hyper Elements roots sharing one defineTheme (src/theme.ts) and shared components (src/components.tsx — wordmark, two-line status stamp, status strip, totals block, summary table, the accounting double rule; all plain layout, no Svg, so they work in Email too): a Document invoice (PageBreak, PageFooter with PageNumber, dashed perforation and payment slip, status-driven strip and stamp), two Emails (MergeTag personalisation, Table summary, a Button whose label is the computed balance, email-clients plugin validation plus per-client previews), and a Canvas card (Svg ledger-column grid, renderImage to PNG). Every template takes the invoice as a prop and renders from the computed view in src/ledger.ts. render.tsx validates everything, then renders via render(), renderPdf() and renderImage() with fonts passed as bytes. Full details and screenshots are in the repo README.

### Live preview URL (optional)

_No response_

### Submission confirmation

- [X] I have starred the [Hyper Elements repository](https://github.com/hyper-elements/hyper-elements).
- [X] My repository is public and contains the complete source code and required README.
- [X] My submission meets the requirements of the selected challenge.
