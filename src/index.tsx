import "./index.css";
import { render } from "react-dom";
import { AppRouter } from "./AppRouter";
import { SettingsProvider } from "./context/SettingsContext";
import "./lib/i18n";

render(
  <SettingsProvider>
    <AppRouter />
  </SettingsProvider>,
  document.getElementById("root")
);
