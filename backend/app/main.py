import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session

from backend.app.core.config import settings
from backend.app.core.database import engine, SessionLocal, Base
from backend.app.models.user import User
from backend.app.models.session import KnowledgeBase
from backend.app.core.security import get_password_hash
from backend.app.retrieval.knowledge_base import SemanticRetrievalEngine

# Import all API Routers
from backend.app.api.auth import router as auth_router
from backend.app.api.chat import router as chat_router
from backend.app.api.tickets import router as ticket_router
from backend.app.api.diagnostics import router as diag_router
from backend.app.api.analytics import router as analytics_router

# Auto-create all tables in the local SQLite database
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Enterprise-grade AI support infrastructure and visual diagnostic platform",
    version="1.0.0"
)

# Enable CORS for Next.js/React standard frontends
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins in local dev; restrict in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure uploads directory is mounted statically to serve screenshots
UPLOADS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "static")
os.makedirs(os.path.join(UPLOADS_DIR, "uploads"), exist_ok=True)
app.mount("/static", StaticFiles(directory=UPLOADS_DIR), name="static")

# Mount API routers
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(chat_router, prefix=settings.API_V1_STR)
app.include_router(ticket_router, prefix=settings.API_V1_STR)
app.include_router(diag_router, prefix=settings.API_V1_STR)
app.include_router(analytics_router, prefix=settings.API_V1_STR)


# Seed database tables on server startup if blank
@app.on_event("startup")
def seed_database():
    db = SessionLocal()
    try:
        # 1. Seed demo users
        user_count = db.query(User).count()
        if user_count == 0:
            print("[VISIOCARE] Seeding demo users...")
            
            demo_agent = User(
                email="agent@visiocare.com",
                hashed_password=get_password_hash("visiocareagent123"),
                full_name="Alex Mercer (VLM Specialist)",
                role="agent"
            )
            demo_customer = User(
                email="customer@visiocare.com",
                hashed_password=get_password_hash("visiocarecustomer123"),
                full_name="Sarah Connor",
                role="customer"
            )
            
            db.add(demo_agent)
            db.add(demo_customer)
            db.commit()
            print("[VISIOCARE] Demo users seeded successfully.")
            
        # 2. Seed Knowledge Base articles
        kb_count = db.query(KnowledgeBase).count()
        if kb_count == 0:
            print("[VISIOCARE] Seeding Knowledge Base vector search indices...")
            for item in SemanticRetrievalEngine.KNOWLEDGE_BASE:
                kb_article = KnowledgeBase(
                    id=item["id"],
                    category=item["category"],
                    title=item["title"],
                    content=item["content"],
                    keywords=item["keywords"]
                )
                db.add(kb_article)
            db.commit()
            print("[VISIOCARE] Knowledge Base indexes seeded successfully.")
            
    except Exception as e:
        print(f"[VISIOCARE ERROR] Seeding database failed: {str(e)}")
    finally:
        db.close()


@app.get("/")
def read_root():
    return {
        "status": "online",
        "system": settings.PROJECT_NAME,
        "mode": "hybrid_vlm",
        "documentation": "/docs"
    }
