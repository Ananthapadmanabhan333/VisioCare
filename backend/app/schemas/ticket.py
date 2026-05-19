from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
from backend.app.schemas.auth import UserResponse

class TicketCreate(BaseModel):
    conversation_id: str
    subject: str
    description: str
    priority: Optional[str] = "medium"

class TicketUpdate(BaseModel):
    status: Optional[str] = None
    priority: Optional[str] = None
    assigned_agent_id: Optional[str] = None
    root_cause_prediction: Optional[str] = None
    resolution_steps: Optional[List[str]] = None

class TicketResponse(BaseModel):
    id: str
    conversation_id: str
    assigned_agent_id: Optional[str] = None
    subject: str
    description: str
    status: str
    priority: str
    root_cause_prediction: Optional[str] = None
    ai_escalation_summary: Optional[str] = None
    resolution_steps: Optional[List[str]] = None
    created_at: datetime
    updated_at: datetime
    agent: Optional[UserResponse] = None

    class Config:
        from_attributes = True
