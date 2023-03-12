import * as React from "react";
import { createRoot } from "react-dom/client";
import App from "~App";
import "~index.css"
import "~Theme.css"
const rootElement = document.getElementById('root');
if (rootElement) {
    createRoot(rootElement).render(<App />)
}