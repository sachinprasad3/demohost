import { createContext, useContext, useState } from "react";
import Loader from "../components/Loader";

const LoaderContext = createContext();

export const LoaderProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState("Loading...");

  const showLoader = (message = "Loading...") => {
    setText(message);
    setLoading(true);
  };

  const hideLoader = () => {
    setLoading(false);
  };

  return (
    <LoaderContext.Provider value={{ showLoader, hideLoader }}>
      {children}
      {loading && <Loader text={text} type="full" />}
    </LoaderContext.Provider>
  );
};

export const useLoader = () => useContext(LoaderContext);