import json
import logging
import re
from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
import httpx
from fastapi import HTTPException, status

from app.core.config import settings
from app.schemas.interview import (
    InterviewGenerateRequest,
    GeneratedQuestion,
)
from app.schemas.rubric import RubricCriterion
from app.schemas.user import ApiConfigStatus
from app.services.prompt_builder import (
    SYSTEM_PROMPT,
    build_generation_prompt,
    build_regeneration_prompt,
)

logger = logging.getLogger("interviewiq.llm")


def clean_json_text(raw_text: str) -> str:
    """Strip markdown code fence blocks if returned by the LLM."""
    text = raw_text.strip()
    # Strip ```json ... ```
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?\s*", "", text, flags=re.IGNORECASE)
        text = re.sub(r"\s*```$", "", text)
    return text.strip()


class BaseLLMProvider(ABC):
    @abstractmethod
    async def generate_completion(self, prompt: str, system_prompt: str) -> str:
        """Call LLM provider and return raw response string."""
        pass


class GeminiProvider(BaseLLMProvider):
    def __init__(self, api_key: str, model: Optional[str] = None):
        self.api_key = api_key
        self.model = model or "gemini-2.5-flash"
        self.base_url = "https://generativelanguage.googleapis.com/v1beta"

    async def generate_completion(self, prompt: str, system_prompt: str) -> str:
        url = f"{self.base_url}/models/{self.model}:generateContent?key={self.api_key}"
        payload = {
            "contents": [
                {
                    "parts": [
                        {"text": f"{system_prompt}\n\nTask:\n{prompt}"}
                    ]
                }
            ],
            "generationConfig": {
                "response_mime_type": "application/json",
                "temperature": 0.4,
                "maxOutputTokens": 8192,
            }
        }
        async with httpx.AsyncClient(timeout=45.0) as client:
            try:
                resp = await client.post(url, json=payload)
            except httpx.RequestError as exc:
                logger.error(f"Gemini API network error: {exc}")
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail=f"Unable to connect to Gemini API: {str(exc)}"
                )

            if resp.status_code != 200:
                logger.error(f"Gemini API returned error {resp.status_code}: {resp.text}")
                detail_msg = "Gemini API error"
                try:
                    err_json = resp.json()
                    detail_msg = err_json.get("error", {}).get("message", resp.text)
                except Exception:
                    detail_msg = resp.text
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail=f"Gemini API error ({resp.status_code}): {detail_msg}"
                )

            data = resp.json()
            try:
                candidates = data.get("candidates", [])
                if not candidates:
                    raise ValueError("No candidates returned by Gemini")
                text = candidates[0]["content"]["parts"][0]["text"]
                return text
            except (KeyError, IndexError, ValueError) as e:
                logger.error(f"Failed to extract candidate text from Gemini: {e}")
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail="Malformed response received from Gemini API"
                )


class OpenAIProvider(BaseLLMProvider):
    def __init__(self, api_key: str, model: Optional[str] = None, base_url: Optional[str] = None):
        self.api_key = api_key
        self.model = model or "gpt-4o-mini"
        self.base_url = (base_url or "https://api.openai.com/v1").rstrip("/")

    async def generate_completion(self, prompt: str, system_prompt: str) -> str:
        url = f"{self.base_url}/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ],
            "response_format": {"type": "json_object"},
            "temperature": 0.4
        }
        async with httpx.AsyncClient(timeout=45.0) as client:
            try:
                resp = await client.post(url, headers=headers, json=payload)
            except httpx.RequestError as exc:
                logger.error(f"OpenAI-compatible API network error: {exc}")
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail=f"Unable to connect to LLM API: {str(exc)}"
                )

            if resp.status_code != 200:
                logger.error(f"LLM API returned {resp.status_code}: {resp.text}")
                detail_msg = "LLM API error"
                try:
                    err_json = resp.json()
                    detail_msg = err_json.get("error", {}).get("message", resp.text)
                except Exception:
                    detail_msg = resp.text
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail=f"LLM API error ({resp.status_code}): {detail_msg}"
                )

            data = resp.json()
            try:
                return data["choices"][0]["message"]["content"]
            except (KeyError, IndexError) as e:
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail="Malformed response received from LLM API"
                )


