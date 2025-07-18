import { Roboto_Mono, Poppins } from "next/font/google";

export const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  variable: "--font-roboto-mono",
});

export const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-poppins",
});

export const fontVariables = `

  ${robotoMono.variable}
  ${poppins.variable}
`;

export const fonts = {
  heading: "var(--font-inter)",
  body: "var(--font-inter)",
  mono: "var(--font-roboto-mono)",
  special: "var(--font-poppins)",
};
