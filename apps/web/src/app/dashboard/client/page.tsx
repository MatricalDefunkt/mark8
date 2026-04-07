import {
  getRoleFromSearchParams,
  ensurePermission,
} from "../../../server/rbac";
import { getDashboardSnapshot } from "../../../server/dashboard-metrics";

type PageProps = {
  searchParams: Record<string, string | string[] | undefined>;
};

const ClientDashboardPage = async ({
  searchParams,
}: PageProps): Promise<JSX.Element> => {
  const roleInput = searchParams.role;
  const role = Array.isArray(roleInput)
    ? getRoleFromSearchParams(roleInput[0] ?? null)
    : getRoleFromSearchParams(roleInput ?? null);

  ensurePermission(role, "dashboard:client");
  const snapshot = await getDashboardSnapshot(role);

  return (
    <main>
      <h1>Client Dashboard</h1>
      <p className="small">
        Execute approved workflows with validated parameters only.
      </p>

      {snapshot.usingFallbackData ? (
        <p className="small warning" style={{ marginTop: "0.75rem" }}>
          Connected to fallback data. Great for demos, swap to DB for live ops.
        </p>
      ) : null}

      <div className="stat-grid" style={{ marginTop: "1rem" }}>
        <section className="card stat-card">
          <p className="small">Token balance</p>
          <h2>{snapshot.summary.tokenBalance}</h2>
        </section>
        <section className="card stat-card">
          <p className="small">Queued + running</p>
          <h2>
            {snapshot.workflows.statusCounts.queued +
              snapshot.workflows.statusCounts.running}
          </h2>
        </section>
        <section className="card stat-card">
          <p className="small">Successful runs</p>
          <h2>{snapshot.workflows.statusCounts.succeeded}</h2>
        </section>
      </div>

      <div className="grid" style={{ marginTop: "1rem" }}>
        <section className="card">
          <h3>Execution History</h3>
          <ul className="list compact">
            {snapshot.workflows.recentRuns.map((run) => (
              <li key={run.id}>
                <span>{run.workflowName}</span>
                <span className="pill">{run.status}</span>
              </li>
            ))}
          </ul>
        </section>
        <section className="card">
          <h3>Support Tickets</h3>
          <ul className="list compact">
            {snapshot.support.recentTickets.map((ticket) => (
              <li key={ticket.id}>
                <span>{ticket.title}</span>
                <span className="pill">{ticket.status}</span>
              </li>
            ))}
          </ul>
        </section>
        <section className="card">
          <h3>Workflow Outcomes</h3>
          <ul className="list compact">
            <li>
              <span>Succeeded</span>
              <span>{snapshot.workflows.statusCounts.succeeded}</span>
            </li>
            <li>
              <span>Failed</span>
              <span>{snapshot.workflows.statusCounts.failed}</span>
            </li>
            <li>
              <span>Canceled</span>
              <span>{snapshot.workflows.statusCounts.canceled}</span>
            </li>
          </ul>
        </section>
      </div>
    </main>
  );
};

export default ClientDashboardPage;
