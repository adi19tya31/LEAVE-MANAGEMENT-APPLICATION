import Keycloak from "keycloak-js";

const keycloak = new Keycloak({
  url: "https://bookstack.insightirs.com/keycloak",
  realm: "LeaveApplicationTest",
  clientId: "leave-management-frontend",
});

export default keycloak;