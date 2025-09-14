// API route for user logout
import { NextResponse } from 'next/server';
import { getSessionCookie, destroySession, removeSessionCookie } from '@/lib/auth';

export async function POST() {
  try {
    // Get the session ID from the cookie
    const sessionId = getSessionCookie();
    
    if (sessionId) {
      // Destroy the session in Redis
      await destroySession(sessionId);
    }
    
    // Remove the session cookie
    removeSessionCookie();
    
    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { success: false, message: 'Logout failed', error: error.message },
      { status: 500 }
    );
  }
}