import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import keycloak from "./keycloak";

import "./index.css";

keycloak
  .init({
    onLoad: "login-required",
    checkLoginIframe: false,
    pkceMethod: "S256",
  })
  .then((authenticated) => {
    console.log("KEYCLOAK AUTHENTICATED:", authenticated);
    console.log("KEYCLOAK TOKEN:", keycloak.token);

    if (!authenticated) {
      console.error("User is not authenticated");
      return;
    }

    ReactDOM.createRoot(document.getElementById("root")).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  })
  .catch((error) => {
    console.error("KEYCLOAK INITIALIZATION FAILED:", error);
  });