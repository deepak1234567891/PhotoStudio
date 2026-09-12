"""
Initialize SQLite database with default admin user
Run this script to create the database and default admin user
"""
from database import SessionLocal, engine
from models import Base, User
from auth import get_password_hash

def init_db():
    # Create all tables (SQLite database file will be created automatically)
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    # Check if admin user already exists
    existing_user = db.query(User).filter(User.username == "admin").first()
    if existing_user:
        print("Admin user already exists!")
    else:
        # Create default admin user
        admin_user = User(
            username="admin",
            hashed_password=get_password_hash("admin123")
        )
        db.add(admin_user)
        db.commit()
        print("Default admin user created successfully!")
        print("Username: admin")
        print("Password: admin123")
    
    db.close()
    print("Database initialization complete!")

if __name__ == "__main__":
    init_db()
