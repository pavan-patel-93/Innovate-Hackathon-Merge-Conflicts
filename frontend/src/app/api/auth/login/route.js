// API route for user login
import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import { createSession, setSessionCookie } from '@/lib/auth';

export async function POST(request) {
  try {
    // Connect to the database
    await connectToDatabase();
    
    // Parse request body
    const { username, password } = await request.json();
    
    // Validate required fields
    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Find the user (allow login with either username or email)
    const user = await User.findOne({
      $or: [
        { username },
        { email: username } // Support login with email as username
      ]
    });

    // Check if user exists
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Create a session
    const sessionId = await createSession(user._id.toString());
    
    // Set the session cookie
    setSessionCookie(sessionId);

    // Debug logging
    console.log('Login API - Found user:', {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      department: user.department
    });

    // Return success response (without password)
    return NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        department: user.department,
        createdAt: user.createdAt,
      },
      token: sessionId, // Include the session token
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Login failed', error: error.message },
      { status: 500 }
    );
  }
}