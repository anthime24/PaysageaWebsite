/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                nature: "#7b9872",
                structure: "#4b463e",
                action: "#b26c2e",
                "bg-light": "#fcfcfc",
                glass: "rgba(255, 255, 255, 0.7)",
                "glass-border": "rgba(0, 0, 0, 0.05)",
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'premium-bg': 'radial-gradient(circle at 2% 2%, rgba(123, 152, 114, 0.03) 0%, transparent 50%), radial-gradient(circle at 98% 98%, rgba(178, 108, 46, 0.03) 0%, transparent 50%)',
            },
            animation: {
                'spin-slow': 'spin 8s linear infinite',
                'progress-ind': 'progress 2s ease-in-out infinite',
            },
            keyframes: {
                progress: {
                    '0%': { transform: 'translateX(-100%)' },
                    '100%': { transform: 'translateX(100%)' },
                }
            }
        },
    },
    plugins: [],
}
