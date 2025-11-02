
import type { PSIRSystem } from "./schema.js";

export function validatePSIR(sys: PSIRSystem) {
  const entityNames = new Set(sys.entities.map(e => e.name));
  for (const f of sys.forces) {
    if (!entityNames.has(f.on)) {
      throw new Error(`Force "${f.name}" refers to unknown entity "${f.on}"`);
    }
  }
  for (const inv of sys.invariants) {
    if (!/[A-Za-z_]\w*\./.test(inv)) {
      // simple heuristic: expect Entity.prop in invariant
      throw new Error(`Invariant "${inv}" lacks Entity.prop reference`);
    }
  }
  return { ok: true as const };
}
