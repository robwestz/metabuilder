
    import type { PSIRSystem, Entity, EntityProp, Force, Field, Meter } from "./schema.js";

    const reSystem = /^\s*system\s+([A-Za-z_][\w-]*)\s*\{\s*$/;
    const reEntity = /^\s*@entity\s+([A-Za-z_]\w*)\s*\(([^)]*)\)\s*$/;
    const reForce  = /^\s*@force\s+([A-Za-z_]\w*)\s*\(([^)]*)\)\s*$/;
    const reField  = /^\s*@field\s+([A-Za-z_]\w*)\.([A-Za-z_]\w*)\s*:\s*([\w\[\]\|]+)\s*$/;
    const reInvariant = /^\s*@invariant\s+(.+?)\s*$/;
    const reMeter  = /^\s*@meter\s+([A-Za-z_]\w*)\s*\(([^)]*)\)\s*->\s*([A-Za-z_]\w*)\s*$/;

    function parseProps(s: string): EntityProp[] {
      if (!s.trim()) return [];
      return s.split(",").map(seg => {
        const [rawName, rawType] = seg.trim().split(":").map(x => x.trim());
        if (!rawName || !rawType) throw new Error(`Bad prop segment: "${seg}"`);
        if (rawType.startsWith("enum[")) {
          const m = rawType.match(/^enum\[(.+)\]$/);
          if (!m) throw new Error(`Bad enum type: "${rawType}"`);
          const values = m[1].split("|").map(v => v.trim()).filter(Boolean);
          return { name: rawName, type: { enum: values } };
        }
        return { name: rawName, type: rawType as any };
      });
    }

    function parseForceArgs(s: string): { on: string; constraints: string[] } {
      // Accept either "on:Entity, ..." or "Entity, constraint, ..."
      const parts = s.split(",").map(p => p.trim()).filter(Boolean);
      if (parts.length === 0) throw new Error("force requires parameters");
      let on = "";
      const constraints: string[] = [];
      for (const p of parts) {
        if (p.startsWith("on:")) on = p.slice(3).trim();
        else if (!on) on = p;
        else constraints.push(p);
      }
      if (!on) throw new Error("force missing 'on' entity");
      return { on, constraints };
    }

    export function parsePSIR(input: string): PSIRSystem {
      const lines = input.split(/?
/);
      let i = 0;
      let sysName = "";
      const entities: Entity[] = [];
      const forces: Force[] = [];
      const fields: Field[] = [];
      const invariants: string[] = [];
      const meters: Meter[] = [];

      // find system header
      for (; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line || line.startsWith("#") || line.startsWith("//")) continue;
        const m = line.match(reSystem);
        if (!m) throw new Error(`Expected "system <Name> {{" at line ${i + 1}`);
        sysName = m[1];
        i++;
        break;
      }
      for (; i < lines.length; i++) {
        let line = lines[i].trim();
        if (!line || line.startsWith("#") || line.startsWith("//")) continue;
        if (line === "}") break;

        let m;
        if ((m = line.match(reEntity))) {
          const e: Entity = { name: m[1], props: parseProps(m[2]) };
          entities.push(e);
          continue;
        }
        if ((m = line.match(reForce))) {
          const fargs = parseForceArgs(m[2]);
          forces.push({ name: m[1], on: fargs.on, constraints: fargs.constraints });
          continue;
        }
        if ((m = line.match(reField))) {
          fields.push({ domain: m[1], name: m[2], type: m[3] });
          continue;
        }
        if ((m = line.match(reInvariant))) {
          invariants.push(m[1]);
          continue;
        }
        if ((m = line.match(reMeter))) {
          const args = m[2].split(",").map(a => a.trim()).filter(Boolean);
          meters.push({ name: m[1], args, unit: m[3] });
          continue;
        }
        throw new Error(`Unrecognized line ${i + 1}: "${line}"`);
      }

      if (!sysName) throw new Error("Missing system name");
      return { name: sysName, entities, forces, fields, invariants, meters };
    }
