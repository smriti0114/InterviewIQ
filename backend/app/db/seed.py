from app.db.session import SessionLocal
from app.db.init_db import init_db
from app.models.user import User
from app.models.interview import Interview
from app.core.security import get_password_hash
from app.services.llm_service import llm_service
from app.schemas.interview import InterviewGenerateRequest


def seed_database():
    init_db()
    db = SessionLocal()
    try:
        # Check if demo user exists
        demo_user = db.query(User).filter(User.email == "demo@interviewiq.ai").first()
        if not demo_user:
            demo_user = User(
                email="demo@interviewiq.ai",
                hashed_password=get_password_hash("demo123456"),
                full_name="Alex Mercer",
                is_active=True,
                default_preferences={
                    "theme": "light",
                    "default_difficulty": "Medium",
                    "default_interview_type": "Technical",
                    "default_question_count": 10,
                    "default_language": "English"
                }
            )
            db.add(demo_user)
            db.commit()
            db.refresh(demo_user)
            print(f"Created demo user: {demo_user.email} (id={demo_user.id})")

        # Check if demo interview exists
        existing_interview = db.query(Interview).filter(Interview.user_id == demo_user.id).first()
        if not existing_interview:
            print("Generating initial demo interview set for Python Developer...")
            req = InterviewGenerateRequest(
                role_title="Senior Python & Distributed Systems Engineer",
                job_description="Architecting high-concurrency event-driven microservices with FastAPI, Celery, Redis, and PostgreSQL.",
                required_skills="Python, FastAPI, Redis, Distributed Systems, PostgreSQL, Docker",
                experience_level="Senior",
                interview_type="Mixed",
                difficulty="Hard",
                question_count=6,
                duration_minutes=60,
                company_or_industry="FinTech / Cloud Infrastructure",
                demo_mode=True
            )
            questions = llm_service._generate_dynamic_mock_questions(req)
            questions_dump = [q.model_dump() for q in questions]

            interview = Interview(
                user_id=demo_user.id,
                role_title=req.role_title,
                job_description=req.job_description,
                required_skills=req.required_skills,
                experience_level=req.experience_level,
                interview_type=req.interview_type,
                difficulty=req.difficulty,
                question_count=len(questions_dump),
                duration_minutes=req.duration_minutes,
                company_or_industry=req.company_or_industry,
                language=req.language,
                questions=questions_dump,
                evaluations={},
            )
            db.add(interview)
            db.commit()
            db.refresh(interview)
            print(f"Created initial interview set: {interview.role_title} (id={interview.id}) with {len(questions_dump)} questions.")
        else:
            print("Initial demo interview set already exists.")
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
