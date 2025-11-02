
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from .routers import health, psir
# include generated hello-app (Checkout)
from .routers.generated import checkout as generated_checkout

app = FastAPI(title="MetaBuilder API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True, allow_methods=["*"], allow_headers=["*"]
)

@app.middleware("http")
async def add_request_id(request: Request, call_next):
    # simple correlation id
    request_id = request.headers.get("x-request-id", "rid-unknown")
    response = await call_next(request)
    response.headers["x-request-id"] = request_id
    return response

app.include_router(health.router, prefix="/health", tags=["health"])
app.include_router(psir.router, prefix="/psir", tags=["psir"])
app.include_router(generated_checkout.router, tags=["generated"])
