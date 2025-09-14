"""
File upload service implementation.
Handles file upload operations and processing.
"""
from typing import Dict, Any, Optional, List
import os
import uuid
import aiofiles
from pathlib import Path
from datetime import datetime

from app.services.base_service import BaseService
from app.core.exceptions import FileUploadError, ValidationError
from app.core.logging import get_logger

logger = get_logger(__name__)


class FileUploadService(BaseService[None]):
    """Service for file upload operations."""
    
    def __init__(self):
        super().__init__()
        
        # Allowed file types and their extensions
        self.allowed_types = {
            'application/pdf': ['.pdf'],
            'application/msword': ['.doc'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
            'text/plain': ['.txt'],
            'application/vnd.ms-excel': ['.xls'],
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
            'application/vnd.ms-powerpoint': ['.ppt'],
            'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx']
        }
        
        # Maximum file size (10MB)
        self.max_file_size = 10 * 1024 * 1024
        
        # Default upload directory
        self.upload_dir = "uploaded-files"
    
    async def validate_file(
        self, 
        filename: str, 
        content_type: str, 
        size: int
    ) -> Dict[str, Any]:
        """Validate uploaded file."""
        try:
            # Check file size
            if size > self.max_file_size:
                raise ValidationError(
                    f"File size {size} exceeds maximum allowed size of {self.max_file_size} bytes"
                )
            
            # Check content type
            if content_type not in self.allowed_types:
                raise ValidationError(
                    f"File type {content_type} not supported",
                    {"supported_types": list(self.allowed_types.keys())}
                )
            
            # Check file extension
            file_extension = Path(filename).suffix.lower()
            allowed_extensions = self.allowed_types[content_type]
            
            if file_extension not in allowed_extensions:
                raise ValidationError(
                    f"File extension {file_extension} not allowed for content type {content_type}",
                    {"allowed_extensions": allowed_extensions}
                )
            
            # Validate filename
            if not filename or len(filename) > 255:
                raise ValidationError("Invalid filename")
            
            # Check for dangerous characters in filename
            dangerous_chars = ['..', '/', '\\', ':', '*', '?', '"', '<', '>', '|']
            for char in dangerous_chars:
                if char in filename:
                    raise ValidationError(f"Filename contains dangerous character: {char}")
            
            return {
                "valid": True,
                "file_extension": file_extension,
                "content_type": content_type,
                "size": size
            }
            
        except Exception as e:
            self.log_error("validate_file", e, {
                "filename": filename,
                "content_type": content_type,
                "size": size
            })
            raise
    
    async def save_file(
        self, 
        file_content: bytes, 
        filename: str, 
        content_type: str,
        upload_dir: Optional[str] = None
    ) -> Dict[str, Any]:
        """Save uploaded file to disk."""
        try:
            # Validate file first
            validation_result = await self.validate_file(
                filename, content_type, len(file_content)
            )
            
            if not validation_result["valid"]:
                raise ValidationError("File validation failed")
            
            # Set upload directory
            target_dir = upload_dir or self.upload_dir
            os.makedirs(target_dir, exist_ok=True)
            
            # Generate unique filename
            file_extension = validation_result["file_extension"]
            unique_filename = f"{uuid.uuid4()}{file_extension}"
            file_path = os.path.join(target_dir, unique_filename)
            
            # Save file
            async with aiofiles.open(file_path, 'wb') as f:
                await f.write(file_content)
            
            # Get file stats
            file_stats = os.stat(file_path)
            
            result = {
                "original_filename": filename,
                "saved_filename": unique_filename,
                "file_path": file_path,
                "content_type": content_type,
                "size": len(file_content),
                "file_extension": file_extension,
                "uploaded_at": datetime.now().isoformat(),
                "file_stats": {
                    "size_on_disk": file_stats.st_size,
                    "created_at": datetime.fromtimestamp(file_stats.st_ctime).isoformat(),
                    "modified_at": datetime.fromtimestamp(file_stats.st_mtime).isoformat()
                }
            }
            
            self.log_operation("save_file", {
                "original_filename": filename,
                "saved_filename": unique_filename,
                "size": len(file_content)
            })
            
            return result
            
        except Exception as e:
            self.log_error("save_file", e, {
                "filename": filename,
                "content_type": content_type,
                "size": len(file_content)
            })
            raise FileUploadError(f"Failed to save file: {str(e)}")
    
    async def delete_file(self, file_path: str) -> bool:
        """Delete a file from disk."""
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
                
                self.log_operation("delete_file", {"file_path": file_path})
                return True
            
            return False
            
        except Exception as e:
            self.log_error("delete_file", e, {"file_path": file_path})
            raise FileUploadError(f"Failed to delete file: {str(e)}")
    
    async def get_file_info(self, file_path: str) -> Optional[Dict[str, Any]]:
        """Get file information."""
        try:
            if not os.path.exists(file_path):
                return None
            
            file_stats = os.stat(file_path)
            
            return {
                "file_path": file_path,
                "filename": os.path.basename(file_path),
                "size": file_stats.st_size,
                "created_at": datetime.fromtimestamp(file_stats.st_ctime).isoformat(),
                "modified_at": datetime.fromtimestamp(file_stats.st_mtime).isoformat(),
                "exists": True
            }
            
        except Exception as e:
            self.log_error("get_file_info", e, {"file_path": file_path})
            return None
    
    async def cleanup_old_files(self, days_old: int = 30) -> int:
        """Clean up files older than specified days."""
        try:
            cleaned_count = 0
            cutoff_time = datetime.now().timestamp() - (days_old * 24 * 60 * 60)
            
            for root, dirs, files in os.walk(self.upload_dir):
                for file in files:
                    file_path = os.path.join(root, file)
                    try:
                        file_time = os.path.getmtime(file_path)
                        if file_time < cutoff_time:
                            os.remove(file_path)
                            cleaned_count += 1
                    except Exception as e:
                        self.log_error("cleanup_old_files_individual", e, {"file_path": file_path})
            
            if cleaned_count > 0:
                self.log_operation("cleanup_old_files", {
                    "cleaned_count": cleaned_count,
                    "days_old": days_old
                })
            
            return cleaned_count
            
        except Exception as e:
            self.log_error("cleanup_old_files", e, {"days_old": days_old})
            return 0
    
    async def get_upload_stats(self) -> Dict[str, Any]:
        """Get upload statistics."""
        try:
            total_files = 0
            total_size = 0
            file_types = {}
            
            for root, dirs, files in os.walk(self.upload_dir):
                for file in files:
                    file_path = os.path.join(root, file)
                    try:
                        file_stats = os.stat(file_path)
                        total_files += 1
                        total_size += file_stats.st_size
                        
                        # Count by file extension
                        file_ext = Path(file).suffix.lower()
                        file_types[file_ext] = file_types.get(file_ext, 0) + 1
                        
                    except Exception as e:
                        self.log_error("get_upload_stats_individual", e, {"file_path": file_path})
            
            return {
                "total_files": total_files,
                "total_size": total_size,
                "total_size_mb": round(total_size / (1024 * 1024), 2),
                "file_types": file_types,
                "upload_dir": self.upload_dir
            }
            
        except Exception as e:
            self.log_error("get_upload_stats", e)
            return {
                "total_files": 0,
                "total_size": 0,
                "total_size_mb": 0,
                "file_types": {},
                "upload_dir": self.upload_dir
            }
    
    def get_supported_types(self) -> Dict[str, List[str]]:
        """Get supported file types and extensions."""
        return self.allowed_types.copy()
    
    def get_max_file_size(self) -> int:
        """Get maximum allowed file size."""
        return self.max_file_size
