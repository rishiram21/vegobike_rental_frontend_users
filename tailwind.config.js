module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      keyframes: {
        fadeInDown: {
          from: { opacity: 0, transform: "translateY(-50px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
        fadeInUp: {
          from: { opacity: 0, transform: "translateY(50px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in-down": "fadeInDown 1s ease-out",
        "fade-in-up": "fadeInUp 1s ease-out",
        'spin-slow': 'spin 3s linear infinite', // Slower spinning animation
        pulse: 'pulse 2s infinite',
      },
    },
  },
  plugins: [],
};
