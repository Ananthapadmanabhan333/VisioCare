from sqlalchemy import Column, String, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
from backend.app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class SupportTicket(Base):
    __tablename__ = "support_tickets"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    conversation_id = Column(String(36), ForeignKey("conversations.id"), nullable=False)
    assigned_agent_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    subject = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    status = Column(String(50), default="open")  # open, in_progress, pending, resolved
    priority = Column(String(50), default="medium")  # low, medium, high, critical
    root_cause_prediction = Column(String(255), nullable=True)
    ai_escalation_summary = Column(Text, nullable=True)
    resolution_steps = Column(JSON, nullable=True)  # List of recommended actions
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    conversation = relationship("Conversation", back_populates="ticket")
    agent = relationship("User", back_populates="tickets", foreign_keys=[assigned_agent_id])
