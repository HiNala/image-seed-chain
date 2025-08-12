import type { Config } from 'tailwindcss'

export default {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './pages/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      animation: {
        aurora: 'aurora 60s linear infinite',
      },
      keyframes: {
        aurora: {
          from: { backgroundPosition: '50% 50%, 50% 50%' },
          to: { backgroundPosition: '350% 50%, 350% 50%' },
        },
      },
      borderRadius: {
        '2xl': '1.25rem'
      },
      boxShadow: {
        soft: '0 10px 30px rgba(0,0,0,0.08)',
        ambient: '0 20px 60px rgba(0,0,0,0.12)'
      },
      colors: {
        haze: {
          50: '#faf8ff', 100: '#f2ecff', 200: '#e6dfff', 300: '#d4c9ff',
          400: '#b7a6ff', 500: '#9e8cff', 600: '#7a69e6', 700: '#5f54bf',
          800: '#4a4396', 900: '#3a3676'
        },
        fg: 'rgba(255,255,255,0.92)',
        muted: 'rgba(255,255,255,0.6)',
        card: 'rgba(255,255,255,0.08)',
        border: 'rgba(255,255,255,0.14)'
      },
      backdropBlur: {
        xs: '2px'
      }
    }
  },
  plugins: [
    function addVariablesForColors({ addBase, theme }: any) {
      const flattenColorPalette = (obj: any, sep = '-'): Record<string, any> =>
        Object.assign(
          {},
          ...Object.entries(obj || {}).map(([k, v]) =>
            typeof v === 'object'
              ? Object.fromEntries(
                  Object.entries(flattenColorPalette(v, sep)).map(([k2, v2]) => [k + sep + k2, v2])
                )
              : { [k]: v }
          )
        )
      const allColors = flattenColorPalette(theme('colors'))
      const newVars = Object.fromEntries(Object.entries(allColors).map(([k, v]) => [`--${k}`, v as string]))
      addBase({ ':root': newVars })
    }
  ]
} satisfies Config


