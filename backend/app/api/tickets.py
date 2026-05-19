from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from backend.app.core.database import get_db
from backend.app.models.ticket import SupportTicket
from backend.app.models.conversation import Conversation, Message
from backend.app.models.user import User
from backend.app.api.auth import get_current_user
from backend.app.schemas.ticket import TicketResponse, TicketCreate, TicketUpdate

router = APIRouter(prefix="/tickets", tags=["AI Escalations & Support Tickets"])


@router.get("", response_model=List[TicketResponse])
def list_tickets(status_filter: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(SupportTicket)
    if status_filter:
        query = query.filter(SupportTicket.status == status_filter)
    tickets = query.order_by(SupportTicket.updated_at.desc()).all()
    return tickets


@router.post("", response_model=TicketResponse, status_code=status.HTTP_201_CREATED)
def create_ticket_escalation(ticket_in: TicketCreate, db: Session = Depends(get_db)):
    # 1. Fetch related conversation history
    conv = db.query(Conversation).filter(Conversation.id == ticket_in.conversation_id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Related conversation not found")
        
    # Check if a ticket already exists for this conversation
    existing_ticket = db.query(SupportTicket).filter(SupportTicket.conversation_id == ticket_in.conversation_id).first()
    if existing_ticket:
        return existing_ticket

    # 2. Extract technical and diagnostic logs from previous messages to compile the summary
    messages = db.query(Message).filter(Message.conversation_id == conv.id).order_by(Message.created_at.asc()).all()
    
    diagnostic_traces = []
    ocr_lines = []
    last_detected_error = "UNKNOWN_EXCEPTION"
    last_root_cause = "No visual diagnostics run."
    last_resolutions = []
    
    for msg in messages:
        if msg.ocr_payload and msg.ocr_payload.get("text"):
            ocr_lines.append(msg.ocr_payload.get("text"))
        if msg.diagnostic_payload:
            payload = msg.diagnostic_payload
            if payload.get("error_code"):
                last_detected_error = payload.get("error_code")
            if payload.get("root_cause"):
                last_root_cause = payload.get("root_cause")
            if payload.get("troubleshooting_steps"):
                last_resolutions = payload.get("troubleshooting_steps")
            
            trace_entry = f"Sender: {msg.sender_type} | Code: {payload.get('error_code')} | Cause: {payload.get('root_cause')}"
            diagnostic_traces.append(trace_entry)

    # 3. Formulate the AI escalation summary reports
    frustration_report = conv.emotion_summary or {"average_frustration": 10}
    ai_summary = (
        f"### AI AUTOMATED ESCALATION PROTOCOL REPORT\n\n"
        f"**System Failure Profile:** {last_detected_error}\n"
        f"**Customer Frustration Index:** {frustration_report.get('average_frustration')}/100\n"
        f"**Visual OCR Scans:** {' '.join(ocr_lines[:2]) if ocr_lines else 'None'}\n\n"
        f"**Predicted Core Root Cause:** {last_root_cause}\n\n"
        f"**Conversational Diagnostic Log:**\n"
    )
    for trace in diagnostic_traces:
        ai_summary += f"- {trace}\n"

    # Update conversation status to escalated
    conv.status = "escalated"

    # 4. Create SupportTicket
    db_ticket = SupportTicket(
        conversation_id=ticket_in.conversation_id,
        subject=ticket_in.subject,
        description=ticket_in.description,
        status="open",
        priority=ticket_in.priority or conv.priority or "medium",
        root_cause_prediction=last_detected_error,
        ai_escalation_summary=ai_summary,
        resolution_steps=last_resolutions or ["Re-examine screenshot OCR bounds", "Contact client support"]
    )
    db.add(db_ticket)
    db.commit()
    db.refresh(db_ticket)
    return db_ticket


@router.get("/{ticket_id}", response_model=TicketResponse)
def get_ticket(ticket_id: str, db: Session = Depends(get_db)):
    ticket = db.query(SupportTicket).filter(SupportTicket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return ticket


@router.put("/{ticket_id}", response_model=TicketResponse)
def update_ticket(
    ticket_id: str,
    ticket_update: TicketUpdate,
    db: Session = Depends(get_db)
):
    ticket = db.query(SupportTicket).filter(SupportTicket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
        
    update_data = ticket_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(ticket, key, value)
        
    # If the ticket is resolved, we can resolve the related conversation as well!
    if ticket.status == "resolved":
        conv = db.query(Conversation).filter(Conversation.id == ticket.conversation_id).first()
        if conv:
            conv.status = "resolved"
            
    db.commit()
    db.refresh(ticket)
    return ticket
