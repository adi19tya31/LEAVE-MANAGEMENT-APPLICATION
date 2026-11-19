-- 005_create_leave_management.sql

CREATE TABLE IF NOT EXISTS `leave_types` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `max_days_per_year` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_general_ci;


CREATE TABLE IF NOT EXISTS `public_holidays` (
  `id` int NOT NULL AUTO_INCREMENT,
  `holiday_date` date NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `holiday_date` (`holiday_date`)
) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_general_ci;


CREATE TABLE IF NOT EXISTS `leave_applications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employee_id` int NOT NULL,
  `leave_type_id` int NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `duration_type` varchar(20) COLLATE utf8mb4_general_ci NOT NULL
    DEFAULT 'FULL_DAY',
  `total_days` decimal(4,1) NOT NULL,
  `reason` text COLLATE utf8mb4_general_ci,
  `status` enum(
    'pending',
    'approved',
    'rejected',
    'cancelled'
  ) COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'pending',
  `approver_id` int NOT NULL,
  `applied_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `decided_on` timestamp NULL DEFAULT NULL,
  `start_day_type` enum(
    'FULL_DAY',
    'FIRST_HALF',
    'SECOND_HALF'
  ) COLLATE utf8mb4_general_ci DEFAULT 'FULL_DAY',
  `end_day_type` enum(
    'FULL_DAY',
    'FIRST_HALF',
    'SECOND_HALF'
  ) COLLATE utf8mb4_general_ci DEFAULT 'FULL_DAY',

  PRIMARY KEY (`id`),

  KEY `employee_id` (`employee_id`),
  KEY `leave_type_id` (`leave_type_id`),
  KEY `approver_id` (`approver_id`),

  CONSTRAINT `leave_applications_ibfk_1`
    FOREIGN KEY (`employee_id`)
    REFERENCES `employees` (`Emp_id`),

  CONSTRAINT `leave_applications_ibfk_2`
    FOREIGN KEY (`leave_type_id`)
    REFERENCES `leave_types` (`id`),

  CONSTRAINT `leave_applications_ibfk_3`
    FOREIGN KEY (`approver_id`)
    REFERENCES `employees` (`Emp_id`)
) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_general_ci;


CREATE TABLE IF NOT EXISTS `leave_balances` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employee_id` int NOT NULL,
  `leave_type_id` int NOT NULL,
  `year` int NOT NULL,
  `allocated_days` int NOT NULL,
  `used_days` int NOT NULL DEFAULT '0',

  PRIMARY KEY (`id`),

  UNIQUE KEY `employee_id`
    (`employee_id`, `leave_type_id`, `year`),

  KEY `leave_type_id` (`leave_type_id`),

  CONSTRAINT `leave_balances_ibfk_1`
    FOREIGN KEY (`employee_id`)
    REFERENCES `employees` (`Emp_id`),

  CONSTRAINT `leave_balances_ibfk_2`
    FOREIGN KEY (`leave_type_id`)
    REFERENCES `leave_types` (`id`)
) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_general_ci;


CREATE TABLE IF NOT EXISTS `leave_approval_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `leave_application_id` int NOT NULL,
  `approver_id` int NOT NULL,
  `action` enum(
    'approved',
    'rejected'
  ) COLLATE utf8mb4_general_ci NOT NULL,
  `remarks` text COLLATE utf8mb4_general_ci,
  `action_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),

  KEY `leave_application_id` (`leave_application_id`),
  KEY `approver_id` (`approver_id`),

  CONSTRAINT `leave_approval_logs_ibfk_1`
    FOREIGN KEY (`leave_application_id`)
    REFERENCES `leave_applications` (`id`),

  CONSTRAINT `leave_approval_logs_ibfk_2`
    FOREIGN KEY (`approver_id`)
    REFERENCES `employees` (`Emp_id`)
) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_general_ci;