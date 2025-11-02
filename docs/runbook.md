
# Runbook

## Processer
- **API**: Uvicorn (FastAPI) lyssnar på port 8000.
- **Web**: Next.js dev server lyssnar på port 3000.
- **Mirror Lab**: Körs via `pnpm --filter @metabuilder/mirror-lab start -- --file sample.psir`.
- **App‑Factory CLI**: `pnpm --filter @metabuilder/app-factory start -- --file docs/samples/checkout.psir`.

## Observability
- Strukturerad loggning (korrelations‑ID) i Node‑moduler.
- FastAPI loggar X-Request-ID på varje anrop.

## Säkerhet
- JWT‑stub för sessioner (ej produktionsklar).
- Moderation‑stub (nyckelordsfilter) före generering.

## Validering (v2)
- Pydantic v2‑modeller används för API‑request/response.
- `enum[...]` mappas till `Literal[...]` och numeriska invariants genererar `@model_validator`.
- 422 svar betyder valideringsfel i modellen eller invariant som brutits.

## Felsök (vanliga fel)
1) **API 404** på `/checkout/*`: Kontrollera att `app.main` inkluderar generated‑router och att servern körs.  
2) **Web fetch‑fel**: Sätt `NEXT_PUBLIC_API_BASE` (default `http://localhost:8000`).  
3) **422 vid POST/PUT**: Kroppen matchar inte modellen (t.ex. `role`) eller invariant bryts (t.ex. `total < 0`).  

## Drift
- Starta med docker-compose för lägsta friktion i dev.
- Se `forge/registry.json` för modulstatus.
