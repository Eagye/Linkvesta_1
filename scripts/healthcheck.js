/* eslint-disable no-console */
const DEFAULTS = {
  frontend: 3000,
  api: 3001,
  auth: 3002
};

const ports = {
  frontend: Number(process.env.FRONTEND_PORT || DEFAULTS.frontend),
  api: Number(process.env.API_PORT || DEFAULTS.api),
  auth: Number(process.env.AUTH_PORT || DEFAULTS.auth)
};

const endpoints = [
  {
    name: 'frontend',
    url: `http://localhost:${ports.frontend}`,
    expectStatuses: [200, 301, 302]
  },
  {
    name: 'api',
    url: `http://localhost:${ports.api}/health`,
    expectStatuses: [200]
  },
  {
    name: 'auth',
    url: `http://localhost:${ports.auth}/health`,
    expectStatuses: [200]
  }
];

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function checkEndpoint({ name, url, expectStatuses }) {
  try {
    const response = await fetch(url, { method: 'GET' });
    const ok = expectStatuses.includes(response.status);
    return {
      name,
      url,
      status: response.status,
      ok
    };
  } catch (error) {
    return {
      name,
      url,
      status: null,
      ok: false,
      error: error?.message || String(error)
    };
  }
}

async function runHealthCheck() {
  const attempts = Number(process.env.HEALTHCHECK_ATTEMPTS || 8);
  const intervalMs = Number(process.env.HEALTHCHECK_INTERVAL_MS || 1500);

  console.log('Running LinkVesta health check...');
  console.log(`Ports: frontend=${ports.frontend}, api=${ports.api}, auth=${ports.auth}`);

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const results = await Promise.all(endpoints.map(checkEndpoint));
    const allOk = results.every((result) => result.ok);

    results.forEach((result) => {
      const statusText = result.ok ? 'OK' : 'FAIL';
      const detail = result.status ? `status ${result.status}` : `error ${result.error || 'unknown'}`;
      console.log(`[${statusText}] ${result.name} -> ${result.url} (${detail})`);
    });

    if (allOk) {
      console.log('All services are healthy.');
      process.exit(0);
    }

    if (attempt < attempts) {
      console.log(`Retrying (${attempt}/${attempts})...`);
      await delay(intervalMs);
    }
  }

  console.error('Health check failed. One or more services are not reachable.');
  process.exit(1);
}

runHealthCheck();
