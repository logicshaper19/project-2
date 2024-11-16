from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import deals, admin
from api.database import engine, Base

app = FastAPI(title="DealFinder AI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create database tables
Base.metadata.create_all(bind=engine)

# Include routers
app.include_router(deals.router, prefix="/api", tags=["deals"])
app.include_router(admin.router, prefix="/api/admin", tags=["admin"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)