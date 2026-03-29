const backendUrl = (process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:4000").replace(/\/$/, "");
const frontendUrl = (process.env.FRONTEND_URL || "http://127.0.0.1:3000").replace(/\/$/, "");

async function check(name, url, { expectedStatuses = [200], verify } = {}) {
  const response = await fetch(url, { redirect: "manual" });
  if (!expectedStatuses.includes(response.status)) {
    throw new Error(`${name} returned ${response.status}, expected ${expectedStatuses.join(", ")}`);
  }
  const payload = verify ? await verify(response) : null;
  process.stdout.write(`✓ ${name} ${response.status}${payload ? ` ${payload}` : ""}\n`);
}

async function verifyHealth(response) {
  const body = await response.json();
  if (body.status !== "ok") {
    throw new Error(`health payload missing ok status: ${JSON.stringify(body)}`);
  }
  return JSON.stringify({ status: body.status });
}

async function main() {
  await check("frontend home", `${frontendUrl}/`, { expectedStatuses: [200, 301, 302, 307, 308] });
  await check("backend health", `${backendUrl}/health`, { expectedStatuses: [200], verify: verifyHealth });
  await check("backend current user auth guard", `${backendUrl}/api/users/me`, { expectedStatuses: [401, 403] });
  await check("backend blog auth guard", `${backendUrl}/api/blog`, { expectedStatuses: [401, 403] });
}

main().catch((error) => {
  console.error(String(error && error.stack ? error.stack : error));
  process.exit(1);
});
