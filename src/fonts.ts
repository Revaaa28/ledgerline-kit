/**
 * Font faces for the HTML outputs (the emails' webmail view, the
 * invoice's print HTML). The PDF and the card image take the same
 * fonts as bytes instead — see render.tsx and assets/fonts/.
 *
 * Space Grotesk ships in Fontsource as a variable file; the kit
 * vendors static 500/700 instances (TTF + WOFF) under assets/fonts/,
 * generated from the variable font with fontTools.
 */
const base = "https://cdn.jsdelivr.net/npm/@fontsource";

type FontFace = { family: string; src: string; format: "woff"; weight: number };

export const fontFaces: FontFace[] = [
  { family: "Space Grotesk", src: `${base}/space-grotesk@5/files/space-grotesk-latin-500-normal.woff`, format: "woff", weight: 500 },
  { family: "Space Grotesk", src: `${base}/space-grotesk@5/files/space-grotesk-latin-700-normal.woff`, format: "woff", weight: 700 },
  { family: "Archivo", src: `${base}/archivo@5/files/archivo-latin-400-normal.woff`, format: "woff", weight: 400 },
  { family: "Archivo", src: `${base}/archivo@5/files/archivo-latin-500-normal.woff`, format: "woff", weight: 500 },
  { family: "Archivo", src: `${base}/archivo@5/files/archivo-latin-700-normal.woff`, format: "woff", weight: 700 },
  { family: "Archivo", src: `${base}/archivo@5/files/archivo-latin-900-normal.woff`, format: "woff", weight: 900 },
  { family: "Space Mono", src: `${base}/space-mono@5/files/space-mono-latin-400-normal.woff`, format: "woff", weight: 400 },
  { family: "Space Mono", src: `${base}/space-mono@5/files/space-mono-latin-700-normal.woff`, format: "woff", weight: 700 },
];
