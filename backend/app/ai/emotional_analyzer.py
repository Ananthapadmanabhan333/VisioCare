import re
from typing import Dict, Any

class EmotionalAnalyzer:
    """
    Analyzes user utterances and typing patterns for frustration, urgency, and sentiment.
    Guides the AI to adjust response tone or automatically trigger service escalation.
    """
    
    FRUSTRATION_KEYWORDS = [
        r"broken", r"worst", r"unusable", r"useless", r"garbage", r"ridiculous",
        r"frustrated", r"furious", r"disaster", r"hate", r"annoyed", r"stupid",
        r"crap", r"terrible", r"nonsense", r"fail", r"sucks", r"slow", r"waiting"
    ]
    
    URGENCY_KEYWORDS = [
        r"asap", r"urgently", r"emergency", r"immediately", r"production down",
        r"system down", r"now", r"critical", r"stop", r"losing money"
    ]

    @classmethod
    def analyze_message(cls, text: str) -> Dict[str, Any]:
        """
        Runs comprehensive linguistic heuristic filters on the user's input.
        Returns sentiment, frustration score, urgency level, and response guidance.
        """
        text_lower = text.lower()
        
        # 1. Check for capitalization patterns (ALL CAPS SHOUTING)
        # Exclude small single words or abbreviations
        words = text.split()
        caps_words = [w for w in words if w.isupper() and len(w) > 2]
        shouting_ratio = len(caps_words) / len(words) if words else 0.0
        
        # 2. Check for punctuation patterns (multiple exclamation/question marks)
        exclamation_matches = len(re.findall(r"!{2,}", text))
        question_matches = len(re.findall(r"\?{2,}", text))
        
        # 3. Keyword matches
        frustration_hits = 0
        for kw in cls.FRUSTRATION_KEYWORDS:
            matches = re.findall(kw, text_lower)
            frustration_hits += len(matches)
            
        urgency_hits = 0
        for kw in cls.URGENCY_KEYWORDS:
            matches = re.findall(kw, text_lower)
            urgency_hits += len(matches)
            
        # 4. Calculate scores
        # Frustration Score: 0 to 100
        frustration_score = 10  # Base line
        frustration_score += frustration_hits * 15
        frustration_score += int(shouting_ratio * 40)
        frustration_score += exclamation_matches * 15
        frustration_score += question_matches * 10
        frustration_score = min(max(frustration_score, 0), 100)
        
        # Urgency Score: 0 to 100
        urgency_score = 10
        urgency_score += urgency_hits * 25
        urgency_score += exclamation_matches * 10
        if "down" in text_lower or "critical" in text_lower or "losing money" in text_lower:
            urgency_score += 40
        urgency_score = min(max(urgency_score, 0), 100)
        
        # 5. Determine emotional category
        if frustration_score > 70:
            sentiment = "highly_frustrated"
            tone_guidance = (
                "APOLOGETIC & COMPASSIONATE: Acknowledge the user's frustration immediately. "
                "Do not use generic assistant filler words. Keep explanations brief and solution-focused. "
                "Offer a clear diagnostic step or immediate manual escalation option."
            )
            should_escalate = True
        elif frustration_score > 45:
            sentiment = "annoyed"
            tone_guidance = (
                "EMPATHETIC & DIRECT: Reassure the user, confirm understanding of the difficulty, "
                "and explain the root cause clearly without technical jargon. Focus on concrete remediation steps."
            )
            should_escalate = False
        elif urgency_score > 65:
            sentiment = "anxious_urgent"
            tone_guidance = (
                "ACTION-ORIENTED & CONCISE: Address the time-critical nature of the incident. "
                "Prioritize speed, state your troubleshooting hypothesis, and proceed directly to technical steps."
            )
            should_escalate = True
        else:
            sentiment = "neutral"
            tone_guidance = (
                "PROFESSIONAL & COLLABORATIVE: Walk the user through standard diagnostic steps. "
                "Be helpful, polite, and thorough."
            )
            should_escalate = False
            
        return {
            "frustration_score": frustration_score,
            "urgency_score": urgency_score,
            "detected_sentiment": sentiment,
            "tone_guidance": tone_guidance,
            "escalation_recommended": should_escalate
        }
