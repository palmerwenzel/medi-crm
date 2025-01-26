-- Name: 20250124000004_add_notifications
-- Description: Implements notification system with preferences and real-time updates
-- Dependencies: 20250121000001_user_system
--
-- Rollback Plan:
-- 1. DROP TABLE IF EXISTS notification_preferences;
-- 2. DROP TABLE IF EXISTS notifications;
-- 3. DROP TYPE IF EXISTS notification_channel;
-- 4. DROP TYPE IF EXISTS notification_priority;
-- 5. DROP TYPE IF EXISTS notification_type;
-- 6. DROP FUNCTION IF EXISTS send_notification;

-- Create notification types enum
CREATE TYPE notification_type AS ENUM (
  'new_message',
  'case_assigned',
  'case_updated',
  'emergency_alert',
  'handoff_request'
);

-- Create notification priority enum
CREATE TYPE notification_priority AS ENUM (
  'low',
  'medium',
  'high',
  'urgent'
);

-- Create notification channel enum
CREATE TYPE notification_channel AS ENUM (
  'in_app',
  'email',
  'browser'
);

-- Create notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  priority notification_priority NOT NULL DEFAULT 'medium',
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_metadata CHECK (jsonb_typeof(metadata) = 'object')
);

-- Create notification preferences table
CREATE TABLE notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  channels notification_channel[] NOT NULL DEFAULT '{in_app}',
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, type)
);

-- Create function to send notification
CREATE OR REPLACE FUNCTION send_notification(
  p_user_id UUID,
  p_type notification_type,
  p_title TEXT,
  p_content TEXT,
  p_metadata JSONB DEFAULT '{}'::jsonb,
  p_priority notification_priority DEFAULT 'medium'
) RETURNS UUID AS $$
DECLARE
  v_notification_id UUID;
  v_preferences RECORD;
BEGIN
  -- Check if user has enabled this notification type
  SELECT * INTO v_preferences
  FROM notification_preferences
  WHERE user_id = p_user_id AND type = p_type;

  -- If no preferences found, use defaults
  IF NOT FOUND THEN
    INSERT INTO notification_preferences (user_id, type)
    VALUES (p_user_id, p_type)
    RETURNING * INTO v_preferences;
  END IF;

  -- Only create notification if enabled
  IF v_preferences.enabled THEN
    INSERT INTO notifications (
      user_id,
      type,
      priority,
      title,
      content,
      metadata
    ) VALUES (
      p_user_id,
      p_type,
      p_priority,
      p_title,
      p_content,
      p_metadata
    ) RETURNING id INTO v_notification_id;

    -- Notify clients of new notification
    PERFORM pg_notify(
      'new_notification',
      json_build_object(
        'notification_id', v_notification_id,
        'user_id', p_user_id,
        'type', p_type,
        'priority', p_priority
      )::text
    );
  END IF;

  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add RLS policies
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- Users can only view their own notifications
CREATE POLICY "Users can view own notifications"
  ON notifications
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only update their own notifications (e.g., mark as read)
CREATE POLICY "Users can update own notifications"
  ON notifications
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can view their own notification preferences
CREATE POLICY "Users can view own notification preferences"
  ON notification_preferences
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own notification preferences
CREATE POLICY "Users can update own notification preferences"
  ON notification_preferences
  FOR ALL
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, read_at)
  WHERE read_at IS NULL;
CREATE INDEX idx_notifications_user_created ON notifications(user_id, created_at DESC);

-- Add comment for documentation
COMMENT ON TABLE notifications IS 'System notifications for users with RLS policies';
COMMENT ON TABLE notification_preferences IS 'User notification preferences with RLS policies'; 