import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    headers: {
      // Content Security Policy
      "Content-Security-Policy": [
        "default-src 'self'",
        "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.resend.com",
        "img-src 'self' data: blob: https://*.supabase.co",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
        "style-src 'self' 'unsafe-inline'",
        "frame-ancestors 'none'",
        "form-action 'self'",
      ].join("; "),
      // Additional Security Headers
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "X-XSS-Protection": "1; mode=block",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
      "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
    },
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
