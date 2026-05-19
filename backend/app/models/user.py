from sqlalchemy import Column, String, DateTime
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
from backend.app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=True)
    role = Column(String(50), default="customer") # customer, agent, admin
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    conversations = relationship("Conversation", back_populates="user")
    tickets = relationship("SupportTicket", back_populates="agent", foreign_keys="SupportTicket.assigned_agent_id")
