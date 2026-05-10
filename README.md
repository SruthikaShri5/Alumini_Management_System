# RootsReconnect - Intelligent Alumni Management System

## 🤖 NEW: Real LLM Integration!

**Intelligent AI Chat** powered by:
- 🔥 **Google Gemini** (Free)
- 💰 **OpenAI GPT-4** (Paid)
- 🤖 **Anthropic Claude** (Paid)

**Quick Setup:**
```bash
# Install LLM dependencies and get API keys
setup-llm.bat

# Test integration
python test-llm.py
```

See [LLM_SETUP.md](LLM_SETUP.md) for detailed instructions.

---

## 🚀 Overview

RootsReconnect is a next-generation alumni management platform powered by AI, built entirely with Python. It features semantic search, intelligent matching, and personalized recommendations for multi-sector alumni networks.

## ✨ Key Features

### AI-Powered Intelligence
- **Semantic Matching**: Uses sentence transformers for deep profile understanding
- **Vector Search**: ChromaDB for fast similarity searches
- **Career Insights**: AI-generated career stage analysis and skill gap identification
- **Smart Recommendations**: Personalized connection suggestions based on embeddings
- **AI Assistant**: Natural language queries for networking advice

### Core Functionality
- **Multi-Sector Support**: Technology, Healthcare, Finance, Education, Manufacturing, Retail, Consulting, Government, Nonprofit
- **Connection Management**: Send, accept, decline connection requests
- **Event Management**: Create and manage alumni events with registration
- **Analytics Dashboard**: Network insights, sector distribution, top skills
- **Profile Management**: Comprehensive profiles with skills, interests, and career info
- **Search & Discovery**: Advanced search by sector, skills, graduation year

## 🛠️ Tech Stack

### Backend
- **FastAPI**: Modern async Python web framework
- **MongoDB + Motor**: Async NoSQL database
- **ChromaDB**: Vector database for semantic search
- **Sentence Transformers**: all-MiniLM-L6-v2 for embeddings
- **JWT + Bcrypt**: Secure authentication
- **Redis**: Caching layer (optional)
- **LangChain**: AI orchestration

### Frontend
- **Streamlit**: Rapid Python web UI
- **Plotly**: Interactive visualizations

## 📦 Quick Start

### Option 1: Docker (Recommended)

```bash
# Clone and start all services
docker-compose up -d

# Access the application
# Backend API: http://localhost:8000
# Frontend UI: http://localhost:8501
# API Docs: http://localhost:8000/docs
```

### Option 2: Manual Setup

#### Backend Setup
```bash
cd python-backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your MongoDB URI

# Run server
uvicorn app.main:app --reload --port 8000
```

#### Frontend Setup
```bash
cd python-frontend

# Install dependencies
pip install -r requirements.txt

# Run Streamlit app
streamlit run app.py
```

## 🔧 Configuration

Create `.env` in `python-backend/`:

```env
MONGODB_URI=mongodb://localhost:27017/rootsreconnect
SECRET_KEY=your-secret-key-min-32-chars
ACCESS_TOKEN_EXPIRE_MINUTES=30
REDIS_URL=redis://localhost:6379
OPENAI_API_KEY=optional
ANTHROPIC_API_KEY=optional
FRONTEND_URL=http://localhost:8501
```

## 📚 API Documentation

Once running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Key Endpoints

```
POST   /api/auth/register          - Register new user
POST   /api/auth/login             - Login
GET    /api/users/me               - Get profile
PUT    /api/users/me               - Update profile
GET    /api/matching/suggestions   - AI match suggestions
GET    /api/matching/insights      - AI career insights
POST   /api/connections/request    - Send connection request
GET    /api/connections/pending    - Get pending requests
POST   /api/ai/query               - Ask AI assistant
GET    /api/analytics/dashboard    - Dashboard stats
POST   /api/events                 - Create event
GET    /api/events                 - List events
```

## 🧪 Testing

```bash
# Test registration
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@example.com",
    "password": "secure123",
    "full_name": "Alice Johnson",
    "sector": "technology",
    "graduation_year": 2019,
    "skills": ["Python", "Machine Learning", "Cloud Computing"],
    "interests": ["AI", "Startups", "Mentorship"],
    "looking_for": ["collaboration", "mentorship"]
  }'

# Login and get token
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=alice@example.com&password=secure123"

# Get AI-powered matches (use token from login)
curl -X GET http://localhost:8000/api/matching/suggestions \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 🎯 Innovative Features

1. **Semantic Understanding**: Goes beyond keyword matching using neural embeddings
2. **Real-time AI Insights**: Automatic career stage detection and personalized recommendations
3. **Multi-Factor Matching**: Considers skills, interests, sector, graduation year, and semantic similarity
4. **Intelligent Skill Gap Analysis**: Sector-specific skill recommendations
5. **Growth Opportunity Suggestions**: Personalized career advancement paths
6. **Networking Potential Scoring**: Quantifies connection value
7. **AI Assistant**: Natural language interface for queries
8. **Event Intelligence**: Smart event recommendations based on profile

## 📊 Architecture

```
RootsReconnect/
├── python-backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app
│   │   ├── config.py            # Settings
│   │   ├── database.py          # MongoDB
│   │   ├── auth.py              # JWT auth
│   │   ├── models.py            # Pydantic models
│   │   ├── ai_engine.py         # AI/ML engine
│   │   └── routes/
│   │       ├── auth.py          # Authentication
│   │       ├── users.py         # User management
│   │       ├── matching.py      # AI matching
│   │       ├── connections.py   # Networking
│   │       ├── ai_assistant.py  # AI queries
│   │       ├── analytics.py     # Dashboard
│   │       └── events.py        # Events
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
├── python-frontend/
│   ├── app.py                   # Streamlit UI
│   └── requirements.txt
├── docker-compose.yml
└── README.md
```

## 🚀 Deployment

### Production with Gunicorn
```bash
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### Docker Production
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 📈 Roadmap

- [ ] Job board integration with AI matching
- [ ] Advanced mentorship pairing algorithm
- [ ] Course/resource recommendation engine
- [ ] Real-time notifications with WebSockets
- [ ] Video call integration
- [ ] Advanced NLP for resume parsing
- [ ] Mobile app with React Native
- [ ] Integration with LinkedIn API
- [ ] Blockchain-verified credentials
- [ ] GraphQL API option

## 🤝 Contributing

Contributions welcome! Please read CONTRIBUTING.md first.

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

- Documentation: http://localhost:8000/docs
- Issues: GitHub Issues
- Email: support@rootsreconnect.com
