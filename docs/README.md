
# MetaBuilder — Builder‑kärna

Detta monorepo innehåller:
- **PSIR** (Prismatic Substrate IR) – typad DSL för systemspecifikationer  
- **Genesis Operators** – syntes/morfologiska operatorer på PSIR  
- **Mirror Lab** – genererar kandidater och rankar dem  
- **App‑Factory** – genererar “hello‑app” (API + UI) från PSIR/ApiSpec/UiFlow  
- **API (FastAPI)** och **Web (Next.js+Tailwind)**

## Nytt i v2
- App‑Factory genererar **Pydantic v2**‑modeller (`Create`/`Update`/`Read`) och **enklare invariants** som `@model_validator`.  
- Exempel: `/checkout/order` avvisar `total < 0` (422), `/checkout/user` accepterar endast `role ∈ {"ADMIN","USER"}`.

## Snabbstart
```bash
# Node-delen
pnpm install
pnpm -r build
pnpm -r test
pnpm --filter @metabuilder/web dev  # http://localhost:3000

# Python-API
cd apps/api
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000  # http://localhost:8000
```

## Hello‑app (Checkout)
- **UI:** http://localhost:3000/checkout  
- **API:**  
  - GET/POST `/checkout/user`, GET/PUT/DELETE `/checkout/user/:id`  
  - GET/POST `/checkout/order`, GET/PUT/DELETE `/checkout/order/:id`

## App‑Factory CLI
```bash
pnpm --filter @metabuilder/app-factory build
pnpm --filter @metabuilder/app-factory start -- --file docs/samples/checkout.psir
```

## Docker
```bash
docker compose up --build
```

## PSIR demo
Öppna webben och klistra in PSIR‑exemplet från `docs/psir.md` i playgrounden; se AST, validering och genererade artefakter.

Se även `docs/runbook.md` för drift och felsökning.