class MockProvider(BaseLLMProvider):
    """Generates dynamic role-specific questions for testing and demo evaluation."""
    async def generate_completion(self, prompt: str, system_prompt: str) -> str:
        # Extract role and skills hints if present in prompt
        return "{}"  # Handled directly by LLMService mock generator for high-fidelity responses


class LLMService:
    def __init__(self):
        self.provider_name = settings.LLM_PROVIDER.lower()
        self.api_key = settings.LLM_API_KEY
        self.model = settings.LLM_MODEL
        self.base_url = settings.LLM_BASE_URL
        self._provider: Optional[BaseLLMProvider] = None
        self._init_provider()

    def _init_provider(self):
        if not self.api_key:
            self._provider = None
            return

        if self.provider_name in ("gemini", "google"):
            self._provider = GeminiProvider(api_key=self.api_key, model=self.model)
        elif self.provider_name in ("openai", "groq", "together", "custom"):
            self._provider = OpenAIProvider(api_key=self.api_key, model=self.model, base_url=self.base_url)
        elif self.provider_name == "mock":
            self._provider = MockProvider()
        else:
            self._provider = GeminiProvider(api_key=self.api_key, model=self.model)

    def get_api_status(self) -> ApiConfigStatus:
        has_key = bool(self.api_key and len(self.api_key.strip()) > 5)
        provider_display = self.provider_name.capitalize()
        model_display = self.model or ("gemini-2.5-flash" if self.provider_name in ("gemini", "google") else "gpt-4o-mini")

        if has_key:
            return ApiConfigStatus(
                llm_provider=provider_display,
                llm_model=model_display,
                is_configured=True,
                has_api_key=True,
                message=f"Connected to {provider_display} API ({model_display})"
            )
        else:
            return ApiConfigStatus(
                llm_provider=provider_display,
                llm_model=model_display,
                is_configured=False,
                has_api_key=False,
                message=f"API key missing. Set LLM_API_KEY (or GEMINI_API_KEY) in backend/.env to enable live generation."
            )

    async def generate_interview_questions(self, req: InterviewGenerateRequest) -> List[GeneratedQuestion]:
        # Check if demo mode was requested or mock provider is active
        if req.demo_mode or self.provider_name == "mock":
            return self._generate_dynamic_mock_questions(req)

        # Ensure API key is configured
        if not self._provider or not self.api_key:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="LLM API key is not configured. Please add your GEMINI_API_KEY or OPENAI_API_KEY to the backend .env file, or check Settings. You can also test with 'Demo Mode' enabled in the generator."
            )

        prompt = build_generation_prompt(req)
        
        # Retry loop for malformed JSON outputs
        last_error = None
        for attempt in range(2):
            try:
                raw_response = await self._provider.generate_completion(prompt, SYSTEM_PROMPT)
                clean_text = clean_json_text(raw_response)
                parsed_json = json.loads(clean_text)

                questions_data = parsed_json.get("questions")
                if not questions_data or not isinstance(questions_data, list):
                    raise ValueError("JSON response missing 'questions' list")

                questions: List[GeneratedQuestion] = []
                for idx, q_dict in enumerate(questions_data):
                    # Guarantee id and number sequence
                    q_dict["id"] = q_dict.get("id") or f"q-{idx + 1}"
                    q_dict["number"] = idx + 1
                    
                    # Ensure rubric exists
                    if "evaluation_rubric" not in q_dict or not q_dict["evaluation_rubric"]:
                        q_dict["evaluation_rubric"] = [
                            {
                                "criterion_name": "Technical Depth & Correctness",
                                "description": "Accuracy and conceptual understanding",
                                "max_points": 5,
                                "strong_indicators": ["Precise and clear explanations"],
                                "weak_indicators": ["Vague or inaccurate statements"]
                            },
                            {
                                "criterion_name": "Practical Application",
                                "description": "Real world implementation and edge cases",
                                "max_points": 5,
                                "strong_indicators": ["Concrete problem solving"],
                                "weak_indicators": ["Inability to apply theory"]
                            }
                        ]
                        q_dict["max_score"] = 10

                    validated_q = GeneratedQuestion.model_validate(q_dict)
                    questions.append(validated_q)

                if questions:
                    return questions
            except (json.JSONDecodeError, ValueError, Exception) as exc:
                logger.warning(f"Generation attempt {attempt + 1} failed: {exc}")
                last_error = exc
                continue

        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Failed to generate structured interview questions after retry: {str(last_error)}"
        )

    async def regenerate_single_question(
        self,
        parent_req: InterviewGenerateRequest,
        current_question: dict,
        feedback: Optional[str] = None
    ) -> GeneratedQuestion:
        if parent_req.demo_mode or self.provider_name == "mock" or not self._provider:
            return self._generate_single_mock_question(parent_req, current_question, feedback)

        prompt = build_regeneration_prompt(parent_req, current_question, feedback)
        for attempt in range(2):
            try:
                raw_response = await self._provider.generate_completion(prompt, SYSTEM_PROMPT)
                clean_text = clean_json_text(raw_response)
                parsed_json = json.loads(clean_text)

                q_dict = parsed_json.get("question") or parsed_json
                q_dict["id"] = current_question.get("id", "q-1")
                q_dict["number"] = current_question.get("number", 1)

                return GeneratedQuestion.model_validate(q_dict)
            except Exception as exc:
                logger.warning(f"Regeneration attempt {attempt + 1} failed: {exc}")
                continue

        # Fallback to single dynamic question generator if provider fails
        return self._generate_single_mock_question(parent_req, current_question, feedback)

    def _generate_dynamic_mock_questions(self, req: InterviewGenerateRequest) -> List[GeneratedQuestion]:
        """High-fidelity dynamic generator for offline testing, demos, and instant local feedback."""
        skills = [s.strip() for s in req.required_skills.split(",") if s.strip()]
        if not skills:
            skills = [req.role_title, "Problem Solving", "System Architecture"]

        questions: List[GeneratedQuestion] = []
        count = min(max(req.question_count, 5), 30)

        for i in range(1, count + 1):
            skill = skills[(i - 1) % len(skills)]
            
            # Select question type and difficulty
            q_type = req.interview_type
            if q_type == "Mixed":
                types_cycle = ["Technical", "Coding", "Behavioral", "System Design", "HR"]
                q_type = types_cycle[(i - 1) % len(types_cycle)]

            diff = req.difficulty
            if diff == "Mixed":
                diffs_cycle = ["Easy", "Medium", "Hard"]
                diff = diffs_cycle[(i - 1) % len(diffs_cycle)]

            # Construct question based on role & skill
            if q_type == "Technical":
                q_text = f"In {req.role_title} workflows using {skill}, how do you diagnose and resolve performance degradation or bottlenecks under high load? Describe your step-by-step investigation methodology."
                topic = f"{skill} Performance & Debugging"
                model_answer = (
                    f"A strong answer outlines structured debugging: 1) Measure and monitor using metrics/APIs, "
                    f"profiling memory allocations and CPU cycles in {skill}; 2) Isolate whether the bottleneck is I/O-bound (database/network latency) "
                    f"or CPU-bound; 3) Implement targeted optimizations such as query indexing, connection pooling, caching strategies, or asynchronous non-blocking handlers; "
                    f"4) Verify with reproducible benchmark/load tests before deploying."
                )
                concepts = [f"{skill} Internals", "Profiling & Metrics", "Bottleneck Isolation", "Caching & Concurrency"]
                red_flags = ["Random trial-and-error changes without profiling", f"Lack of knowledge of {skill} execution model"]
            elif q_type == "Coding":
                q_text = f"Implement a resilient caching mechanism or rate-limiter in {skill} with a sliding window algorithm. Discuss time complexity, concurrency safety, and memory bounds."
                topic = f"{skill} Algorithmic Implementation"
                model_answer = (
                    f"The candidate should design a sliding window using an ordered timestamp queue or token bucket. "
                    f"Must address thread/goroutine safety via mutexes or atomic operations, guarantee O(1) or O(log N) amortized lookup, "
                    f"and explicitly handle memory purging for stale keys."
                )
                concepts = ["Sliding Window", "Concurrency Safety", "Time & Space Complexity", "Memory Eviction"]
                red_flags = ["Ignoring race conditions", "Unbounded memory growth", "O(N^2) complexity"]
            elif q_type == "System Design":
                q_text = f"Architect a fault-tolerant, horizontally scalable notification or ingestion pipeline for {req.role_title} requirements handling 50k events/sec. What storage, queue, and partitioning strategies would you choose?"
                topic = "Distributed Systems & Event Streaming"
                model_answer = (
                    "Covers: API Gateway with rate limiting -> Distributed event log (Kafka/RabbitMQ) partitioned by entity ID -> "
                    "Stateless worker consumer groups with idempotency keys -> Write-optimized datastore -> Circuit breakers and Dead-Letter Queues (DLQ) for failed deliveries."
                )
                concepts = ["Event Driven Architecture", "Partitioning & Sharding", "Idempotency", "Dead Letter Queues", "Backpressure"]
                red_flags = ["Single point of failure without replica failover", "Ignoring message duplication"]
            elif q_type == "Behavioral":
                q_text = f"Describe a situation in your experience where you strongly disagreed with a technical design decision proposed by a colleague or lead. How did you advocate for your point of view, and what was the outcome?"
                topic = "Stakeholder Collaboration & Technical Disagreement"
                model_answer = (
                    "Uses STAR format: 1) Situation: context of conflicting technical approaches; 2) Task: need to align without stalling project delivery; "
                    "3) Action: built quick prototypes/benchmarks to ground discussion in measurable data rather than opinions, listened actively to colleague's trade-offs; "
                    "4) Result: reached consensus or committed to the agreed approach, maintaining team trust."
                )
                concepts = ["STAR Methodology", "Data-driven Consensus", "Constructive Conflict", "Team Alignment"]
                red_flags = ["Passive aggressiveness", "Insisting on personal preference without data", "Holding lingering grudges"]
            else:  # HR
                q_text = f"What key factors make you thrive in an engineering environment, and how do you prioritize competing deadlines across multiple initiatives for {req.role_title} responsibilities?"
                topic = "Prioritization, Culture & Work Style"
                model_answer = (
                    "Articulates clear prioritization criteria (Eisenhower Matrix / business impact vs engineering debt), "
                    "proactive communication with stakeholders on trade-offs, and cultivating continuous learning and psychological safety in the team."
                )
                concepts = ["Time Management", "Transparent Communication", "Continuous Learning", "Team Accountability"]
                red_flags = ["Overpromising and silently missing deadlines", "Blaming others for lack of clarity"]

            # Rubric criteria with sum equal to 10
            rubric = [
                RubricCriterion(
                    criterion_name="Technical Precision & Depth",
                    description=f"Evaluates candidate's accurate grasp of {topic}",
                    max_points=4,
                    strong_indicators=[
                        f"Demonstrates deep, nuanced understanding of {skill} mechanics",
                        "Clearly articulates underlying engineering trade-offs"
                    ],
                    weak_indicators=[
                        "Relies on superficial buzzwords without mechanics",
                        "Makes fundamental factual errors"
                    ]
                ),
                RubricCriterion(
                    criterion_name="Practical Reasoning & Implementation",
                    description="Ability to translate concepts into robust real-world solutions",
                    max_points=3,
                    strong_indicators=[
                        "Structures answer logically with concrete steps",
                        "Considers edge cases and operational reality"
                    ],
                    weak_indicators=[
                        "Offers generic, non-applicable textbook answers",
                        "Fails to identify common failure modes"
                    ]
                ),
                RubricCriterion(
                    criterion_name="Communication & Problem Solving",
                    description="Clarity, structure, and responsiveness",
                    max_points=3,
                    strong_indicators=[
                        "Communicates complex ideas concisely and clearly",
                        "Responds thoughtfully to probing follow-ups"
                    ],
                    weak_indicators=[
                        "Disorganized, rambling, or defensive response",
                        "Avoids direct answers to key questions"
                    ]
                )
            ]

            follow_ups = [
                f"How would your approach change if the scale increased by 100x?",
                f"What monitoring metrics or telemetry would you alert on in production for this scenario?"
            ]

            question = GeneratedQuestion(
                id=f"q-{i}",
                number=i,
                question=q_text,
                category=q_type,
                topic=topic,
                difficulty=diff,
                question_type=q_type,
                suggested_answer=model_answer,
                key_concepts=concepts,
                follow_up_questions=follow_ups,
                max_score=10,
                evaluation_rubric=rubric,
                red_flags=red_flags,
                estimated_time_minutes=5 if q_type != "Coding" else 10,
            )
            questions.append(question)

        return questions

    def _generate_single_mock_question(
        self,
        parent_req: InterviewGenerateRequest,
        current_question: dict,
        feedback: Optional[str] = None
    ) -> GeneratedQuestion:
        num = current_question.get("number", 1)
        qid = current_question.get("id", f"q-{num}")
        skill = parent_req.required_skills.split(",")[0].strip() if parent_req.required_skills else "Engineering"
        q_type = current_question.get("question_type", parent_req.interview_type)
        diff = current_question.get("difficulty", parent_req.difficulty)

        fb_note = f" (Focus: {feedback})" if feedback else ""

        q_text = f"Refined Assessment for {parent_req.role_title}: How would you architect and test a production-grade component in {skill} with high resilience?{fb_note}"
        
        return GeneratedQuestion(
            id=qid,
            number=num,
            question=q_text,
            category=q_type,
            topic=f"{skill} Advanced Architecture",
            difficulty=diff,
            question_type=q_type,
            suggested_answer=f"Detailed model answer demonstrating architectural rigor in {skill}, considering failovers, logging, contract validation, and clean testing.",
            key_concepts=[skill, "Resilience", "Unit & Integration Testing", "Telemetry"],
            follow_up_questions=["What trade-offs did you make regarding latency versus consistency?"],
            max_score=10,
            evaluation_rubric=[
                RubricCriterion(
                    criterion_name="Architecture & Depth",
                    description="Depth of solution and correctness",
                    max_points=4,
                    strong_indicators=["Cohesive design", "Awareness of edge cases"],
                    weak_indicators=["Lacks concrete structure"]
                ),
                RubricCriterion(
                    criterion_name="Testing & Reliability",
                    description="Verification and production hardening",
                    max_points=3,
                    strong_indicators=["Mentions chaos testing or mocks", "Validates failure paths"],
                    weak_indicators=["Overlooks error states"]
                ),
                RubricCriterion(
                    criterion_name="Communication & Justification",
                    description="Clarity of trade-off justification",
                    max_points=3,
                    strong_indicators=["Justifies choices with metrics"],
                    weak_indicators=["Dogmatic choices without reasoning"]
                )
            ],
            red_flags=["Inability to explain failure handling", "Ignoring operational overhead"],
            estimated_time_minutes=6
        )


llm_service = LLMService()
