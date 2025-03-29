import { db } from './dbConfig';
import { 
  Users, 
  Rewards, 
  Transactions,
  type User,
  type Reward,
  type Transaction,
  type Report,
  type NewReward
} from './schema';
import { eq, desc } from 'drizzle-orm';

// In-memory storage for notifications and reports
let notifications: Array<{
  id: number;
  userId: number;
  message: string;
  type: string;
  read: boolean;
  createdAt: Date;
}> = [];

let reports: Report[] = [];
let nextReportId = 1;
let nextNotificationId = 1;

export async function createUser(email: string, name: string): Promise<User> {
  try {
    // Attempt to insert a new user.
    // If a conflict occurs on the email field, do nothing.
    const [newUser] = await db
      .insert(Users)
      .values({
        email,
        name,
        totalPoints: 0,
        totalWaste: '0',
        totalReports: 0
      })
      .onConflictDoNothing() // This prevents duplicate key error
      .returning();

    // If the insert did not create a new record, fetch the existing user.
    if (!newUser) {
      const [existingUser] = await db
        .select()
        .from(Users)
        .where(eq(Users.email, email));
      return existingUser;
    }

    return newUser;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  try {
    const [user] = await db
      .select()
      .from(Users)
      .where(eq(Users.email, email));
    return user;
  } catch (error) {
    console.error('Error getting user by email:', error);
    throw error;
  }
}

function calculatePoints(difficulty: string, amount: number): number {
  const basePoints = 5;
  const multiplier = difficulty === 'Easy' ? 1 : 
                    difficulty === 'Medium' ? 4 : 
                    8;
  return Math.floor(amount * basePoints * multiplier);
}

export async function createReport(
  userId: number,
  location: string,
  latitude: number,
  longitude: number,
  wasteType: string,
  amount: string,
  imageUrl?: string
): Promise<Report> {
  try {
    const numericAmount = parseFloat(amount.match(/\d+(\.\d+)?/)?.[0] || '0');
    const difficulty = numericAmount <= 5 ? 'Easy' : 
                      numericAmount <= 20 ? 'Medium' : 
                      'Hard';
    const points = calculatePoints(difficulty, numericAmount);

    // Create in-memory report
    const report: Report = {
      id: nextReportId++,
      location,
      wasteType,
      amount,
      createdAt: new Date().toISOString(),
      latitude,
      longitude
    };

    // Add to in-memory storage
    reports.unshift(report);

    // Update user's total points and waste
    await db
      .update(Users)
      .set({
        totalPoints: db.raw('total_points + ' + points),
        totalWaste: db.raw('total_waste + ' + numericAmount),
        totalReports: db.raw('total_reports + 1')
      })
      .where(eq(Users.id, userId));

    // Store points in database
    await createTransaction(userId, 'earned_report', points, `Reported ${amount} of ${wasteType} waste`);
    await updateRewardPoints(userId, points);

    // Create notification
    notifications.push({
      id: nextNotificationId++,
      userId,
      message: `You've earned ${points} points for reporting waste!`,
      type: 'reward',
      read: false,
      createdAt: new Date()
    });

    return report;
  } catch (error) {
    console.error('Error creating report:', error);
    throw error;
  }
}

export async function getRecentReports(limit = 10): Promise<Report[]> {
  return reports.slice(0, limit);
}

export async function getUnreadNotifications(userId: number) {
  return notifications.filter(n => n.userId === userId && !n.read);
}

export async function markNotificationAsRead(notificationId: number) {
  const notification = notifications.find(n => n.id === notificationId);
  if (notification) {
    notification.read = true;
  }
}

export async function getRewardTransactions(userId: number): Promise<Transaction[]> {
  try {
    const transactions = await db
      .select()
      .from(Transactions)
      .where(eq(Transactions.userId, userId))
      .orderBy(desc(Transactions.createdAt));

    return transactions;
  } catch (error) {
    console.error('Error fetching reward transactions:', error);
    return [];
  }
}

export async function createTransaction(
  userId: number,
  type: string,
  amount: number,
  description: string
): Promise<Transaction> {
  try {
    const [transaction] = await db
      .insert(Transactions)
      .values({
        userId,
        type,
        amount,
        description,
      })
      .returning();
    return transaction;
  } catch (error) {
    console.error('Error creating transaction:', error);
    throw error;
  }
}

export async function updateRewardPoints(userId: number, points: number): Promise<Reward> {
  try {
    const [reward] = await db
      .insert(Rewards)
      .values({
        userId,
        points,
        name: 'Points Reward',
        description: 'Points earned from waste reporting',
        collectionInfo: 'Automatically collected',
        level: Math.floor(points / 100) + 1
      })
      .returning();
    return reward;
  } catch (error) {
    console.error('Error updating reward points:', error);
    throw error;
  }
}

export async function getAllRewards(): Promise<Reward[]> {
  try {
    const rewards = await db
      .select({
        id: Rewards.id,
        userId: Rewards.userId,
        points: Rewards.points,
        level: Rewards.level,
        createdAt: Rewards.createdAt,
        userName: Users.name
      })
      .from(Rewards)
      .leftJoin(Users, eq(Rewards.userId, Users.id))
      .orderBy(desc(Rewards.points));
    return rewards;
  } catch (error) {
    console.error('Error fetching all rewards:', error);
    return [];
  }
}

export async function getAvailableRewards(userId: number): Promise<Reward[]> {
  try {
    const rewards = await db
      .select()
      .from(Rewards)
      .where(eq(Rewards.userId, userId))
      .orderBy(desc(Rewards.createdAt));
    return rewards;
  } catch (error) {
    console.error('Error fetching available rewards:', error);
    return [];
  }
}

export async function redeemReward(userId: number, points: number): Promise<void> {
  try {
    await createTransaction(userId, 'redeemed', points, `Redeemed ${points} points`);
  } catch (error) {
    console.error('Error redeeming reward:', error);
    throw error;
  }
}

export async function updateWasteLocationStatus(
  locationId: number,
  userId: number,
  status: string,
  verificationResult: any
): Promise<void> {
  try {
    const points = calculatePoints(
      verificationResult.difficulty || 'Medium', 
      parseFloat(verificationResult.quantity) || 0
    );
    
    await createTransaction(userId, 'earned_collect', points, `Completed waste collection task`);
    await updateRewardPoints(userId, points);

    notifications.push({
      id: nextNotificationId++,
      userId,
      message: `You've earned ${points} points for collecting waste!`,
      type: 'reward',
      read: false,
      createdAt: new Date()
    });
  } catch (error) {
    console.error('Error updating waste location status:', error);
    throw error;
  }
}
