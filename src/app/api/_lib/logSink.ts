type ClientErrorEvent = {
  kind: "client_error";
  level: "error";
  apiRequestId: string;
  requestId?: string;
  id?: string;
  type?: string;
  message?: string;
  stack?: string;
  digest?: string;
  path?: string;
  userAgent?: string;
  timestamp?: string;
  receivedAt: string;
  env: string;
  site?: string;
};

function isNonEmpty(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<T>((_, reject) => {
    timer = setTimeout(() => reject(new Error("timeout")), ms);
  });
  return Promise.race([promise, timeout]).finally(() => {
    if (timer) clearTimeout(timer);
  });
}

function getSiteUrl(): string | undefined {
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.SITE_URL;
  return isNonEmpty(site) ? site : undefined;
}

function getDesiredSinks(): Array<"betterstack" | "datadog"> {
  const configured = (process.env.CLIENT_ERROR_SINKS ?? process.env.LOG_SINKS ?? "").trim();
  if (configured) {
    return configured
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter((s): s is "betterstack" | "datadog" => s === "betterstack" || s === "datadog");
  }

  const sinks: Array<"betterstack" | "datadog"> = [];
  if (isNonEmpty(process.env.BETTERSTACK_SOURCE_TOKEN) || isNonEmpty(process.env.LOGTAIL_SOURCE_TOKEN)) sinks.push("betterstack");
  if (isNonEmpty(process.env.DATADOG_API_KEY)) sinks.push("datadog");
  return sinks;
}

async function sendToBetterStack(event: ClientErrorEvent): Promise<void> {
  const token = process.env.BETTERSTACK_SOURCE_TOKEN ?? process.env.LOGTAIL_SOURCE_TOKEN;
  if (!isNonEmpty(token)) return;

  await fetch("https://in.logs.betterstack.com", {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
    body: JSON.stringify([
      {
        message: event.message ?? "Client error",
        ...event,
      },
    ]),
  });
}

async function sendToDatadog(event: ClientErrorEvent): Promise<void> {
  const apiKey = process.env.DATADOG_API_KEY;
  if (!isNonEmpty(apiKey)) return;

  const site = (process.env.DATADOG_SITE ?? "datadoghq.com").trim();
  const intakeHost = site.includes(".") ? `http-intake.logs.${site}` : `http-intake.logs.datadoghq.com`;
  const url = `https://${intakeHost}/api/v2/logs`;

  const service = process.env.DATADOG_SERVICE ?? "alo-doktor-frontend";
  const source = process.env.DATADOG_SOURCE ?? "nextjs";
  const tags = (process.env.DATADOG_TAGS ?? `env:${event.env}`).trim();

  await fetch(url, {
    method: "POST",
    headers: {
      "dd-api-key": apiKey,
      "content-type": "application/json",
    },
    body: JSON.stringify([
      {
        message: `[client-error] ${event.message ?? "Client error"}`,
        service,
        ddsource: source,
        ddtags: tags,
        status: "error",
        ...event,
      },
    ]),
  });
}

export async function emitClientErrorEvent(input: Omit<ClientErrorEvent, "receivedAt" | "env" | "site">): Promise<void> {
  const env = process.env.NODE_ENV ?? "development";
  const event: ClientErrorEvent = {
    ...input,
    receivedAt: new Date().toISOString(),
    env,
    site: getSiteUrl(),
  };

  const sinks = getDesiredSinks();
  if (sinks.length === 0) return;

  const tasks: Promise<void>[] = [];
  for (const sink of sinks) {
    if (sink === "betterstack") tasks.push(sendToBetterStack(event));
    if (sink === "datadog") tasks.push(sendToDatadog(event));
  }

  // Keep server responses fast: best-effort, short timeout, swallow failures.
  await withTimeout(Promise.allSettled(tasks), 800).catch(() => {});
}

