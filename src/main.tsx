
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Force cache invalidation by adding a timestamp to CSS
const link = document.createElement('link');
link.rel = 'stylesheet';
link.href = `./index.css?v=${new Date().getTime()}`;
document.head.appendChild(link);

// Force reload of all resources
if (window.location.search !== '?fresh') {
  // Add a timestamp parameter to force a complete refresh
  window.location.href = window.location.pathname + '?fresh&t=' + new Date().getTime();
}

// Create a meta tag for viewport if it doesn't exist
const viewportMeta = document.querySelector('meta[name="viewport"]');
if (!viewportMeta) {
  const meta = document.createElement('meta');
  meta.name = 'viewport';
  meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
  document.getElementsByTagName('head')[0].appendChild(meta);
}

createRoot(document.getElementById("root")!).render(<App />);
