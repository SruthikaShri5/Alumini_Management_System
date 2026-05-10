from fastapi import FastAPI, HTTPException, Depends, status, UploadFile, File
from fastapi.responses import StreamingResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import List, Optional
import hashlib
from jose import jwt
from datetime import datetime, timedelta
import os
import json
from fastapi.middleware.cors import CORSMiddleware
from app.database import db

app = FastAPI(title="RootsReconnect API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer()
SECRET_KEY = os.getenv("SECRET_KEY", "rootsreconnect-fixed-secret-key-2024-do-not-change")

# Models
class UserRegister(BaseModel):
    email: str
    password: str
    full_name: str
    role: str = "student"
    sector: str
    graduation_year: int
    skills: List[str]
    interests: List[str]
    looking_for: List[str]
    company: Optional[str] = ""
    position: Optional[str] = ""
    is_rural: Optional[bool] = False
    # is_approved will be set automatically based on role:
    # - admin: auto-approved
    # - alumni: auto-approved (they are verified professionals)
    # - student: pending approval until admin approves

class UserLogin(BaseModel):
    username: str
    password: str

class EventCreate(BaseModel):
    title: str
    date: str
    time: str
    type: str
    location: str
    max_attendees: int
    description: str
    tags: List[str]

class JobCreate(BaseModel):
    title: str
    company: str
    location: str
    type: str
    salary: str
    remote: bool
    description: str
    skills: List[str]

def create_token(email: str):
    payload = {"sub": email, "exp": datetime.utcnow() + timedelta(hours=24)}
    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        email = payload.get("sub")
        if not email:
            raise HTTPException(status_code=401, detail="Invalid token: no email")
        
        conn = db.get_connection()
        c = conn.cursor()
        c.execute("SELECT * FROM users WHERE email = ?", (email,))
        row = c.fetchone()
        conn.close()
        
        if not row:
            raise HTTPException(status_code=401, detail="User not found")
        return db.dict_from_row(row)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")

def require_role(allowed_roles: List[str]):
    def role_checker(current_user = Depends(get_current_user)):
        if current_user["role"] not in allowed_roles:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return current_user
    return role_checker

# Auth Endpoints
@app.post("/api/auth/register")
async def register(user: UserRegister):
    conn = db.get_connection()
    c = conn.cursor()
    
    c.execute("SELECT email FROM users WHERE email = ?", (user.email,))
    if c.fetchone():
        conn.close()
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = hashlib.sha256(user.password.encode()).hexdigest()
    
    # Set is_approved based on role:
    # - admin: auto-approved
    # - alumni: auto-approved (they are verified professionals)
    # - student: pending approval (needs admin approval)
    is_approved = 1 if user.role in ["admin", "alumni"] else 0
    is_rural = 1 if user.is_rural else 0

    c.execute('''INSERT INTO users 
        (email, password, full_name, role, sector, graduation_year, skills, interests,
         looking_for, company, position, is_rural, is_approved, created_at,
         profile_views, connections_count, bio, current_role, location, linkedin, github, twitter, website)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)''',
              (user.email, hashed_password, user.full_name, user.role, user.sector,
               user.graduation_year, json.dumps(user.skills), json.dumps(user.interests),
               json.dumps(user.looking_for), user.company or "", user.position or "",
               is_rural, is_approved, datetime.utcnow().isoformat(), 0, 0,
               "", "", "", "", "", "", ""))
    
    conn.commit()
    conn.close()
    
    if user.role == "student":
        return {"message": "Registration submitted. Waiting for admin approval.", "role": user.role, "approved": False}
    return {"message": "User registered successfully", "role": user.role, "approved": True}

@app.post("/api/auth/login")
async def login(user: UserLogin):
    conn = db.get_connection()
    c = conn.cursor()
    
    c.execute("SELECT * FROM users WHERE email = ?", (user.username,))
    row = c.fetchone()
    conn.close()
    
    if not row:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    stored_user = db.dict_from_row(row)
    hashed_input = hashlib.sha256(user.password.encode()).hexdigest()
    
    if hashed_input != stored_user["password"]:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Check if user is approved (students need admin approval)
    is_approved = stored_user.get("is_approved", 1)
    if is_approved == 0:
        raise HTTPException(status_code=403, detail="Account pending approval. Please wait for admin approval.")
    
    token = create_token(user.username)
    return {
        "access_token": token,
        "token_type": "bearer",
        "role": stored_user["role"],
        "user": {k: v for k, v in stored_user.items() if k != "password"}
    }

@app.get("/api/users/me")
async def get_profile(current_user = Depends(get_current_user)):
    return {k: v for k, v in current_user.items() if k != "password"}

@app.get("/api/users/{email}")
async def get_user_by_email(email: str, current_user = Depends(get_current_user)):
    conn = db.get_connection()
    c = conn.cursor()
    c.execute("SELECT * FROM users WHERE email = ?", (email,))
    row = c.fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="User not found")
    user = db.dict_from_row(row)
    return {k: v for k, v in user.items() if k != "password"}

