# README.COPILOT.md
# MetaBuilder — Setup-instruktioner för GitHub Copilot / automation

Detta dokument instruerar GitHub Copilot (eller en automatiserad agent) hur hela MetaBuilder-projektet ska rekonstrueras, byggas, testas och pushas upp till ett GitHub-repo. Kör dessa steg i projektroten.

> Förutsättningar (agenten / Copilot runner):
> - Python 3.11+
> - Node 18+
> - pnpm installerat
> - pip (Python package installer)
> - Git-credentials (token eller SSH key) tillgängliga i miljön (GITHUB_TOKEN eller SSH)

---

## Översikt
Målet är:
1. Verifiera miljö och beroenden.
2. Generera saknade komponenter (App-Factory, forms, generated API).
3. Köra testsviten (JS + Python).
4. Paketera och skapa ett repo + push (om så önskas).
5. Starta orchestrator (valfritt) för att skapa UI-stubs och köra monitor.

---

## Körsteg (exakt sekvens)

### 1) Miljökontroll
Kör:
```bash
python -c "import sys; assert sys.version_info >= (3,11), 'Behöver Python 3.11+'; print('py-ok')"
node -v
pnpm -v
```

Alternativt kör skriptet som finns i repo:
```bash
python setup_and_orchestrate.py --check-only
```

(Agenten kan anropa funktionen i `orchestrator.verify_environment.check_environment()` om den körs programatiskt.)

### 2) Installera Node-beroenden
```bash
pnpm install
pnpm -r build
```

### 3) Installera Python-beroenden
```bash
cd apps/api
python -m venv .venv
# Windows
.venv\Scripts\activate
# Linux/Mac
# source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
cd ..\..
```

### 4) Generera artefakter (App-Factory)

Kör app-factory CLI (fungerar i monorepo):
```bash
# exempel, generera från sample PSIR
pnpm --filter @metabuilder/app-factory start -- --file docs/samples/checkout.psir
# eller (Nodeless) om vi vill använda den inbyggda generatorn
node labs/app-factory/cli.js --file docs/samples/checkout.psir
```

Verifiera att `apps/api/app/routers/generated/checkout.py` och motsvarande webbfiler skapats.

### 5) Kör tester

Kör Node/Vitest:
```bash
pnpm -r test
```

Kör Python/pytest:
```bash
cd apps/api
.venv\Scripts\activate
pytest -q
```

### 6) Starta tjänster lokalt (dev)

API:
```bash
cd apps/api
.venv\Scripts\activate
uvicorn app.main:app --reload --port 8000
```

Web:
```bash
cd apps/web
pnpm dev
```

(Eller kör `docker compose up --build` från projektroten.)

### 7) Starta orchestrator (valfritt)

Orchestrator skapar UI-stubs, startar monitor och erbjuder GUI:
```bash
python setup_and_orchestrate.py
# eller starta bara monitor i bakgrunden
python -c "from orchestrator.monitor_builder import start_monitoring; start_monitoring(8001)"
```

### 8) Automatiskt commit + push
```bash
git add .
git commit -m "Complete MetaBuilder setup"
git push origin main
```

---

## Fail-safe / självläkning

- Om generatorskript saknar moduler, kör `pnpm install` och `pip install -r apps/api/requirements.txt`.
- Om genererade router-filer inte finns — kör app-factory CLI igen med PSIR-filen.
- Kör `python create_metabuilder_full_project.py` om man vill återskapa hela projektet lokalt från script.

---

## Vad Copilot ska tänka på (policy för kodgenerering)

- Generera inte produktionsnycklar eller hemligheter i koden. Använd miljövariabler.
- Markera alla autogenererade filer med en header `# AUTO-GENERATED` och tryck in dem på en separat branch "autogen/<timestamp>" om du vill reviewa innan merge.
- Kör tester innan push.
- Om något misslyckas, skriv detaljerad felrapport i `orchestrator/last_run.log`.

---

## Snabbchecklista för verifikation efter körning

- [ ] `apps/api` startar och svarar på `GET /health`.
- [ ] `apps/api/app/routers/generated/checkout.py` finns och innehåller `router = APIRouter(prefix="/checkout"...`.
- [ ] `apps/web/app/checkout` innehåller `page.tsx` för list/detail.
- [ ] `orchestrator` finns och `python setup_and_orchestrate.py` körs utan undantag.
- [ ] Vitest & Pytest körs grönt.

---

Slutligen: om Copilot behöver mer precision i filmallar (t.ex. Pydantic-modellexempel, Next.js formkomponent), be om en extra prompt: "Generera <entitet>-form i React/TSX baserat på PSIR: <PSIR-snippet>".

