// API routes for individual document type operations
import { NextResponse } from 'next/server';
import { DocumentTypeService } from '@/services/documentTypeService';

// GET /api/setup/document-types/[id] - Get document type by ID
export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    const documentType = await DocumentTypeService.getDocumentTypeById(id);
    
    return NextResponse.json(documentType);
  } catch (error) {
    console.error('Error fetching document type:', error);
    
    if (error.message.includes('not found')) {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/setup/document-types/[id] - Update document type
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { updated_by, ...updateData } = body;
    
    const updatedDocumentType = await DocumentTypeService.updateDocumentType(
      id,
      updateData,
      updated_by || 'system'
    );
    
    return NextResponse.json(updatedDocumentType);
  } catch (error) {
    console.error('Error updating document type:', error);
    
    if (error.message.includes('not found')) {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      );
    }
    
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

// DELETE /api/setup/document-types/[id] - Delete document type
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    
    const result = await DocumentTypeService.deleteDocumentType(id);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error deleting document type:', error);
    
    if (error.message.includes('not found')) {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
