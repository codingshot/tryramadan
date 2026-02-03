import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { reportWebVitals } from "./lib/reportWebVitals";

const root = createRoot(document.getElementById("root")!);
root.render(<App />);
reportWebVitals();
