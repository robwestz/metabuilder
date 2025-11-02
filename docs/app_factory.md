
# App‑Factory — Hello‑app generator

App‑Factory tar en PSIR‑modell och producerar:
- **API** (FastAPI‑router med **Pydantic v2‑modeller**: `Create`/`Update`/`Read`)  
- **UI** (Next.js serverkomponenter: list + detail per entitet)
- **Validering**: `enum[...]` → `Literal[...]`, `uuid` → `UUID`, numeriska invariants (t.ex. `Order.total >= 0`) → `@model_validator`‑regler

## CLI
```bash
pnpm --filter @metabuilder/app-factory build
pnpm --filter @metabuilder/app-factory start -- --file docs/samples/checkout.psir
```

Skapade filer skrivs in i repo enligt `packages/shared/appfactory/generator.ts` (API under `apps/api/app/routers/generated/`, UI under `apps/web/app/<system>/`).

## Programmatisk användning
```ts
import { psir, appfactory } from "@metabuilder/shared";
const ast = psir.parsePSIR(source);
psir.validatePSIR(ast);
const assets = appfactory.generateHelloApp(ast);
// skriv assets.path → assets.content till disk
```

## Invariants (stöd i v2)
Denna version genererar checkar för enkla uttryck av formen:
```
Entity.prop OP number    # OP ∈ {>=, <=, >, <, ==, !=}
```
De placeras som `@model_validator(mode="after")` på `Create`/`Update`‑modellerna per entitet.
