import BatchLiveSessions from "../../components/monitoring/BatchLiveSessions";
import { getClientProjects, getStoredClient } from "./clientPortalData";

export default function ClientLiveFeed() {
  const client = getStoredClient();
  const ids = getClientProjects(client.name).map((project) => project.id);
  return <BatchLiveSessions title="Live Feed" clientProjectIds={ids} />;
}
