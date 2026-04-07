// @ts-nocheck
import type { RoleKey } from "@vada/contracts";

const getPrismaClient = async () => {
  try {
    const db = await import("@vada/db");
    return db.prisma;
  } catch {
    return null;
  }
};

type WorkflowStatusCounts = {
  queued: number;
  running: number;
  succeeded: number;
  failed: number;
  canceled: number;
};

type TicketStatusCounts = {
  open: number;
  in_progress: number;
  resolved: number;
  closed: number;
};

export type DashboardSnapshot = {
  organization: {
    id: string;
    name: string;
    slug: string;
  };
  generatedAt: string;
  role: RoleKey;
  usingFallbackData: boolean;
  summary: {
    publishedWorkflows: number;
    totalRuns: number;
    runsThisMonth: number;
    successRate: number;
    openTickets: number;
    tokenBalance: number;
    monthlyRunQuota: number | null;
  };
  billing: {
    planName: string | null;
    subscriptionStatus: string | null;
    includedTokens: number | null;
    walletBalance: number;
    walletReserved: number;
    lifetimeSpent: number;
    recentPurchases: Array<{
      id: string;
      tokens: number;
      priceCents: number;
      createdAt: string;
    }>;
  };
  workflows: {
    statusCounts: WorkflowStatusCounts;
    topWorkflows: Array<{
      workflowKey: string;
      workflowName: string;
      runs: number;
    }>;
    recentRuns: Array<{
      id: string;
      workflowName: string;
      status: keyof WorkflowStatusCounts;
      tokenCost: number;
      createdAt: string;
      finishedAt: string | null;
    }>;
  };
  support: {
    statusCounts: TicketStatusCounts;
    recentTickets: Array<{
      id: string;
      title: string;
      status: keyof TicketStatusCounts;
      priority: "low" | "medium" | "high" | "urgent";
      updatedAt: string;
    }>;
  };
  audit: Array<{
    id: string;
    action: string;
    resourceType: string;
    actorEmail: string | null;
    createdAt: string;
  }>;
};

const defaultWorkflowStatusCounts = (): WorkflowStatusCounts => ({
  queued: 0,
  running: 0,
  succeeded: 0,
  failed: 0,
  canceled: 0,
});

const defaultTicketStatusCounts = (): TicketStatusCounts => ({
  open: 0,
  in_progress: 0,
  resolved: 0,
  closed: 0,
});

const toIso = (value: Date | null): string | null => {
  return value ? value.toISOString() : null;
};

const startOfCurrentMonth = (): Date => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
};

const buildFallbackSnapshot = (role: RoleKey): DashboardSnapshot => {
  return {
    organization: {
      id: "fallback-org",
      name: "Demo FinOps",
      slug: "demo-finops",
    },
    generatedAt: new Date().toISOString(),
    role,
    usingFallbackData: true,
    summary: {
      publishedWorkflows: 4,
      totalRuns: 184,
      runsThisMonth: 39,
      successRate: 94,
      openTickets: 3,
      tokenBalance: 362,
      monthlyRunQuota: 200,
    },
    billing: {
      planName: "Starter",
      subscriptionStatus: "active",
      includedTokens: 500,
      walletBalance: 362,
      walletReserved: 24,
      lifetimeSpent: 138,
      recentPurchases: [
        {
          id: "fallback-purchase-1",
          tokens: 250,
          priceCents: 1900,
          createdAt: new Date(Date.now() - 86_400_000).toISOString(),
        },
      ],
    },
    workflows: {
      statusCounts: {
        queued: 2,
        running: 1,
        succeeded: 172,
        failed: 8,
        canceled: 1,
      },
      topWorkflows: [
        {
          workflowKey: "invoice-reminder",
          workflowName: "Invoice Reminder",
          runs: 61,
        },
        {
          workflowKey: "lead-enrichment",
          workflowName: "Lead Enrichment",
          runs: 54,
        },
        { workflowKey: "risk-alert", workflowName: "Risk Alert", runs: 43 },
      ],
      recentRuns: [
        {
          id: "fallback-run-1",
          workflowName: "Invoice Reminder",
          status: "succeeded",
          tokenCost: 3,
          createdAt: new Date(Date.now() - 21_000_000).toISOString(),
          finishedAt: new Date(Date.now() - 20_900_000).toISOString(),
        },
        {
          id: "fallback-run-2",
          workflowName: "Lead Enrichment",
          status: "failed",
          tokenCost: 5,
          createdAt: new Date(Date.now() - 14_000_000).toISOString(),
          finishedAt: new Date(Date.now() - 13_700_000).toISOString(),
        },
      ],
    },
    support: {
      statusCounts: {
        open: 2,
        in_progress: 1,
        resolved: 12,
        closed: 25,
      },
      recentTickets: [
        {
          id: "fallback-ticket-1",
          title: "Refund not reflected in wallet",
          status: "open",
          priority: "high",
          updatedAt: new Date(Date.now() - 7_200_000).toISOString(),
        },
      ],
    },
    audit: [
      {
        id: "fallback-audit-1",
        action: "workflow_run_requested",
        resourceType: "workflow_run",
        actorEmail: "client@demo.vada.local",
        createdAt: new Date(Date.now() - 9_100_000).toISOString(),
      },
    ],
  };
};

const getOrganizationSlug = (): string => {
  return process.env.VADA_DEMO_ORG_SLUG ?? "demo-finops";
};

