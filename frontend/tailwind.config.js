/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#080b11",
        cardBg: "rgba(17, 25, 40, 0.75)",
        borderGlow: "rgba(255, 255, 255, 0.08)",
        primary: {
          DEFAULT: "#00f0ff", // Neon Cyan
          hover: "#00c8d7",
        },
        secondary: {
          DEFAULT: "#bd00ff", // Neon Purple
          hover: "#a300dd",
        },
        warning: {
          DEFAULT: "#ff3b30", // Bright Red
          hover: "#e03126",
        },
        success: {
          DEFAULT: "#34c759", // Leaf Green
        }
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "glass-gradient": "linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%)",
      },
      boxShadow: {
        glow: "0 0 15px rgba(0, 240, 255, 0.2)",
        purpleGlow: "0 0 15px rgba(189, 0, 255, 0.25)",
        redGlow: "0 0 15px rgba(255, 59, 48, 0.2)",
      },
      fontFamily: {
        sans: ["Outfit", "Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      }
    },
  },
  plugins: [],
}
