import copy
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc

from app.db.session import get_db
from app.models.user import User
from app.models.interview import Interview
from app.schemas.interview import (
    InterviewGenerateRequest,
    InterviewDetailResponse,
    InterviewSummaryResponse,
    InterviewListResponse,
    InterviewUpdateRequest,
    QuestionRegenerateRequest,
    GeneratedQuestion,
)
from app.api.deps import get_current_user
from app.core.rate_limit import generation_limiter
from app.services.llm_service import llm_service

router = APIRouter(prefix="/interviews", tags=["Interviews"])


@router.post("/generate", response_model=InterviewDetailResponse, status_code=status.HTTP_201_CREATED)
async def generate_interview(
    req: InterviewGenerateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Enforce sliding-window rate limit per user
    generation_limiter.check_rate_limit(f"user-{current_user.id}")

    # Generate questions via configured LLM provider or demo mode
    questions = await llm_service.generate_interview_questions(req)
    questions_dump = [q.model_dump() for q in questions]

    # Persist interview to SQLite
    interview = Interview(
        user_id=current_user.id,
        role_title=req.role_title,
        job_description=req.job_description,
        required_skills=req.required_skills,
        experience_level=req.experience_level,
        interview_type=req.interview_type,
        difficulty=req.difficulty,
        question_count=len(questions),
        duration_minutes=req.duration_minutes or 45,
        company_or_industry=req.company_or_industry,
        candidate_resume_text=req.candidate_resume_text,
        focus_areas=req.focus_areas,
        language=req.language,
        questions=questions_dump,
        evaluations={},
    )
    db.add(interview)
    db.commit()
    db.refresh(interview)

    return InterviewDetailResponse.model_validate(interview)


@router.get("", response_model=InterviewListResponse)
def list_interviews(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=50),
    search: Optional[str] = Query(None, max_length=100),
    difficulty: Optional[str] = Query(None),
    interview_type: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Interview).filter(Interview.user_id == current_user.id)

    if search:
        search_filter = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Interview.role_title.ilike(search_filter),
                Interview.required_skills.ilike(search_filter),
                Interview.company_or_industry.ilike(search_filter)
            )
        )

    if difficulty and difficulty != "All":
        query = query.filter(Interview.difficulty == difficulty)

    if interview_type and interview_type != "All":
        query = query.filter(Interview.interview_type == interview_type)

    total = query.count()
    total_pages = (total + page_size - 1) // page_size if total > 0 else 1

    interviews = query.order_by(desc(Interview.created_at))\
                      .offset((page - 1) * page_size)\
                      .limit(page_size)\
                      .all()

    items = [InterviewSummaryResponse.model_validate(i) for i in interviews]
    return InterviewListResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )


@router.get("/{interview_id}", response_model=InterviewDetailResponse)
def get_interview(
    interview_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    interview = db.query(Interview).filter(
        Interview.id == interview_id,
        Interview.user_id == current_user.id
    ).first()

    if not interview:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview set not found or access denied."
        )

    return InterviewDetailResponse.model_validate(interview)


@router.put("/{interview_id}", response_model=InterviewDetailResponse)
def update_interview(
    interview_id: int,
    update_data: InterviewUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    interview = db.query(Interview).filter(
        Interview.id == interview_id,
        Interview.user_id == current_user.id
    ).first()

    if not interview:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview set not found or access denied."
        )

    if update_data.role_title is not None:
        interview.role_title = update_data.role_title

    if update_data.questions is not None:
        # Re-number and validate
        updated_questions = []
        for idx, q in enumerate(update_data.questions):
            q_dict = q.model_dump()
            q_dict["number"] = idx + 1
            updated_questions.append(q_dict)
        interview.questions = updated_questions
        interview.question_count = len(updated_questions)

    if update_data.evaluations is not None:
        interview.evaluations = update_data.evaluations

    db.add(interview)
    db.commit()
    db.refresh(interview)
    return InterviewDetailResponse.model_validate(interview)


@router.post("/{interview_id}/regenerate-question", response_model=InterviewDetailResponse)
async def regenerate_question(
    interview_id: int,
    regen_req: QuestionRegenerateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Enforce rate limit
    generation_limiter.check_rate_limit(f"user-{current_user.id}")

    interview = db.query(Interview).filter(
        Interview.id == interview_id,
        Interview.user_id == current_user.id
    ).first()

    if not interview:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview set not found or access denied."
        )

    questions = list(interview.questions or [])
    target_idx = None
    target_q = None

    for idx, q in enumerate(questions):
        if q.get("id") == regen_req.question_id:
            target_idx = idx
            target_q = q
            break

    if target_idx is None or target_q is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Question '{regen_req.question_id}' not found in this interview set."
        )

    # Build parent request context
    parent_req = InterviewGenerateRequest(
        role_title=interview.role_title,
        job_description=interview.job_description,
        required_skills=interview.required_skills,
        experience_level=interview.experience_level,
        interview_type=interview.interview_type,
        difficulty=interview.difficulty,
        question_count=interview.question_count,
        duration_minutes=interview.duration_minutes,
        company_or_industry=interview.company_or_industry,
        language=interview.language,
        demo_mode=(llm_service.api_key is None)
    )

    new_q: GeneratedQuestion = await llm_service.regenerate_single_question(
        parent_req=parent_req,
        current_question=target_q,
        feedback=regen_req.feedback
    )

    new_q_dict = new_q.model_dump()
    new_q_dict["number"] = target_q.get("number", target_idx + 1)
    new_q_dict["id"] = target_q.get("id", f"q-{target_idx + 1}")

    questions[target_idx] = new_q_dict
    interview.questions = questions

    db.add(interview)
    db.commit()
    db.refresh(interview)
    return InterviewDetailResponse.model_validate(interview)


@router.post("/{interview_id}/duplicate", response_model=InterviewDetailResponse, status_code=status.HTTP_201_CREATED)
def duplicate_interview(
    interview_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    original = db.query(Interview).filter(
        Interview.id == interview_id,
        Interview.user_id == current_user.id
    ).first()

    if not original:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview set not found or access denied."
        )

    # Deep copy questions
    cloned_questions = copy.deepcopy(original.questions)

    duplicated = Interview(
        user_id=current_user.id,
        role_title=f"{original.role_title} (Copy)",
        job_description=original.job_description,
        required_skills=original.required_skills,
        experience_level=original.experience_level,
        interview_type=original.interview_type,
        difficulty=original.difficulty,
        question_count=original.question_count,
        duration_minutes=original.duration_minutes,
        company_or_industry=original.company_or_industry,
        candidate_resume_text=original.candidate_resume_text,
        focus_areas=original.focus_areas,
        language=original.language,
        questions=cloned_questions,
        evaluations={},
    )
    db.add(duplicated)
    db.commit()
    db.refresh(duplicated)
    return InterviewDetailResponse.model_validate(duplicated)


@router.delete("/{interview_id}", status_code=status.HTTP_200_OK)
def delete_interview(
    interview_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    interview = db.query(Interview).filter(
        Interview.id == interview_id,
        Interview.user_id == current_user.id
    ).first()

    if not interview:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview set not found or access denied."
        )

    db.delete(interview)
    db.commit()
    return {"message": "Interview set deleted successfully.", "id": interview_id}
