// API route to get the current authenticated user
import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import { getCurrentUserId } from '@/lib/auth';

export async function GET() {
  try {
    // Get the current user ID from the session
    const userId = await getCurrentUserId();
    
    // If no user ID, return unauthorized
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Connect to the database
    await connectToDatabase();
    
    // Find the user
    const user = await User.findById(userId).select('-password');
    
    // If user not found, return unauthorized
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 401 }
      );
    }
    
    // Return the user data
    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        department: user.department,
        createdAt: user.createdAt,
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    return NextResponse.json(
      { success: false, message: 'Error retrieving user', error: error.message },
      { status: 500 }
    );
  }
}