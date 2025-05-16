
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Create a meta tag for viewport if it doesn't exist
const viewportMeta = document.querySelector('meta[name="viewport"]');
if (!viewportMeta) {
  const meta = document.createElement('meta');
  meta.name = 'viewport';
  meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
  document.getElementsByTagName('head')[0].appendChild(meta);
}

// Global error handler
window.addEventListener('error', (event) => {
  console.error('Global error caught:', event.error);
  // You could send these errors to a logging service
});

// Network resilience
window.addEventListener('online', () => {
  console.log('Connection restored. Reloading content...');
  // Reload content or notify the user
});

window.addEventListener('offline', () => {
  console.warn('Connection lost. Switching to offline mode...');
  // Could show an offline banner or switch to cached content
});

// Enhanced Netlify configuration
const netlifyConfigScript = document.createElement('script');
netlifyConfigScript.innerHTML = `
  // Help Netlify handle routes correctly
  if (window.netlifyIdentity) {
    window.netlifyIdentity.on("init", user => {
      if (!user) {
        window.netlifyIdentity.on("login", () => {
          document.location.href = "/admin/";
        });
      }
    });
  }
`;
document.head.appendChild(netlifyConfigScript);

// Initialize the app
createRoot(document.getElementById("root")!).render(<App />);
