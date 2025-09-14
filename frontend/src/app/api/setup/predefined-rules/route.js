// API route for predefined rules
import { NextResponse } from 'next/server';

// GET /api/setup/predefined-rules - Get predefined rules
export async function GET() {
  try {
    const predefinedRules = [
      {
        rule_id: "CONTENT-001",
        name: "Minimum Content Length",
        description: "Ensures section has minimum character count",
        severity: "major",
        parameters: {
          min_chars: { type: "number", default: 100, description: "Minimum character count" }
        }
      },
      {
        rule_id: "CONTENT-002",
        name: "Maximum Content Length",
        description: "Ensures section doesn't exceed maximum character count",
        severity: "minor",
        parameters: {
          max_chars: { type: "number", default: 5000, description: "Maximum character count" }
        }
      },
      {
        rule_id: "FORMAT-001",
        name: "Required Keywords",
        description: "Ensures section contains specific keywords",
        severity: "critical",
        parameters: {
          keywords: { type: "array", default: [], description: "Required keywords" }
        }
      },
      {
        rule_id: "FORMAT-002",
        name: "Forbidden Keywords",
        description: "Ensures section doesn't contain forbidden keywords",
        severity: "major",
        parameters: {
          forbidden_keywords: { type: "array", default: [], description: "Forbidden keywords" }
        }
      },
      {
        rule_id: "STRUCTURE-001",
        name: "Required Subsections",
        description: "Ensures section contains specific subsections",
        severity: "critical",
        parameters: {
          subsections: { type: "array", default: [], description: "Required subsections" }
        }
      },
      {
        rule_id: "STRUCTURE-002",
        name: "Table Format",
        description: "Ensures section contains properly formatted table",
        severity: "major",
        parameters: {
          min_rows: { type: "number", default: 2, description: "Minimum table rows" },
          required_columns: { type: "array", default: [], description: "Required table columns" }
        }
      }
    ];
    
    return NextResponse.json(predefinedRules);
  } catch (error) {
    console.error('Error fetching predefined rules:', error);
    return NextResponse.json(
      { error: 'Failed to fetch predefined rules' },
      { status: 500 }
    );
  }
}