@app.put("/api/users/me")
async def update_profile(updates: dict, current_user = Depends(get_current_user)):
    conn = db.get_connection()
    c = conn.cursor()
    
    for key, value in updates.items():
        if key not in ["password", "email", "role"]:
            if isinstance(value, list):
                value = json.dumps(value)
            c.execute(f"UPDATE users SET {key} = ? WHERE email = ?", (value, current_user["email"]))
    
    conn.commit()
    conn.close()
    return {"message": "Profile updated"}

# Matching Endpoints
@app.get("/api/matching/suggestions")
async def get_suggestions(mode: str = "semantic", current_user = Depends(get_current_user)):
    conn = db.get_connection()
    c = conn.cursor()
    
    c.execute("SELECT * FROM users WHERE email != ? AND role != 'admin'", (current_user["email"],))
    rows = c.fetchall()
    conn.close()
    
    matches = []
    current_skills = set(current_user.get("skills", []))
    current_interests = set(current_user.get("interests", []))
    current_sector = current_user.get("sector", "")
    current_grad_year = current_user.get("graduation_year", 2020)
    
    for row in rows:
        user_data = db.dict_from_row(row)
        user_skills = set(user_data.get("skills", []))
        user_interests = set(user_data.get("interests", []))
        
        # AI Matching Algorithm
        skill_overlap = len(current_skills.intersection(user_skills))
        interest_overlap = len(current_interests.intersection(user_interests))
        sector_match = 15 if user_data["sector"] == current_sector else 0
        year_diff = abs(current_grad_year - user_data["graduation_year"])
        experience_factor = 10 if 2 <= year_diff <= 5 else 5
        
        # Semantic scoring
        if mode == "semantic":
            compatibility_score = min(98, (
                skill_overlap * 12 + 
                interest_overlap * 10 + 
                sector_match + 
                experience_factor + 
                45
            ))
        else:  # collaborative
            compatibility_score = min(98, (
                skill_overlap * 15 + 
                interest_overlap * 8 + 
                sector_match + 
                50
            ))
        
        if compatibility_score > 50:
            reasons = []
            if skill_overlap > 0:
                common_skills = list(user_skills.intersection(current_skills))[:2]
                reasons.append(f"Shares {skill_overlap} skills: {', '.join(common_skills)}")
            if interest_overlap > 0:
                common_interests = list(user_interests.intersection(current_interests))[:2]
                reasons.append(f"Common interests: {', '.join(common_interests)}")
            if user_data["sector"] == current_sector:
                reasons.append(f"Both work in {user_data['sector']}")
            if 2 <= year_diff <= 5:
                reasons.append(f"Great mentorship potential ({year_diff} years difference)")
            if user_data.get("company"):
                reasons.append(f"Works at {user_data['company']}")
            
            matches.append({
                "user_id": user_data["email"],
                "full_name": user_data["full_name"],
                "sector": user_data["sector"],
                "graduation_year": user_data["graduation_year"],
                "skills": user_data.get("skills", []),
                "company": user_data.get("company", ""),
                "position": user_data.get("position", ""),
                "compatibility_score": compatibility_score,
                "reasons": reasons[:3]
            })
    
    matches.sort(key=lambda x: x["compatibility_score"], reverse=True)
    return {"matches": matches[:20]}

@app.get("/api/matching/insights")
async def get_insights(current_user = Depends(get_current_user)):
    career_stages = {
        "student": "Early Career - Learning Phase",
        "alumni": "Professional - Growth Phase"
    }
    
    return {
        "career_stage": career_stages.get(current_user["role"], "Professional"),
        "networking_potential": 8.5,
        "skill_gaps": ["Leadership", "Public Speaking", "Advanced Analytics"],
        "growth_opportunities": ["Mentorship Programs", "Industry Certifications", "Conference Speaking"]
    }

# AI Agent Endpoint
agent_instance = None
augment_instance = None

@app.post("/api/agent/chat")
async def agent_chat(message: dict, current_user = Depends(get_current_user)):
    global agent_instance, augment_instance

    # Accept both "message" and "query" keys
    query = message.get("message") or message.get("query", "")
    user_context = current_user

    try:
        from app.llm_agent import get_llm_agent
        llm = get_llm_agent()
        response = llm.chat(query, user_context)
        return {"response": response, "powered_by": llm.provider or "fallback"}
    except Exception as e:
        print(f"LLM error: {e}")

    if not augment_instance:
        from app.ai_agent import create_augment_agent
        augment_instance = create_augment_agent(db)

    result = augment_instance.process(query, user_context)
    return result

