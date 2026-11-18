/**
 * Screenshot the rendered emails for preview/ — the same job
 * pdftoppm does for the PDFs. The email HTML carries no @font-face
 * (an Email root can't), so the shot copies get the kit's vendored
 * WOFFs injected as file:// faces; the sent HTML stays untouched.
 */
import { readFile, writeFile, unlink } from "node:fs/promises";
import { chromium } from "playwright-core";

const KIT = "/home/hatch/workspace/ledgerline-kit";
const fonts = `
@font-face { font-family: 'Space Grotesk'; src: url('file://${KIT}/assets/fonts/SpaceGrotesk-500.woff') format('woff'); font-weight: 500; }
@font-face { font-family: 'Space Grotesk'; src: url('file://${KIT}/assets/fonts/SpaceGrotesk-700.woff') format('woff'); font-weight: 700; }
@font-face { font-family: 'Archivo'; src: url('file://${KIT}/assets/fonts/Archivo-400.woff') format('woff'); font-weight: 400; }
@font-face { font-family: 'Archivo'; src: url('file://${KIT}/assets/fonts/Archivo-500.woff') format('woff'); font-weight: 500; }
@font-face { font-family: 'Archivo'; src: url('file://${KIT}/assets/fonts/Archivo-700.woff') format('woff'); font-weight: 700; }
@font-face { font-family: 'Archivo'; src: url('file://${KIT}/assets/fonts/Archivo-900.woff') format('woff'); font-weight: 900; }
@font-face { font-family: 'Space Mono'; src: url('file://${KIT}/assets/fonts/SpaceMono-400.woff') format('woff'); font-weight: 400; }
@font-face { font-family: 'Space Mono'; src: url('file://${KIT}/assets/fonts/SpaceMono-700.woff') format('woff'); font-weight: 700; }
`;

const targets = ["reminder-due", "reminder-overdue", "reminder-final", "receipt-paid"];

const browser = await chromium.launch({
  executablePath: "/home/hatch/.cache/ms-playwright/chromium-1254/chrome-linux64/chrome",
  args: ["--allow-file-access-from-files", "--no-sandbox"],
});
try {
  const page = await browser.newPage({ viewport: { width: 680, height: 900 }, deviceScaleFactor: 2 });
  for (const name of targets) {
    const html = await readFile(`${KIT}/out/${name}.html`, "utf8");
    const shot = `${KIT}/preview/.shot-${name}.html`;
    await writeFile(shot, html.replace("</head>", `<style>${fonts}</style></head>`));
    await page.goto(`file://${shot}`);
    await page.waitForTimeout(350);
    await page.screenshot({ path: `${KIT}/preview/${name}.png`, fullPage: true });
    await unlink(shot);
    console.log(`preview/${name}.png`);
  }
} finally {
  await browser.close();
}
