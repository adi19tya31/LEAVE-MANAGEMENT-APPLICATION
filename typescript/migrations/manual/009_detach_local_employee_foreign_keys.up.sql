-- MANUAL ONLY: scripts/migrate.ts does not recurse into this directory.
-- Do not run until backups are complete and every historical employee reference
-- has been reconciled to a central employee ID using a verified Keycloak ID match.
-- This preserves all rows and only removes Leave Management's local-employee FKs.
-- Verify the deployed constraint names before applying.

ALTER TABLE `leave_applications`
  DROP FOREIGN KEY `leave_applications_ibfk_1`,
  DROP FOREIGN KEY `leave_applications_ibfk_3`;

ALTER TABLE `leave_balances`
  DROP FOREIGN KEY `leave_balances_ibfk_1`;

ALTER TABLE `leave_approval_logs`
  DROP FOREIGN KEY `leave_approval_logs_ibfk_2`;

ALTER TABLE `compoff_balances`
  DROP FOREIGN KEY `compoff_balances_ibfk_1`;

ALTER TABLE `comp_off_requests`
  DROP FOREIGN KEY `fk_comp_off_approver`,
  DROP FOREIGN KEY `fk_comp_off_employee`;

ALTER TABLE `notifications`
  DROP FOREIGN KEY `fk_notification_recipient`;
