import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { reportWebVitals } from "./lib/reportWebVitals";
import { injectJsonLd } from "./lib/jsonld";

injectJsonLd();

// Load fonts non-blocking (CSP-safe: no inline handlers)
const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href = "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&family=Amiri:wght@400;700&display=swap";
document.head.appendChild(fontLink);

const root = createRoot(document.getElementById("root")!);
root.render(<App />);
reportWebVitals();
