from typing import List, Optional
from pydantic import BaseModel, Field


class RubricCriterion(BaseModel):
    criterion_name: str = Field(..., description="Name of the evaluation criterion, e.g., 'Technical Correctness'")
    description: str = Field(..., description="Explanation of what is assessed")
    max_points: int = Field(..., ge=1, description="Maximum points allocated to this criterion")
    strong_indicators: List[str] = Field(default_factory=list, description="Observable indicators of an exceptional answer")
    weak_indicators: List[str] = Field(default_factory=list, description="Indicators of a partial, incorrect, or weak answer")


class CriterionScore(BaseModel):
    criterion_name: str
    assigned_points: int
    notes: Optional[str] = ""


class CandidateAnswerEvaluation(BaseModel):
    question_id: str
    candidate_answer: str
    criterion_scores: List[CriterionScore] = Field(default_factory=list)
    overall_question_score: int = 0
    feedback: Optional[str] = ""
