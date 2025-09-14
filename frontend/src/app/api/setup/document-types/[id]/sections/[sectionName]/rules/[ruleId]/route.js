// API routes for individual section rule operations
import { NextResponse } from 'next/server';
import { DocumentTypeService } from '@/services/documentTypeService';

// PUT /api/setup/document-types/[id]/sections/[sectionName]/rules/[ruleId] - Update section rule
export async function PUT(request, { params }) {
  try {
    const { id, sectionName, ruleId } = params;
    const ruleData = await request.json();
    
    const updatedDocumentType = await DocumentTypeService.updateSectionRule(
      id,
      decodeURIComponent(sectionName),
      decodeURIComponent(ruleId),
      ruleData
    );
    
    return NextResponse.json(updatedDocumentType);
  } catch (error) {
    console.error('Error updating section rule:', error);
    
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

// DELETE /api/setup/document-types/[id]/sections/[sectionName]/rules/[ruleId] - Delete section rule
export async function DELETE(request, { params }) {
  try {
    const { id, sectionName, ruleId } = params;
    
    const updatedDocumentType = await DocumentTypeService.deleteSectionRule(
      id,
      decodeURIComponent(sectionName),
      decodeURIComponent(ruleId)
    );
    
    return NextResponse.json(updatedDocumentType);
  } catch (error) {
    console.error('Error deleting section rule:', error);
    
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
