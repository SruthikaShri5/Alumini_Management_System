import sqlite3
import hashlib
import json
from datetime import datetime
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "rootsreconnect.db")

def init_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    
    # Users table
    c.execute('''CREATE TABLE IF NOT EXISTS users (
        email TEXT PRIMARY KEY,
        password TEXT NOT NULL,
        full_name TEXT NOT NULL,
        role TEXT NOT NULL,
        sector TEXT,
        graduation_year INTEGER,
        skills TEXT,
        interests TEXT,
        looking_for TEXT,
        company TEXT,
        position TEXT,
        is_rural INTEGER DEFAULT 0,
        is_approved INTEGER DEFAULT 0,
        created_at TEXT,
        profile_views INTEGER DEFAULT 0,
        connections_count INTEGER DEFAULT 0,
        bio TEXT DEFAULT '',
        current_role TEXT DEFAULT '',
        location TEXT DEFAULT '',
        linkedin TEXT DEFAULT '',
        github TEXT DEFAULT '',
        twitter TEXT DEFAULT '',
        website TEXT DEFAULT ''
    )''')
    
    # Events table
    c.execute('''CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        date TEXT,
        time TEXT,
        type TEXT,
        location TEXT,
        attendees INTEGER DEFAULT 0,
        max_attendees INTEGER,
        host TEXT,
        description TEXT,
        tags TEXT,
        featured INTEGER DEFAULT 0,
        speakers TEXT,
        created_by TEXT,
        created_at TEXT
    )''')
    
    # Jobs table
    c.execute('''CREATE TABLE IF NOT EXISTS jobs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        company TEXT,
        location TEXT,
        type TEXT,
        salary TEXT,
        remote INTEGER,
        posted TEXT,
        description TEXT,
        skills TEXT,
        posted_by TEXT,
        applicants INTEGER DEFAULT 0,
        status TEXT DEFAULT 'active'
    )''')
    
    # Connections table
    c.execute('''CREATE TABLE IF NOT EXISTS connections (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        from_user TEXT,
        to_user TEXT,
        status TEXT DEFAULT 'pending',
        created_at TEXT
    )''')

    # Messages table
    c.execute('''CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        from_user TEXT NOT NULL,
        to_user TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at TEXT,
        is_read INTEGER DEFAULT 0
    )''')

    # Endorsements table
    c.execute('''CREATE TABLE IF NOT EXISTS endorsements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        from_user TEXT NOT NULL,
        target_user TEXT NOT NULL,
        skill TEXT NOT NULL,
        note TEXT DEFAULT '',
        created_at TEXT
    )''')

    # Job Applications tracker
    c.execute('''CREATE TABLE IF NOT EXISTS job_applications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_email TEXT NOT NULL,
        job_title TEXT,
        company TEXT,
        status TEXT DEFAULT 'applied',
        applied_date TEXT,
        notes TEXT DEFAULT '',
        job_url TEXT DEFAULT ''
    )''')
    
    conn.commit()
    
    # Migrate: add new columns if they don't exist
    new_columns = [
        ("bio", "TEXT DEFAULT ''"),
        ("current_role", "TEXT DEFAULT ''"),
        ("location", "TEXT DEFAULT ''"),
        ("linkedin", "TEXT DEFAULT ''"),
        ("github", "TEXT DEFAULT ''"),
        ("twitter", "TEXT DEFAULT ''"),
        ("website", "TEXT DEFAULT ''"),
    ]
    for col_name, col_def in new_columns:
        try:
            c.execute(f"ALTER TABLE users ADD COLUMN {col_name} {col_def}")
            conn.commit()
        except Exception:
            pass  # Column already exists

    # Check if data exists
    c.execute("SELECT COUNT(*) FROM users")
    if c.fetchone()[0] == 0:
        load_sample_data(conn)
    
    conn.close()

