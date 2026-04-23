import { spawn } from "child_process";

const serviceConfig = {
  appointments: {
    entry: "src/services/appointments/index.ts",
    port: 3103,
  },
  auth: {
    entry: "src/services/auth/index.ts",
    port: 3101,
  },
  docs: {
    entry: "src/services/docs/index.ts",
    port: 3100,
  },
  users: {
    entry: "src/services/users/index.ts",
    port: 3102,
  },
} as const;

type ServiceName = keyof typeof serviceConfig;

const requestedService = process.env.SERVICE as ServiceName | undefined;
const selectedServices = requestedService ? [requestedService] : (Object.keys(serviceConfig) as ServiceName[]);

if (requestedService && !(requestedService in serviceConfig)) {
  console.error(`Unknown service "${requestedService}". Expected one of: ${Object.keys(serviceConfig).join(", ")}.`);
  process.exit(1);
}

const children = selectedServices.map((service) => {
  const config = serviceConfig[service];
  console.log(`Starting ${service} service on port ${config.port}...`);

  return spawn("tsx", ["watch", config.entry], {
    stdio: "inherit",
    env: {
      ...process.env,
      PORT: process.env.PORT ?? config.port.toString(),
      SERVICE: service,
    },
    shell: true,
  });
});

const shutdown = () => {
  children.forEach((child) => {
    if (!child.killed) {
      child.kill();
    }
  });
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

children.forEach((child) => {
  child.on("error", (error) => {
    console.error("Failed to start service watcher:", error);
  });
});

console.log(`Backend watch mode is running for: ${selectedServices.join(", ")}.`);
