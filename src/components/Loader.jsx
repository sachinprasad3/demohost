import React from "react";
const Loader = ({
  text = "Loading...",
  type = "inline",
}) => {
  return (
    <div className={type === "full" ? "full-page-loader" : "inline-loader"}>
      <div className="loaderimg">
        <div>
          <img src="/images/logo-icon.png" alt="Loading..." />
          <div className="spinner"></div>
        </div>
      </div>
        <p className="loader-text">{text}</p>
    </div>
  );
};

export default Loader;
