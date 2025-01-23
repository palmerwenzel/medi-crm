--
-- Name: 20250121000004_webhook_system; Type: MIGRATION
-- Description: Implements webhook system for case notifications
-- Dependencies: 20250121000001_user_system (for user references)
--

-- Tables
CREATE TABLE webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL CHECK (url LIKE 'https://%'),
  secret TEXT NOT NULL,
  description TEXT,
  events TEXT[] NOT NULL,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_triggered_at TIMESTAMPTZ,
  failure_count INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT valid_events CHECK (
    array_length(events, 1) > 0 AND
    array_length(events, 1) <= 10
  )
);

-- Functions
CREATE OR REPLACE FUNCTION handle_webhook_update()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER on_webhook_update
  BEFORE UPDATE ON webhooks
  FOR EACH ROW
  EXECUTE FUNCTION handle_webhook_update();

-- Policies
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;

-- Staff and admins can view webhooks
CREATE POLICY "Staff and admins can view webhooks"
  ON webhooks
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('staff', 'admin')
    )
  );

-- Staff and admins can create webhooks
CREATE POLICY "Staff and admins can create webhooks"
  ON webhooks
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('staff', 'admin')
    )
  );

-- Staff and admins can update webhooks
CREATE POLICY "Staff and admins can update webhooks"
  ON webhooks
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('staff', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('staff', 'admin')
    )
  );

-- Staff and admins can delete webhooks
CREATE POLICY "Staff and admins can delete webhooks"
  ON webhooks
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('staff', 'admin')
    )
  );

-- Create indexes
CREATE INDEX idx_webhooks_created_by ON webhooks(created_by);
CREATE INDEX idx_webhooks_is_active ON webhooks(is_active);
CREATE INDEX idx_webhooks_last_triggered_at ON webhooks(last_triggered_at);
CREATE INDEX idx_webhooks_failure_count ON webhooks(failure_count); 