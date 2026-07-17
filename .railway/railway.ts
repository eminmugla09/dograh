import { defineRailway, github, image, postgres, preserve, project, redis, service, volume } from "railway/iac";

export default defineRailway(() => {
  const Redis = redis("Redis");
  const Postgres = postgres("Postgres");
  const redisVolume = volume("redis-volume", { alerts: { usage: { "100": {}, "80": {}, "95": {} } }, allowOnlineResize: true, region: "us-east4-eqdc4a", sizeMB: 5000 });
  const postgresVolume = volume("postgres-volume", { alerts: { usage: { "100": {}, "80": {}, "95": {} } }, allowOnlineResize: true, region: "us-east4-eqdc4a", sizeMB: 5000 });
  const dograhApi = service("dograh-api", {
    source: github("eminmugla09/dograh", { branch: "railway-build-fix" }),
    build: { buildEnvironment: "V3", builder: "DOCKERFILE", dockerfilePath: "api/Dockerfile" },
    replicas: { "us-east4-eqdc4a": 1 },
    env: {
      BACKEND_API_ENDPOINT: preserve(),
      DATABASE_URL: preserve(),
      ENABLE_AWS_S3: preserve(),
      ENABLE_SIGNUP: preserve(),
      ENABLE_TELEMETRY: preserve(),
      ENVIRONMENT: preserve(),
      FASTAPI_WORKERS: preserve(),
      FORCE_TURN_RELAY: preserve(),
      FORWARDED_ALLOW_IPS: preserve(),
      LOG_LEVEL: preserve(),
      MINIO_ACCESS_KEY: preserve(),
      MINIO_BUCKET: preserve(),
      MINIO_ENDPOINT: preserve(),
      MINIO_PUBLIC_ENDPOINT: preserve(),
      MINIO_SECRET_KEY: preserve(),
      MINIO_SECURE: preserve(),
      OSS_JWT_SECRET: preserve(),
      POSTHOG_API_KEY: preserve(),
      POSTHOG_HOST: preserve(),
      PUBLIC_BASE_URL: preserve(),
      PUBLIC_HOST: preserve(),
      REDIS_URL: preserve(),
      TURN_HOST: preserve(),
      TURN_SECRET: preserve(),
    },
  });
  const minio = service("minio", {
    source: image("minio/minio:latest"),
    start: "minio server /data --console-address :9001",
    replicas: { "us-east4-eqdc4a": 1 },
    env: {
      MINIO_ROOT_PASSWORD: preserve(),
      MINIO_ROOT_USER: preserve(),
    },
  });
  const dograhUi = service("dograh-ui", {
    source: github("eminmugla09/dograh", { branch: "railway-build-fix" }),
    build: { buildEnvironment: "V3", builder: "DOCKERFILE", dockerfilePath: "ui/Dockerfile" },
    replicas: { "us-east4-eqdc4a": 1 },
    env: {
      BACKEND_URL: `http://${dograhApi.env.RAILWAY_PRIVATE_DOMAIN}:8000`,
      NODE_ENV: "production",
      HOSTNAME: "0.0.0.0",
    },
  });

  return project("Dogra-Test", {
    resources: [dograhApi, dograhUi, Redis, Postgres, minio, redisVolume, postgresVolume],
  });
});
