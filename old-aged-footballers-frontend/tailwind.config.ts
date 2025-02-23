import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'tap': {
          '0%, 100%': { backgroundColor: 'rgb(224 231 255)' },
          '50%': { backgroundColor: 'rgb(199 210 254)' },
        }
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-out',
        'tap': 'tap 0.2s ease-in-out'
      },
    },
  },
  plugins: [],
} satisfies Config;
