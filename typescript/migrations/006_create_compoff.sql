-- 006_create_compoff.sql

CREATE TABLE IF NOT EXISTS `compoff_balances` (
  `balance_id` int NOT NULL AUTO_INCREMENT,
  `Emp_id` int NOT NULL,
  `year` year NOT NULL,
  `total_days` decimal(4,1) NOT NULL DEFAULT '0.0',
  `used_days` decimal(4,1) NOT NULL DEFAULT '0.0',

  PRIMARY KEY (`balance_id`),

  UNIQUE KEY `uniq_compoff_balance`
    (`Emp_id`, `year`),

  CONSTRAINT `compoff_balances_ibfk_1`
    FOREIGN KEY (`Emp_id`)
    REFERENCES `employees` (`Emp_id`)
) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_general_ci;


CREATE TABLE IF NOT EXISTS `comp_off_requests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employee_id` int NOT NULL,
  `work_date` date NOT NULL,
  `reason` text COLLATE utf8mb4_general_ci NOT NULL,
  `status` enum(
    'pending',
    'approved',
    'rejected'
  ) COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'pending',
  `approver_id` int NOT NULL,
  `applied_on` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `decided_on` datetime DEFAULT NULL,
  `remarks` text COLLATE utf8mb4_general_ci,
  `completed_at` datetime DEFAULT NULL,

  PRIMARY KEY (`id`),

  KEY `idx_comp_off_employee` (`employee_id`),
  KEY `idx_comp_off_approver_status` (`approver_id`, `status`),
  KEY `idx_comp_off_work_date` (`work_date`),

  CONSTRAINT `fk_comp_off_approver`
    FOREIGN KEY (`approver_id`)
    REFERENCES `employees` (`Emp_id`),

  CONSTRAINT `fk_comp_off_employee`
    FOREIGN KEY (`employee_id`)
    REFERENCES `employees` (`Emp_id`)
) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_general_ci;