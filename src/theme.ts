import { defineTheme } from "@hyper-elements/react";

/**
 * The Ledgerline brand, written once.
 *
 * Every root in the kit (Document, Email, Canvas) takes this theme,
 * so the invoice, the reminder, the receipt and the card cannot
 * drift apart: deep pine green and warm cream, a lime that only
 * appears on the dark green, and a status palette the whole kit
 * shares — gold for due, red for overdue, green for paid.
 *
 * Type: Space Grotesk for display (a studio's voice), Archivo for
 * text, Space Mono for every number that came off a ledger.
 */
export const ledgerline = defineTheme({
  colors: {
    background: "#f6f1e5", // warm cream
    foreground: "#141a16", // green-black ink
    primary: "#0c3b2e",
    primaryForeground: "#f6f1e5",
    muted: "#68705f",
    border: "#e0d9c4",
    ink: "#141a16",
    paper: "#f6f1e5",
    pine: "#0c3b2e",
    pineDeep: "#07271e",
    emerald: "#0e7a55",
    lime: "#d9f45c",
    gold: "#b97f10", // due — dark enough for small text on cream
    goldBright: "#e8a13a", // due — shapes and large type only
    red: "#bc2a1a", // overdue
    redDeep: "#9c2113", // overdue, small text on cream
    lineOnPine: "#2a5a48",
    faintOnPine: "#9db8ab",
    cardLine: "#e7e0cd",
  },
  fonts: {
    body: "Archivo, Arial, sans-serif",
    heading: "'Space Grotesk', Archivo, Arial, sans-serif",
    mono: "'Space Mono', 'Courier New', monospace",
  },
  fontSizes: { body: 15 },
  lineHeights: { body: 1.55 },
  components: {
    Heading: {
      by: {
        level: {
          1: { fontSize: 30, lineHeight: 1.12, letterSpacing: 0.2, mobile: { fontSize: 25 } },
          2: { fontSize: 19, lineHeight: 1.25, letterSpacing: 0.3 },
          3: { fontSize: 14, lineHeight: 1.3, letterSpacing: 1 },
        },
      },
    },
    Button: {
      borderRadius: 10,
      padding: [13, 24],
      fontWeight: 700,
      hover: { backgroundColor: "#0e7a55" },
    },
    Text: {},
  },
  styles: {
    card: {
      backgroundColor: "#ffffff",
      borderRadius: 16,
      padding: 32,
      gap: 18,
    },
    eyebrow: {
      fontFamily: "'Space Mono', 'Courier New', monospace",
      fontSize: 11,
      letterSpacing: 2.5,
      textTransform: "uppercase",
    },
  },
});

/* Plain constants for the places a token can't reach (shared
 * components, Svg fills). Same values as the theme above. */
export const ink = "#141a16";
export const paper = "#f6f1e5";
export const pine = "#0c3b2e";
export const pineDeep = "#07271e";
export const emerald = "#0e7a55";
export const lime = "#d9f45c";
export const gold = "#b97f10";
export const goldBright = "#e8a13a";
export const red = "#bc2a1a";
export const redDeep = "#9c2113";
export const muted = "#68705f";
export const lineOnPine = "#2a5a48";
export const faintOnPine = "#9db8ab";

export const display = "'Space Grotesk', Archivo, Arial, sans-serif";
export const mono = "'Space Mono', 'Courier New', monospace";
