import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          const normalizedId = id.replace(/\\/g, '/');
          if (normalizedId.includes('/src/data/fonts')) return 'font-engine';
          if (normalizedId.includes('/src/components/OnboardingShowroom')) return 'onboarding-tour';
          if (normalizedId.includes('/src/components/BusinessCalendar')) return 'schedule-workspace';
          if (normalizedId.includes('/src/components/BookingFlow')) return 'booking-page';
          if (normalizedId.includes('node_modules/firebase')) return 'firebase';
          if (normalizedId.includes('node_modules/lucide-react')) return 'icons';
          if (normalizedId.includes('node_modules/react') || normalizedId.includes('node_modules/react-dom')) return 'react';
          if (normalizedId.includes('node_modules')) return 'vendor';
        }
      }
    }
  },
  server: {
    host: '127.0.0.1',
    port: 4173
  }
});
