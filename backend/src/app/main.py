from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sse_starlette.sse import EventSourceResponse
from dotenv import load_dotenv
from .models.chat import ChatRequest
from .services.chat_service import ChatService

load_dotenv()

app = FastAPI()

@app.post("/api/chat/stream")
async def stream_chat(request: ChatRequest):
    """Stream chat responses from selected model."""
    try:
        if request.model == "gemini":
            generator = ChatService.stream_gemini(
                messages=request.messages,
                model_version=request.model_version
            )
        else:  # fireworks
            generator = ChatService.stream_fireworks(
                messages=request.messages,
                model_version=request.model_version
            )

        async def event_generator():
            try:
                async for chunk in generator:
                    if chunk:
                        yield {
                            "event": "message",
                            "data": chunk
                        }
            except Exception as e:
                yield {
                    "event": "error",
                    "data": str(e)
                }

        return EventSourceResponse(event_generator())

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
