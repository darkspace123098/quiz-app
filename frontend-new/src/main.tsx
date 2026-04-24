import { createRoot } from "react-dom/client"
import "./index.css"
import App from "./App.tsx"

createRoot(document.getElementById("root")!).render(
  // Removing StrictMode to prevent double-logging in development, particularly for proctoring logic initialization which relies on hardware.
  <App />
)
