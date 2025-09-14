// API routes for section rule operations
import { NextResponse } from 'next/server';
import { DocumentTypeService } from '@/services/documentTypeService';

// POST /api/setup/document-types/[id]/sections/[sectionName]/rules - Add section rule
export async function POST(request, { params }) {
  try {
    const { id, sectionName } = params;
    const ruleData = await request.json();
    
    // Validate required fields
    if (!ruleData.rule_id || !ruleData.name) {
      return NextResponse.json(
        { error: 'rule_id and name are required' },
        { status: 400 }
      );
    }
    
    const updatedDocumentType = await DocumentTypeService.addSectionRule(
      id,
      decodeURIComponent(sectionName),
      ruleData
    );
    
    return NextResponse.json(updatedDocumentType);
  } catch (error) {
    console.error('Error adding section rule:', error);
    
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
