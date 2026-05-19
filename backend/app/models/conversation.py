from sqlalchemy import Column, String, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
from backend.app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    title = Column(String(255), default="New Support Session")
    status = Column(String(50), default="active")  # active, resolved, escalated
    priority = Column(String(50), default="medium")  # low, medium, high, critical
    emotion_summary = Column(JSON, nullable=True)  # History of client emotions detected
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="conversations")
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan")
    ticket = relationship("SupportTicket", back_populates="conversation", uselist=False)


class Message(Base):
    __tablename__ = "messages"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    conversation_id = Column(String(36), ForeignKey("conversations.id"), nullable=False)
    sender_type = Column(String(50), nullable=False)  # user, assistant, system
    content = Column(Text, nullable=False)
    screenshot_url = Column(String(1024), nullable=True)
    ocr_payload = Column(JSON, nullable=True)       # OCR text, areas, boundaries
    diagnostic_payload = Column(JSON, nullable=True) # Probable issues and diagnostics
    emotion_payload = Column(JSON, nullable=True)    # Sentiment, frustration score
    reasoning_trace = Column(Text, nullable=True)    # Hidden chain-of-thought for agents
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    conversation = relationship("Conversation", back_populates="messages")
