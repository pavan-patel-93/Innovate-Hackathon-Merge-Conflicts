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

    // Get days parameter from URL
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days')) || 30;

    const { db } = await connectToDocumentStore();

    // Determine if user should see all data or just their own
    const isAdmin = user.role === 'admin';
    const filterUserId = isAdmin ? null : user._id.toString();

    // Calculate start date
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Build base filter
    const baseFilter = {
      created_at: { $gte: startDate },
      ...(filterUserId ? { user_id: filterUserId } : {})
    };

    // Get upload trends over time from document_store
    const uploadTrendsPipeline = [
      { $match: baseFilter },
      {
        $group: {
          _id: {
            year: { $year: '$created_at' },
            month: { $month: '$created_at' },
            day: { $dayOfMonth: '$created_at' }
          },
          count: { $sum: 1 },
          avg_score: { $avg: '$compliance_score' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ];

    const uploadTrends = await db.collection('document_store').aggregate(uploadTrendsPipeline).toArray();

    // Format response
    const trendsData = {
      period_days: days,
      upload_trends: uploadTrends.map(item => ({
        date: `${item._id.year}-${String(item._id.month).padStart(2, '0')}-${String(item._id.day).padStart(2, '0')}`,
        documents_uploaded: item.count,
        average_score: item.avg_score ? Math.round(item.avg_score * 100) / 100 : 0
      }))
    };

    return NextResponse.json(trendsData);

  } catch (error) {
    console.error('Error fetching analytics trends:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve analytics trends' },
      { status: 500 }
    );
  }
}
