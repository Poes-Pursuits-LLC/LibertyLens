// Design tokens for Liberty Lens unified design system
export const designTokens = {
  colors: {
    // Brand colors
    primary: {
      50: "#eff6ff",
      100: "#dbeafe",
      200: "#bfdbfe",
      300: "#93c5fd",
      400: "#60a5fa",
      500: "#3b82f6", // Primary blue
      600: "#2563eb",
      700: "#1d4ed8",
      800: "#1e40af",
      900: "#1e3a8a",
    },
    cyan: {
      50: "#ecfeff",
      100: "#cffafe",
      200: "#a5f3fc",
      300: "#67e8f9",
      400: "#22d3ee",
      500: "#06b6d4", // Secondary cyan
      600: "#0891b2",
      700: "#0e7490",
      800: "#155e75",
      900: "#164e63",
    },
    // Surface colors (for dark mode)
    surface: {
      50: "#f8fafc",
      100: "#f1f5f9",
      200: "#e2e8f0",
      300: "#cbd5e1",
      400: "#94a3b8",
      500: "#64748b",
      600: "#475569",
      700: "#334155",
      800: "#1e293b",
      900: "#0f172a",
      950: "#020617",
    },
    // Semantic colors
    success: {
      light: "#10b981",
      DEFAULT: "#059669",
      dark: "#047857",
    },
    warning: {
      light: "#f59e0b",
      DEFAULT: "#d97706",
      dark: "#b45309",
    },
    danger: {
      light: "#ef4444",
      DEFAULT: "#dc2626",
      dark: "#b91c1c",
    },
  },
  gradients: {
    brand: "linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)",
    brandHover: "linear-gradient(135deg, #2563eb 0%, #0891b2 100%)",
    surface: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
    glow: "linear-gradient(135deg, #3b82f6 0%, #06b6d4 50%, #3b82f6 100%)",
  },
  shadows: {
    glow: "0 0 20px rgba(59, 130, 246, 0.5), 0 0 40px rgba(6, 182, 212, 0.3)",
    card: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    cardHover:
      "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
    input:
      "0px 2px 3px -1px rgba(0, 0, 0, 0.1), 0px 1px 0px 0px rgba(25, 28, 33, 0.02), 0px 0px 0px 1px rgba(25, 28, 33, 0.08)",
  },
  animation: {
    duration: {
      fast: "150ms",
      normal: "250ms",
      slow: "500ms",
    },
    easing: {
      default: "cubic-bezier(0.4, 0, 0.2, 1)",
      smooth: "cubic-bezier(0.25, 0.1, 0.25, 1)",
      spring: "cubic-bezier(0.175, 0.885, 0.32, 1.275)",
    },
  },
  spacing: {
    section: "5rem", // 80px
    container: "1280px",
  },
};

// CSS variables for runtime theming
export const cssVariables = `
  :root {
    /* Brand colors */
    --color-primary: ${designTokens.colors.primary[500]};
    --color-primary-hover: ${designTokens.colors.primary[600]};
    --color-secondary: ${designTokens.colors.cyan[500]};
    --color-secondary-hover: ${designTokens.colors.cyan[600]};
    
    /* Surface colors */
    --color-background: #ffffff;
    --color-surface: #f8fafc;
    --color-surface-hover: #f1f5f9;
    --color-border: #e2e8f0;
    
    /* Text colors */
    --color-text-primary: #0f172a;
    --color-text-secondary: #64748b;
    --color-text-muted: #94a3b8;
    
    /* Gradients */
    --gradient-brand: ${designTokens.gradients.brand};
    --gradient-brand-hover: ${designTokens.gradients.brandHover};
    
    /* Shadows */
    --shadow-glow: ${designTokens.shadows.glow};
    --shadow-card: ${designTokens.shadows.card};
    --shadow-card-hover: ${designTokens.shadows.cardHover};
    
    /* Animation */
    --duration-fast: ${designTokens.animation.duration.fast};
    --duration-normal: ${designTokens.animation.duration.normal};
    --duration-slow: ${designTokens.animation.duration.slow};
    --easing-default: ${designTokens.animation.easing.default};
    --easing-smooth: ${designTokens.animation.easing.smooth};
    --easing-spring: ${designTokens.animation.easing.spring};
  }
  
  .dark {
    /* Surface colors for dark mode */
    --color-background: #020617;
    --color-surface: #0f172a;
    --color-surface-hover: #1e293b;
    --color-border: #334155;
    
    /* Text colors for dark mode */
    --color-text-primary: #f8fafc;
    --color-text-secondary: #cbd5e1;
    --color-text-muted: #64748b;
    
    /* Adjust shadows for dark mode */
    --shadow-card: 0 4px 6px -1px rgb(0 0 0 / 0.3), 0 2px 4px -2px rgb(0 0 0 / 0.3);
    --shadow-card-hover: 0 10px 15px -3px rgb(0 0 0 / 0.3), 0 4px 6px -4px rgb(0 0 0 / 0.3);
  }
`;

// Tailwind config extension
export const tailwindExtension = {
  colors: {
    brand: {
      primary: "var(--color-primary)",
      "primary-hover": "var(--color-primary-hover)",
      secondary: "var(--color-secondary)",
      "secondary-hover": "var(--color-secondary-hover)",
    },
    surface: {
      DEFAULT: "var(--color-surface)",
      hover: "var(--color-surface-hover)",
      background: "var(--color-background)",
      border: "var(--color-border)",
    },
    content: {
      primary: "var(--color-text-primary)",
      secondary: "var(--color-text-secondary)",
      muted: "var(--color-text-muted)",
    },
  },
  backgroundImage: {
    "gradient-brand": "var(--gradient-brand)",
    "gradient-brand-hover": "var(--gradient-brand-hover)",
  },
  boxShadow: {
    glow: "var(--shadow-glow)",
    card: "var(--shadow-card)",
    "card-hover": "var(--shadow-card-hover)",
  },
  transitionDuration: {
    fast: "var(--duration-fast)",
    normal: "var(--duration-normal)",
    slow: "var(--duration-slow)",
  },
  transitionTimingFunction: {
    default: "var(--easing-default)",
    smooth: "var(--easing-smooth)",
    spring: "var(--easing-spring)",
  },
};
