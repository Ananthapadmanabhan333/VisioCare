import sys
import os

# Append project root to python path to verify root-level imports
project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, project_root)

print("Verifying VisioCare backend imports...")
try:
    from backend.app.core.config import settings
    print("[OK] Config settings imported successfully")
    
    from backend.app.core.database import Base, get_db
    print("[OK] Database session helpers imported successfully")
    
    from backend.app.models.user import User
    from backend.app.models.conversation import Conversation, Message
    from backend.app.models.ticket import SupportTicket
    from backend.app.models.session import KnowledgeBase, TroubleshootingSession
    print("[OK] SQLAlchemy models imported successfully")
    
    from backend.app.schemas.auth import UserCreate, Token
    from backend.app.schemas.chat import MessageCreate, ConversationResponse
    from backend.app.schemas.ticket import TicketCreate, TicketUpdate
    from backend.app.schemas.diagnostics import DiagnosticsCreate
    print("[OK] Pydantic schemas imported successfully")
    
    from backend.app.ai.vlm_orchestrator import VLMOrchestrator
    from backend.app.ai.emotional_analyzer import EmotionalAnalyzer
    from backend.app.ai.workflows import TroubleshootingWorkflowEngine
    print("[OK] AI & VLM components imported successfully")
    
    from backend.app.retrieval.knowledge_base import SemanticRetrievalEngine
    print("[OK] Semantic retrieval indices imported successfully")
    
    from backend.app.api.auth import router as auth_router
    from backend.app.api.chat import router as chat_router
    from backend.app.api.tickets import router as ticket_router
    from backend.app.api.diagnostics import router as diag_router
    from backend.app.api.analytics import router as analytics_router
    print("[OK] API routers imported successfully")
    
    import backend.app.main as main
    print("[OK] Main application entry point verified successfully")
    
    print("\nALL VisioCare Python backend imports are valid and error-free!")
    sys.exit(0)
except Exception as e:
    print(f"\n[FAIL] IMPORT ERROR DETECTED: {str(e)}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
