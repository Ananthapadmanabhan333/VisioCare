from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class MessageCreate(BaseModel):
    content: str
    screenshot_url: Optional[str] = None

class MessageResponse(BaseModel):
    id: str
    conversation_id: str
    sender_type: str  # user, assistant, system
    content: str
    screenshot_url: Optional[str] = None
    ocr_payload: Optional[Dict[str, Any]] = None
    diagnostic_payload: Optional[Dict[str, Any]] = None
    emotion_payload: Optional[Dict[str, Any]] = None
    reasoning_trace: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class ConversationCreate(BaseModel):
    title: Optional[str] = "New Support Session"

class ConversationResponse(BaseModel):
    id: str
    user_id: Optional[str] = None
    title: str
    status: str
    priority: str
    emotion_summary: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: datetime
    messages: Optional[List[MessageResponse]] = None

    class Config:
        from_attributes = True
