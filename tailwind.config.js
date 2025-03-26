/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'notice-bg': '#fdf6f3',
        'notice-text': '#8b6f67',
        'notice-hint': '#a18d87',
        'footer-bg': '#f8f9fa',
        'footer-border': '#eee',
        'footer-text': '#666',
        'editor-toolbar': '#f3f4f6',
        'editor-border': '#e5e7eb',
        'editor-button': '#10b981',
        'editor-button-hover': '#059669',
        'status-success-bg': '#d1fae5',
        'status-success-text': '#065f46',
        'status-error-bg': '#fee2e2',
        'status-error-text': '#b91c1c',
        'header-bg': '#ffffff',
        'header-text': '#111827',
        'header-description': '#6b7280',
        'split-bg': '#ffffff',
        'split-border': '#ddd',
        'split-toolbar-bg': '#f8f9fa',
        'split-toolbar-border': '#e5e5e5',
        'split-status': '#6b7280',
        'split-status-saved': '#10b981',
        'split-status-saving': '#3b82f6',
        'split-status-changed': '#f59e0b',
        'split-save-button': '#3b82f6',
        'split-save-button-hover': '#2563eb',
        'split-save-button-disabled': '#93c5fd',
        'split-save-needed': '#f97316',
        'split-save-needed-hover': '#ea580c',
        'split-editor-bg': '#f9fafb',
        'split-editor-text': '#374151',
        'split-divider': '#e5e5e5',
        'split-preview-bg': '#ffffff',
        'dark-split-bg': '#1e293b',
        'dark-split-border': '#334155',
        'dark-split-toolbar': '#1f2937',
        'dark-split-toolbar-border': '#374151',
        'dark-split-status': '#94a3b8',
        'dark-split-editor-bg': '#1f2937',
        'dark-split-editor-text': '#e5e7eb',
        'dark-split-divider': '#334155',
        'dark-split-preview-bg': '#1e293b',
      },
      height: {
        'editor': 'calc(100vh - 280px)',
        'editor-mobile': 'calc(100vh - 230px)',
      },
      minHeight: {
        'editor': '500px',
        'split': '400px',
        'split-content': '300px',
      },
      keyframes: {
        fadeIn: {
          'from': { opacity: '0' },
          'to': { opacity: '1' },
        },
        spin: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        pulse: {
          '0%': { boxShadow: '0 0 0 0 rgba(249, 115, 22, 0.4)' },
          '70%': { boxShadow: '0 0 0 5px rgba(249, 115, 22, 0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(249, 115, 22, 0)' },
        },
        pulseSave: {
          '0%': { 
            backgroundColor: '#1d4ed8',
            color: '#ffffff'
          },
          '50%': { 
            backgroundColor: '#60a5fa',
            color: '#ffffff'
          },
          '100%': { 
            backgroundColor: '#1d4ed8',
            color: '#ffffff'
          }
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease',
        'spin': 'spin 1s linear infinite',
        'pulse': 'pulse 1.5s infinite',
        'pulse-save': 'pulseSave 1.2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
} 