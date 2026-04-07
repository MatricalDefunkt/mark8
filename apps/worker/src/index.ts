import { Queue, Worker, type JobsOptions } from "bullmq";
import { Redis } from "ioredis";
import {
  executeWorkflowRequestSchema,
  type ExecuteWorkflowRequest,
} from "@vada/contracts";
import { getServerEnv } from "@vada/config";

type WorkflowExecutionJobData = {
  workflowKey: string;
  request: ExecuteWorkflowRequest;
};

const env = getServerEnv();
const connection = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

const queueName = "workflow-execution";

export const workflowExecutionQueue = new Queue<WorkflowExecutionJobData>(
  queueName,
  {
    connection,
  },
);

const jobDefaults: JobsOptions = {
  attempts: 3,
  removeOnComplete: 200,
  removeOnFail: 500,
  backoff: {
    type: "exponential",
    delay: 2_000,
  },
};

export const enqueueWorkflowExecution = async (
  data: WorkflowExecutionJobData,
): Promise<void> => {
  executeWorkflowRequestSchema.parse(data.request);
  await workflowExecutionQueue.add("execute-workflow", data, jobDefaults);
};

const worker = new Worker<WorkflowExecutionJobData>(
  queueName,
  async (job) => {
    executeWorkflowRequestSchema.parse(job.data.request);

    // Placeholder pipeline:
    // 1) Validate org role + quotas/token holds
    // 2) Trigger n8n workflow with validated parameters
    // 3) Process callback, then commit/refund token ledger entries
    // 4) Persist run events for dashboards + support context

    // eslint-disable-next-line no-console
    console.info("[worker] processing workflow execution", {
      id: job.id,
      workflowKey: job.data.workflowKey,
      organizationId: job.data.request.organizationId,
    });

    // TODO: call n8n API using env.N8N_BASE_URL and env.N8N_API_KEY
  },
  {
    connection,
    concurrency: 6,
  },
);

worker.on("completed", (job) => {
  // eslint-disable-next-line no-console
  console.info("[worker] completed", { jobId: job.id });
});

worker.on("failed", (job, error) => {
  // eslint-disable-next-line no-console
  console.error("[worker] failed", { jobId: job?.id, error });
});

// eslint-disable-next-line no-console
console.info("[worker] started", {
  queueName,
  n8nBaseUrl: env.N8N_BASE_URL,
});
