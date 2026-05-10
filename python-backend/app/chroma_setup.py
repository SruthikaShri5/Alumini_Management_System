"""
ChromaDB Setup for RootsReconnect
Vector database for semantic search and embeddings
"""

import os
import chromadb
from chromadb.config import Settings

# Get the app directory
APP_DIR = os.path.dirname(os.path.abspath(__file__))
CHROMA_DIR = os.path.join(os.path.dirname(APP_DIR), 'chroma_data')

def get_chroma_client():
    """Get or create ChromaDB client"""
    # Create persistent client that stores data locally
    client = chromadb.PersistentClient(path=CHROMA_DIR)
    return client

def initialize_collections():
    """Initialize ChromaDB collections for the application"""
    client = get_chroma_client()
    
    # Create collections for different data types
    collections = {
        'users': 'User profiles and skills for semantic search',
        'jobs': 'Job postings for matching',
        'mentors': 'Mentor profiles',
        'conversations': 'AI conversation history',
        'career_resources': 'Career advice and resources'
    }
    
    created_collections = {}
    for name, description in collections.items():
        try:
            coll = client.get_or_create_collection(
                name=name,
                metadata={"description": description}
            )
            created_collections[name] = coll
            print(f"[OK] Collection '{name}' ready")
        except Exception as e:
            print(f"[X] Error creating collection '{name}': {e}")
    
    return created_collections

def add_sample_data():
    """Add sample data for testing"""
    client = get_chroma_client()
    
    # Get or create users collection
    users = client.get_or_create_collection(name='users')
    
    # Check if data already exists
    if users.count() > 0:
        print(f"Collection already has {users.count()} items")
        return
    
    # Sample user embeddings and metadata
    sample_users = [
        {
            "id": "user_1",
            "embedding": [0.1] * 384,  # Placeholder embedding
            "metadata": {
                "name": "John Smith",
                "role": "Software Engineer",
                "sector": "Technology",
                "skills": "Python,JavaScript,Machine Learning",
                "looking_for": "Mentorship,Job Opportunities"
            }
        },
        {
            "id": "user_2", 
            "embedding": [0.2] * 384,
            "metadata": {
                "name": "Sarah Johnson",
                "role": "Product Manager",
                "sector": "Finance",
                "skills": "Product Strategy,Agile,Data Analysis",
                "looking_for": "Networking,Career Advice"
            }
        }
    ]
    
    for user in sample_users:
        users.add(
            ids=[user["id"]],
            embeddings=[user["embedding"]],
            metadatas=[user["metadata"]]
        )
    
    print(f"[OK] Added {len(sample_users)} sample users")

def query_similar_users(query_embedding, n=5):
    """Query for similar users based on embedding"""
    client = get_chroma_client()
    users = client.get_or_create_collection(name='users')
    
    results = users.query(
        query_embeddings=[query_embedding],
        n_results=n
    )
    
    return results

def main():
    """Main setup function"""
    print("=" * 50)
    print("Initializing ChromaDB for RootsReconnect")
    print("=" * 50)
    print(f"Storage location: {CHROMA_DIR}")
    print()
    
    # Initialize collections
    print("Creating collections...")
    collections = initialize_collections()
    print()
    
    # Add sample data
    print("Adding sample data...")
    add_sample_data()
    print()
    
    # Test query
    print("Testing ChromaDB connection...")
    test_embedding = [0.15] * 384
    results = query_similar_users(test_embedding, n=2)
    print("[OK] ChromaDB is working!")
    print()
    
    print("=" * 50)
    print("ChromaDB Setup Complete!")
    print("=" * 50)
    
    return client if 'client' in locals() else None

if __name__ == "__main__":
    main()
