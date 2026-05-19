from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class DiagnosticsCreate(BaseModel):
    client_os: Optional[str] = None
    client_browser: Optional[str] = None
    network_latency_ms: Optional[str] = None
    console_logs: Optional[str] = None
    diagnostic_code: Optional[str] = None

class DiagnosticsResponse(BaseModel):
    id: str
    client_os: Optional[str] = None
    client_browser: Optional[str] = None
    network_latency_ms: Optional[str] = None
    console_logs: Optional[str] = None
    diagnostic_code: Optional[str] = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class KnowledgeBaseSearchQuery(BaseModel):
    query: str
    limit: Optional[int] = 3

class KnowledgeBaseSearchResponse(BaseModel):
    category: str
    title: str
    content: str
    keywords: List[str]
    similarity: float