# Alias for frontend CareerAdvisor component
@app.post("/api/ai/query")
async def ai_query(message: dict, current_user = Depends(get_current_user)):
    return await agent_chat(message, current_user)

@app.get("/api/agent/actions")
async def get_agent_actions(action: str, current_user = Depends(get_current_user)):
    """Direct endpoint for specific augment actions"""
    from app.ai_agent import AugmentAgent
    
    agent = AugmentAgent(db)
    
    if action == "profile":
        return agent.augment_profile(current_user)
    elif action == "jobs":
        return agent.augment_job_search(current_user)
    elif action == "network":
        return agent.augment_network(current_user)
    elif action == "events":
        return agent.augment_events(current_user)
    elif action == "plan":
        return agent.augment_career_plan(current_user)
    elif action == "insights":
        return agent.augment_insights(current_user)
    else:
        return {"error": "Unknown action. Try: profile, jobs, network, events, plan, or insights"}

# Events Endpoints
@app.get("/api/events")
async def get_events(current_user = Depends(get_current_user)):
    conn = db.get_connection()
    c = conn.cursor()
    c.execute("SELECT * FROM events ORDER BY date DESC")
    rows = c.fetchall()
    conn.close()
    
    events = [db.dict_from_row(row) for row in rows]
    return {"events": events}

@app.post("/api/events")
async def create_event(event: EventCreate, current_user = Depends(require_role(["admin", "alumni"]))):
    conn = db.get_connection()
    c = conn.cursor()
    
    c.execute('''INSERT INTO events (title,date,time,type,location,max_attendees,description,
                 tags,host,created_by,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)''',
              (event.title, event.date, event.time, event.type, event.location,
               event.max_attendees, event.description, json.dumps(event.tags),
               current_user["full_name"], current_user["email"], datetime.utcnow().isoformat()))
    
    event_id = c.lastrowid
    conn.commit()
    conn.close()
    
    return {"message": "Event created", "id": event_id}

# Jobs Endpoints
@app.get("/api/jobs")
async def get_jobs(current_user = Depends(get_current_user)):
    conn = db.get_connection()
    c = conn.cursor()
    c.execute("SELECT * FROM jobs WHERE status = 'active' ORDER BY posted DESC")
    rows = c.fetchall()
    conn.close()
    
    jobs = [db.dict_from_row(row) for row in rows]
    user_skills = set(current_user.get("skills", []))
    
    for job in jobs:
        job_skills = set(job.get("skills", []))
        overlap = len(user_skills.intersection(job_skills))
        job["match_score"] = min(95, max(60, overlap * 20 + 50))
    
    return {"jobs": sorted(jobs, key=lambda x: x.get("match_score", 0), reverse=True)}

@app.post("/api/jobs")
async def create_job(job: JobCreate, current_user = Depends(require_role(["admin", "alumni"]))):
    conn = db.get_connection()
    c = conn.cursor()
    
    c.execute('''INSERT INTO jobs (title,company,location,type,salary,remote,description,
                 skills,posted_by,posted) VALUES (?,?,?,?,?,?,?,?,?,?)''',
              (job.title, job.company, job.location, job.type, job.salary, int(job.remote),
               job.description, json.dumps(job.skills), current_user["email"],
               datetime.utcnow().strftime("%Y-%m-%d")))
    
    job_id = c.lastrowid
    conn.commit()
    conn.close()
    
    return {"message": "Job posted", "id": job_id}

# Connections
@app.post("/api/connections/request")
async def send_connection(data: dict, current_user = Depends(get_current_user)):
    target_id = data.get("target_user_id")
    
    conn = db.get_connection()
    c = conn.cursor()
    
    c.execute("SELECT email FROM users WHERE email = ?", (target_id,))
    if not c.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail="User not found")
    
    c.execute('''INSERT INTO connections (from_user,to_user,status,created_at) VALUES (?,?,?,?)''',
              (current_user["email"], target_id, "pending", datetime.utcnow().isoformat()))
    
    conn.commit()
    conn.close()
    return {"message": "Connection request sent"}

@app.get("/api/connections/pending")
async def get_pending(current_user = Depends(get_current_user)):
    conn = db.get_connection()
    c = conn.cursor()
    c.execute("SELECT * FROM connections WHERE to_user = ? AND status = 'pending'",
              (current_user["email"],))
    rows = c.fetchall()
    conn.close()
    pending = [dict(row) for row in rows]
    return {"pending": pending}

