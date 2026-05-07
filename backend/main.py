from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.trustedhost import TrustedHostMiddleware
from init_db import init_db
from routers import auth, wellness, training, injury, dashboard, medical

app = FastAPI(title="Athlete Injury Prevention API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(wellness.router)
app.include_router(training.router)
app.include_router(injury.router)
app.include_router(dashboard.router)
app.include_router(medical.router)

@app.on_event("startup")
def on_startup():
    init_db()

@app.get("/")
def root():
    return {"message": "Athlete Injury Prevention API", "docs": "/docs"}
