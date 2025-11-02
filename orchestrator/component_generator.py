
    import re
    from pathlib import Path

    # Very simple PSIR parser that extracts system name, entity names and props.
    def parse_psir_file(path: Path):
        text = path.read_text(encoding="utf-8")
        system_match = re.search(r"system\s+([A-Za-z_][\w-]*)", text)
        system = system_match.group(1) if system_match else "Unknown"
        entities: dict[str, list[tuple[str, str]]] = {}
        for line in text.splitlines():
            m = re.match(r"@entity\s+([A-Za-z_]\w*)\s*\(([^)]*)\)", line.strip())
            if m:
                name, props = m.groups()
                prop_list = []
                for seg in props.split(','):
                    seg = seg.strip()
                    if not seg: continue
                    if ':' in seg:
                        prop_list.append(tuple(seg.split(':', 1)))
                entities[name] = prop_list
        return system, entities

    # Generate simple Next.js forms for create/update for each entity.
    def generate_forms(base: Path, system: str, entities: dict):
        sys_slug = system.lower()
        for entity, props in entities.items():
            e_slug = entity.lower()
            # Create form
            form_content = ["export default function Form() {", "  return (", "    <form className='card space-y-2' method='post'>"]
            for name, typ in props:
                if name.strip() == "id":
                    continue
                form_content.append(f"      <label className='block'>{name}:")
                form_content.append(f"        <input name='{name}' className='border p-1' />")
                form_content.append("      </label>")
            form_content.append("      <button type='submit' className='underline'>Submit</button>")
            form_content.append("    </form>")
            form_content.append("  );")
            form_content.append("}")
            write_file(base, f"apps/web/app/{sys_slug}/{e_slug}/create/page.tsx", "
".join(form_content))
            # Update form (similar but with PUT method placeholder)
            write_file(base, f"apps/web/app/{sys_slug}/{e_slug}/[id]/edit/page.tsx", "
".join(form_content).replace("Submit", "Update"))

    # Locate PSIR files in docs/samples and produce stub forms.
    def generate_components() -> None:
        docs_dir = Path(__file__).resolve().parent.parent / "docs" / "samples"
        base = Path(__file__).resolve().parent.parent
        for psir_file in docs_dir.glob("*.psir"):
            system, entities = parse_psir_file(psir_file)
            generate_forms(base, system, entities)
            print(f"Generated forms for {system} ({len(entities)} entities)")

    if __name__ == "__main__":
        generate_components()
