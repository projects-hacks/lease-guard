from google import genai
from app.config import settings

class LegalChatBot:
    def __init__(self):
        if not settings.GEMINI_API_KEY:
            raise ValueError("Gemini API Key is missing")
        self.client = genai.Client(api_key=settings.GEMINI_API_KEY)
        self.model = "gemini-3-flash-preview" 
        
        self.system_instruction = """
        You are 'LeaseGuard AI', a helpful legal assistant for tenants.
        Your goal is to answer questions about rental laws, lease agreements, and tenant rights clearly and concisely.
        
        Guidelines:
        - Provide accurate, general legal information based on US tenant law (prioritize California/New York if unspecified).
        - Always clarify that you are an AI and this is not professional legal advice.
        - Be empathetic to tenants facing issues.
        - Keep answers concise (max 3-4 sentences) suitable for voice conversation.
        """

    def get_legal_answer(self, user_query: str) -> str:
        try:
            response = self.client.models.generate_content(
                model=self.model,
                contents=user_query,
                config=dict(system_instruction=self.system_instruction) # Pass system instruction here
            )
            return response.text
        except Exception as e:
            print(f"LLM Error: {e}")
            return "I'm sorry, I'm having trouble accessing my legal database right now. Please try again."
