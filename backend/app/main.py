from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import router as api_router
from app.api.realtime import router as realtime_router
from app.core.config import get_settings

settings = get_settings()
app = FastAPI(title=settings.app_name, version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_origin_regex=r"chrome-extension://.*|moz-extension://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(api_router, prefix="/api/v1")
app.include_router(realtime_router)


@app.get("/")
def root():
    return {"name": settings.app_name, "docs": "/docs", "health": "/api/v1/health"}
