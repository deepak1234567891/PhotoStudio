from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
from routers import auth_router, items_router, sales_router, reports_router, categories_router
from database import engine
from models import Base

load_dotenv()

# Create database tables (SQLite creates the file automatically)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Inventory & Billing System")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://backend:8000"],  # Vite default port and production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router, prefix="/api/auth", tags=["authentication"])
app.include_router(categories_router, prefix="/api/categories", tags=["categories"])
app.include_router(items_router, prefix="/api/items", tags=["items"])
app.include_router(sales_router, prefix="/api/sales", tags=["sales"])
app.include_router(reports_router, prefix="/api/reports", tags=["reports"])

@app.get("/")
def read_root():
    return {"message": "Inventory & Billing System API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
