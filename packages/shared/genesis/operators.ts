
import type { PSIRSystem } from "../psir/schema.js";

function dedupeByName<T extends { name: string }>(arr: T[]): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const x of arr) {
    if (!seen.has(x.name)) { out.push(x); seen.add(x.name); }
  }
  return out;
}

export function crossover(a: PSIRSystem, b: PSIRSystem): PSIRSystem {
  if (!a || !b) throw new Error("crossover requires two systems");
  return {
    name: `${a.name}_x_${b.name}`,
    entities: dedupeByName([...a.entities, ...b.entities]),
    forces: dedupeByName([...a.forces, ...b.forces]),
    fields: dedupeByName([...a.fields, ...b.fields]),
    invariants: Array.from(new Set([...a.invariants, ...b.invariants])),
    meters: dedupeByName([...a.meters, ...b.meters])
  };
}

export function anneal(a: PSIRSystem, objective: { maxEntities?: number } = {}): PSIRSystem {
  const max = objective.maxEntities ?? a.entities.length;
  const entities = a.entities.slice(0, max);
  const keep = new Set(entities.map(e => e.name));
  return { ...a,
    entities,
    forces: a.forces.filter(f => keep.has(f.on))
  };
}

export function distill(models: PSIRSystem[]): PSIRSystem {
  if (!models.length) throw new Error("distill requires models");
  const base = models[0];
  const inv = models.map(m => new Set(m.invariants));
  const commonInv = base.invariants.filter(x => inv.every(s => s.has(x)));
  return { ...base, name: `${base.name}_distilled`, invariants: commonInv };
}

export function transmute(a: PSIRSystem, mode: "rules-to-ui" | "ui-to-rules" = "rules-to-ui"): PSIRSystem & { uiHints?: string[] } {
  if (mode === "rules-to-ui") {
    const hints = a.invariants.map(i => `Display badge when: ${i}`);
    return { ...a, uiHints: hints };
  }
  return a;
}
