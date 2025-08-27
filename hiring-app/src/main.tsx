import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.scss";

import { updateConfig } from "./utils/helpers.ts";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes/routes.tsx";
import App from "./App.tsx";

// Writing for future needs if we need to fetch environment variables
// and update config before rendering the app
const getEnvironmentConfig = async () => {
  const response = await fetch(`/config/environment.json`);
  if (!response.ok) {
    throw new Error("Failed to load app enviroment");
  }
  const envData = await response.json();
  updateConfig(envData);
};

await getEnvironmentConfig();
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
    <App />
  </StrictMode>
);
