from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.session import Base


class Interview(Base):
    __tablename__ = "interviews"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    role_title = Column(String(255), nullable=False, index=True)
    job_description = Column(Text, nullable=True)
    required_skills = Column(String(500), nullable=False)
    experience_level = Column(String(50), nullable=False)  # Fresher, Entry Level, Mid-Level, Senior
    interview_type = Column(String(50), nullable=False)    # Technical, HR, Behavioral, Coding, System Design, Mixed
    difficulty = Column(String(50), nullable=False)        # Easy, Medium, Hard, Mixed
    question_count = Column(Integer, nullable=False, default=10)
    duration_minutes = Column(Integer, nullable=True)
    company_or_industry = Column(String(255), nullable=True)
    candidate_resume_text = Column(Text, nullable=True)
    focus_areas = Column(String(500), nullable=True)
    language = Column(String(50), nullable=False, default="English")
    
    # Stores list of full question objects with rubrics, model answers, red flags, etc.
    questions = Column(JSON, nullable=False, default=list)
    
    # Optional evaluations recorded by interviewer
    evaluations = Column(JSON, nullable=True, default=dict)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    user = relationship("User", back_populates="interviews")
