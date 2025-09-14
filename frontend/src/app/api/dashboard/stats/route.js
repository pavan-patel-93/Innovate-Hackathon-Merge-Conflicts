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
    console.log('[Dashboard Stats] Starting request...');
    
    // Get current user from session
    const user = await getCurrentUser();
    console.log('[Dashboard Stats] User:', user ? { id: user._id, username: user.username, role: user.role } : 'null');
    
    if (!user) {
      console.log('[Dashboard Stats] No user found, returning 401');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { db } = await connectToDocumentStore();
    console.log('[Dashboard Stats] Connected to document store');

    // Determine if user should see all data or just their own
    const isAdmin = user.role === 'admin';
    const filterUserId = isAdmin ? null : user._id.toString();

    // Build base filter
    const baseFilter = filterUserId ? { user_id: filterUserId } : {};

    // Get document statistics from document_store collection
    const totalDocuments = await db.collection('document_store').countDocuments(baseFilter);
    
    // Get documents by status (using metadata.status from document_store)
    const statusPipeline = [
      { $match: baseFilter },
      {
        $group: {
          _id: '$metadata.status',
          count: { $sum: 1 },
          avg_score: { $avg: '$compliance_score' }
        }
      }
    ];
    const statusStats = await db.collection('document_store').aggregate(statusPipeline).toArray();

    // Get compliance score distribution
    const scorePipeline = [
      { $match: { ...baseFilter, compliance_score: { $exists: true, $ne: null } } },
      {
        $bucket: {
          groupBy: '$compliance_score',
          boundaries: [0, 60, 80, 100, 101],
          default: 'other',
          output: {
            count: { $sum: 1 },
            documents: { $push: '$original_filename' }
          }
        }
      }
    ];
    const scoreDistribution = await db.collection('document_store').aggregate(scorePipeline).toArray();

    // Get issue statistics from compliance_analysis (assuming it contains structured data)
    // For now, we'll create mock data based on compliance_score ranges
    const issuesStats = [];
    const lowScoreDocs = await db.collection('document_store').countDocuments({ ...baseFilter, compliance_score: { $lt: 60 } });
    const mediumScoreDocs = await db.collection('document_store').countDocuments({ ...baseFilter, compliance_score: { $gte: 60, $lt: 80 } });
    
    if (lowScoreDocs > 0) {
      issuesStats.push({ _id: 'critical', count: Math.ceil(lowScoreDocs * 0.3) });
      issuesStats.push({ _id: 'major', count: Math.ceil(lowScoreDocs * 0.7) });
    }
    if (mediumScoreDocs > 0) {
      issuesStats.push({ _id: 'minor', count: Math.ceil(mediumScoreDocs * 0.5) });
      issuesStats.push({ _id: 'info', count: Math.ceil(mediumScoreDocs * 0.5) });
    }

    // Get recent documents for the user with user info
    const recentDocuments = await db.collection('document_store')
      .aggregate([
        { $match: baseFilter },
        { $sort: { created_at: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: 'users',
            localField: 'user_id',
            foreignField: '_id',
            as: 'user_info'
          }
        },
        {
          $addFields: {
            uploaded_by: {
              $ifNull: [
                { $arrayElemAt: ['$user_info.username', 0] },
                'Unknown'
              ]
            }
          }
        },
        {
          $project: {
            user_info: 0 // Remove the user_info array from final result
          }
        }
      ])
      .toArray();

    // Calculate average compliance score
    const avgScorePipeline = [
      { $match: { ...baseFilter, compliance_score: { $exists: true, $ne: null } } },
      {
        $group: {
          _id: null,
          avgScore: { $avg: '$compliance_score' }
        }
      }
    ];
    const avgScoreResult = await db.collection('document_store').aggregate(avgScorePipeline).toArray();
    const averageComplianceScore = avgScoreResult.length > 0 ? avgScoreResult[0].avgScore : 0;

    // Helper functions
    const getCountBySeverity = (severity) => {
      const stat = issuesStats.find(item => item._id === severity);
      return stat ? stat.count : 0;
    };

    const getCountByScoreRange = (boundary) => {
      const dist = scoreDistribution.find(item => item._id === boundary);
      return dist ? dist.count : 0;
    };

    const getCountByStatus = (status) => {
      const stat = statusStats.find(item => item._id === status);
      return stat ? stat.count : 0;
    };

    // Format response
    const stats = {
      user_info: {
        id: user._id.toString(),
        username: user.username,
        role: user.role,
        is_admin: isAdmin
      },
      overview: {
        total_documents: totalDocuments,
        average_compliance_score: Math.round(averageComplianceScore * 100) / 100,
        documents_analyzed: getCountByStatus('success'),
        documents_pending: getCountByStatus('processing') + getCountByStatus('uploaded')
      },
      compliance_distribution: {
        excellent: getCountByScoreRange(80),
        good: getCountByScoreRange(60),
        needs_work: getCountByScoreRange(0)
      },
      issues_breakdown: {
        critical: getCountBySeverity('critical'),
        major: getCountBySeverity('major'),
        minor: getCountBySeverity('minor'),
        info: getCountBySeverity('info')
      },
      status_breakdown: statusStats.reduce((acc, item) => {
        acc[item._id] = {
          count: item.count,
          avg_score: item.avg_score ? Math.round(item.avg_score * 100) / 100 : 0
        };
        return acc;
      }, {}),
      recent_documents: recentDocuments.map(doc => ({
        id: doc._id.toString(),
        filename: doc.original_filename || doc.filename,
        status: doc.metadata?.status || 'unknown',
        compliance_score: doc.compliance_score,
        created_at: doc.created_at,
        analyzed_at: doc.updated_at,
        size_bytes: doc.size_bytes,
        content_type: doc.content_type,
        issues_count: doc.compliance_score < 60 ? Math.ceil(Math.random() * 5) + 1 : Math.ceil(Math.random() * 2),
        critical_issues: doc.compliance_score < 40 ? Math.ceil(Math.random() * 3) : 0,
        user_id: doc.user_id || 'system'
      }))
    };

    // Add user statistics for admin
    if (isAdmin) {
      const userStatsPipeline = [
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ];
      const userStatsResults = await db.collection('users').aggregate(userStatsPipeline).toArray();
      const totalUsers = await db.collection('users').countDocuments();
      const activeUsers = await db.collection('users').countDocuments({ status: 'active' });

      stats.user_statistics = {
        total_users: totalUsers,
        by_status: userStatsResults.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        active_users: activeUsers
      };
    }

    return NextResponse.json(stats);

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve dashboard statistics' },
      { status: 500 }
    );
  }
}
