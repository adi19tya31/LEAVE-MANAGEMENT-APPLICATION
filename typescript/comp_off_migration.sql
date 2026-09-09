CREATE TABLE IF NOT EXISTS comp_off_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT NOT NULL,
  work_date DATE NOT NULL,
  reason TEXT NOT NULL,
  status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  approver_id INT NOT NULL,
  applied_on DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  decided_on DATETIME NULL,
  remarks TEXT NULL,
  CONSTRAINT fk_comp_off_employee FOREIGN KEY (employee_id) REFERENCES employees(Emp_id),
  CONSTRAINT fk_comp_off_approver FOREIGN KEY (approver_id) REFERENCES employees(Emp_id),
  INDEX idx_comp_off_employee (employee_id),
  INDEX idx_comp_off_approver_status (approver_id, status),
  INDEX idx_comp_off_work_date (work_date)
);
