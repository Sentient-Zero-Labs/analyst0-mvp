import type { Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";
import animate from "tailwindcss-animate";

const base = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
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
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
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
      borderColor: {
        DEFAULT: "hsl(var(--border))",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
} satisfies Config;

const config: Config = {
  presets: [base],
  content: base.content,
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)", ...fontFamily.sans],
        mono: ["var(--font-geist-mono)", ...fontFamily.mono],
      },
      fontSize: {
        "2base": ["0.93rem", "1.32rem"],
        "2sm": ["0.82rem", "1.15rem"],
        "2xs": ["0.7rem", "1rem"],
        "3xs": ["0.65rem", "1rem"],
      },
      boxShadow: {
        "m-xl": "0 0px 13px -1px rgba(0, 0, 0, 0.5)",
        "m-lg": "0 0px 10px -1px rgba(0, 0, 0, 0.5)",
        "m-md": "0 0px 7px -1px rgba(0, 0, 0, 0.5)",
        "m-sm": "0 0px 5px -1.5px rgba(0, 0, 0, 0.5)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },

      keyframes: {
        shimmer: {
          from: {
            "backgroundPosition": "0 0",
          },
          to: {
            "backgroundPosition": "-200% 0",
          },
        },
        meteor: {
          "0%": { transform: "rotate(215deg) translateX(0)", opacity: "1" },
          "70%": { opacity: "1" },
          "100%": {
            transform: "rotate(215deg) translateX(-500px)",
            opacity: "0",
          },
        },
        "text-color-gradient": {
          "0% 100%": {
            backgroundPosition: "0% 50%",
          },
          "50%": {
            backgroundPosition: "120% 50%",
          },
        },
        "fade-out": {
          "0%": { opacity: "1" },
          "100%": { opacity: "0", display: "none" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "wipe-left-right": {
          "0%": { width: "0", opacity: "100%" },
          "100%": { width: "100%", opacity: "100%" },
        },
        "wipe-bottom-up": {
          "0%": { transform: "translateY(100%)" },
          "25%": { transform: "translateY(0%)" },
          "50%": { transform: "translateY(0%)" },
          "75%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(-100%)" },
        },
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        border: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        "slide-up": {
          from: { transform: "translateY(100%)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
      },
      animation: {
        shimmer: "shimmer 2s linear infinite",
        "meteor-effect": "meteor 5s linear infinite",
        "wipe-bottom-up": "wipe-bottom-up 1s linear",
        "wipe-left-right": "wipe-left-right 1s linear",
        "wipe-show-down": "wipe-show-down 3s ease-out infinite",
        "fade-out": "fade-out 0.2s ease-out forwards",
        "fade-in": "fade-in 0.2s ease-out forwards",
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        border: "border 4s ease infinite",
        "slide-up": "slide-up 0.5s ease-out forwards",
        "text-color-gradient": "text-color-gradient 2s",
      },
      height: {
        header: "45px",
      },
    },
  },
  plugins: [
    animate,
    // @ts-expect-error - Tailwind types are not updated
    function ({ addUtilities }) {
      addUtilities({
        ".no-spinners": {
          "&::-webkit-inner-spin-button, &::-webkit-outer-spin-button": {
            "-webkit-appearance": "none",
            "margin": "0",
          },
          "-moz-appearance": "textfield",
        },
      });
    },
  ],
  variants: {
    extend: {
      display: ["sidebar-expanded"],
    },
  },
};
export default config;
