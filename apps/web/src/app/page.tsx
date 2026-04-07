const HomePage = (): JSX.Element => {
  return (
    <main>
      <h1>Vada Prototype</h1>
      <p className="small">
        Monorepo SaaS for selling curated n8n workflows with organization-scoped
        RBAC, Stripe billing, token-based execution, and support ticketing.
      </p>

      <div className="grid" style={{ marginTop: "1.25rem" }}>
        <a className="card" href="/dashboard/admin?role=admin">
          <h3>Admin Dashboard</h3>
          <p className="small">
            Configure workflow pricing, roles, and org settings.
          </p>
        </a>
        <a className="card" href="/dashboard/billing?role=billing">
          <h3>Billing Dashboard</h3>
          <p className="small">
            Plans, subscriptions, invoices, and token top-ups.
          </p>
        </a>
        <a className="card" href="/dashboard/sales?role=sales">
          <h3>Sales Dashboard</h3>
          <p className="small">Usage insights and customer lifecycle view.</p>
        </a>
        <a className="card" href="/dashboard/client?role=client">
          <h3>Client Dashboard</h3>
          <p className="small">
            Run workflows, track execution history, open tickets.
          </p>
        </a>
      </div>

      <p className="small" style={{ marginTop: "1rem" }}>
        API preview:{" "}
        <a href="/api/dashboard/overview?role=admin">/api/dashboard/overview</a>
      </p>
    </main>
  );
};

export default HomePage;
