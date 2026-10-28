from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session
import re

from app.db.session import get_db
from app.models.user import User
from app.models.interview import Interview
from app.api.deps import get_current_user
from app.services.export_service import (
    generate_pdf_export,
    generate_csv_export,
    generate_json_export
)

router = APIRouter(prefix="/interviews", tags=["Exports"])


def sanitize_filename(name: str) -> str:
    clean = re.sub(r"[^\w\s-]", "", name).strip().replace(" ", "_")
    return clean or "interview"


@router.get("/{interview_id}/export/pdf")
def export_interview_pdf(
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
            detail="Interview not found or access denied."
        )

    interview_data = {
        "role_title": interview.role_title,
        "experience_level": interview.experience_level,
        "interview_type": interview.interview_type,
        "difficulty": interview.difficulty,
        "required_skills": interview.required_skills,
        "duration_minutes": interview.duration_minutes,
        "created_at": interview.created_at,
        "questions": interview.questions,
    }

    try:
        pdf_bytes = generate_pdf_export(interview_data)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate PDF: {str(exc)}"
        )

    filename = f"{sanitize_filename(interview.role_title)}_interview_{interview.id}.pdf"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )


@router.get("/{interview_id}/export/csv")
def export_interview_csv(
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
            detail="Interview not found or access denied."
        )

    interview_data = {
        "role_title": interview.role_title,
        "experience_level": interview.experience_level,
        "interview_type": interview.interview_type,
        "difficulty": interview.difficulty,
        "required_skills": interview.required_skills,
        "created_at": interview.created_at,
        "questions": interview.questions,
    }

    csv_text = generate_csv_export(interview_data)
    filename = f"{sanitize_filename(interview.role_title)}_interview_{interview.id}.csv"
    return Response(
        content=csv_text,
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )


@router.get("/{interview_id}/export/json")
def export_interview_json(
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
            detail="Interview not found or access denied."
        )

    interview_data = {
        "id": interview.id,
        "role_title": interview.role_title,
        "job_description": interview.job_description,
        "experience_level": interview.experience_level,
        "interview_type": interview.interview_type,
        "difficulty": interview.difficulty,
        "required_skills": interview.required_skills,
        "duration_minutes": interview.duration_minutes,
        "company_or_industry": interview.company_or_industry,
        "language": interview.language,
        "created_at": str(interview.created_at),
        "updated_at": str(interview.updated_at),
        "questions": interview.questions,
        "evaluations": interview.evaluations,
    }

    json_text = generate_json_export(interview_data)
    filename = f"{sanitize_filename(interview.role_title)}_interview_{interview.id}.json"
    return Response(
        content=json_text,
        media_type="application/json",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )
