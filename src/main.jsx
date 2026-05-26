// main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";
import { LogoProvider } from "./context/LogoContext";
import QueryProvider from "./reactQueryConfig/QueryProvider";
import { NotificationProvider } from "./context/NotificationContext";
import { AuthProvider } from "./context/AuthProvider";
import { KeyPairSelectorProvider } from "./context/KeyPairSelectorContext";
import { StudentProvider } from "./context/StudentProvider";
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {/* <LogoProvider>   */}
    <QueryProvider>
      <NotificationProvider>
        <LogoProvider>
          <AuthProvider>
            <KeyPairSelectorProvider>
              <StudentProvider>
                <App />
              </StudentProvider>
            </KeyPairSelectorProvider>
          </AuthProvider>
        </LogoProvider>
      </NotificationProvider>
    </QueryProvider>
  </React.StrictMode>
);
