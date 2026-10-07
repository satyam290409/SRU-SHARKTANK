import { db } from '../db';
import { activityLogs } from '../db/schema';
import { v4 as uuidv4 } from 'uuid';

export const logActivity = (
  userId: string | null,
  userRole: string,
  action: string,
  details: string,
  eventId: string | null = null,
  ipAddress: string | null = null
) => {
  try {
    db.insert(activityLogs).values({
      id: uuidv4(),
      eventId,
      userId,
      userRole,
      action,
      details,
      ipAddress
    }).run();
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
};
