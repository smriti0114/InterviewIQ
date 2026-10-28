from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field, model_validator
from app.schemas.rubric import RubricCriterion, CandidateAnswerEvaluation


class CodingDetails(BaseModel):
    problem_statement: Optional[str] = None
    input_format: Optional[str] = None
    output_format: Optional[str] = None
    constraints: Optional[str] = None
    sample_input: Optional[str] = None
    sample_output: Optional[str] = None
    edge_cases: List[str] = Field(default_factory=list)


class GeneratedQuestion(BaseModel):
    id: str = Field(..., description="Unique question identifier, e.g. 'q-1'")
    number: int = Field(..., description="Sequential question number 1..N")
    question: str = Field(..., min_length=5, description="Full question text")
    category: str = Field(..., description="Category: Technical, HR, Behavioral, Coding, System Design, etc.")
    topic: str = Field(..., description="Skill or topic assessed, e.g. 'SQL Indexing', 'Team Conflict'")
    difficulty: str = Field(..., description="Difficulty: Easy, Medium, or Hard")
    question_type: str = Field(..., description="Question type, e.g. Technical, HR, Behavioral, Coding")
    suggested_answer: str = Field(..., min_length=10, description="Comprehensive model answer or outline")
    key_concepts: List[str] = Field(default_factory=list, description="Core keywords and concepts expected")
    follow_up_questions: List[str] = Field(default_factory=list, description="Relevant probing follow-up questions")
    max_score: int = Field(default=10, ge=1, le=50, description="Maximum total score")
    evaluation_rubric: List[RubricCriterion] = Field(..., min_length=1, description="Specific scoring rubric criteria")
    red_flags: List[str] = Field(default_factory=list, description="Common mistakes, misconceptions, or warning signals")
    estimated_time_minutes: int = Field(default=5, ge=1, le=60, description="Estimated time for this question")
    coding_details: Optional[CodingDetails] = None

    @model_validator(mode="after")
    def validate_rubric_sum(self):
        # Ensure sum of criterion max points equals max_score.
        # If the LLM generates a minor discrepancy, adjust the criteria points gracefully.
        if not self.evaluation_rubric:
            return self

        total_rubric = sum(c.max_points for c in self.evaluation_rubric)
        if total_rubric != self.max_score:
            diff = self.max_score - total_rubric
            # Adjust the first or last criterion's points to make it strictly equal
            if self.evaluation_rubric[0].max_points + diff >= 1:
                self.evaluation_rubric[0].max_points += diff
            else:
                self.max_score = total_rubric
        return self


class InterviewGenerateRequest(BaseModel):
    role_title: str = Field(..., min_length=2, max_length=100, description="Target job title, e.g. 'Senior Python Developer'")
    job_description: Optional[str] = Field(None, max_length=5000, description="Job description or context")
    required_skills: str = Field(..., min_length=2, max_length=500, description="Comma-separated required skills")
    experience_level: str = Field(default="Mid-Level", description="Fresher, Entry Level, Mid-Level, or Senior")
    interview_type: str = Field(default="Technical", description="Technical, HR, Behavioral, Coding, System Design, or Mixed")
    difficulty: str = Field(default="Medium", description="Easy, Medium, Hard, or Mixed")
    question_count: int = Field(default=10, ge=5, le=30, description="Number of questions to generate (5 to 30)")
    duration_minutes: Optional[int] = Field(default=45, ge=15, le=180, description="Interview duration in minutes")
    company_or_industry: Optional[str] = Field(None, max_length=100, description="Optional company or industry focus")
    candidate_resume_text: Optional[str] = Field(None, max_length=10000, description="Candidate resume text or skills summary")
    focus_areas: Optional[str] = Field(None, max_length=300, description="Specific topics or focus areas")
    language: str = Field(default="English", max_length=50, description="Language preference")
    demo_mode: Optional[bool] = Field(default=False, description="Explicit test demo mode toggle")


class QuestionRegenerateRequest(BaseModel):
    question_id: str
    feedback: Optional[str] = Field(None, max_length=300, description="Instructions for regenerating, e.g. 'make it harder' or 'focus on asyncio'")


class InterviewUpdateRequest(BaseModel):
    role_title: Optional[str] = None
    questions: Optional[List[GeneratedQuestion]] = None
    evaluations: Optional[Dict[str, Any]] = None


class InterviewSummaryResponse(BaseModel):
    id: int
    role_title: str
    required_skills: str
    experience_level: str
    interview_type: str
    difficulty: str
    question_count: int
    duration_minutes: Optional[int] = None
    company_or_industry: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class InterviewDetailResponse(BaseModel):
    id: int
    user_id: int
    role_title: str
    job_description: Optional[str] = None
    required_skills: str
    experience_level: str
    interview_type: str
    difficulty: str
    question_count: int
    duration_minutes: Optional[int] = None
    company_or_industry: Optional[str] = None
    candidate_resume_text: Optional[str] = None
    focus_areas: Optional[str] = None
    language: str
    questions: List[GeneratedQuestion]
    evaluations: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class InterviewListResponse(BaseModel):
    items: List[InterviewSummaryResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
