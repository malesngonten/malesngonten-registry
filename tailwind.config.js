/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    // Component sources are previewed live with @remotion/player and rely on
    // Tailwind utilities (same classes they get under Remotion Studio's
    // @remotion/tailwind-v4), so they must be scanned for class names too.
    // Keep lib/** in sync since helpers (e.g. lib/remocn-ui) are imported by
    // preview internals.
    "./components/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      // Compatibility aliases for Tailwind v4 utility names used by component
      // sources that were authored against Remotion Studio (@remotion/
      // tailwind-v4). Values mirror the v4 defaults so previews on this
      // Tailwind v3 build render identically to the Studio.
      borderRadius: {
        "2xs": "0.25rem",
      },
      blur: {
        xs: "4px",
      },
      backdropBlur: {
        xs: "4px",
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
      },
    },
  },
  plugins: [],
}
