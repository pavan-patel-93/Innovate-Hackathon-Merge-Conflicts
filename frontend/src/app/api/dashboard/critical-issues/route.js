import { NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';
import { getCurrentUserId } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://merge_conflicters:1nwsRDU0uFRJdYWX@c0.wauvhzx.mongodb.net/?retryWrites=true&w=majority&appName=C0';

let cachedClient = null;
let cachedDb = null;

async function connectToDocumentStore() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db();

  cachedClient = client;
  cachedDb = db;

  return { client, db };
}

async function getCurrentUser() {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return null;

    await connectToDatabase();
    const user = await User.findById(userId).select('-password');
    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

export async function GET(request) {
  try {
    // Get current user from session
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get limit parameter from URL
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit')) || 20;

    const { db } = await connectToDocumentStore();

    // Determine if user should see all data or just their own
    const isAdmin = user.role === 'admin';
    const filterUserId = isAdmin ? null : user._id.toString();

    // Build filter for documents with low compliance scores (indicating critical issues)
    const baseFilter = {
      compliance_score: { $lt: 60 }, // Documents with low compliance scores likely have critical issues
      ...(filterUserId ? { user_id: filterUserId } : {})
    };

    // Get documents with critical issues from document_store
    const criticalDocs = await db.collection('document_store')
      .find(baseFilter)
      .sort({ created_at: -1 })
      .limit(limit)
      .toArray();

    // Format response
    const criticalIssuesData = {
      critical_documents: criticalDocs.map(doc => {
        // Generate mock critical issues based on compliance score
        const numIssues = Math.ceil((60 - doc.compliance_score) / 10);
        const mockIssues = [];
        
        for (let i = 0; i < numIssues; i++) {
          mockIssues.push({
            id: `issue_${i + 1}`,
            type: ['security', 'compliance', 'validation', 'documentation'][i % 4],
            message: `Critical compliance issue detected in document analysis`,
            severity: 'critical',
            section: `Section ${i + 1}`,
            suggestions: [`Review and update section ${i + 1}`, 'Ensure compliance standards are met']
          });
        }
        
        return {
          id: doc._id.toString(),
          filename: doc.original_filename || doc.filename,
          user_id: doc.user_id || 'system',
          compliance_score: doc.compliance_score,
          critical_issues: mockIssues,
          created_at: doc.created_at,
          analyzed_at: doc.updated_at,
          size_bytes: doc.size_bytes,
          content_type: doc.content_type
        };
      })
    };

    return NextResponse.json(criticalIssuesData);

  } catch (error) {
    console.error('Error fetching critical issues:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve critical issues' },
      { status: 500 }
    );
  }
}
