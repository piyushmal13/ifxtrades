/**
 * Structured logger — no-ops in production to keep runtime logs clean.
 * Use this instead of raw console.* calls in application code.
 *
 * In production, errors are silently swallowed here; wire up a real
 * logging service (e.g. Sentry, Datadog, Axiom) by replacing the stubs below.
 */

const isDev = process.env.NODE_ENV === "development";

type LogLevel = "info" | "warn" | "error";

function log(level: LogLevel, message: string, ...args: unknown[]) {
  if (!isDev) {
    // TODO: forward to your observability platform in production
    // e.g. Sentry.captureException(args[0]) for errors
    return;
  }
  // eslint-disable-next-line no-console
  console[level](`[ifxtrades] ${message}`, ...args);
}

export const logger = {
  info: (message: string, ...args: unknown[]) => log("info", message, ...args),
  warn: (message: string, ...args: unknown[]) => log("warn", message, ...args),
  error: (message: string, ...args: unknown[]) => log("error", message, ...args),
};