@app.get("/api/connections/accepted")
async def get_accepted(current_user = Depends(get_current_user)):
    """Get all accepted connections for current user"""
    conn = db.get_connection()
    c = conn.cursor()
    # Get connections where user is either sender or receiver and status is accepted
    c.execute("""SELECT * FROM connections 
                 WHERE (from_user = ? OR to_user = ?) AND status = 'accepted'""",
              (current_user["email"], current_user["email"]))
    rows = c.fetchall()
    conn.close()
    connections = []
    for row in rows:
        r = dict(row)
        # Get the other person's email
        other_email = r["to_user"] if r["from_user"] == current_user["email"] else r["from_user"]
        r["other_user"] = other_email
        connections.append(r)
    return {"connections": connections}

@app.put("/api/connections/accept")
async def accept_connection(data: dict, current_user = Depends(get_current_user)):
    """Accept a connection request — any user can accept"""
    connection_id = data.get("connection_id")
    conn = db.get_connection()
    c = conn.cursor()
    # Verify the connection exists and is directed to current user
    c.execute("SELECT * FROM connections WHERE id = ? AND to_user = ?",
              (connection_id, current_user["email"]))
    connection = c.fetchone()
    if not connection:
        # Try accepting by id regardless of to_user (fallback)
        c.execute("SELECT * FROM connections WHERE id = ?", (connection_id,))
        connection = c.fetchone()
        if not connection:
            conn.close()
            raise HTTPException(status_code=404, detail="Connection request not found")
    c.execute("UPDATE connections SET status = 'accepted' WHERE id = ?", (connection_id,))
    conn.commit()
    conn.close()
    return {"message": "Connection accepted"}

# Analytics
@app.get("/api/analytics/dashboard")
async def get_analytics(range: str = "30d", current_user = Depends(get_current_user)):
    conn = db.get_connection()
    c = conn.cursor()
    
    if current_user["role"] == "admin":
        c.execute("SELECT COUNT(*) FROM users")
        total_users = c.fetchone()[0]
        
        c.execute("SELECT COUNT(*) FROM users WHERE role = 'alumni'")
        total_alumni = c.fetchone()[0]
        
        c.execute("SELECT COUNT(*) FROM users WHERE role = 'student'")
        total_students = c.fetchone()[0]
        
        c.execute("SELECT COUNT(*) FROM connections")
        total_connections = c.fetchone()[0]
        
        c.execute("SELECT COUNT(*) FROM events")
        total_events = c.fetchone()[0]
        
        c.execute("SELECT COUNT(*) FROM jobs")
        total_jobs = c.fetchone()[0]
        
        c.execute("SELECT sector, COUNT(*) as count FROM users GROUP BY sector")
        sector_rows = c.fetchall()
        
        conn.close()
        
        return {
            "total_users": total_users,
            "total_alumni": total_alumni,
            "total_students": total_students,
            "total_connections": total_connections,
            "total_events": total_events,
            "total_jobs": total_jobs,
            "sector_distribution": [{"sector": row[0], "count": row[1]} for row in sector_rows]
        }
    else:
        conn.close()
        return {
            "total_connections": current_user.get("connections_count", 0),
            "profile_views": current_user.get("profile_views", 0),
            "network_score": 8.7,
            "sector_distribution": []
        }

# Mentorship Endpoints
@app.get("/api/mentorship/matches")
async def get_mentorship_matches(current_user = Depends(get_current_user)):
    conn = db.get_connection()
    c = conn.cursor()
    
    if current_user["role"] == "student":
        c.execute("SELECT * FROM users WHERE role = 'alumni' AND email != ?", (current_user["email"],))
    else:
        c.execute("SELECT * FROM users WHERE role = 'student' AND email != ?", (current_user["email"],))
    
    rows = c.fetchall()
    conn.close()
    
    matches = []
    current_skills = set(current_user.get("skills", []))
    current_interests = set(current_user.get("interests", []))
    
    for row in rows:
        user = db.dict_from_row(row)
        user_skills = set(user.get("skills", []))
        user_interests = set(user.get("interests", []))
        
        skill_match = len(current_skills.intersection(user_skills))
        interest_match = len(current_interests.intersection(user_interests))
        
        match_score = min(95, skill_match * 12 + interest_match * 8 + 55)
        
        if match_score > 65:
            matches.append({
                "id": user["email"],
                "name": user["full_name"],
                "role": user["role"],
                "sector": user["sector"],
                "company": user.get("company", ""),
                "position": user.get("position", ""),
                "skills": user.get("skills", []),
                "interests": user.get("interests", []),
                "match_score": match_score,
                "experience_years": datetime.now().year - user["graduation_year"],
                "success_rate": 92
            })
    
    matches.sort(key=lambda x: x["match_score"], reverse=True)
    return {"matches": matches[:15]}

