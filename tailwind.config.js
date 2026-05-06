/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        gold: {
          50:  'rgba(200, 169, 110, 0.06)',
          100: 'rgba(200, 169, 110, 0.12)',
          200: '#E8D5A6',
          300: '#D9C185',
          400: '#C8A96E',
          500: '#B8924A',
          600: '#9A7A3C',
          700: '#7A6030',
          800: '#5A4824',
          900: '#3A2E18',
        },
        obsidian: {
          50:  '#F0EDE8',
          100: '#C8BFB5',
          200: '#9A8E82',
          300: '#6E6057',
          400: '#4D4540',
          500: '#2E2B27',
          600: '#242220',
          700: '#1C1A17',
          800: '#141210',
          900: '#0B0A09',
          950: '#080705',
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        serif:   ['"Instrument Serif"', 'Georgia', 'serif'],
        sans:    ['"DM Sans"', 'system-ui', 'sans-serif'],
        inter:   ['"Inter"', 'system-ui', 'sans-serif'],
        jakarta: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        outfit:  ['"Outfit"', 'system-ui', 'sans-serif'],
        script:  ['Qwitcher Grypen', 'cursive'],
      },
      fontSize: {
        'display': ['5.5rem', { lineHeight: '1.05', letterSpacing: '-0.03em' }],
        'h1': ['4.5rem', { lineHeight: '1.08', letterSpacing: '-0.025em' }],
        'h2': ['3.5rem', { lineHeight: '1.12', letterSpacing: '-0.02em' }],
        'h3': ['2.4rem', { lineHeight: '1.2', letterSpacing: '-0.015em' }],
        'h4': ['1.9rem', { lineHeight: '1.3' }],
        'h5': ['1.5rem', { lineHeight: '1.4' }],
        'h6': ['1.25rem', { lineHeight: '1.5' }],
      },
      borderRadius: {
        xl: "calc(var(--radius) + 4px)",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xs: "calc(var(--radius) - 6px)",
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        gold: "0 0 0 1px rgba(200,169,110,0.2), 0 4px 24px rgba(200,169,110,0.12)",
        'gold-lg': "0 0 0 1px rgba(200,169,110,0.25), 0 8px 40px rgba(200,169,110,0.18)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "caret-blink": {
          "0%,70%,100%": { opacity: "1" },
          "20%,50%": { opacity: "0" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-in-left": {
          "0%": { opacity: "0", transform: "translateX(-40px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "slide-in-right": {
          "0%": { opacity: "0", transform: "translateX(40px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.92)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "marquee": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "caret-blink": "caret-blink 1.25s ease-out infinite",
        "fade-up": "fade-up 0.6s ease-out forwards",
        "fade-in": "fade-in 0.4s ease-out forwards",
        "slide-in-left": "slide-in-left 0.7s ease-out forwards",
        "slide-in-right": "slide-in-right 0.7s ease-out forwards",
        "scale-in": "scale-in 0.6s ease-out forwards",
        "marquee": "marquee 40s linear infinite",
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '30': '7.5rem',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
