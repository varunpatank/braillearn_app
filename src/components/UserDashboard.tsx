import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export function UserDashboard({ userId }: { userId: number }) {
  const [reward, setReward] = useState<{ points: number; level: number } | null>(null);
  const [notifications, setNotifications] = useState<Array<{ id: number; message: string; type: string }>>([]);

  useEffect(() => {
    const fetchUserData = async () => {
      // Fetch user's points/level from Supabase `users` profile
      try {
        const { data: user } = await supabase.from('users').select('total_points, level').eq('id', userId).maybeSingle();
        if (user) setReward({ points: user.total_points ?? 0, level: user.level ?? 1 });
      } catch (err) {
        console.error('Failed to fetch user reward from Supabase', err);
      }

      // Fetch unread notifications from Supabase (fallback to empty array if table missing)
      try {
        const { data: notifs, error } = await supabase
          .from('notifications')
          .select('id, message, type')
          .eq('user_id', userId)
          .eq('read', false)
          .order('created_at', { ascending: false });
        if (!error && notifs) setNotifications(notifs as any[]);
      } catch (err) {
        console.warn('Notifications table may not exist in Supabase yet', err);
      }
    };

    fetchUserData();
  }, [userId]);

  const handleNotificationRead = async (notificationId: number) => {
    try {
      await supabase.from('notifications').update({ read: true }).eq('id', notificationId);
    } catch (err) {
      console.warn('Failed to mark notification read in Supabase', err);
    }
    setNotifications(notifications.filter(n => n.id !== notificationId));
  };

  return (
    <div>
      <h2>User Dashboard</h2>
      {reward && (
        <div>
          <p>Points: {reward.points}</p>
          <p>Level: {reward.level}</p>
        </div>
      )}
      <h3>Notifications</h3>
      <ul>
        {notifications.map(notification => (
          <li key={notification.id}>
            {notification.message}
            <button onClick={() => handleNotificationRead(notification.id)}>Mark as Read</button>
          </li>
        ))}
      </ul>
    </div>
  );
}