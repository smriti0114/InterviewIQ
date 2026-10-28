import time
from typing import Dict, List
from fastapi import HTTPException, status
from app.core.config import settings


class InMemoryRateLimiter:
    """Sliding window rate limiter for expensive AI endpoints."""
    def __init__(self, requests_per_minute: int = 15):
        self.requests_per_minute = requests_per_minute
        self.history: Dict[str, List[float]] = {}

    def check_rate_limit(self, key: str):
        now = time.time()
        window_start = now - 60.0

        if key not in self.history:
            self.history[key] = []

        # Keep timestamps within the last 60 seconds
        self.history[key] = [ts for ts in self.history[key] if ts > window_start]

        if len(self.history[key]) >= self.requests_per_minute:
            retry_after = int(60 - (now - self.history[key][0])) + 1
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Rate limit exceeded. Maximum {self.requests_per_minute} AI generations per minute. Try again in {retry_after} seconds.",
                headers={"Retry-After": str(retry_after)},
            )

        self.history[key].append(now)


generation_limiter = InMemoryRateLimiter(
    requests_per_minute=settings.RATE_LIMIT_GENERATE_PER_MINUTE
)
