/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
          game: ['Fredoka', 'sans-serif'],
          sans: ['Poppins', 'sans-serif']
      },
      colors: {
          riRed: '#DC2626',
          riDarkRed: '#7F1D1D',
          riGold: '#FACC15',
          riDarkGold: '#CA8A04'
      },
      keyframes: {
          float: {
              '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
              '50%': { transform: 'translateY(-12px) rotate(3deg)' }
          },
          pop: {
              '0%': { transform: 'scale(0.8)', opacity: '0' },
              '70%': { transform: 'scale(1.1)' },
              '100%': { transform: 'scale(1)', opacity: '1' }
          },
          pulseGlow: {
              '0%, 100%': { filter: 'drop-shadow(0 0 15px rgba(250, 204, 21, 0.8))' },
              '50%': { filter: 'drop-shadow(0 0 35px rgba(239, 68, 68, 1))' }
          },
          feverBg: {
              '0%': { backgroundPosition: '0% 0%' },
              '100%': { backgroundPosition: '100% 100%' }
          },
          floatText: {
              '0%': { opacity: '1', transform: 'translate(-50%, 0) scale(0.8) rotate(-5deg)' },
              '50%': { transform: 'translate(-50%, -40px) scale(1.3) rotate(5deg)' },
              '100%': { opacity: '0', transform: 'translate(-50%, -80px) scale(1) rotate(0deg)' }
          }
      },
      animation: {
          float: 'float 3.5s ease-in-out infinite',
          pop: 'pop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
          pulseGlow: 'pulseGlow 1.5s infinite',
          floatText: 'floatText 0.7s cubic-bezier(0.1, 0.8, 0.3, 1) forwards'
      }
    }
  },
  plugins: [],
}
