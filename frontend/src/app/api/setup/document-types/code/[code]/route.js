// API route for getting document type by code
import { NextResponse } from 'next/server';
import { DocumentTypeService } from '@/services/documentTypeService';

// GET /api/setup/document-types/code/[code] - Get document type by code
export async function GET(request, { params }) {
  try {
    const { code } = params;
    
    const documentType = await DocumentTypeService.getDocumentTypeByCode(code);
    
    return NextResponse.json(documentType);
  } catch (error) {
    console.error('Error fetching document type by code:', error);
    
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