def load_sample_data(conn):
    c = conn.cursor()
    
    # Sample users
    users = [
        ("admin@rootsreconnect.com", "admin123", "Admin User", "admin", "technology", 2015,
         '["Management","Leadership","Strategy"]', '["Platform Growth","User Experience"]',
         '["platform_improvement"]', "RootsReconnect", "Platform Administrator"),
        ("sarah.chen@gmail.com", "password123", "Sarah Chen", "alumni", "technology", 2018,
         '["Python","Machine Learning","Data Science","TensorFlow","AWS", "Leadership", "Strategy"]',
         '["AI Research","Mentorship","Startups", "Platform Growth"]', '["mentorship","collaboration"]',
         "Google", "Senior Data Scientist"),
        ("mike.johnson@gmail.com", "password123", "Mike Johnson", "alumni", "technology", 2019,
         '["Product Management","Agile","User Research","Analytics", "Leadership"]',
         '["Product Strategy","Innovation", "Platform Growth"]', '["networking","job_opportunities"]',
         "Microsoft", "Product Manager"),
        ("emily.rodriguez@gmail.com", "password123", "Emily Rodriguez", "alumni", "technology", 2020,
         '["UI/UX Design","Figma","User Research","Prototyping", "Strategy"]',
         '["Design Systems","Accessibility", "User Experience"]', '["collaboration","mentorship"]',
         "Apple", "UX Designer"),
        ("david.kim@gmail.com", "password123", "David Kim", "alumni", "technology", 2017,
         '["Java","System Design","Kubernetes","Microservices", "Leadership"]',
         '["Cloud Architecture","DevOps", "Strategy"]', '["networking","career_advice"]',
         "Amazon", "Engineering Manager"),
        ("lisa.wang@gmail.com", "password123", "Lisa Wang", "alumni", "technology", 2019,
         '["Deep Learning","NLP","PyTorch","Research", "Management"]',
         '["AI Ethics","Research", "Platform Growth"]', '["collaboration","research_opportunities"]',
         "OpenAI", "AI Researcher"),
        ("john.smith@student.com", "password123", "John Smith", "student", "technology", 2025,
         '["JavaScript","React","Node.js", "Leadership"]', '["Web Development","Internships", "Mentorship"]',
         '["mentorship","job_opportunities","career_advice"]', "University", "Computer Science Student"),
        ("maria.garcia@student.com", "password123", "Maria Garcia", "student", "technology", 2024,
         '["Python","Data Analysis","SQL", "Machine Learning"]', '["Data Science","Machine Learning", "AI Research"]',
         '["mentorship","internships"]', "University", "Data Science Student"),
        ("alex.brown@gmail.com", "password123", "Alex Brown", "alumni", "finance", 2016,
         '["Financial Analysis","Risk Management","Excel","Bloomberg", "Leadership"]',
         '["Investment Banking","Fintech", "Strategy"]', '["networking","career_advice"]',
         "Goldman Sachs", "Investment Analyst"),
        ("priya.patel@gmail.com", "password123", "Priya Patel", "alumni", "healthcare", 2018,
         '["Healthcare IT","HIPAA","EMR Systems","Project Management", "Strategy"]',
         '["Digital Health","Telemedicine", "Innovation"]', '["collaboration","innovation"]',
         "Mayo Clinic", "Healthcare IT Manager"),
        ("james.wilson@student.com", "password123", "James Wilson", "student", "technology", 2026,
         '["Python","Java","C++","Data Structures", "Leadership", "Management"]',
         '["Software Development","Machine Learning", "AI Research", "Mentorship"]',
         '["internships","mentorship","career_advice"]', "University", "CS Student"),
        ("sophia.lee@gmail.com", "password123", "Sophia Lee", "alumni", "technology", 2020,
         '["Data Analytics","Python","SQL","Tableau", "Strategy"]',
         '["Data Science","Business Intelligence", "Platform Growth"]',
         '["networking","collaboration"]', "Netflix", "Data Analyst"),
        # Government sector alumni
        ("raj.sharma@gov.in", "password123", "Raj Sharma", "alumni", "government", 2015,
         '["Public Policy","Urban Development","Project Management", "Leadership"]',
         '["Rural Development","Smart Cities", "Governance"]',
         '["mentorship","career_advice"]', "Ministry of Urban Development", "Director"),
        ("priya.gov@gov.in", "password123", "Priya Devi", "alumni", "public_sector", 2018,
         '["Healthcare Policy","Public Health","Management", "Strategy"]',
         '["Rural Healthcare","Policy Reform", "Innovation"]',
         '["mentorship","collaboration"]', "National Health Mission", "Program Manager"),
        # Rural students
        ("amit.rural@student.com", "password123", "Amit Kumar", "student", "government", 2025,
         '["Public Administration","Political Science","Research"]', '["Civil Services","Rural Development", "Policy Analysis"]',
         '["mentorship","career_guidance"]', "Rural College", "Political Science Student"),
        ("sunita.rani@student.com", "password123", "Sunita Rani", "student", "public_sector", 2026,
         '["Healthcare Administration","Management"]', '["Hospital Management","Public Health"]',
         '["internships","mentorship"]', "Rural Medical College", "Healthcare Admin Student")
    ]

    rural_emails = {"amit.rural@student.com", "sunita.rani@student.com"}

    for user in users:
        email, password, *rest = user
        hashed = hashlib.sha256(password.encode()).hexdigest()
        is_rural = 1 if email in rural_emails else 0
        is_approved = 1
        full_name, role, sector, grad_year, skills, interests, looking_for, company, position = rest
        c.execute('''INSERT INTO users 
            (email, password, full_name, role, sector, graduation_year, skills, interests,
             looking_for, company, position, is_rural, is_approved, created_at,
             profile_views, connections_count, bio, current_role, location, linkedin, github, twitter, website)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)''',
                  (email, hashed, full_name, role, sector, grad_year, skills, interests,
                   looking_for, company, position, is_rural, is_approved,
                   datetime.utcnow().isoformat(), 0, 0,
                   "", "", "", "", "", "", ""))
    
    # Sample events
    events = [
        ("AI & Machine Learning Summit 2024", "2024-04-15", "10:00 AM PST", "virtual",
         "Virtual Event", 234, 500, "Tech Alumni Chapter",
         "Join industry leaders discussing the future of AI and its impact on careers.",
         '["AI","Technology","Networking"]', 1, '["Dr. Sarah Chen","Lisa Wang"]',
         "admin@rootsreconnect.com", datetime.utcnow().isoformat()),
        ("Career Mentorship Mixer", "2024-04-20", "6:00 PM EST", "in-person",
         "San Francisco, CA", 45, 50, "Alumni Network",
         "Connect with mentors from top companies and get career guidance.",
         '["Mentorship","Career","Networking"]', 0, '[]',
         "admin@rootsreconnect.com", datetime.utcnow().isoformat()),
        ("Startup Pitch Night", "2024-04-25", "7:00 PM PST", "hybrid",
         "New York, NY", 89, 100, "Entrepreneurship Club",
         "Watch alumni startups pitch to investors and network with founders.",
         '["Startups","Investment","Innovation"]', 1, '["Mike Johnson","David Kim"]',
         "admin@rootsreconnect.com", datetime.utcnow().isoformat())
    ]
    
    for event in events:
        c.execute('''INSERT INTO events (title,date,time,type,location,attendees,max_attendees,
                     host,description,tags,featured,speakers,created_by,created_at) 
                     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)''', event)
    
    # Sample jobs
    jobs = [
        ("Senior Data Scientist", "TechCorp AI", "San Francisco, CA", "Full-time",
         "$150k - $200k", 1, "2024-03-10",
         "Lead AI initiatives and build ML models for our next-gen platform.",
         '["Python","Machine Learning","TensorFlow","AWS"]', "sarah.chen@gmail.com", 12, "active"),
        ("Product Manager", "StartupXYZ", "Remote", "Full-time",
         "$130k - $170k", 1, "2024-03-12",
         "Lead product vision and execution for B2B SaaS platform.",
         '["Product Management","Agile","Analytics","User Research"]', "mike.johnson@gmail.com", 8, "active"),
        ("UX Designer", "DesignCo", "New York, NY", "Full-time",
         "$110k - $140k", 0, "2024-03-14",
         "Create beautiful and intuitive user experiences for mobile apps.",
         '["UI/UX Design","Figma","Prototyping","User Research"]', "emily.rodriguez@gmail.com", 15, "active"),
        ("Software Engineering Intern", "Google", "Mountain View, CA", "Internship",
         "$8k/month", 0, "2024-03-08",
         "Summer internship for students passionate about building scalable systems.",
         '["Python","Java","Data Structures","Algorithms"]', "sarah.chen@gmail.com", 45, "active")
    ]
    
    for job in jobs:
        c.execute('''INSERT INTO jobs (title,company,location,type,salary,remote,posted,
                     description,skills,posted_by,applicants,status) 
                     VALUES (?,?,?,?,?,?,?,?,?,?,?,?)''', job)
    
    conn.commit()

# Initialize database
init_db()

class Database:
    def __init__(self):
        self.db_path = DB_PATH
    
    def get_connection(self):
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn
    
    def dict_from_row(self, row):
        d = dict(row)
        # Parse JSON fields
        for key in ['skills', 'interests', 'looking_for', 'tags', 'speakers']:
            if key in d and d[key]:
                try:
                    d[key] = json.loads(d[key])
                except:
                    d[key] = []
        return d

db = Database()
