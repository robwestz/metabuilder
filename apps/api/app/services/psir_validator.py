
# Minimal PSIR parser for API (mirrors TS, simplified)
import re

re_system = re.compile(r"^\s*system\s+([A-Za-z_][\w-]*)\s*\{\s*$")
re_entity = re.compile(r"^\s*@entity\s+([A-Za-z_]\w*)\s*\(([^)]*)\)\s*$")
re_force  = re.compile(r"^\s*@force\s+([A-Za-z_]\w*)\s*\(([^)]*)\)\s*$")
re_invariant = re.compile(r"^\s*@invariant\s+(.+?)\s*$")

def _parse_props(s: str):
    s = s.strip()
    if not s: return []
    out = []
    for seg in s.split(","):
        seg = seg.strip()
        if not seg: continue
        if ":" not in seg: raise ValueError(f"Bad prop segment: {seg}")
        name, typ = [x.strip() for x in seg.split(":", 1)]
        out.append({"name": name, "type": typ})
    return out

def _parse_force_args(s: str):
    parts = [p.strip() for p in s.split(",") if p.strip()]
    if not parts: raise ValueError("force requires params")
    on = ""
    constraints = []
    for p in parts:
        if p.startswith("on:"): on = p[3:].strip()
        elif not on: on = p
        else: constraints.append(p)
    if not on: raise ValueError("force missing on")
    return {"on": on, "constraints": constraints}

def parse_psir(text: str):
    lines = text.splitlines()
    i = 0
    sysname = ""
    entities, forces, invariants = [], [], []
    # header
    for i, line in enumerate(lines):
        line = line.strip()
        if not line or line.startswith("#") or line.startswith("//"): continue
        m = re_system.match(line)
        if not m: raise ValueError(f'Expected "system <Name> {{" at line {i+1}')
        sysname = m.group(1)
        start = i + 1
        break
    for j in range(start, len(lines)):
        line = lines[j].strip()
        if not line or line.startswith("#") or line.startswith("//"): continue
        if line == "}": break
        m = re_entity.match(line)
        if m:
            entities.append({"name": m.group(1), "props": _parse_props(m.group(2))})
            continue
        m = re_force.match(line)
        if m:
            args = _parse_force_args(m.group(2))
            forces.append({"name": m.group(1), **args}); continue
        m = re_invariant.match(line)
        if m:
            invariants.append(m.group(1)); continue
        raise ValueError(f"Unrecognized line {j+1}: {line}")
    return {"name": sysname, "entities": entities, "forces": forces, "invariants": invariants}

def validate_psir(ast):
    names = {e["name"] for e in ast["entities"]}
    for f in ast["forces"]:
        if f["on"] not in names:
            raise ValueError(f'Force "{f["name"]}" refers to unknown entity "{f["on"]}"')
    for inv in ast["invariants"]:
        if "." not in inv:
            raise ValueError(f'Invariant "{inv}" lacks Entity.prop reference')
    return True
