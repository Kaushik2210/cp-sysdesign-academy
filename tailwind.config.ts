import typography from "@tailwindcss/typography";

/** @type {import('tailwindcss').Config} */
const config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}", "./content/**/*.mdx"],
  theme: {
    extend: {
      colors: {
        bg: "hsl(var(--bg))",
        fg: "hsl(var(--fg))",
        muted: "hsl(var(--muted))",
        "muted-fg": "hsl(var(--muted-fg))",
        border: "hsl(var(--border))",
        accent: "hsl(var(--accent))",
        "accent-fg": "hsl(var(--accent-fg))",
        card: "hsl(var(--card))",
        hot: "hsl(var(--hot))",
        cool: "hsl(var(--cool))",
        sun: "hsl(var(--sun))",
        leaf: "hsl(var(--leaf))",
        pink: "hsl(var(--pink))",
        yellow: "hsl(var(--yellow))",
        mint: "hsl(var(--mint))",
        orange: "hsl(var(--orange))",
        lilac: "hsl(var(--lilac))",
        sky: "hsl(var(--sky))",
      },
      borderRadius: { lg: "8px", xl: "12px", "2xl": "16px", "3xl": "22px" },
      fontFamily: {
        sans: ['"Bricolage Grotesque Variable"', '"Helvetica Neue"', "Helvetica", "Arial", "system-ui", "sans-serif"],
        mono: ['"Space Mono"', "ui-monospace", "SFMono-Regular", "Menlo", "Consolas", "monospace"],
      },
    },
  },
  plugins: [typography],
};

export default config;
