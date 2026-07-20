import posthog from "posthog-js";

const projectToken = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;

if (!projectToken || !host) {
  throw new Error("PostHog environment variables are not configured.");
}

posthog.init(projectToken, {
  api_host: host,
  defaults: "2025-11-30",
  capture_exceptions: true,
  debug: process.env.NODE_ENV === "development",
});
