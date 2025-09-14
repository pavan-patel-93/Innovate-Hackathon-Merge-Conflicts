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

    const { db } = await connectToDocumentStore();

    // Determine if user should see all data or just their own
    const isAdmin = user.role === 'admin';
    const filterUserId = isAdmin ? null : user._id.toString();

    // Build base filter
    const baseFilter = filterUserId ? { user_id: filterUserId } : {};

    // Get documents from document_store
    const documents = await db.collection('document_store')
      .find(baseFilter)
      .sort({ created_at: -1 })
      .toArray();

    // Format documents for frontend
    const formattedDocuments = documents.map(doc => ({
      id: doc._id.toString(),
      document_id: doc._id.toString(),
      filename: doc.original_filename || doc.filename,
      name: doc.original_filename || doc.filename,
      size: doc.size_bytes,
      size_bytes: doc.size_bytes,
      content_type: doc.content_type,
      type: doc.content_type,
      created_at: doc.created_at,
      uploadDate: doc.created_at,
      updated_at: doc.updated_at,
      status: doc.metadata?.status || 'success',
      compliance_score: doc.compliance_score,
      complianceScore: doc.compliance_score,
      parsed_content: doc.parsed_content,
      compliance_analysis: doc.compliance_analysis,
      user_id: doc.user_id || 'system',
      // Generate mock issues based on compliance score
      issues: doc.compliance_score < 60 ? [
        { type: 'critical', message: 'Low compliance score detected', severity: 3 },
        { type: 'major', message: 'Document requires review', severity: 2 }
      ] : doc.compliance_score < 80 ? [
        { type: 'minor', message: 'Minor compliance issues found', severity: 1 }
      ] : []
    }));

    return NextResponse.json(formattedDocuments);

  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve documents' },
      { status: 500 }
    );
  }
}
