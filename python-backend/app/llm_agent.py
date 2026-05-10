"""
LLM Integration for RootsReconnect
Supports: Google Gemini (Free), OpenAI GPT-4, Anthropic Claude
"""

import os
from typing import Dict, Optional
from app.config import GEMINI_API_KEY, OPENAI_API_KEY, ANTHROPIC_API_KEY

# Try to import LLM libraries
try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False

try:
    from openai import OpenAI
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False

try:
    from anthropic import Anthropic
    ANTHROPIC_AVAILABLE = True
except ImportError:
    ANTHROPIC_AVAILABLE = False


class LLMAgent:
    """Intelligent LLM-powered career advisor"""
    
    def __init__(self):
        self.provider = None
        self.client = None
        self._initialize()
    
    def _initialize(self):
        """Initialize the best available LLM provider"""
        
        # Try Gemini first (free)
        if GEMINI_AVAILABLE and GEMINI_API_KEY:
            try:
                genai.configure(api_key=GEMINI_API_KEY)
                # Try models in order of preference
                for model_name in ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro']:
                    try:
                        self.client = genai.GenerativeModel(model_name)
                        # Test with a simple call
                        test = self.client.generate_content("Hi")
                        self.provider = "gemini"
                        self.model_name = model_name
                        print(f"✅ Using Google Gemini ({model_name})")
                        return
                    except Exception:
                        continue
            except Exception as e:
                print(f"Gemini init failed: {e}")
        
        # Try OpenAI
        if OPENAI_AVAILABLE and OPENAI_API_KEY:
            try:
                self.client = OpenAI(api_key=OPENAI_API_KEY)
                self.provider = "openai"
                print("Using OpenAI GPT-4")
                return
            except Exception as e:
                print(f"OpenAI init failed: {e}")
        
        # Try Anthropic
        if ANTHROPIC_AVAILABLE and ANTHROPIC_API_KEY:
            try:
                self.client = Anthropic(api_key=ANTHROPIC_API_KEY)
                self.provider = "anthropic"
                print("Using Anthropic Claude")
                return
            except Exception as e:
                print(f"Anthropic init failed: {e}")
        
        print("No LLM configured - using fallback responses")
    
    def chat(self, message: str, user_context: Dict) -> str:
        """Send message to LLM and get intelligent response"""
        self.user_context = user_context  # store for fallback use

        if not self.client:
            return self._fallback_response(message)
        
        # Build context-aware prompt
        prompt = self._build_prompt(message, user_context)
        
        try:
            if self.provider == "gemini":
                response = self.client.generate_content(prompt)
                return response.text
            
            elif self.provider == "openai":
                response = self.client.chat.completions.create(
                    model="gpt-4",
                    messages=[
                        {"role": "system", "content": self._get_system_prompt()},
                        {"role": "user", "content": prompt}
                    ],
                    max_tokens=500,
                    temperature=0.7
                )
                return response.choices[0].message.content
            
            elif self.provider == "anthropic":
                response = self.client.messages.create(
                    model="claude-3-sonnet-20240229",
                    max_tokens=500,
                    messages=[{"role": "user", "content": prompt}]
                )
                return response.content[0].text
            
        except Exception as e:
            print(f"LLM error: {e}")
            return self._fallback_response(message)
        
        return self._fallback_response(message)
    
    def _build_prompt(self, message: str, user: Dict) -> str:
        """Build context-aware prompt"""
        return f"""You are Augment, an AI Career Agent for RootsReconnect alumni network.

User Profile:
- Name: {user.get('full_name', 'User')}
- Role: {user.get('role', 'student')}
- Sector: {user.get('sector', 'technology')}
- Skills: {', '.join(user.get('skills', [])[:5])}
- Interests: {', '.join(user.get('interests', [])[:3])}
- Looking for: {', '.join(user.get('looking_for', []))}

User Question: {message}

Answer the user's specific question directly and concisely. Provide actionable advice tailored to their profile. Keep response under 150 words."""
    
    def _get_system_prompt(self) -> str:
        """System prompt for OpenAI"""
        return """You are Augment, an AI Career Agent for RootsReconnect. Answer user questions directly and specifically. Provide actionable advice based on their profile. Be concise and helpful."""
    
    def _fallback_response(self, message: str) -> str:
        """Smart fallback when no LLM available"""
        msg_lower = message.lower()

        if any(kw in msg_lower for kw in ['hello', 'hi', 'hey', 'how are you']):
            name = self.user_context.get('full_name', 'there') if hasattr(self, 'user_context') else 'there'
            return f"Hi {name.split()[0] if name != 'there' else name}! I'm your AI career advisor. Ask me anything about jobs, networking, skills, or career planning!"

        elif any(kw in msg_lower for kw in ['job', 'work', 'career', 'position', 'salary', 'hire']):
            return "**Job Search Tips:**\n\n• Optimize your profile with relevant skills\n• Network with alumni in target companies\n• Apply to roles matching 70%+ of your skills\n• Alumni referrals increase interview chances by 5x\n\nCheck the Job Board for AI-matched opportunities!"

        elif any(kw in msg_lower for kw in ['network', 'connect', 'mentor', 'alumni']):
            return "**Networking Strategy:**\n\n• Start with alumni 3-10 years ahead in your sector\n• Personalize every connection message\n• Attend virtual events to expand your reach\n• Follow up within 48 hours of connecting\n\nVisit Alumni Mapping to find your best matches!"

        elif any(kw in msg_lower for kw in ['skill', 'learn', 'course', 'certif', 'improve']):
            return "**Skill Development:**\n\n• Identify gaps by comparing your skills with job listings\n• Focus on high-demand skills in your sector\n• Build real projects — practical beats theoretical\n• Get certified to validate expertise\n\nCheck Career Advisor for your personalized learning path!"

        elif any(kw in msg_lower for kw in ['resume', 'cv', 'profile']):
            return "**Resume & Profile Tips:**\n\n• Use the Resume Parser to auto-fill your profile from PDF\n• Add 5+ specific skills (not generic ones)\n• Write a 2-3 sentence bio highlighting your goals\n• Link your LinkedIn and GitHub\n\nA complete profile gets 5x more connection requests!"

        elif any(kw in msg_lower for kw in ['mentor', 'mentorship', 'guide']):
            return "**Finding a Mentor:**\n\n• Visit the Mentorship Hub for AI-matched mentors\n• Look for alumni 5-10 years ahead in your field\n• Send a personalized request explaining your goals\n• Be specific about what you want to learn\n\nMentorship can accelerate your career by 2-3 years!"

        elif any(kw in msg_lower for kw in ['event', 'webinar', 'conference', 'meetup']):
            return "**Events & Networking:**\n\n• Attend virtual events to meet alumni globally\n• Prepare a 30-second intro before each event\n• Follow up with 2-3 people after every event\n• Check the Events page for upcoming opportunities!"

        else:
            sector = self.user_context.get('sector', 'your field') if hasattr(self, 'user_context') else 'your field'
            role = self.user_context.get('role', 'professional') if hasattr(self, 'user_context') else 'professional'
            return f"As a {role} in {sector}, I can help you with:\n\n• **Jobs** — Find AI-matched opportunities\n• **Networking** — Connect with the right alumni\n• **Skills** — Build your learning roadmap\n• **Mentorship** — Get guided career advice\n• **Resume** — Auto-fill your profile from PDF\n\nWhat would you like to explore?"


# Singleton instance
_llm_agent = None

def get_llm_agent() -> LLMAgent:
    global _llm_agent
    if _llm_agent is None:
        _llm_agent = LLMAgent()
    return _llm_agent

def reset_llm_agent():
    global _llm_agent
    _llm_agent = None
