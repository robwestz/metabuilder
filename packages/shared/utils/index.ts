
import { randomUUID } from "node:crypto";

export function createLogger(component: string) {
  return {
    info: (msg: string, meta: Record<string, unknown> = {}) =>
      console.log(JSON.stringify({ level: "info", component, msg, rid: randomUUID(), ...meta })),
    warn: (msg: string, meta: Record<string, unknown> = {}) =>
      console.warn(JSON.stringify({ level: "warn", component, msg, rid: randomUUID(), ...meta })),
    error: (msg: string, meta: Record<string, unknown> = {}) =>
      console.error(JSON.stringify({ level: "error", component, msg, rid: randomUUID(), ...meta }))
  };
}

export function moderateText(s: string) {
  const flagged = /(?:violence|hate|abuse)/i.test(s);
  return { ok: !flagged, flagged };
}
