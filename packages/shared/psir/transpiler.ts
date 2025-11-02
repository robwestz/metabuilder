
import type { PSIRSystem, FeatureSpec, ModuleSpec, ApiSpec, UiFlow } from "./schema.js";

export function toFeatureSpec(sys: PSIRSystem): FeatureSpec {
  const features: FeatureSpec["features"] = [];
  sys.entities.forEach(e => features.push({ name: e.name, kind: "entity" }));
  sys.forces.forEach(f => features.push({ name: f.name, kind: "force", ref: f.on }));
  sys.fields.forEach(f => features.push({ name: `${f.domain}.${f.name}`, kind: "field" }));
  sys.invariants.forEach((i, idx) => features.push({ name: `inv${idx + 1}`, kind: "invariant", ref: i }));
  sys.meters.forEach(m => features.push({ name: m.name, kind: "meter" }));
  return { system: sys.name, features };
}

export function toModuleSpec(sys: PSIRSystem): ModuleSpec {
  const modules: ModuleSpec["modules"] = [
    { name: "entities", exports: sys.entities.map(e => e.name) },
    { name: "forces", exports: sys.forces.map(f => f.name) },
    { name: "fields", exports: sys.fields.map(f => `${f.domain}.${f.name}`) }
  ];
  return { system: sys.name, modules };
}

export function toApiSpec(sys: PSIRSystem): ApiSpec {
  const endpoints: ApiSpec["endpoints"] = [];
  for (const e of sys.entities) {
    const base = `/${sys.name.toLowerCase()}/${e.name.toLowerCase()}`;
    endpoints.push({ path: base, method: "GET", description: `List ${e.name}` });
    endpoints.push({ path: base, method: "POST", description: `Create ${e.name}` });
    endpoints.push({ path: `${base}/:id`, method: "GET", description: `Get ${e.name}` });
    endpoints.push({ path: `${base}/:id`, method: "PUT", description: `Update ${e.name}` });
    endpoints.push({ path: `${base}/:id`, method: "DELETE", description: `Delete ${e.name}` });
  }
  return { system: sys.name, endpoints };
}

export function toUiFlow(sys: PSIRSystem): UiFlow {
  const nodes: UiFlow["nodes"] = [];
  const edges: UiFlow["edges"] = [];
  for (const e of sys.entities) {
    const listId = `list_${e.name}`;
    const detailId = `detail_${e.name}`;
    nodes.push({ id: listId, label: `${e.name} List`, kind: "list" });
    nodes.push({ id: detailId, label: `${e.name} Detail`, kind: "detail" });
    edges.push({ from: listId, to: detailId, label: "view" });
  }
  sys.forces.forEach(f => nodes.push({ id: `action_${f.name}`, label: `${f.name}`, kind: "action" }));
  return { system: sys.name, nodes, edges };
}
