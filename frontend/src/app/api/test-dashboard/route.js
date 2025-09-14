import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://merge_conflicters:1nwsRDU0uFRJdYWX@c0.wauvhzx.mongodb.net/?retryWrites=true&w=majority&appName=C0';

export async function GET(request) {
  try {
    console.log('[Test Dashboard] Starting test...');
    
    // Test MongoDB connection
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db();
    
    console.log('[Test Dashboard] Connected to MongoDB');
    
    // Test document_store collection
    const documentCount = await db.collection('document_store').countDocuments();
    console.log('[Test Dashboard] Document count:', documentCount);
    
    // Get sample documents
    const sampleDocs = await db.collection('document_store').find({}).limit(3).toArray();
    console.log('[Test Dashboard] Sample documents:', sampleDocs.map(doc => ({
      id: doc._id,
      filename: doc.original_filename || doc.filename,
      compliance_score: doc.compliance_score,
      status: doc.metadata?.status
    })));
    
    await client.close();
    
    return NextResponse.json({
      success: true,
      mongodb_connected: true,
      document_count: documentCount,
      sample_documents: sampleDocs.map(doc => ({
        id: doc._id.toString(),
        filename: doc.original_filename || doc.filename,
        compliance_score: doc.compliance_score,
        status: doc.metadata?.status,
        created_at: doc.created_at
      }))
    });
    
  } catch (error) {
    console.error('[Test Dashboard] Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      mongodb_connected: false
    }, { status: 500 });
  }
}
