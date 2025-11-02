
from fastapi import FastAPI
from threading import Thread
import uvicorn

# Start a lightweight monitoring API on port 8001 in a background thread.
def start_monitor():
    app = FastAPI(title="MetaBuilder Monitor")
    counter = {"requests": 0}

    @app.middleware("http")
    async def count_requests(request, call_next):
        counter["requests"] += 1
        return await call_next(request)

    @app.get("/health")
    def health():
        return {"status": "ok"}

    @app.get("/metrics")
    def metrics():
        return dict(counter)

    def _run():
        uvicorn.run(app, host="0.0.0.0", port=8001, log_level="info")

    thread = Thread(target=_run, daemon=True)
    thread.start()
    print("Monitoring service started on port 8001")
