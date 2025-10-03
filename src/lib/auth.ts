// src/lib/auth.ts
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not defined');
}
const key = new TextEncoder().encode(JWT_SECRET);

/**
 * Verifies the session token from the cookies and returns the payload.
 * This is for use in the App Router (Server Components, API Routes).
 * @returns The JWT payload or null if the token is invalid or not present.
 */
export async function getSession() {
  const token = (await cookies()).get('token')?.value;

  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, key, {
      algorithms: ['HS256'],
    });
    // Cast the payload to include userId
    return payload as { userId: number; iat: number; exp: number };
  } catch (error) {
    // This will catch expired tokens or invalid signatures
    console.error('Session verification failed:', error);
    return null;
  }
}

/**
 * A convenience function that directly returns the user ID from the session.
 * @returns The user ID as a number, or null if the session is not valid.
 */
export async function getUserId() {
    const session = await getSession();
    if (session && typeof session.userId === 'number') {
        return session.userId;
    }
    return null;
}