@app.post("/api/mentorship/request")
async def send_mentorship_request(data: dict, current_user = Depends(get_current_user)):
    mentor_id = data.get("mentor_id")
    message = data.get("message", "")
    
    conn = db.get_connection()
    c = conn.cursor()
    c.execute('''INSERT INTO connections (from_user,to_user,status,created_at) VALUES (?,?,?,?)''',
              (current_user["email"], mentor_id, "pending", datetime.utcnow().isoformat()))
    conn.commit()
    conn.close()
    
    return {"message": "Mentorship request sent"}

# Admin Endpoints
@app.get("/api/admin/users")
async def get_all_users(current_user = Depends(require_role(["admin"]))):
    conn = db.get_connection()
    c = conn.cursor()
    c.execute("SELECT * FROM users")
    rows = c.fetchall()
    conn.close()
    
    users = [{k: v for k, v in db.dict_from_row(row).items() if k != "password"} for row in rows]
    return {"users": users}

@app.delete("/api/admin/users/{email}")
async def delete_user(email: str, current_user = Depends(require_role(["admin"]))):
    conn = db.get_connection()
    c = conn.cursor()
    c.execute("DELETE FROM users WHERE email = ?", (email,))
    conn.commit()
    conn.close()
    return {"message": "User deleted"}

@app.put("/api/admin/users/{email}")
async def update_user(email: str, updates: dict, current_user = Depends(require_role(["admin"]))):
    conn = db.get_connection()
    c = conn.cursor()
    
    for key, value in updates.items():
        if key not in ["password", "email"]:
            if isinstance(value, list):
                value = json.dumps(value)
            c.execute(f"UPDATE users SET {key} = ? WHERE email = ?", (value, email))
    
    conn.commit()
    conn.close()

# Admin approval endpoints
@app.get("/api/admin/pending-users")
async def get_pending_users(current_user = Depends(require_role(["admin"]))):
    """Get all users pending approval (students who registered)"""
    conn = db.get_connection()
    c = conn.cursor()
    c.execute("SELECT * FROM users WHERE is_approved = 0")
    rows = c.fetchall()
    conn.close()
    
    users = [{k: v for k, v in db.dict_from_row(row).items() if k != "password"} for row in rows]
    return {"pending_users": users}

@app.post("/api/admin/approve/{email}")
async def approve_user(email: str, current_user = Depends(require_role(["admin"]))):
    """Approve a user (student) - allows them to login and use the platform"""
    conn = db.get_connection()
    c = conn.cursor()
    
    c.execute("UPDATE users SET is_approved = 1 WHERE email = ?", (email,))
    conn.commit()
    conn.close()
    
    return {"message": f"User {email} has been approved"}

@app.post("/api/admin/reject/{email}")
async def reject_user(email: str, current_user = Depends(require_role(["admin"]))):
    """Reject a user - delete their registration"""
    conn = db.get_connection()
    c = conn.cursor()
    
    c.execute("DELETE FROM users WHERE email = ?", (email,))
    conn.commit()
    conn.close()
    
    return {"message": f"User {email} has been rejected and removed"}

# ============================================================
# MESSAGING SYSTEM
# ============================================================
@app.get("/api/messages/conversations")
async def get_conversations(current_user = Depends(get_current_user)):
    conn = db.get_connection()
    c = conn.cursor()
    c.execute("""
        SELECT DISTINCT 
            CASE WHEN from_user = ? THEN to_user ELSE from_user END as other_user,
            MAX(created_at) as last_time,
            MAX(content) as last_message
        FROM messages WHERE from_user = ? OR to_user = ?
        GROUP BY other_user ORDER BY last_time DESC
    """, (current_user["email"], current_user["email"], current_user["email"]))
    rows = c.fetchall()
    convos = []
    for row in rows:
        other = row[0]
        c.execute("SELECT full_name, sector, company FROM users WHERE email = ?", (other,))
        u = c.fetchone()
        convos.append({
            "other_user": other,
            "other_name": u[0] if u else other,
            "other_sector": u[1] if u else "",
            "other_company": u[2] if u else "",
            "last_message": row[2],
            "last_time": row[1],
            "unread": 0
        })
    conn.close()
    return {"conversations": convos}

