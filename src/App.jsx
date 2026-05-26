// App.jsx
import React, { useEffect } from "react";
import { BrowserRouter as Router, useLocation } from "react-router-dom";

import PullToRefresh from "./components/PullToRefresh";
import AppRoutes from "./Routes/AppRoutes.jsx";
// import { LogoProvider } from "./context/LogoContext";
// import { NotificationProvider } from "./context/NotificationContext.jsx";
// import { AuthProvider } from "./context/AuthProvider.jsx";
// import { StudentProvider } from "./context/StudentProvider.jsx";
// import QueryProvider from "./reactQueryConfig/QueryProvider.jsx";
// import { KeyPairSelectorProvider } from "./context/KeyPairSelectorContext.jsx";
import RouteThemeLoader from "./hooks/themeHooks/RouteThemeLoader.jsx";
import { useAuth } from "./context/AuthContext.jsx";
import Loader from "./components/Loader.jsx";

function BodyClassHandler() {
  const { pathname } = useLocation();
  useEffect(() => {
    let cls = pathname.replace(/\//g, "-").replace(/^-+/, "").trim();
    if (!cls) cls = "home";
    document.body.className = "";
    document.body.classList.add(cls + "-page");
  }, [pathname]);

  return null;
}

export default function App() {

  const { loading: authLoading } = useAuth();

  if (authLoading) {
    return <Loader text="Loading App" type="full" />;
  }

  return (

    <Router>
      <PullToRefresh>
        <BodyClassHandler />
      </PullToRefresh>
      <RouteThemeLoader />
      <AppRoutes />
    </Router>

  );
}
