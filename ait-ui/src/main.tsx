import React from "react";
import ReactDOM from "react-dom/client";
import { ThemeProvider } from "@emotion/react";
import { CssBaseline } from "@mui/material";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import { App } from "./App";
import { theme } from "./theme";
import * as Ait from "ait-lib";

const history = Ait.History.load();

addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") {
    (async () => {
      history.store();
    })().catch((x) => console.error(x));
  }
});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App history={history} />
    </ThemeProvider>
  </React.StrictMode>
);
