# app/db/redis.py
import redis
import os
import json
import logging
from datetime import timedelta

logger = logging.getLogger(__name__)

# Get Redis configuration from environment variables or use defaults
REDIS_HOST = os.getenv('REDIS_HOST', 'localhost')
REDIS_PORT = int(os.getenv('REDIS_PORT', 6379))
REDIS_DB = int(os.getenv('REDIS_DB', 0))
REDIS_PASSWORD = os.getenv('REDIS_PASSWORD', None)

# Create Redis client
redis_client = redis.Redis(
    host=REDIS_HOST,
    port=REDIS_PORT,
    db=REDIS_DB,
    password=REDIS_PASSWORD,
    decode_responses=True,
    socket_timeout=5,
    socket_connect_timeout=5,
    retry_on_timeout=True
)

# Test Redis connection
try:
    redis_client.ping()
    logger.info("Redis connection established")
except redis.ConnectionError as e:
    logger.error(f"Redis connection failed: {e}")
    # Continue without Redis - we'll fall back to MongoDB

def get_redis_client():
    """Get Redis client instance"""
    return redis_client

# Session management functions
def set_session(session_id, user_data, expire_seconds=3600):
    """Store session data in Redis with expiration"""
    try:
        redis_client.setex(
            f"session:{session_id}", 
            timedelta(seconds=expire_seconds),
            json.dumps(user_data)
        )
        return True
    except Exception as e:
        logger.error(f"Error storing session in Redis: {e}")
        return False

def get_session(session_id):
    """Get session data from Redis"""
    try:
        data = redis_client.get(f"session:{session_id}")
        if data:
            return json.loads(data)
        return None
    except Exception as e:
        logger.error(f"Error retrieving session from Redis: {e}")
        return None

def delete_session(session_id):
    """Delete session data from Redis"""
    try:
        redis_client.delete(f"session:{session_id}")
        return True
    except Exception as e:
        logger.error(f"Error deleting session from Redis: {e}")
        return False

def extend_session(session_id, expire_seconds=3600):
    """Extend session expiration time"""
    try:
        # Get current session data
        data = get_session(session_id)
        if data:
            # Reset with new expiration
            set_session(session_id, data, expire_seconds)
            return True
        return False
    except Exception as e:
        logger.error(f"Error extending session in Redis: {e}")
        return False