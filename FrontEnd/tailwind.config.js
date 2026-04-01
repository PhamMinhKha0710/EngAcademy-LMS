/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#fff7ed', 100: '#ffedd5', 200: '#fed7aa',
                    300: '#fdba74', 400: '#fb923c', 500: '#f49d25',
                    600: '#ea8c0a', 700: '#c76a00', 800: '#9c5400',
                    900: '#7c4200',
                },
                'background-light': '#f8f7f5',
                'background-dark': '#221a10',
                success: {
                    50: '#ecfdf5', 100: '#d1fae5', 500: '#10b981', 600: '#059669',
                },
                amber: {
                    50: '#fffbeb', 100: '#fef3c7', 500: '#f59e0b', 600: '#d97706',
                },
                violet: {
                    50: '#f5f3ff', 100: '#ede9fe', 500: '#8b5cf6', 600: '#7c3aed',
                },
                secondary: {
                    50: '#f0fdf4', 100: '#dcfce7', 500: '#10b981', 600: '#059669',
                },
            },
            fontFamily: {
                sans: ['Spline Sans', 'system-ui', 'sans-serif'],
                display: ['Spline Sans', 'sans-serif'],
            },
            borderRadius: {
                DEFAULT: '1rem',
                lg: '2rem',
                xl: '3rem',
                full: '9999px',
            },
            transitionDuration: {
                DEFAULT: '250ms',
                fast: '200ms',
                normal: '250ms',
                slow: '300ms',
            },
            boxShadow: {
                card: '0 1px 3px 0 rgb(0 0 0 / 0.05), 0 1px 2px -1px rgb(0 0 0 / 0.05)',
                'card-hover': '0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
            },
        },
    },
    plugins: [
        require('@tailwindcss/typography'),
    ],
}
