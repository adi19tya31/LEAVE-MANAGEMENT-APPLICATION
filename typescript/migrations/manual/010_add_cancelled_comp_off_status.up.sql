
-- Migration: 010_add_cancelled_comp_off_status
-- Add cancelled status to Comp-Off requests.

ALTER TABLE comp_off_requests
MODIFY COLUMN status
    ENUM('pending', 'approved', 'rejected', 'cancelled')
    COLLATE utf8mb4_general_ci
    NOT NULL
    DEFAULT 'pending';
  