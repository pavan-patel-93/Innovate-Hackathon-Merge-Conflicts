#!/usr/bin/env python3
"""
Setup script for FasiAPI backend.
Handles dependency installation and environment setup.
"""
import subprocess
import sys
import os
from pathlib import Path


def run_command(command, description):
    """Run a command and handle errors."""
    print(f"🔄 {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} completed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed:")
        print(f"Error: {e.stderr}")
        return False


def check_python_version():
    """Check if Python version is compatible."""
    if sys.version_info < (3, 8):
        print("❌ Python 3.8 or higher is required")
        print(f"Current version: {sys.version}")
        return False
    print(f"✅ Python version {sys.version.split()[0]} is compatible")
    return True


def install_dependencies(use_minimal=False):
    """Install project dependencies."""
    requirements_file = "requirements-minimal.txt" if use_minimal else "requirements.txt"
    
    if not os.path.exists(requirements_file):
        print(f"❌ Requirements file {requirements_file} not found")
        return False
    
    print(f"📦 Installing dependencies from {requirements_file}...")
    
    # Upgrade pip first
    if not run_command(f"{sys.executable} -m pip install --upgrade pip", "Upgrading pip"):
        return False
    
    # Install dependencies
    if not run_command(f"{sys.executable} -m pip install -r {requirements_file}", f"Installing dependencies from {requirements_file}"):
        return False
    
    return True


def create_env_file():
    """Create .env file if it doesn't exist."""
    env_file = Path(".env")
    if env_file.exists():
        print("✅ .env file already exists")
        return True
    
    print("📝 Creating .env file...")
    env_content = """# FasiAPI Environment Configuration

# Application Settings
DEBUG=true
LOG_LEVEL=INFO
SECRET_KEY=your-secret-key-change-in-production

# Database Settings
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB_NAME=fasi_api

# CORS Settings
CORS_ORIGINS=http://localhost:3000,http://localhost:3001

# AI Services (Optional)
AZURE_OPENAI_KEY=your_azure_openai_key_here
AZURE_OPENAI_ENDPOINT=your_azure_openai_endpoint_here
LAMAPARSE_API_KEY=your_lamaparse_api_key_here

# File Upload Settings
MAX_FILE_SIZE=10485760
UPLOAD_DIR=app/uploaded-files

# WebSocket Settings
WS_HEARTBEAT_INTERVAL=30
WS_MAX_CONNECTIONS=1000
"""
    
    try:
        with open(env_file, 'w') as f:
            f.write(env_content)
        print("✅ .env file created successfully")
        print("⚠️  Please update the .env file with your actual configuration values")
        return True
    except Exception as e:
        print(f"❌ Failed to create .env file: {e}")
        return False


def main():
    """Main setup function."""
    print("🚀 FasiAPI Backend Setup")
    print("=" * 50)
    
    # Check Python version
    if not check_python_version():
        sys.exit(1)
    
    # Ask user for installation type
    print("\n📋 Installation Options:")
    print("1. Full installation (with monitoring and observability)")
    print("2. Minimal installation (core features only)")
    
    choice = input("\nEnter your choice (1 or 2): ").strip()
    use_minimal = choice == "2"
    
    if choice not in ["1", "2"]:
        print("❌ Invalid choice. Please run the script again and choose 1 or 2.")
        sys.exit(1)
    
    # Install dependencies
    if not install_dependencies(use_minimal):
        print("❌ Dependency installation failed")
        sys.exit(1)
    
    # Create .env file
    if not create_env_file():
        print("❌ Failed to create .env file")
        sys.exit(1)
    
    print("\n🎉 Setup completed successfully!")
    print("\n📚 Next steps:")
    print("1. Update the .env file with your configuration")
    print("2. Start MongoDB if not already running")
    print("3. Run the application:")
    print("   python server.py")
    print("   or")
    print("   python -m uvicorn app.main:app --reload")
    print("\n📖 For more information, see:")
    print("   - INDUSTRY_STANDARD_ARCHITECTURE.md")
    print("   - REFACTORING_SUMMARY.md")


if __name__ == "__main__":
    main()
