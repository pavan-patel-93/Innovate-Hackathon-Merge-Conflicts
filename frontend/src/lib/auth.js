// Authentication helper functions
import { v4 as uuidv4 } from 'uuid';
import { getRedisClient } from './redis';
import { cookies } from 'next/headers';

// Default session expiration time (1 day in seconds)
const SESSION_EXPIRY = 24 * 60 * 60; // 1 day

/**
 * Create a new session for a user
 * @param {string} userId - The user ID to associate with the session
 * @param {number} expiresIn - Session expiry time in seconds (default: 1 day)
 * @returns {Promise<string>} - The session ID
 */
export async function createSession(userId, expiresIn = SESSION_EXPIRY) {
  const sessionId = uuidv4();
  const redis = await getRedisClient();
  
  // Store session in Redis with expiry
  await redis.set(`sess:${sessionId}`, userId, {
    EX: expiresIn
  });
  
  return sessionId;
}

/**
 * Get the user ID associated with a session
 * @param {string} sessionId - The session ID
 * @returns {Promise<string|null>} - The user ID or null if session not found
 */
export async function getUserIdFromSession(sessionId) {
  if (!sessionId) return null;
  
  const redis = await getRedisClient();
  const userId = await redis.get(`sess:${sessionId}`);
  
  return userId;
}

/**
 * Destroy a session
 * @param {string} sessionId - The session ID to destroy
 * @returns {Promise<boolean>} - Whether the session was successfully destroyed
 */
export async function destroySession(sessionId) {
  if (!sessionId) return false;
  
  const redis = await getRedisClient();
  await redis.del(`sess:${sessionId}`);
  
  return true;
}

/**
 * Set the session cookie
 * @param {string} sessionId - The session ID to store in the cookie
 * @param {number} expiresIn - Cookie expiry time in seconds (default: 1 day)
 */
export function setSessionCookie(sessionId, expiresIn = SESSION_EXPIRY) {
  const cookieStore = cookies();
  
  cookieStore.set('session_id', sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: expiresIn,
    path: '/',
  });
}

/**
 * Get the session ID from the cookie
 * @returns {string|undefined} - The session ID or undefined if not found
 */
export function getSessionCookie() {
  const cookieStore = cookies();
  return cookieStore.get('session_id')?.value;
}

/**
 * Remove the session cookie
 */
export function removeSessionCookie() {
  const cookieStore = cookies();
  
  cookieStore.set('session_id', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });
}

/**
 * Get the current user ID from the session cookie
 * @returns {Promise<string|null>} - The user ID or null if not authenticated
 */
export async function getCurrentUserId() {
  const sessionId = getSessionCookie();
  if (!sessionId) return null;
  
  return await getUserIdFromSession(sessionId);
}