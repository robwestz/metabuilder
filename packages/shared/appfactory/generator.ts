
    import {
      type PSIRSystem,
      toApiSpec,
      toUiFlow
    } from "../psir/index.js";
    import type { FileAsset } from "./index.js";

    type Primitive = "string" | "number" | "boolean" | "uuid" | "int" | "float";
    type PropType = Primitive | { enum: string[] };

    function slug(s: string) { return s.toLowerCase(); }
    function isEnum(t: PropType): t is { enum: string[] } {
      return typeof t === "object" && t !== null && "enum" in t;
    }
    function pyType(t: PropType): string {
      if (isEnum(t)) return `Literal[${t.enum.map(v => JSON.stringify(v)).join(", ")}]} }`;
      switch (t) {
        case "string": return "str";
        case "number": return "float";
        case "boolean": return "bool";
        case "uuid": return "UUID";
        case "int": return "int";
        case "float": return "float";
        default: return "str";
      }
    }

    function collectEntityInvariants(sys: PSIRSystem, entityName: string) {
      const checks: { prop: string; op: string; value: string }[] = [];
      const re = new RegExp(`^${entityName}\.([A-Za-z_]\w*)\s*(<=|>=|==|!=|<|>)\s*(-?\d+(?:\.\d+)?)$`);
      for (const inv of sys.invariants) {
        const m = inv.trim().match(re);
        if (m) checks.push({ prop: m[1], op: m[2], value: m[3] });
      }
      return checks;
    }

    function renderInvariantIfs(entity: string, mode: "create" | "update", checks: { prop: string; op: string; value: string }[]) {
      if (!checks.length) return "";
      const lines: string[] = [];
      lines.push("@model_validator(mode="after")");
      lines.push("def _check_invariants(self):");
      for (const c of checks) {
        const guard = mode === "update" ? `self.${c.prop} is not None and ` : "";
        lines.push(`    if ${guard}not (self.${c.prop} ${c.op} ${c.value}):`);
        lines.push(`        raise ValueError("Invariant violated: ${entity}.${c.prop} ${c.op} ${c.value}")`);
      }
      lines.push("    return self");
      return lines.map(l => `    ${l}`).join("
");
    }

    function pyModelsForEntity(sys: PSIRSystem, e: PSIRSystem["entities"][number]): string {
      const eName = e.name;
      const fields = e.props.filter(p => p.name !== "id");
      const createFields = fields.map(p => `    ${p.name}: ${pyType(p.type as any)}`).join("
");
      const updateFields = fields.map(p => `    ${p.name}: ${pyType(p.type as any)} | None = None`).join("
");
      const readFields = fields.map(p => `    ${p.name}: ${pyType(p.type as any)}`).join("
");
      const checksCreate = renderInvariantIfs(eName, "create", collectEntityInvariants(sys, eName));
      const checksUpdate = renderInvariantIfs(eName, "update", collectEntityInvariants(sys, eName));

      return [
        `# ==== Models for ${eName}`,
        `class ${eName}Create(BaseModel):`,
        `    id: UUID | None = None`,
        createFields || "    pass",
        checksCreate ? `
${checksCreate}` : "",
        "",
        `class ${eName}Update(BaseModel):`,
        updateFields || "    pass",
        checksUpdate ? `
${checksUpdate}` : "",
        "",
        `class ${eName}Read(BaseModel):`,
        `    id: UUID`,
        readFields ? readFields : "",
        ""
      ].join("
");
    }

    function pyRouter(sys: PSIRSystem): string {
      const sysSlug = slug(sys.name);

      const modelBlocks = sys.entities.map(e => pyModelsForEntity(sys, e)).join("

");

      // seeds med enkla värden (id + första möjliga värdet)
      const seeds = sys.entities.map(e => {
        const eSlug = slug(e.name);
        const mkSeed = (i: number) => {
          const id = `${eSlug}${i}`;
          const kvs = e.props
            .filter(p => p.name !== "id")
            .map(p => {
              if (isEnum(p.type as any)) {
                const v = (p.type as any).enum[0] || "VAL";
                return `"${p.name}": ${JSON.stringify(v)}`;
              }
              const t = p.type as any as Primitive;
              const v =
                t === "string" ? `"sample"` :
                t === "number" || t === "float" ? 0.0 :
                t === "int" ? 0 :
                t === "boolean" ? true :
                t === "uuid" ? `"00000000-0000-0000-0000-000000000000"` :
                `"sample"`;
              return `"${p.name}": ${v}`;
            }).join(", ");
          return `"${id}": {"id":"${id}"${kvs ? ", " + kvs : ""}}`;
        };
        return `store_${eSlug}: dict[str, dict] = {
  ${mkSeed(1)},
  ${mkSeed(2)}
}`;
      }).join("

");

      const endpoints = sys.entities.map(e => {
        const eSlug = slug(e.name);
        return `# ---- ${e.name}
    @router.get("/${eSlug}")
    def list_${eSlug}():
        return list(store_${eSlug}.values())

    @router.post("/${eSlug}")
    def create_${eSlug}(body: ${e.name}Create):
        data = body.model_dump()
        _id = str(data.get("id") or uuid4())
        data["id"] = _id
        store_${eSlug}[_id] = data
        return data

    @router.get("/${eSlug}/{item_id}")
    def get_${eSlug}(item_id: str):
        obj = store_${eSlug}.get(item_id)
        if not obj:
          raise HTTPException(status_code=404, detail="${e.name} not found")
        return obj

    @router.put("/${eSlug}/{item_id}")
    def update_${eSlug}(item_id: str, body: ${e.name}Update):
        if item_id not in store_${eSlug}:
          raise HTTPException(status_code=404, detail="${e.name} not found")
        patch = body.model_dump(exclude_unset=True, exclude_none=True)
        patch.pop("id", None)
        store_${eSlug}[item_id].update(patch)
        return store_${eSlug}[item_id]

    @router.delete("/${eSlug}/{item_id}")
    def delete_${eSlug}(item_id: str):
        if item_id not in store_${eSlug}:
          raise HTTPException(status_code=404, detail="${e.name} not found")
        del store_${eSlug}[item_id]
        return {"ok": True}`;
      }).join("

");

      return `from fastapi import APIRouter, HTTPException
    from typing import Literal
    from pydantic import BaseModel, model_validator
    from uuid import UUID, uuid4

    router = APIRouter(prefix="/${sysSlug}", tags=["generated-${sysSlug}"])

    # ==== Pydantic Models
    ${modelBlocks}

    # ==== In-memory stores
    from typing import Dict as dict  # alias to make type hints explicit
    ${seeds}

    ${endpoints}
    `;
    }

    function tsListPage(sysName: string, entity: string): string {
      const sysSlug = slug(sysName);
      const eSlug = slug(entity);
      return `export const dynamic = "force-dynamic";
    async function fetchList() {
      const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";
      const r = await fetch(`${base}/${sysSlug}/${eSlug}`, { cache: "no-store" });
      if (!r.ok) throw new Error("API error");
      return r.json();
    }
    export default async function Page() {
      const data = await fetchList();
      return (
        <section className="card">
          <h2 className="text-xl font-semibold mb-3">${entity} — List</h2>
          <ul className="space-y-2">
            {data.map((x: any) => (
              <li key={x.id} className="flex items-center justify-between border-b py-2">
                <span className="font-mono text-sm">{x.id}</span>
                <a href="/${sysSlug}/${eSlug}/" className="sr-only">List root</a>
                <a className="underline" href={"/${sysSlug}/${eSlug}/" + encodeURIComponent(x.id)}>Detalj →</a>
              </li>
            ))}
          </ul>
        </section>
      );
    }`;
    }

    function tsDetailPage(sysName: string, entity: string): string {
      const sysSlug = slug(sysName);
      const eSlug = slug(entity);
      return `export const dynamic = "force-dynamic";
    async function fetchItem(id: string) {
      const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";
      const r = await fetch(`${base}/${sysSlug}/${eSlug}/${id}`, { cache: "no-store" });
      if (!r.ok) throw new Error("Not found");
      return r.json();
    }
    export default async function Page({ params }: { params: { id: string }}) {
      const data = await fetchItem(params.id);
      return (
        <section className="card">
          <h2 className="text-xl font-semibold mb-3">${entity} — Detail</h2>
          <pre className="text-xs bg-gray-50 dark:bg-gray-950 p-3 rounded overflow-auto"><code>{JSON.stringify(data, null, 2)}</code></pre>
          <a className="inline-block mt-4 underline" href="/${sysSlug}/${eSlug}">← Till listan</a>
        </section>
      );
    }`;
    }

    function tsSystemIndex(sysName: string, entities: string[]): string {
      const sysSlug = slug(sysName);
      return `export default function Page() {
      return (
        <section className="card">
          <h2 className="text-xl font-semibold mb-3">${sysName}</h2>
          <ul className="list-disc pl-6">
            ${entities.map(e => `<li><a className="underline" href="/${sysSlug}/${slug(e)}">${e} — List</a></li>`).join("
        ")}
          </ul>
        </section>
      );
    }`;
    }

    export function generateHelloApp(sys: PSIRSystem): FileAsset[] {
      const files: FileAsset[] = [];
      const sysSlug = slug(sys.name);

      // API router
      files.push({
        path: `apps/api/app/routers/generated/${sysSlug}.py`,
        content: pyRouter(sys)
      });
      files.push({
        path: `apps/api/app/routers/generated/__init__.py`,
        content: "# package marker for generated routers
"
      });

      // Web pages
      files.push({
        path: `apps/web/app/${sysSlug}/page.tsx`,
        content: tsSystemIndex(sys.name, sys.entities.map(e => e.name))
      });
      for (const e of sys.entities) {
        const eSlug = slug(e.name);
        files.push({
          path: `apps/web/app/${sysSlug}/${eSlug}/page.tsx`,
          content: tsListPage(sys.name, e.name)
        });
        files.push({
          path: `apps/web/app/${sysSlug}/${eSlug}/[id]/page.tsx`,
          content: tsDetailPage(sys.name, e.name)
        });
      }

      // Manifest (meta)
      files.push({
        path: `docs/generated/${sysSlug}_manifest.json`,
        content: JSON.stringify({ system: sys.name, api: toApiSpec(sys), ui: toUiFlow(sys) }, null, 2)
      });

      return files;
    }
