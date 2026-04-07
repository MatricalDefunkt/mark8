import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const plans = [
  {
    code: "starter",
    name: "Starter",
    description: "For small teams getting started with workflow automation.",
    monthlyPriceCents: 2900,
    includedTokens: 500,
    monthlyRunQuota: 200,
  },
  {
    code: "growth",
    name: "Growth",
    description: "For teams scaling automation with moderate run volume.",
    monthlyPriceCents: 9900,
    includedTokens: 2500,
    monthlyRunQuota: 1500,
  },
  {
    code: "scale",
    name: "Scale",
    description: "For high-volume usage and advanced support needs.",
    monthlyPriceCents: 24900,
    includedTokens: 10000,
    monthlyRunQuota: 10000,
  },
] as const;

const ensureDefaultPlans = async (): Promise<void> => {
  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { code: plan.code },
      create: {
        ...plan,
        isActive: true,
      },
      update: {
        ...plan,
        isActive: true,
      },
    });
  }
};

const ensureDemoOrganization = async (): Promise<void> => {
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@demo.mark8.local" },
    create: {
      email: "admin@demo.mark8.local",
      name: "Demo Admin",
      passwordHash: "replace-with-authjs-hash",
    },
    update: {
      name: "Demo Admin",
    },
  });

  const billingUser = await prisma.user.upsert({
    where: { email: "billing@demo.mark8.local" },
    create: {
      email: "billing@demo.mark8.local",
      name: "Demo Billing",
      passwordHash: "replace-with-authjs-hash",
    },
    update: {
      name: "Demo Billing",
    },
  });

  const salesUser = await prisma.user.upsert({
    where: { email: "sales@demo.mark8.local" },
    create: {
      email: "sales@demo.mark8.local",
      name: "Demo Sales",
      passwordHash: "replace-with-authjs-hash",
    },
    update: {
      name: "Demo Sales",
    },
  });

  const clientUser = await prisma.user.upsert({
    where: { email: "client@demo.mark8.local" },
    create: {
      email: "client@demo.mark8.local",
      name: "Demo Client",
      passwordHash: "replace-with-authjs-hash",
    },
    update: {
      name: "Demo Client",
    },
  });

  const org = await prisma.organization.upsert({
    where: { slug: "demo-finops" },
    create: {
      name: "Demo FinOps",
      slug: "demo-finops",
    },
    update: {
      name: "Demo FinOps",
    },
  });

  const memberships: Array<{
    userId: string;
    role: "admin" | "billing" | "sales" | "client";
  }> = [
    { userId: adminUser.id, role: "admin" },
    { userId: billingUser.id, role: "billing" },
    { userId: salesUser.id, role: "sales" },
    { userId: clientUser.id, role: "client" },
  ];

  for (const membership of memberships) {
    await prisma.membership.upsert({
      where: {
        userId_organizationId: {
          userId: membership.userId,
          organizationId: org.id,
        },
      },
      create: {
        userId: membership.userId,
        organizationId: org.id,
        role: membership.role,
      },
      update: {
        role: membership.role,
      },
    });
  }

  const starterPlan = await prisma.plan.findUnique({
    where: { code: "starter" },
  });

  if (starterPlan !== null) {
    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    await prisma.subscription.upsert({
      where: {
        id: `${org.id}-starter-subscription`,
      },
      create: {
        id: `${org.id}-starter-subscription`,
        organizationId: org.id,
        planId: starterPlan.id,
        status: "active",
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
      },
      update: {
        planId: starterPlan.id,
        status: "active",
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
      },
    });

    const wallet = await prisma.tokenWallet.upsert({
      where: { organizationId: org.id },
      create: {
        organizationId: org.id,
        balance: starterPlan.includedTokens,
        reserved: 0,
        lifetimeSpent: 0,
      },
      update: {},
    });

    await prisma.tokenLedgerEntry.create({
      data: {
        walletId: wallet.id,
        type: "plan_grant",
        amount: starterPlan.includedTokens,
        reason: "Starter plan monthly token grant",
        referenceId: `seed-plan-grant-${starterPlan.code}`,
      },
    });
  }
};

const seed = async (): Promise<void> => {
  await ensureDefaultPlans();
  await ensureDemoOrganization();
};

seed()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    // eslint-disable-next-line no-console
    console.error("Seed failed", error);
    await prisma.$disconnect();
    process.exit(1);
  });
