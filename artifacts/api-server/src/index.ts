import app from "./app";
import { logger } from "./lib/logger";
import { initDb } from "./lib/db";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error("PORT environment variable is required but was not provided.");
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 3_000;

async function tryInitDb(attempt = 1): Promise<void> {
  try {
    await initDb();
    logger.info("PostgreSQL schema verified — tables ready");
  } catch (err) {
    if (attempt >= MAX_RETRIES) {
      logger.error(
        { err },
        `Failed to connect to PostgreSQL after ${MAX_RETRIES} attempts.\n` +
        "Check that DATABASE_URL is correct and the database server is reachable.\n" +
        "Supabase tip: free projects auto-pause — visit your Supabase dashboard to un-pause, " +
        "or use the Session Pooler URL (aws-0-<region>.pooler.supabase.com:5432) instead of the direct URL."
      );
      process.exit(1);
    }
    logger.warn({ err, attempt }, `DB connection attempt ${attempt} failed — retrying in ${RETRY_DELAY_MS / 1000}s`);
    await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
    return tryInitDb(attempt + 1);
  }
}

tryInitDb().then(() => {
  app.listen(port, (err) => {
    if (err) {
      logger.error({ err }, "Error listening on port");
      process.exit(1);
    }
    logger.info({ port }, "Server listening");
  });
});
