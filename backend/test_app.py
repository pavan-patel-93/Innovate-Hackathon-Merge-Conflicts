#!/usr/bin/env python3
"""
Test script to verify the FasiAPI application starts correctly.
"""
import asyncio
import sys
from pathlib import Path

# Add the app directory to Python path
sys.path.insert(0, str(Path(__file__).parent))

async def test_app_startup():
    """Test if the application can start without errors."""
    try:
        print("🔄 Testing FasiAPI application startup...")
        
        # Import the main application
        from app.main import app
        print("✅ Application imported successfully")
        
        # Test dependency injection
        from app.core.dependencies import get_chat_service, get_websocket_service
        print("✅ Dependencies imported successfully")
        
        # Test service creation
        websocket_service = await get_websocket_service()
        print("✅ WebSocket service created successfully")
        
        # Test database connection (if available)
        try:
            from app.core.database import check_database_health
            db_healthy = await check_database_health()
            if db_healthy:
                print("✅ Database connection successful")
            else:
                print("⚠️  Database connection failed (MongoDB may not be running)")
        except Exception as e:
            print(f"⚠️  Database connection test failed: {e}")
        
        print("\n🎉 Application startup test completed successfully!")
        print("The FasiAPI backend is ready to run.")
        
        return True
        
    except Exception as e:
        print(f"❌ Application startup test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = asyncio.run(test_app_startup())
    sys.exit(0 if success else 1)