@app.get("/api/messages/{other_email}")
async def get_messages(other_email: str, current_user = Depends(get_current_user)):
    conn = db.get_connection()
    c = conn.cursor()
    c.execute("""SELECT * FROM messages 
        WHERE (from_user = ? AND to_user = ?) OR (from_user = ? AND to_user = ?)
        ORDER BY created_at ASC""",
        (current_user["email"], other_email, other_email, current_user["email"]))
    rows = c.fetchall()
    conn.close()
    msgs = [dict(r) for r in rows]
    return {"messages": msgs}

@app.post("/api/messages/{to_email}")
async def send_message(to_email: str, data: dict, current_user = Depends(get_current_user)):
    content = data.get("content", "").strip()
    if not content:
        raise HTTPException(status_code=400, detail="Message cannot be empty")
    conn = db.get_connection()
    c = conn.cursor()
    c.execute("SELECT email FROM users WHERE email = ?", (to_email,))
    if not c.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail="User not found")
    c.execute("INSERT INTO messages (from_user, to_user, content, created_at) VALUES (?,?,?,?)",
              (current_user["email"], to_email, content, datetime.utcnow().isoformat()))
    conn.commit()
    conn.close()
    return {"message": "Sent"}

# ============================================================
# ENDORSEMENTS
# ============================================================
@app.get("/api/endorsements/{email}")
async def get_endorsements(email: str, current_user = Depends(get_current_user)):
    conn = db.get_connection()
    c = conn.cursor()
    c.execute("SELECT * FROM endorsements WHERE target_user = ? ORDER BY created_at DESC", (email,))
    rows = c.fetchall()
    conn.close()
    return {"endorsements": [dict(r) for r in rows]}

@app.post("/api/endorsements/{target_email}")
async def add_endorsement(target_email: str, data: dict, current_user = Depends(get_current_user)):
    skill = data.get("skill", "")
    note = data.get("note", "")
    if not skill:
        raise HTTPException(status_code=400, detail="Skill required")
    conn = db.get_connection()
    c = conn.cursor()
    c.execute("SELECT id FROM endorsements WHERE from_user=? AND target_user=? AND skill=?",
              (current_user["email"], target_email, skill))
    if c.fetchone():
        conn.close()
        raise HTTPException(status_code=400, detail="Already endorsed this skill")
    c.execute("INSERT INTO endorsements (from_user, target_user, skill, note, created_at) VALUES (?,?,?,?,?)",
              (current_user["email"], target_email, skill, note, datetime.utcnow().isoformat()))
    conn.commit()
    conn.close()
    return {"message": "Endorsed"}

# ============================================================
# JOB APPLICATION TRACKER
# ============================================================
@app.get("/api/job-tracker")
async def get_job_tracker(current_user = Depends(get_current_user)):
    conn = db.get_connection()
    c = conn.cursor()
    c.execute("SELECT * FROM job_applications WHERE user_email = ? ORDER BY applied_date DESC",
              (current_user["email"],))
    rows = c.fetchall()
    conn.close()
    return {"applications": [dict(r) for r in rows]}

@app.post("/api/job-tracker")
async def add_job_application(data: dict, current_user = Depends(get_current_user)):
    conn = db.get_connection()
    c = conn.cursor()
    c.execute("""INSERT INTO job_applications 
        (user_email, job_title, company, status, applied_date, notes, job_url)
        VALUES (?,?,?,?,?,?,?)""",
        (current_user["email"], data.get("job_title",""), data.get("company",""),
         data.get("status","applied"), datetime.utcnow().strftime("%Y-%m-%d"),
         data.get("notes",""), data.get("job_url","")))
    conn.commit()
    conn.close()
    return {"message": "Application tracked"}

@app.put("/api/job-tracker/{app_id}")
async def update_job_application(app_id: int, data: dict, current_user = Depends(get_current_user)):
    conn = db.get_connection()
    c = conn.cursor()
    c.execute("UPDATE job_applications SET status=?, notes=? WHERE id=? AND user_email=?",
              (data.get("status"), data.get("notes",""), app_id, current_user["email"]))
    conn.commit()
    conn.close()
    return {"message": "Updated"}

@app.delete("/api/job-tracker/{app_id}")
async def delete_job_application(app_id: int, current_user = Depends(get_current_user)):
    conn = db.get_connection()
    c = conn.cursor()
    c.execute("DELETE FROM job_applications WHERE id=? AND user_email=?", (app_id, current_user["email"]))
    conn.commit()
    conn.close()
    return {"message": "Deleted"}

