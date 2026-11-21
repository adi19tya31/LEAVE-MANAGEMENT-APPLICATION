-- MANUAL ONLY: apply only if every business-table employee ID exists in
-- employees.Emp_id. This may fail after central employee IDs are written.

ALTER TABLE `leave_applications`
  ADD CONSTRAINT `leave_applications_ibfk_1`
    FOREIGN KEY (`employee_id`) REFERENCES `employees` (`Emp_id`),
  ADD CONSTRAINT `leave_applications_ibfk_3`
    FOREIGN KEY (`approver_id`) REFERENCES `employees` (`Emp_id`);

ALTER TABLE `leave_balances`
  ADD CONSTRAINT `leave_balances_ibfk_1`
    FOREIGN KEY (`employee_id`) REFERENCES `employees` (`Emp_id`);

ALTER TABLE `leave_approval_logs`
  ADD CONSTRAINT `leave_approval_logs_ibfk_2`
    FOREIGN KEY (`approver_id`) REFERENCES `employees` (`Emp_id`);

ALTER TABLE `compoff_balances`
  ADD CONSTRAINT `compoff_balances_ibfk_1`
    FOREIGN KEY (`Emp_id`) REFERENCES `employees` (`Emp_id`);

ALTER TABLE `comp_off_requests`
  ADD CONSTRAINT `fk_comp_off_approver`
    FOREIGN KEY (`approver_id`) REFERENCES `employees` (`Emp_id`),
  ADD CONSTRAINT `fk_comp_off_employee`
    FOREIGN KEY (`employee_id`) REFERENCES `employees` (`Emp_id`);

ALTER TABLE `notifications`
  ADD CONSTRAINT `fk_notification_recipient`
    FOREIGN KEY (`recipient_id`) REFERENCES `employees` (`Emp_id`);
