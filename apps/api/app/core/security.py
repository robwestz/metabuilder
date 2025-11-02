
import time, jwt
from .config import settings

def create_access_token(subject: str) -> str:
    payload = {"sub": subject, "exp": int(time.time()) + settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60}
    return jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")