# ============================================================
# SMART SEARCH
# ============================================================
@app.get("/api/search")
async def smart_search(q: str = "", current_user = Depends(get_current_user)):
    if not q:
        return {"results": []}
    conn = db.get_connection()
    c = conn.cursor()
    like = f"%{q}%"
    c.execute("""SELECT email, full_name, role, sector, company, position, skills 
        FROM users WHERE email != ? AND (
            full_name LIKE ? OR sector LIKE ? OR company LIKE ? OR 
            position LIKE ? OR skills LIKE ?
        ) LIMIT 20""", (current_user["email"], like, like, like, like, like))
    users = [db.dict_from_row(r) for r in c.fetchall()]
    c.execute("SELECT id, title, company, location, type FROM jobs WHERE title LIKE ? OR company LIKE ? OR skills LIKE ? LIMIT 10",
              (like, like, like))
    jobs = [dict(r) for r in c.fetchall()]
    c.execute("SELECT id, title, date, type, location FROM events WHERE title LIKE ? OR description LIKE ? LIMIT 10",
              (like, like))
    events = [dict(r) for r in c.fetchall()]
    conn.close()
    return {"users": users, "jobs": jobs, "events": events, "query": q}

# ============================================================
# SKILL TRENDS
# ============================================================
@app.get("/api/skills/trends")
async def get_skill_trends(current_user = Depends(get_current_user)):
    conn = db.get_connection()
    c = conn.cursor()
    c.execute("SELECT skills FROM jobs WHERE status='active'")
    all_skills = {}
    for row in c.fetchall():
        try:
            skills = json.loads(row[0]) if row[0] else []
            for s in skills:
                all_skills[s] = all_skills.get(s, 0) + 1
        except: pass
    c.execute("SELECT skills FROM users WHERE role='alumni'")
    alumni_skills = {}
    for row in c.fetchall():
        try:
            skills = json.loads(row[0]) if row[0] else []
            for s in skills:
                alumni_skills[s] = alumni_skills.get(s, 0) + 1
        except: pass
    conn.close()
    trends = sorted([{"skill": k, "demand": v, "growth": f"+{v*8}%"} 
                     for k, v in all_skills.items()], key=lambda x: x["demand"], reverse=True)[:15]
    return {"trends": trends, "total_jobs_analyzed": sum(all_skills.values())}

# ============================================================
# ANALYTICS EXPORT
# ============================================================
@app.get("/api/analytics/export")
async def export_analytics(current_user = Depends(require_role(["admin"]))):
    from fastapi.responses import StreamingResponse
    import csv, io
    conn = db.get_connection()
    c = conn.cursor()
    c.execute("SELECT email, full_name, role, sector, graduation_year, company, position, created_at FROM users")
    rows = c.fetchall()
    conn.close()
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Email","Name","Role","Sector","Grad Year","Company","Position","Joined"])
    for r in rows:
        writer.writerow(list(r))
    output.seek(0)
    return StreamingResponse(io.BytesIO(output.getvalue().encode()),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=rootsreconnect_users.csv"})

# ============================================================
# AI CONNECTION MESSAGE GENERATOR
# ============================================================
@app.post("/api/ai/connection-message")
async def generate_connection_message(data: dict, current_user = Depends(get_current_user)):
    target_email = data.get("target_email", "")
    conn = db.get_connection()
    c = conn.cursor()
    c.execute("SELECT * FROM users WHERE email = ?", (target_email,))
    row = c.fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="User not found")
    target = db.dict_from_row(row)
    current_skills = set(current_user.get("skills", []))
    target_skills = set(target.get("skills", []))
    shared = list(current_skills & target_skills)[:2]
    msg = f"""Hi {target.get('full_name', '')},

I came across your profile on RootsReconnect and was impressed by your work at {target.get('company', 'your organization')} as {target.get('position', 'a professional')}.

{f"We share a passion for {' and '.join(shared)}, which I think could make for a great conversation." if shared else f"Your experience in {target.get('sector', 'your field')} aligns well with my interests."}

I'm a {current_user.get('role', 'professional')} in {current_user.get('sector', 'the industry')} and would love to connect and learn from your experience.

Would you be open to a brief chat?

Best regards,
{current_user.get('full_name', '')}"""
    return {"message": msg}