export const getDashboardSnapshot = async (
  role: RoleKey,
): Promise<DashboardSnapshot> => {
  try {
    const prisma = await getPrismaClient();
    if (prisma === null) {
      return buildFallbackSnapshot(role);
    }

    const slug = getOrganizationSlug();
    const organization = await prisma.organization.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
      },
    });

    if (organization === null) {
      return buildFallbackSnapshot(role);
    }

    const monthStart = startOfCurrentMonth();

    const [
      publishedWorkflows,
      totalRuns,
      runsThisMonth,
      wallet,
      subscription,
      recentPurchases,
      recentRuns,
      recentTickets,
      recentAudit,
    ] = await Promise.all([
      prisma.workflow.count({
        where: {
          organizationId: organization.id,
          isPublished: true,
        },
      }),
      prisma.workflowRun.count({
        where: {
          organizationId: organization.id,
        },
      }),
      prisma.workflowRun.count({
        where: {
          organizationId: organization.id,
          createdAt: {
            gte: monthStart,
          },
        },
      }),
      prisma.tokenWallet.findUnique({
        where: {
          organizationId: organization.id,
        },
      }),
      prisma.subscription.findFirst({
        where: {
          organizationId: organization.id,
        },
        orderBy: {
          updatedAt: "desc",
        },
        select: {
          status: true,
          plan: {
            select: {
              name: true,
              includedTokens: true,
              monthlyRunQuota: true,
            },
          },
        },
      }),
      prisma.tokenPurchase.findMany({
        where: {
          organizationId: organization.id,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
        select: {
          id: true,
          tokens: true,
          priceCents: true,
          createdAt: true,
        },
      }),
      prisma.workflowRun.findMany({
        where: {
          organizationId: organization.id,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 50,
        select: {
          id: true,
          status: true,
          tokenCostSnapshot: true,
          createdAt: true,
          finishedAt: true,
          workflow: {
            select: {
              id: true,
              key: true,
              name: true,
            },
          },
        },
      }),
      prisma.supportTicket.findMany({
        where: {
          organizationId: organization.id,
        },
        orderBy: {
          updatedAt: "desc",
        },
        take: 12,
        select: {
          id: true,
          title: true,
          status: true,
          priority: true,
          updatedAt: true,
        },
      }),
      prisma.auditLog.findMany({
        where: {
          organizationId: organization.id,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 8,
        select: {
          id: true,
          action: true,
          resourceType: true,
          createdAt: true,
          actor: {
            select: {
              email: true,
            },
          },
        },
      }),
    ]);

    const workflowStatusCounts = defaultWorkflowStatusCounts();
    const workflowCounter = new Map<
      string,
      {
        workflowKey: string;
        workflowName: string;
        runs: number;
      }
    >();

    for (const run of recentRuns) {
      workflowStatusCounts[run.status] += 1;

      const existing = workflowCounter.get(run.workflow.id);

      if (existing) {
        existing.runs += 1;
        continue;
      }

      workflowCounter.set(run.workflow.id, {
        workflowKey: run.workflow.key,
        workflowName: run.workflow.name,
        runs: 1,
      });
    }

    const ticketStatusCounts = defaultTicketStatusCounts();
    for (const ticket of recentTickets) {
      ticketStatusCounts[ticket.status] += 1;
    }

    const succeeded = workflowStatusCounts.succeeded;
    const failed = workflowStatusCounts.failed;
    const denom = succeeded + failed;
    const successRate = denom > 0 ? Math.round((succeeded / denom) * 100) : 0;

    return {
      organization,
      generatedAt: new Date().toISOString(),
      role,
      usingFallbackData: false,
      summary: {
        publishedWorkflows,
        totalRuns,
        runsThisMonth,
        successRate,
        openTickets: ticketStatusCounts.open + ticketStatusCounts.in_progress,
        tokenBalance: wallet?.balance ?? 0,
        monthlyRunQuota: subscription?.plan.monthlyRunQuota ?? null,
      },
      billing: {
        planName: subscription?.plan.name ?? null,
        subscriptionStatus: subscription?.status ?? null,
        includedTokens: subscription?.plan.includedTokens ?? null,
        walletBalance: wallet?.balance ?? 0,
        walletReserved: wallet?.reserved ?? 0,
        lifetimeSpent: wallet?.lifetimeSpent ?? 0,
        recentPurchases: recentPurchases.map((purchase) => ({
          id: purchase.id,
          tokens: purchase.tokens,
          priceCents: purchase.priceCents,
          createdAt: purchase.createdAt.toISOString(),
        })),
      },
      workflows: {
        statusCounts: workflowStatusCounts,
        topWorkflows: Array.from(workflowCounter.values())
          .sort((a, b) => b.runs - a.runs)
          .slice(0, 5),
        recentRuns: recentRuns.slice(0, 8).map((run) => ({
          id: run.id,
          workflowName: run.workflow.name,
          status: run.status,
          tokenCost: run.tokenCostSnapshot,
          createdAt: run.createdAt.toISOString(),
          finishedAt: toIso(run.finishedAt),
        })),
      },
      support: {
        statusCounts: ticketStatusCounts,
        recentTickets: recentTickets.slice(0, 6).map((ticket) => ({
          id: ticket.id,
          title: ticket.title,
          status: ticket.status,
          priority: ticket.priority,
          updatedAt: ticket.updatedAt.toISOString(),
        })),
      },
      audit: recentAudit.map((entry) => ({
        id: entry.id,
        action: entry.action,
        resourceType: entry.resourceType,
        actorEmail: entry.actor?.email ?? null,
        createdAt: entry.createdAt.toISOString(),
      })),
    };
  } catch {
    return buildFallbackSnapshot(role);
  }
};
