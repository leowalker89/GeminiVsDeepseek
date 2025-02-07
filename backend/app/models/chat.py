from typing import List, Optional, Literal
from pydantic import BaseModel

class ChatRequest(BaseModel):
    messages: List[Message]
    model: Literal["gemini", "fireworks"]
    model_version: Literal["flash", "thinking", "r1", "v3"]
    stream: bool = True
    temperature: Optional[float] = 0.7
    max_tokens: Optional[int] = 1000 