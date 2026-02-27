import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";

// Convex HTTP actions can be used for webhook-style endpoints if needed in future.
// The main redirect logic lives in Next.js middleware for latency reasons.

const http = httpRouter();

export default http;
