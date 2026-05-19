import os
import uuid
import shutil
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from backend.app.core.database import get_db
from backend.app.models.conversation import Conversation, Message
from backend.app.models.user import User
from backend.app.api.auth import get_current_user
from backend.app.ai.vlm_orchestrator import VLMOrchestrator
from backend.app.ai.emotional_analyzer import EmotionalAnalyzer
from backend.app.retrieval.knowledge_base import SemanticRetrievalEngine
from backend.app.schemas.chat import ConversationResponse, MessageResponse

router = APIRouter(prefix="/conversations", tags=["Chat & Conversations"])

# Ensure uploads folder exists
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "static", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Helper dependency to optionally authenticate guest users
def get_optional_user(db: Session = Depends(get_db), token: Optional[str] = None) -> Optional[User]:
    # Custom light extractor to avoid throwing 401 for guest troubleshooters
    return None


@router.get("", response_model=List[ConversationResponse])
def get_conversations(db: Session = Depends(get_db)):
    conversations = db.query(Conversation).order_by(Conversation.updated_at.desc()).all()
    return conversations


@router.post("", response_model=ConversationResponse, status_code=status.HTTP_201_CREATED)
def create_conversation(title: Optional[str] = Form("New Support Session"), db: Session = Depends(get_db)):
    db_conv = Conversation(
        title=title,
        status="active",
        priority="medium",
        emotion_summary={"average_frustration": 10, "sentiment_history": ["neutral"]}
    )
    db.add(db_conv)
    db.commit()
    db.refresh(db_conv)
    return db_conv


@router.get("/{conversation_id}", response_model=ConversationResponse)
def get_conversation(conversation_id: str, db: Session = Depends(get_db)):
    conv = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return conv


@router.post("/{conversation_id}/messages", response_model=MessageResponse)
async def create_message(
    conversation_id: str,
    content: str = Form(...),
    screenshot: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    conv = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
        
    # 1. Process customer message emotion
    emotion_report = EmotionalAnalyzer.analyze_message(content)
    
    # 2. Save screenshot locally if uploaded
    screenshot_url = None
    image_bytes = None
    image_name = None
    
    if screenshot:
        try:
            image_name = screenshot.filename
            file_ext = os.path.splitext(image_name)[1]
            unique_filename = f"{uuid.uuid4()}{file_ext}"
            file_path = os.path.join(UPLOAD_DIR, unique_filename)
            
            image_bytes = await screenshot.read()
            with open(file_path, "wb") as buffer:
                buffer.write(image_bytes)
                
            # Statically servable link mapping
            screenshot_url = f"/static/uploads/{unique_filename}"
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to process image upload: {str(e)}"
            )

    # 3. Create user message record
    user_msg = Message(
        conversation_id=conversation_id,
        sender_type="user",
        content=content,
        screenshot_url=screenshot_url,
        emotion_payload={
            "frustration_score": emotion_report["frustration_score"],
            "urgency_score": emotion_report["urgency_score"],
            "detected_sentiment": emotion_report["detected_sentiment"]
        }
    )
    db.add(user_msg)
    
    # 4. Trigger AI diagnosis and multimodal understanding pipeline
    vlm_result = {}
    kb_insights = []
    
    # Call orchestrator (runs Gemini or local smart fallback CV logic)
    vlm_result = await VLMOrchestrator.process_multimodal_request(
        message_text=content,
        image_bytes=image_bytes,
        image_name=image_name
    )
    
    # Perform semantic knowledge search for matching documentation
    kb_matches = SemanticRetrievalEngine.search(content)
    kb_insights = [match["article"] for match in kb_matches]

    # Adjust ticket priority prediction if user shows high frustration or critical warning
    priority_level = vlm_result.get("priority", "medium")
    if emotion_report["frustration_score"] > 60:
        priority_level = "high"
    if emotion_report["urgency_score"] > 80:
        priority_level = "critical"
        
    # Build AI assistant response text incorporating VLM results & KB documentation
    ai_content = ""
    if image_bytes:
        ai_content += f"### Visual Diagnostic Analysis ({vlm_result.get('detected_error_code', 'ERR_DETECTED')})\n"
        ai_content += f"**Predicted Root Cause:** {vlm_result.get('root_cause', '')}\n\n"
        ai_content += "#### Step-by-Step Resolution Procedures:\n"
        for i, step in enumerate(vlm_result.get("troubleshooting_steps", []), 1):
            ai_content += f"{i}. {step}\n"
            
        if kb_insights:
            ai_content += "\n#### Related Knowledge Base Manuals:\n"
            for kb in kb_insights:
                ai_content += f"- **[{kb['title']}]** {kb['content'][:140]}...\n"
    else:
        # Text-only semantic matching and conversational assistance
        if kb_insights:
            ai_content += f"I analyzed your request and found some relevant knowledge base entries:\n\n"
            for kb in kb_insights:
                ai_content += f"### {kb['title']}\n{kb['content']}\n\n"
            ai_content += "Based on this, please check the steps above. Let me know if you need to escalate this case to our engineering team."
        else:
            ai_content += (
                f"I've registered your request. Based on my analysis: sentiment is {emotion_report['detected_sentiment']}. "
                f"I'm ready to walk you through diagnostics. If you have an error screen or log screenshot, please upload it "
                f"so I can visually analyze the layout."
            )
            
    # Assemble AI message
    ai_msg = Message(
        conversation_id=conversation_id,
        sender_type="assistant",
        content=ai_content,
        ocr_payload={"text": vlm_result.get("ocr_text", "")} if image_bytes else None,
        diagnostic_payload={
            "error_code": vlm_result.get("detected_error_code"),
            "bounding_boxes": vlm_result.get("bounding_boxes", []),
            "root_cause": vlm_result.get("root_cause"),
            "troubleshooting_steps": vlm_result.get("troubleshooting_steps", []),
            "kb_suggestions": kb_insights,
            "inference_mode": vlm_result.get("inference_mode"),
            "latency_ms": vlm_result.get("latency_ms")
        },
        emotion_payload={
            "frustration_score": emotion_report["frustration_score"],
            "tone_guidance": emotion_report["tone_guidance"]
        },
        reasoning_trace=vlm_result.get("reasoning_trace", "Analyzing text intent and finding semantic database mappings.")
    )
    db.add(ai_msg)
    
    # 5. Update Conversation summary status and priority
    conv.priority = priority_level
    if emotion_report["escalation_recommended"] or vlm_result.get("should_escalate"):
        conv.status = "escalated"
    
    # Append sentiments in dynamic summary history
    history = conv.emotion_summary or {"average_frustration": 10, "sentiment_history": []}
    history["sentiment_history"].append(emotion_report["detected_sentiment"])
    history["average_frustration"] = int((history["average_frustration"] + emotion_report["frustration_score"]) / 2)
    conv.emotion_summary = history
    
    conv.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(ai_msg)
    
    return ai_msg
