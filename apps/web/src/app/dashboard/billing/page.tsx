import {
  getRoleFromSearchParams,
  ensurePermission,
} from "../../../server/rbac";
import { getDashboardSnapshot } from "../../../server/dashboard-metrics";

type PageProps = {
  searchParams: Record<string, string | string[] | undefined>;
};

const BillingDashboardPage = async ({
  searchParams,
}: PageProps): Promise<JSX.Element> => {
  const roleInput = searchParams.role;
  const role = Array.isArray(roleInput)
    ? getRoleFromSearchParams(roleInput[0] ?? null)
    : getRoleFromSearchParams(roleInput ?? null);

  ensurePermission(role, "dashboard:billing");
  const snapshot = await getDashboardSnapshot(role);

  return (
    <main>
      <h1>Billing Dashboard</h1>
      <p className="small">
        Manage subscriptions, token purchases, and invoice history.
      </p>

      {snapshot.usingFallbackData ? (
        <p className="small warning" style={{ marginTop: "0.75rem" }}>
          Live billing data unavailable — presenting curated demo snapshot.
        </p>
      ) : null}

      <div className="stat-grid" style={{ marginTop: "1rem" }}>
        <section className="card stat-card">
          <p className="small">Current plan</p>
          <h2>{snapshot.billing.planName ?? "Unassigned"}</h2>
          <p className="small">
            Status: {snapshot.billing.subscriptionStatus ?? "n/a"}
          </p>
        </section>
        <section className="card stat-card">
          <p className="small">Token balance</p>
          <h2>{snapshot.billing.walletBalance}</h2>
          <p className="small">Reserved: {snapshot.billing.walletReserved}</p>
        </section>
        <section className="card stat-card">
          <p className="small">Lifetime tokens spent</p>
          <h2>{snapshot.billing.lifetimeSpent}</h2>
        </section>
      </div>

      <div className="grid" style={{ marginTop: "1rem" }}>
        <section className="card">
          <h3>Current Plan</h3>
          <ul className="list compact">
            <li>
              <span>Plan</span>
              <span>{snapshot.billing.planName ?? "Not set"}</span>
            </li>
            <li>
              <span>Included monthly tokens</span>
              <span>{snapshot.billing.includedTokens ?? 0}</span>
            </li>
            <li>
              <span>Subscription status</span>
              <span>{snapshot.billing.subscriptionStatus ?? "n/a"}</span>
            </li>
          </ul>
        </section>
        <section className="card">
          <h3>Recent Token Purchases</h3>
          <ul className="list compact">
            {snapshot.billing.recentPurchases.length > 0 ? (
              snapshot.billing.recentPurchases.map((purchase) => (
                <li key={purchase.id}>
                  <span>{purchase.tokens} tokens</span>
                  <span>${(purchase.priceCents / 100).toFixed(2)}</span>
                </li>
              ))
            ) : (
              <li>
                <span className="small">No purchases yet</span>
              </li>
            )}
          </ul>
        </section>
      </div>
    </main>
  );
};

export default BillingDashboardPage;
