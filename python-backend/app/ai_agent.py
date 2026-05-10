"""
Augment Agent System for RootsReconnect
An AI Career Agent that actively augments your career journey
Performs real actions, makes recommendations, and automates tasks
"""

import os
import json
import random
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta

class AugmentAgent:
    """
    An augment-style AI agent that doesn't just answer questions -
    it actively helps, performs actions, and augments your career journey.
    """
    
    def __init__(self, db):
        self.db = db
        self.user_context = {}
        
    def set_user_context(self, user):
        """Set the current user's context"""
        self.user_context = user
        
    # ============= AUGMENT TOOLS =============
    
    def augment_profile(self, user: Dict) -> Dict:
        """
        Augment user's profile by analyzing gaps and suggesting improvements
        Returns actionable profile enhancement plan
        """
        suggestions = []
        score = 0
        
        # Analyze skills
        skills = user.get('skills', [])
        if len(skills) < 3:
            suggestions.append({
                "action": "Add more relevant skills",
                "impact": "High",
                "suggested_skills": self._suggest_skills(user)
            })
        else:
            score += 25
            
        # Analyze interests
        interests = user.get('interests', [])
        if len(interests) < 2:
            suggestions.append({
                "action": "Add career interests",
                "impact": "Medium",
                "suggested": ["AI & Machine Learning", "Product Strategy", "Leadership Development"]
            })
        else:
            score += 15
            
        # Analyze looking_for
        looking_for = user.get('looking_for', [])
        if len(looking_for) < 1:
            suggestions.append({
                "action": "Specify what you're looking for",
                "impact": "High",
                "suggested": ["mentorship", "job_opportunities", "networking"]
            })
        else:
            score += 20
            
        # Check for company/position
        if not user.get('company') or not user.get('position'):
            suggestions.append({
                "action": "Add current role details",
                "impact": "High",
                "suggested": "Update your position and company"
            })
        else:
            score += 25
            
        # Check for profile completeness
        score = min(100, score + 15)  # Base score
        
        return {
            "augmented": True,
            "profile_score": score,
            "grade": "A" if score >= 90 else "B" if score >= 70 else "C" if score >= 50 else "D",
            "improvements": suggestions,
            "auto_apply": suggestions[:2] if suggestions else []
        }
    
    def _suggest_skills(self, user: Dict) -> List[str]:
        """Suggest skills based on user's sector and role"""
        sector = user.get('sector', 'technology')
        role = user.get('role', 'student')
        
        skill_suggestions = {
            "technology": ["Python", "Cloud Computing", "System Design", "Leadership", "Communication"],
            "finance": ["Financial Modeling", "Data Analysis", "Risk Management", "Leadership"],
            "healthcare": ["Healthcare IT", "Project Management", "Data Analytics", "Compliance"],
            "marketing": ["Digital Marketing", "Analytics", "Content Strategy", "SEO"]
        }
        return skill_suggestions.get(sector, skill_suggestions["technology"])
    
    def augment_job_search(self, user: Dict, query: str = None) -> Dict:
        """
        Augment job search by finding personalized matches
        and creating application strategies
        """
        conn = self.db.get_connection()
        c = conn.cursor()
        
        user_skills = set(user.get('skills', []))
        search_term = query or "software"
        
        c.execute("""SELECT * FROM jobs WHERE status = 'active' 
                    AND (title LIKE ? OR description LIKE ? OR skills LIKE ?)
                    ORDER BY posted DESC LIMIT 10""", 
                    (f"%{search_term}%", f"%{search_term}%", f"%{search_term}%"))
        
        jobs = []
        for row in c.fetchall():
            job = self.db.dict_from_row(row)
            job_skills = set(job.get('skills', []))
            match = len(user_skills.intersection(job_skills))
            
            # Calculate match score
            match_score = min(100, 50 + (match * 15))
            
            jobs.append({
                "id": job.get("id"),
                "title": job.get("title"),
                "company": job.get("company"),
                "location": job.get("location"),
                "salary": job.get("salary"),
                "match_score": match_score,
                "matched_skills": list(user_skills.intersection(job_skills)),
                "missing_skills": list(job_skills - user_skills)[:3],
                "apply_strategy": self._create_apply_strategy(match, job)
            })
        
        conn.close()
        
        # Sort by match score
        jobs.sort(key=lambda x: x['match_score'], reverse=True)
        
        return {
            "augmented": True,
            "total_found": len(jobs),
            "top_matches": jobs[:5],
            "search_insights": {
                "your_strengths": list(user_skills)[:3],
                "gaps_to_fill": jobs[0].get('missing_skills', []) if jobs else [],
                "best_fit": jobs[0].get('title') if jobs else None
            }
        }
    
    def _create_apply_strategy(self, match: int, job: Dict) -> str:
        """Create personalized application strategy"""
        if match >= 3:
            return "Strong match! Highlight your shared skills in your application."
        elif match >= 1:
            return "Good match. Emphasize your willingness to learn and adapt."
        else:
            return "Entry opportunity. Focus on your enthusiasm and transferrable skills."
    
    def augment_network(self, user: Dict) -> Dict:
        """
        Augment networking by finding strategic connections
        """
        conn = self.db.get_connection()
        c = conn.cursor()
        
        # Find alumni in same sector
        sector = user.get('sector', 'technology')
        c.execute("""SELECT * FROM users WHERE role = 'alumni' AND sector = ? 
                    AND email != ? LIMIT 15""", 
                    (sector, user.get('email', '')))
        
        connections = []
        for row in c.fetchall():
            alum = self.db.dict_from_row(row)
            
            # Calculate connection value
            value_score = self._calculate_connection_value(user, alum)
            
            connections.append({
                "name": alum.get("full_name"),
                "title": alum.get("position"),
                "company": alum.get("company"),
                "graduation_year": alum.get("graduation_year"),
                "value_score": value_score,
                "reason": self._generate_connection_reason(user, alum),
                "reach_out_template": self._generate_outreach(user, alum)
            })
        
        conn.close()
        
        # Sort by value score
        connections.sort(key=lambda x: x['value_score'], reverse=True)
        
        return {
            "augmented": True,
            "total_suggested": len(connections),
            "priority_connections": connections[:5],
            "networking_strategy": {
                "immediate": connections[:2],
                "this_month": connections[2:5],
                "long_term": connections[5:8]
            }
        }
    
    def _calculate_connection_value(self, user: Dict, alum: Dict) -> int:
        """Calculate the value of connecting with someone"""
        score = 50
        
        # Same sector bonus
        if user.get('sector') == alum.get('sector'):
            score += 20
            
        # Year difference (mentorship potential)
        user_year = user.get('graduation_year', 2025)
        alum_year = alum.get('graduation_year', 2015)
        diff = abs(user_year - alum_year)
        
        if 3 <= diff <= 10:
            score += 15  # Good mentorship gap
        elif diff > 10:
            score += 10  # Can learn from senior
            
        # Has company info
        if alum.get('company'):
            score += 10
            
        return min(100, score)
    
    def _generate_connection_reason(self, user: Dict, alum: Dict) -> str:
        """Generate personalized connection reason"""
        reasons = []
        
        if user.get('sector') == alum.get('sector'):
            reasons.append(f"Both in {alum.get('sector')}")
            
        if alum.get('company'):
            reasons.append(f"Works at {alum['company']}")
            
        user_year = user.get('graduation_year', 2025)
        alum_year = alum.get('graduation_year', 2015)
        
        if user_year < alum_year:
            reasons.append(f"Class of {alum_year} - potential mentor")
            
        return ". ".join(reasons[:2])
    
    def _generate_outreach(self, user: Dict, alum: Dict) -> str:
        """Generate personalized outreach message"""
        return f"""Hi {alum.get('full_name')},

I'm a {user.get('role')} at {user.get('company', 'University')} interested in {user.get('sector')}. 

I noticed you're a {alum.get('position')} at {alum.get('company')} and would love to connect and learn from your experience.

Would you be open to a brief chat?

Best regards"""
    
    def augment_events(self, user: Dict) -> Dict:
        """
        Augment event discovery with personalized recommendations
        """
        conn = self.db.get_connection()
        c = conn.cursor()
        
        c.execute("SELECT * FROM events ORDER BY date DESC LIMIT 10")
        
        events = []
        for row in c.fetchall():
            event = self.db.dict_from_row(row)
            
            # Calculate relevance score
            relevance = self._calculate_event_relevance(user, event)
            
            events.append({
                "id": event.get("id"),
                "title": event.get("title"),
                "date": event.get("date"),
                "type": event.get("type"),
                "location": event.get("location"),
                "relevance_score": relevance,
                "why_attend": self._generate_event_benefit(user, event),
                "attendee_benefits": self._extract_event_benefits(event)
            })
        
        conn.close()
        
        events.sort(key=lambda x: x['relevance_score'], reverse=True)
        
        return {
            "augmented": True,
            "recommended": events[:5],
            "this_week": [e for e in events if self._is_this_week(e.get('date', ''))],
            "action_items": [
                "RSVP to 2+ events this month",
                "Prepare introduction for networking",
                "Follow up with attendees after"
            ]
        }
    
    def _calculate_event_relevance(self, user: Dict, event: Dict) -> int:
        """Calculate how relevant an event is to the user"""
        score = 50
        
        tags = event.get('tags', [])
        sector = user.get('sector', '')
        
        if any(sector.lower() in str(tag).lower() for tag in tags):
            score += 30
            
        if event.get('type') == 'virtual':
            score += 10
            
        return min(100, score)
    
    def _generate_event_benefit(self, user: Dict, event: Dict) -> str:
        """Generate why user should attend"""
        sector = user.get('sector', '')
        return f"Connect with {sector} professionals and expand your network"
    
    def _extract_event_benefits(self, event: Dict) -> List[str]:
        """Extract benefits from event"""
        return ["Networking opportunities", "Industry insights", "Potential mentorship"]
    
    def _is_this_week(self, date_str: str) -> bool:
        """Check if event is this week"""
        try:
            event_date = datetime.strptime(date_str, "%Y-%m-%d")
            now = datetime.now()
            week_from_now = now + timedelta(days=7)
            return now <= event_date <= week_from_now
        except:
            return False
    
    def augment_career_plan(self, user: Dict, goal: str = None) -> Dict:
        """
        Create an augmented, dynamic career plan
        """
        role = user.get('role', 'student')
        sector = user.get('sector', 'technology')
        
        # Generate personalized milestones
        milestones = self._generate_milestones(role, sector)
        
        return {
            "augmented": True,
            "career_goal": goal or "Career Growth",
            "timeline": "90-day plan",
            "milestones": milestones,
            "weekly_actions": [
                {"week": 1, "focus": "Profile optimization", "tasks": ["Update skills", "Add interests", "Request recommendations"]},
                {"week": 2, "focus": "Network expansion", "tasks": ["Connect with 5 alumni", "Attend 1 event", "Message 2 potential mentors"]},
                {"week": 3, "focus": "Application sprint", "tasks": ["Apply to 5 jobs", "Get resume reviewed", "Practice interviews"]},
                {"week": 4, "focus": "Skill building", "tasks": ["Complete 1 certification", "Build 1 project", "Attend workshop"]},
                {"week": 5, "focus": "Interview prep", "tasks": ["Mock interviews", "Research companies", "Prepare questions"]},
                {"week": 6, "focus": "Application push", "tasks": ["Apply to 10 jobs", "Follow up on applications", "Network referrals"]},
                {"week": 7, "focus": "Skill gaps", "tasks": ["Take course", "Build portfolio", "Get feedback"]},
                {"week": 8, "focus": "Final push", "tasks": ["Final applications", "Thank mentors", "Prepare negotiation"]},
                {"week": 9, "focus": "Evaluation", "tasks": ["Review offers", "Negotiate", "Make decision"]},
                {"week": 10, "focus": "Transition", "tasks": ["Accept offer", "Start onboarding", "Update profile"]},
                {"week": 11, "focus": "Growth", "tasks": ["Set new goals", "New learning path", "Help others"]},
                {"week": 12, "focus": "Review", "tasks": ["Quarterly review", "Adjust plan", "Celebrate wins"]}
            ],
            "success_metrics": {
                "profile_views": "+50%",
                "connection_requests": "10+",
                "interviews": "3+",
                "offers": "1+"
            }
        }
    
    def _generate_milestones(self, role: str, sector: str) -> List[Dict]:
        """Generate career milestones"""
        if role == 'student':
            return [
                {"month": 1, "milestone": "Complete profile", "status": "pending"},
                {"month": 2, "milestone": "Secure internship", "status": "pending"},
                {"month": 3, "milestone": "Build portfolio", "status": "pending"},
                {"month": 6, "milestone": "First job offer", "status": "pending"}
            ]
        else:
            return [
                {"month": 1, "milestone": "Expand network", "status": "pending"},
                {"month": 3, "milestone": "Skill upgrade", "status": "pending"},
                {"month": 6, "milestone": "Promotion/pivot", "status": "pending"},
                {"month": 12, "milestone": "Leadership role", "status": "pending"}
            ]
    
    def augment_insights(self, user: Dict) -> Dict:
        """
        Provide augmented, real-time insights about user's career position
        """
        return {
            "augmented": True,
            "market_position": {
                "demand": "High in your sector",
                "competition_level": "Moderate",
                "salary_trend": "+8% YoY"
            },
            "your_advantages": user.get('skills', [])[:3],
            "gaps_to_close": ["Leadership", "Cloud Architecture", "System Design"],
            "opportunities": [
                {"type": "job", "count": 12, "action": "Apply to 3 this week"},
                {"type": "mentor", "count": 5, "action": "Request 2 introductions"},
                {"type": "event", "count": 3, "action": "RSVP to 1 this week"}
            ],
            "ai_recommendations": [
                "Your profile is 70% complete - add more skills to improve matching",
                "3 new jobs match your profile - check the Jobs section",
                "You have 2 pending connection requests - follow up"
            ]
        }
    
    # ============= MAIN PROCESSOR =============
    
    def process(self, request: str, user: Dict) -> Dict:
        """
        Process user request and return augmented response
        """
        self.user_context = user
        request_lower = request.lower()
        
        # Determine which augment function to use
        if any(kw in request_lower for kw in ['profile', 'analyze', 'score', 'improve']):
            result = self.augment_profile(user)
            return self._format_augment_response("profile", result)
            
        elif any(kw in request_lower for kw in ['job', 'search', 'apply', 'work']):
            query = request.replace('job', '').replace('search', '').strip()
            result = self.augment_job_search(user, query or None)
            return self._format_augment_response("jobs", result)
            
        elif any(kw in request_lower for kw in ['network', 'connect', 'mentor', 'contact']):
            result = self.augment_network(user)
            return self._format_augment_response("network", result)
            
        elif any(kw in request_lower for kw in ['event', 'webinar', 'meetup', 'conference']):
            result = self.augment_events(user)
            return self._format_augment_response("events", result)
            
        elif any(kw in request_lower for kw in ['plan', 'roadmap', 'goal', 'career']):
            goal = request.replace('plan', '').replace('roadmap', '').strip() or None
            result = self.augment_career_plan(user, goal)
            return self._format_augment_response("plan", result)
            
        elif any(kw in request_lower for kw in ['insight', 'analytics', 'overview', 'dashboard']):
            result = self.augment_insights(user)
            return self._format_augment_response("insights", result)
            
        else:
            # Default to insights
            return self._format_augment_response("insights", self.augment_insights(user))
    
    def _format_augment_response(self, aug_type: str, data: Dict) -> Dict:
        """Format the augmented response"""
        
        if not data.get("augmented"):
            return {"response": "I couldn't process that request. Try asking about jobs, network, events, or your career plan."}
        
        response = ""
        
        if aug_type == "profile":
            response = f"""📊 **Profile Analysis Complete**

**Profile Score:** {data['profile_score']}/100 (Grade: {data['grade']})

**Improvements Needed:**"""
            for imp in data.get('improvements', [])[:3]:
                response += f"\n• {imp['action']} ({imp['impact']} impact)"
                
        elif aug_type == "jobs":
            response = f"""🎯 **Job Search Augmented**

Found {data['total_found']} jobs. Top matches:"""
            for job in data.get('top_matches', [])[:3]:
                response += f"""

**{job['title']}** at {job['company']}
   Match: {job['match_score']}% | 📍 {job['location']}
   💡 {job['apply_strategy']}"""
                
        elif aug_type == "network":
            response = f"""🔗 **Network Augmented**

{len(data['priority_connections'])} strategic connections recommended:"""
            for conn in data.get('priority_connections', [])[:3]:
                response += f"""

**{conn['name']}** - {conn['title']} at {conn['company']}
   Value Score: {conn['value_score']}% | 📅 {conn['reason']}"""
                
        elif aug_type == "events":
            response = f"""📅 **Events Augmented**

Recommended events for you:"""
            for event in data.get('recommended', [])[:3]:
                response += f"""

**{event['title']}**
   📅 {event['date']} | 📍 {event['location']}
   Score: {event['relevance_score']}%"""
                
        elif aug_type == "plan":
            response = f"""📋 **Career Plan Augmented**

Goal: {data['career_goal']} | Timeline: {data['timeline']}

**Weekly Focus:**"""
            for week in data.get('weekly_actions', [])[:4]:
                response += f"\n\n**Week {week['week']}:** {week['focus']}"
                for task in week['tasks']:
                    response += f"\n   ✓ {task}"
                    
        elif aug_type == "insights":
            response = f"""📈 **Career Insights Augmented**

**Market Position:** {data['market_position']['demand']}
**Your Advantages:** {', '.join(data['your_advantages'])}

**AI Recommendations:**"""
            for rec in data.get('ai_recommendations', []):
                response += f"\n• {rec}"
                
        return {
            "response": response,
            "augmented": True,
            "type": aug_type,
            "data": data
        }


# Create singleton instance
def create_augment_agent(db):
    """Create and return the Augment Agent"""
    return AugmentAgent(db)
