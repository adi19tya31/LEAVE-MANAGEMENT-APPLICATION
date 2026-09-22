import Keycloak from "keycloak-js";

const keycloak = new Keycloak({
  url: "http://192.168.1.39:8080",
  realm: "LeaveApplication",
  clientId: "leave-management-frontend",
});

export default keycloak;