
-- Add foreign key constraint to link leave_requests.user_id to profiles.id
ALTER TABLE leave_requests 
ADD CONSTRAINT fk_leave_requests_user_id 
FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Add foreign key constraint for approved_by field as well
ALTER TABLE leave_requests 
ADD CONSTRAINT fk_leave_requests_approved_by 
FOREIGN KEY (approved_by) REFERENCES profiles(id) ON DELETE SET NULL;
