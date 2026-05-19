from sqlalchemy import Column, String, DateTime, Text, JSON
import uuid
from datetime import datetime
from backend.app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class KnowledgeBase(Base):
    __tablename__ = "knowledge_base"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    category = Column(String(100), index=True, nullable=False) # e.g. Hardware, Payment, Account
    title = Column(String(255), index=True, nullable=False)
    content = Column(Text, nullable=False)
    keywords = Column(JSON, nullable=True) # List of keywords/tags
    created_at = Column(DateTime, default=datetime.utcnow)


class TroubleshootingSession(Base):
    __tablename__ = "troubleshooting_sessions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    client_os = Column(String(50), nullable=True)
    client_browser = Column(String(50), nullable=True)
    network_latency_ms = Column(String(50), nullable=True)
    console_logs = Column(Text, nullable=True)  # Captured console logs
    diagnostic_code = Column(String(100), nullable=True)
    status = Column(String(50), default="diagnosed")
    created_at = Column(DateTime, default=datetime.utcnow)
