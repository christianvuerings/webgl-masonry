import { createRoot } from "react-dom/client";
import * as React from "react";
import "./styles.css";
import App from "./App";

createRoot(document.getElementById("container") as HTMLDivElement).render(
  <App />,
);
