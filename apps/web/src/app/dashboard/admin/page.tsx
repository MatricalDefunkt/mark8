import {
  getRoleFromSearchParams,
  ensurePermission,
} from "../../../server/rbac";
import { getDashboardSnapshot } from "../../../server/dashboard-metrics";

type PageProps = {
  searchParams: Record<string, string | string[] | undefined>;
};

const AdminDashboardPage = async ({
  searchParams,
}: PageProps): Promise<JSX.Element> => {
  const roleInput = searchParams.role;
  const role = Array.isArray(roleInput)
    ? getRoleFromSearchParams(roleInput[0] ?? null)
    : getRoleFromSearchParams(roleInput ?? null);

  ensurePermission(role, "dashboard:admin");
  const snapshot = await getDashboardSnapshot(role);

  return (
    <main>
      <h1>Admin Dashboard</h1>
      <p className="small">
        Manage workflows, token pricing, and organization access for{" "}
        <strong>{snapshot.organization.name}</strong>.
      </p>

      {snapshot.usingFallbackData ? (
        <p className="small warning" style={{ marginTop: "0.75rem" }}>
          Database not connected — showing presentation-safe demo data.
        </p>
      ) : null}

      <div className="stat-grid" style={{ marginTop: "1rem" }}>
        <section className="card stat-card">
          <p className="small">Published workflows</p>
          <h2>{snapshot.summary.publishedWorkflows}</h2>
        </section>
        <section className="card stat-card">
          <p className="small">Runs this month</p>
          <h2>
            {snapshot.summary.runsThisMonth}
            {snapshot.summary.monthlyRunQuota !== null
              ? ` / ${snapshot.summary.monthlyRunQuota}`
              : ""}
          </h2>
        </section>
        <section className="card stat-card">
          <p className="small">Execution success rate</p>
          <h2>{snapshot.summary.successRate}%</h2>
        </section>
      </div>

      <div className="grid" style={{ marginTop: "1rem" }}>
        <section className="card">
          <h3>Top Workflows</h3>
          <ul className="list">
            {snapshot.workflows.topWorkflows.map((workflow) => (
              <li key={workflow.workflowKey}>
                <span>{workflow.workflowName}</span>
                <span className="pill">{workflow.runs} runs</span>
              </li>
            ))}
          </ul>
        </section>
        <section className="card">
          <h3>Workflow Status Mix</h3>
          <ul className="list compact">
            <li>
              <span>Queued</span>
              <span>{snapshot.workflows.statusCounts.queued}</span>
            </li>
            <li>
              <span>Running</span>
              <span>{snapshot.workflows.statusCounts.running}</span>
            </li>
            <li>
              <span>Succeeded</span>
              <span>{snapshot.workflows.statusCounts.succeeded}</span>
            </li>
            <li>
              <span>Failed</span>
              <span>{snapshot.workflows.statusCounts.failed}</span>
            </li>
          </ul>
        </section>
        <section className="card">
          <h3>Audit Feed</h3>
          <ul className="list compact">
            {snapshot.audit.map((entry) => (
              <li key={entry.id}>
                <span>
                  {entry.action.replaceAll("_", " ")} · {entry.resourceType}
                </span>
                <span className="small">
                  {new Date(entry.createdAt).toLocaleTimeString()}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
};

export default AdminDashboardPage;
