from typing import AsyncGenerator, List
import litellm
from ..models.chat import Message, ChatRequest

class ChatService:
    """Service to handle chat completions for different models."""
    
    GEMINI_MODELS = {
        "flash": "gemini/gemini-2.0-flash",
        "thinking": "gemini/gemini-2.0-flash-thinking-exp-01-21"
    }
    
    FIREWORKS_MODELS = {
        "r1": "fireworks_ai/accounts/fireworks/models/deepseek-r1",
        "v3": "fireworks_ai/accounts/fireworks/models/deepseek-v3"
    }
    
    @staticmethod
    async def stream_gemini(messages: List[Message], model_version: str = "flash", temperature: float = 0.7) -> AsyncGenerator[str, None]:
        """
        Stream responses from Google's Gemini model.
        
        Args:
            messages: List of conversation messages
            model_version: Version of Gemini model to use ("flash" or "thinking")
            temperature: Sampling temperature
        """
        try:
            model = ChatService.GEMINI_MODELS.get(model_version)
            if not model:
                yield f"Error: Invalid Gemini model version: {model_version}"
                return

            response = await litellm.acompletion(
                model=model,
                messages=[{"role": m.role, "content": m.content} for m in messages],
                temperature=temperature,
                stream=True
            )
            
            async for chunk in response:
                if chunk.choices[0].delta.content is not None:
                    yield chunk.choices[0].delta.content
                    
        except Exception as e:
            yield f"Error: {str(e)}"

    @staticmethod
    async def stream_fireworks(messages: List[Message], model_version: str = "v3", temperature: float = 0.7) -> AsyncGenerator[str, None]:
        """
        Stream responses from FireworksAI's model.
        
        Args:
            messages: List of conversation messages
            model_version: Version of Fireworks model to use ("r1" or "v3")
            temperature: Sampling temperature
        """
        try:
            model = ChatService.FIREWORKS_MODELS.get(model_version)
            if not model:
                yield f"Error: Invalid Fireworks model version: {model_version}"
                return

            response = await litellm.acompletion(
                model=model,
                messages=[{"role": m.role, "content": m.content} for m in messages],
                temperature=temperature,
                stream=True
            )
            
            async for chunk in response:
                if chunk.choices[0].delta.content is not None:
                    yield chunk.choices[0].delta.content
                    
        except Exception as e:
            yield f"Error: {str(e)}" 