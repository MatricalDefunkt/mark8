import {
  getRoleFromSearchParams,
  ensurePermission,
} from "../../../server/rbac";
import { getDashboardSnapshot } from "../../../server/dashboard-metrics";

type PageProps = {
  searchParams: Record<string, string | string[] | undefined>;
};

const SalesDashboardPage = async ({
  searchParams,
}: PageProps): Promise<JSX.Element> => {
  const roleInput = searchParams.role;
  const role = Array.isArray(roleInput)
    ? getRoleFromSearchParams(roleInput[0] ?? null)
    : getRoleFromSearchParams(roleInput ?? null);

  ensurePermission(role, "dashboard:sales");
  const snapshot = await getDashboardSnapshot(role);

  return (
    <main>
      <h1>Sales Dashboard</h1>
      <p className="small">
        Monitor account usage and identify upgrade opportunities.
      </p>

      {snapshot.usingFallbackData ? (
        <p className="small warning" style={{ marginTop: "0.75rem" }}>
          Running in demo mode while data services warm up.
        </p>
      ) : null}

      <div className="stat-grid" style={{ marginTop: "1rem" }}>
        <section className="card stat-card">
          <p className="small">Total runs</p>
          <h2>{snapshot.summary.totalRuns}</h2>
        </section>
        <section className="card stat-card">
          <p className="small">Success rate</p>
          <h2>{snapshot.summary.successRate}%</h2>
        </section>
        <section className="card stat-card">
          <p className="small">Open support load</p>
          <h2>{snapshot.summary.openTickets}</h2>
        </section>
      </div>

      <div className="grid" style={{ marginTop: "1rem" }}>
        <section className="card">
          <h3>Top Adopted Workflows</h3>
          <ul className="list compact">
            {snapshot.workflows.topWorkflows.map((workflow) => (
              <li key={workflow.workflowKey}>
                <span>{workflow.workflowName}</span>
                <span className="pill">{workflow.runs} runs</span>
              </li>
            ))}
          </ul>
        </section>
        <section className="card">
          <h3>Support Signals</h3>
          <ul className="list compact">
            <li>
              <span>Open</span>
              <span>{snapshot.support.statusCounts.open}</span>
            </li>
            <li>
              <span>In progress</span>
              <span>{snapshot.support.statusCounts.in_progress}</span>
            </li>
            <li>
              <span>Resolved</span>
              <span>{snapshot.support.statusCounts.resolved}</span>
            </li>
          </ul>
        </section>
      </div>
    </main>
  );
};

export default SalesDashboardPage;
