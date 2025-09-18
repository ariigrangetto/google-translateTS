/* eslint-disable react/react-in-jsx-scope */
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import UpdateStateProvider from "./context/updateStateContext.tsx";

createRoot(document.getElementById("root")!).render(
  <UpdateStateProvider>
    <App />
  </UpdateStateProvider>
);
