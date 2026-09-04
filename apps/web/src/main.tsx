import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { reportWebVitals } from "./lib/reportWebVitals";
import { injectJsonLd } from "./lib/jsonld";

injectJsonLd();

// Load fonts non-blocking (CSP-safe: no inline handlers). If the request fails
// (e.g. blocked, offline), the app still loads with fallback fonts; avoid unhandled errors.
const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href = "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&family=Amiri:wght@400;700&display=swap";
fontLink.onerror = () => {}; // no-op so failed load doesn't throw
document.head.appendChild(fontLink);

const root = createRoot(document.getElementById("root")!);
root.render(<App />);
reportWebVitals();
