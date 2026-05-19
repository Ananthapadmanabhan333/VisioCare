from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from backend.app.core.database import get_db
from backend.app.models.session import TroubleshootingSession, KnowledgeBase
from backend.app.schemas.diagnostics import DiagnosticsCreate, DiagnosticsResponse, KnowledgeBaseSearchQuery, KnowledgeBaseSearchResponse
from backend.app.retrieval.knowledge_base import SemanticRetrievalEngine

router = APIRouter(prefix="/diagnostics", tags=["Realtime Diagnostics & KB Search"])


@router.post("/sessions", response_model=DiagnosticsResponse, status_code=status.HTTP_201_CREATED)
def submit_diagnostics(diag_in: DiagnosticsCreate, db: Session = Depends(get_db)):
    # Simple rule matching to auto-diagnose based on console logs or codes
    logs_lower = (diag_in.console_logs or "").lower()
    code = diag_in.diagnostic_code
    
    if not code:
        if "timeout" in logs_lower or "stripe" in logs_lower:
            code = "ERR_STRIPE_GATEWAY_TIMEOUT"
        elif "oom" in logs_lower or "exit code 137" in logs_lower:
            code = "ERR_DOCKER_OOM_KILLED"
        elif "collision" in logs_lower or "dhcp" in logs_lower:
            code = "ERR_NET_IP_COLLISION"
        elif "inaccessible_boot_device" in logs_lower or "0x0000007b" in logs_lower:
            code = "ERR_SYSTEM_BSOD_CRITICAL"
        else:
            code = "ERR_GENERIC_RUNTIME_EXCEPTION"
            
    db_session = TroubleshootingSession(
        client_os=diag_in.client_os,
        client_browser=diag_in.client_browser,
        network_latency_ms=diag_in.network_latency_ms,
        console_logs=diag_in.console_logs,
        diagnostic_code=code,
        status="diagnosed"
    )
    db.add(db_session)
    db.commit()
    db.refresh(db_session)
    return db_session


@router.post("/search", response_model=List[KnowledgeBaseSearchResponse])
def semantic_kb_search(query_in: KnowledgeBaseSearchQuery):
    results = SemanticRetrievalEngine.search(query=query_in.query, limit=query_in.limit)
    response_items = []
    
    for res in results:
        art = res["article"]
        response_items.append({
            "category": art["category"],
            "title": art["title"],
            "content": art["content"],
            "keywords": art["keywords"],
            "similarity": res["similarity"]
        })
    return response_items