# ============================================================
# RESUME PARSER
# ============================================================
@app.post("/api/resume/parse")
async def parse_resume(file: UploadFile = File(...), current_user = Depends(get_current_user)):
    """Upload PDF resume → extract text → LLM parses skills/experience/education"""
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    # Read PDF
    try:
        import PyPDF2, io
        content = await file.read()
        reader = PyPDF2.PdfReader(io.BytesIO(content))
        text = "\n".join(page.extract_text() or "" for page in reader.pages)
        text = text[:6000]  # cap for LLM context
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not read PDF: {str(e)}")

    if not text.strip():
        raise HTTPException(status_code=400, detail="PDF appears to be empty or image-based")

    # LLM extraction
    prompt = f"""Extract structured information from this resume text. Return ONLY valid JSON with these exact keys:
{{
  "full_name": "string or empty",
  "current_role": "string or empty",
  "company": "string or empty",
  "location": "string or empty",
  "skills": ["list", "of", "skills"],
  "interests": ["list", "of", "interests"],
  "bio": "2-3 sentence professional summary",
  "graduation_year": number or null,
  "sector": "one of: technology, healthcare, finance, education, manufacturing, consulting, government, nonprofit or empty"
}}

Resume text:
{text}

Return only the JSON object, no markdown, no explanation."""

    extracted = {}
    try:
        from app.llm_agent import get_llm_agent
        llm = get_llm_agent()
        response = llm.chat(prompt, {})
        # Clean response
        clean = response.strip()
        if clean.startswith("```"):
            clean = clean.split("```")[1]
            if clean.startswith("json"):
                clean = clean[4:]
        extracted = json.loads(clean.strip())
    except Exception as e:
        # Fallback: basic extraction
        import re
        skills_keywords = ["python","javascript","react","node","java","sql","aws","machine learning",
                          "data analysis","project management","leadership","communication","excel","figma"]
        found_skills = [s.title() for s in skills_keywords if s in text.lower()]
        extracted = {
            "full_name": current_user.get("full_name",""),
            "skills": found_skills[:10],
            "interests": [],
            "bio": text[:200].replace("\n"," ").strip(),
            "current_role": "",
            "company": "",
            "location": "",
            "graduation_year": None,
            "sector": current_user.get("sector","technology")
        }

    return {"extracted": extracted, "raw_text_length": len(text)}

@app.post("/api/resume/apply")
async def apply_resume_data(data: dict, current_user = Depends(get_current_user)):
    """Apply extracted resume data to user profile"""
    # Map extracted fields to actual DB column names
    field_map = {
        "full_name": "full_name",
        "bio": "bio",
        "current_role": "current_role",
        "company": "company",
        "location": "location",
        "skills": "skills",
        "interests": "interests",
        "graduation_year": "graduation_year",
        "sector": "sector",
    }
    conn = db.get_connection()
    c = conn.cursor()
    updated = 0
    for key, db_col in field_map.items():
        value = data.get(key)
        if value is None or value == "" or value == []:
            continue
        try:
            if isinstance(value, list):
                value = json.dumps(value)
            c.execute(f"UPDATE users SET {db_col} = ? WHERE email = ?",
                      (value, current_user["email"]))
            updated += 1
        except Exception as e:
            print(f"Skipping field {db_col}: {e}")
    conn.commit()
    conn.close()
    return {"message": f"Profile updated — {updated} fields applied"}

# ============================================================
# ENHANCED ANALYTICS EXPORT
# ============================================================
@app.get("/api/analytics/export-full")
async def export_full_analytics(current_user = Depends(require_role(["admin"]))):
    """Export users, connections, events as multi-sheet CSV"""
    from fastapi.responses import StreamingResponse
    import csv, io
    conn = db.get_connection()
    c = conn.cursor()

    output = io.StringIO()
    writer = csv.writer(output)

    # Users
    writer.writerow(["=== USERS ==="])
    writer.writerow(["Email","Name","Role","Sector","Grad Year","Company","Position","Approved","Joined"])
    c.execute("SELECT email,full_name,role,sector,graduation_year,company,position,is_approved,created_at FROM users")
    for r in c.fetchall(): writer.writerow(list(r))

    writer.writerow([])
    writer.writerow(["=== CONNECTIONS ==="])
    writer.writerow(["From","To","Status","Date"])
    c.execute("SELECT from_user,to_user,status,created_at FROM connections")
    for r in c.fetchall(): writer.writerow(list(r))

    writer.writerow([])
    writer.writerow(["=== EVENTS ==="])
    writer.writerow(["Title","Date","Type","Location","Attendees","Max","Host"])
    c.execute("SELECT title,date,type,location,attendees,max_attendees,host FROM events")
    for r in c.fetchall(): writer.writerow(list(r))

    writer.writerow([])
    writer.writerow(["=== JOBS ==="])
    writer.writerow(["Title","Company","Location","Type","Salary","Posted By","Applicants","Status"])
    c.execute("SELECT title,company,location,type,salary,posted_by,applicants,status FROM jobs")
    for r in c.fetchall(): writer.writerow(list(r))

    conn.close()
    output.seek(0)
    return StreamingResponse(
        io.BytesIO(output.getvalue().encode()),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=rootsreconnect_full_export.csv"}
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
