// API route for user signup
import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import { createSession, setSessionCookie } from '@/lib/auth';

export async function POST(request) {
  try {
    // Connect to the database
    await connectToDatabase();
    
    // Parse request body
    const { username, email, password, confirmPassword } = await request.json();
    
    // Validate required fields
    if (!username || !email || !password) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Validate password match
    if (password !== confirmPassword) {
      return NextResponse.json(
        { success: false, message: 'Passwords do not match' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'User with this email or username already exists' },
        { status: 409 }
      );
    }

    // Create new user
    const user = new User({
      username,
      email,
      password,
      role: 'compliance_analyst', // Setting default role for this application
      department: 'Quality Assurance', // Default department
    });

    // Save the user
    await user.save();

    // Create a session
    const sessionId = await createSession(user._id.toString());
    
    // Set the session cookie
    setSessionCookie(sessionId);

    // Return success response (without password)
    return NextResponse.json({
      success: true,
      message: 'User created successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        department: user.department,
        createdAt: user.createdAt,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { success: false, message: 'Error creating user', error: error.message },
      { status: 500 }
    );
  }
}