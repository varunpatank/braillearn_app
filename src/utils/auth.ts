import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { db } from './db/dbConfig';
import { Users } from './db/schema';
import { eq } from 'drizzle-orm';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateToken(userId: number): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): { userId: number } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    return decoded;
  } catch (error) {
    return null;
  }
}

export async function registerUser(email: string, password: string, name: string) {
  const hashedPassword = await hashPassword(password);
  
  try {
    const [user] = await db
      .insert(Users)
      .values({
        email,
        password: hashedPassword,
        name,
      })
      .returning();
    
    const token = generateToken(user.id);
    return { user, token };
  } catch (error) {
    throw new Error('Failed to register user');
  }
}

export async function loginUser(email: string, password: string) {
  try {
    const [user] = await db
      .select()
      .from(Users)
      .where(eq(Users.email, email));

    if (!user) {
      throw new Error('User not found');
    }

    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      throw new Error('Invalid password');
    }

    const token = generateToken(user.id);
    return { user, token };
  } catch (error) {
    throw new Error('Failed to login');
  }
}