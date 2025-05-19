
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Force cache invalidation by adding a timestamp to CSS
const link = document.createElement('link');
link.rel = 'stylesheet';
link.href = `./index.css?v=${new Date().getTime()}`;
document.head.appendChild(link);

// Create a meta tag for viewport if it doesn't exist
const viewportMeta = document.querySelector('meta[name="viewport"]');
if (!viewportMeta) {
  const meta = document.createElement('meta');
  meta.name = 'viewport';
  meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
  document.getElementsByTagName('head')[0].appendChild(meta);
}

// Force a complete page refresh on load to clear any cached styles
if (window.performance && 
    window.performance.navigation && 
    window.performance.navigation.type === 1) {
  window.location.reload(true);
}

createRoot(document.getElementById("root")!).render(<App />);
