import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export function BodyClassHandler() {
  const { pathname } = useLocation();
  useEffect(() => {
    let cls = pathname.replace(/\//g, "-").replace(/^-+/, "").trim();
    if (!cls) cls = "home";
    document.body.className = "";
    document.body.classList.add(cls + "-page");
  }, [pathname]);

  return null;
}

