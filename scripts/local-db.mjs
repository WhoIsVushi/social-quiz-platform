import EmbeddedPostgres from "embedded-postgres";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { randomBytes } from "node:crypto";
const root = resolve(".local");
mkdirSync(root, { recursive: true });
const configPath = resolve(root, "database.json");
const config = existsSync(configPath)
  ? JSON.parse(readFileSync(configPath, "utf8"))
  : { user: "app", password: randomBytes(24).toString("hex"), port: 55432 };
if (!existsSync(configPath)) writeFileSync(configPath, JSON.stringify(config), { mode: 0o600 });
const pg = new EmbeddedPostgres({
  ...config,
  databaseDir: resolve(root, "postgres"),
  persistent: true,
  authMethod: "scram-sha-256",
  initdbFlags: ["--encoding=UTF8", "--locale=C"],
  postgresFlags: ["-c", "listen_addresses=127.0.0.1"],
  onLog: () => {},
  onError: () => {},
});
if (!existsSync(resolve(root, "postgres", "PG_VERSION"))) await pg.initialise();
await pg.start();
const client = pg.getPgClient();
await client.connect();
const result = await client.query("SELECT 1 FROM pg_database WHERE datname='app'");
if (!result.rowCount) await client.query("CREATE DATABASE app");
await client.end();
if (!existsSync(".env"))
  writeFileSync(
    ".env",
    `DATABASE_URL="postgresql://${config.user}:${config.password}@127.0.0.1:${config.port}/app?schema=public"\nBETTER_AUTH_SECRET="${randomBytes(48).toString("base64url")}"\nBETTER_AUTH_URL="http://127.0.0.1:3000"\nNEXT_PUBLIC_APP_URL="http://127.0.0.1:3000"\nREQUIRE_EMAIL_VERIFICATION="false"\nTRUST_PROXY="false"\n`,
    { mode: 0o600 },
  );
console.log(`Development PostgreSQL ready on 127.0.0.1:${config.port}. Press Ctrl+C to stop.`);
let stopping = false;
async function stop() {
  if (stopping) return;
  stopping = true;
  await pg.stop();
  process.exit(0);
}
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
setInterval(() => {}, 60000);
