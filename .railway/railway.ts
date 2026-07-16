import { defineRailway, github, postgres, project, redis, service, volume } from "railway/iac";

export default defineRailway(() => {
  const Redis = redis("Redis");
  const Postgres = postgres("Postgres");
  const redisVolume = volume("redis-volume", { alerts: { usage: { "100": {}, "80": {}, "95": {} } }, allowOnlineResize: true, region: "us-east4-eqdc4a", sizeMB: 5000 });
  const postgresVolume = volume("postgres-volume", { alerts: { usage: { "100": {}, "80": {}, "95": {} } }, allowOnlineResize: true, region: "us-east4-eqdc4a", sizeMB: 5000 });
  const dograhApi = service("dograh-api", {
    source: github("dograh-hq/dograh"),
    build: { buildEnvironment: "V3", builder: "DOCKERFILE", dockerfilePath: "api/Dockerfile" },
    replicas: { "us-east4-eqdc4a": 1 },
  });

  return project("Dogra-Test", {
    resources: [dograhApi, Redis, Postgres, redisVolume, postgresVolume],
  });
});
