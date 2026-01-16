/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "#ff6b35",
          dark: "#e85d04",
        },
        secondary: {
          DEFAULT: "#4ecdc4",
        },
        accent: "#f7931e",
        card: "var(--card)",
        border: "var(--border)",
        muted: "#6b7280",
      },
    },
  },
  plugins: [],
};
