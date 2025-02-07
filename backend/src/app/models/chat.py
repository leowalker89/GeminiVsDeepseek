from typing import List, Literal
from pydantic import BaseModel

class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[Message]
    model: Literal["gemini", "fireworks"]
    model_version: Literal["flash", "thinking", "r1", "v3"]
    stream: bool = True 