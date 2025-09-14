// API routes for document type CRUD operations
import { NextResponse } from 'next/server';
import { DocumentTypeService } from '@/services/documentTypeService';

// GET /api/setup/document-types - Get all document types
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const skip = parseInt(searchParams.get('skip') || '0');
    const limit = parseInt(searchParams.get('limit') || '100');
    
    const documentTypes = await DocumentTypeService.getDocumentTypes(skip, limit);
    
    return NextResponse.json(documentTypes);
  } catch (error) {
    console.error('Error fetching document types:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/setup/document-types - Create new document type
export async function POST(request) {
  try {
    const body = await request.json();
    const { created_by, ...documentTypeData } = body;
    
    // Validate required fields
    if (!documentTypeData.code || !documentTypeData.name) {
      return NextResponse.json(
        { error: 'Code and name are required' },
        { status: 400 }
      );
    }
    
    const createdDocumentType = await DocumentTypeService.createDocumentType(
      documentTypeData,
      created_by || 'system'
    );
    
    return NextResponse.json(createdDocumentType, { status: 201 });
  } catch (error) {
    console.error('Error creating document type:', error);
    
    if (error.message.includes('already exists')) {
      return NextResponse.json(
        { error: error.message },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
