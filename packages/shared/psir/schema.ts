
export type Primitive = "string" | "number" | "boolean" | "uuid" | "int" | "float" | "enum";

export interface EntityProp {
  name: string;
  type: Primitive | { enum: string[] };
}

export interface Entity {
  name: string;
  props: EntityProp[];
}

export interface Force {
  name: string;
  on: string;               // Entity name
  constraints: string[];    // textual constraints
}

export interface Field {
  domain: string;
  name: string;
  type: string;
}

export interface Meter {
  name: string;
  args: string[];
  unit: string;
}

export interface PSIRSystem {
  name: string;
  entities: Entity[];
  forces: Force[];
  fields: Field[];
  invariants: string[];
  meters: Meter[];
}

export interface FeatureSpec {
  system: string;
  features: { name: string; kind: "entity" | "force" | "field" | "meter" | "invariant"; ref?: string }[];
}

export interface ModuleSpec {
  system: string;
  modules: { name: string; exports: string[] }[];
}

export interface ApiSpec {
  system: string;
  endpoints: { path: string; method: "GET" | "POST" | "PUT" | "DELETE"; description: string }[];
}

export interface UiFlow {
  system: string;
  nodes: { id: string; label: string; kind: "list" | "detail" | "action" }[];
  edges: { from: string; to: string; label?: string }[];
}
