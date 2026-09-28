-- Dump of database 'insightinfotech' — generated 2026-09-21T06:50:55.593Z
SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table: comp_off_requests
-- ----------------------------
DROP TABLE IF EXISTS `comp_off_requests`;
CREATE TABLE `comp_off_requests` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `employee_id` int(11) NOT NULL,
  `work_date` date NOT NULL,
  `reason` text NOT NULL,
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `approver_id` int(11) NOT NULL,
  `applied_on` datetime NOT NULL DEFAULT current_timestamp(),
  `decided_on` datetime DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `completed_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_comp_off_employee` (`employee_id`),
  KEY `idx_comp_off_approver_status` (`approver_id`,`status`),
  KEY `idx_comp_off_work_date` (`work_date`),
  CONSTRAINT `fk_comp_off_approver` FOREIGN KEY (`approver_id`) REFERENCES `employees` (`Emp_id`),
  CONSTRAINT `fk_comp_off_employee` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`Emp_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `comp_off_requests` (`id`, `employee_id`, `work_date`, `reason`, `status`, `approver_id`, `applied_on`, `decided_on`, `remarks`, `completed_at`) VALUES (1, 3, '2026-09-12 18:30:00', 'xyz', 'approved', 2, '2026-09-07 12:23:34', '2026-09-07 12:24:27', 'ok done', NULL);
INSERT INTO `comp_off_requests` (`id`, `employee_id`, `work_date`, `reason`, `status`, `approver_id`, `applied_on`, `decided_on`, `remarks`, `completed_at`) VALUES (2, 4, '2026-09-12 18:30:00', 'extraa work', 'approved', 2, '2026-09-07 18:30:02', '2026-09-07 18:30:37', 'well done', NULL);
INSERT INTO `comp_off_requests` (`id`, `employee_id`, `work_date`, `reason`, `status`, `approver_id`, `applied_on`, `decided_on`, `remarks`, `completed_at`) VALUES (3, 10, '2026-09-13 18:30:00', 'extraa work', 'approved', 8, '2026-09-11 12:43:37', '2026-09-11 12:53:57', NULL, NULL);
INSERT INTO `comp_off_requests` (`id`, `employee_id`, `work_date`, `reason`, `status`, `approver_id`, `applied_on`, `decided_on`, `remarks`, `completed_at`) VALUES (4, 8, '2026-09-12 18:30:00', 'extra work', 'approved', 7, '2026-09-12 05:11:42', '2026-09-12 05:35:07', NULL, NULL);
INSERT INTO `comp_off_requests` (`id`, `employee_id`, `work_date`, `reason`, `status`, `approver_id`, `applied_on`, `decided_on`, `remarks`, `completed_at`) VALUES (5, 8, '2026-09-13 18:30:00', 'extraa work', 'approved', 7, '2026-09-12 05:36:53', '2026-09-15 10:09:05', NULL, NULL);

-- ----------------------------
-- Table: compoff_balances
-- ----------------------------
DROP TABLE IF EXISTS `compoff_balances`;
CREATE TABLE `compoff_balances` (
  `balance_id` int(11) NOT NULL AUTO_INCREMENT,
  `Emp_id` int(11) NOT NULL,
  `year` year(4) NOT NULL,
  `total_days` decimal(4,1) NOT NULL DEFAULT 0.0,
  `used_days` decimal(4,1) NOT NULL DEFAULT 0.0,
  PRIMARY KEY (`balance_id`),
  UNIQUE KEY `uniq_compoff_balance` (`Emp_id`,`year`),
  CONSTRAINT `compoff_balances_ibfk_1` FOREIGN KEY (`Emp_id`) REFERENCES `employees` (`Emp_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ----------------------------
-- Table: departments
-- ----------------------------
DROP TABLE IF EXISTS `departments`;
CREATE TABLE `departments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `manager_id` int(11) DEFAULT NULL,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  KEY `fk_departments_manager` (`manager_id`),
  CONSTRAINT `fk_departments_manager` FOREIGN KEY (`manager_id`) REFERENCES `employees` (`Emp_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `departments` (`id`, `name`, `manager_id`, `status`) VALUES (1, 'DEVLOPEMENT', NULL, 'active');
INSERT INTO `departments` (`id`, `name`, `manager_id`, `status`) VALUES (2, 'SUPPORT', 8, 'active');
INSERT INTO `departments` (`id`, `name`, `manager_id`, `status`) VALUES (4, 'SALES', NULL, 'active');
INSERT INTO `departments` (`id`, `name`, `manager_id`, `status`) VALUES (5, 'TESTING', NULL, 'active');

-- ----------------------------
-- Table: employees
-- ----------------------------
DROP TABLE IF EXISTS `employees`;
CREATE TABLE `employees` (
  `Emp_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(150) NOT NULL,
  `company` varchar(150) DEFAULT NULL,
  `employee_code` varchar(30) DEFAULT NULL,
  `aadhar_no` char(12) DEFAULT NULL,
  `pan_no` char(10) DEFAULT NULL,
  `email` varchar(150) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role_id` int(11) NOT NULL,
  `Dept_id` int(11) DEFAULT NULL,
  `reporting_to` int(11) DEFAULT NULL,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `reset_token` varchar(255) DEFAULT NULL,
  `reset_token_expires` datetime DEFAULT NULL,
  PRIMARY KEY (`Emp_id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `employee_code` (`employee_code`),
  UNIQUE KEY `aadhar_no` (`aadhar_no`),
  UNIQUE KEY `pan_no` (`pan_no`),
  KEY `role_id` (`role_id`),
  KEY `Dept_id` (`Dept_id`),
  KEY `reporting_to` (`reporting_to`),
  CONSTRAINT `employees_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`),
  CONSTRAINT `employees_ibfk_2` FOREIGN KEY (`Dept_id`) REFERENCES `departments` (`id`),
  CONSTRAINT `employees_ibfk_3` FOREIGN KEY (`reporting_to`) REFERENCES `employees` (`Emp_id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `employees` (`Emp_id`, `name`, `company`, `employee_code`, `aadhar_no`, `pan_no`, `email`, `password_hash`, `role_id`, `Dept_id`, `reporting_to`, `status`, `created_at`, `reset_token`, `reset_token_expires`) VALUES (2, 'Rohit Manager', NULL, NULL, NULL, NULL, 'manager@test.com', '$2b$10$TwMYrOBfYBXYcLcO4QJSJuFQP1uAuZw2TRmqt.j18vPK/pk0VmG86', 2, 1, NULL, 'active', '2026-09-01 11:31:46', NULL, NULL);
INSERT INTO `employees` (`Emp_id`, `name`, `company`, `employee_code`, `aadhar_no`, `pan_no`, `email`, `password_hash`, `role_id`, `Dept_id`, `reporting_to`, `status`, `created_at`, `reset_token`, `reset_token_expires`) VALUES (3, 'Aditya Test', NULL, NULL, NULL, NULL, 'aditya@test.com', '$2b$10$r6PBhoLeYwEtsycILpYAw.PVdcavDe96uhku/Q7ormF8gsXKhXfyu', 1, 1, 2, 'active', '2026-09-01 11:31:46', NULL, NULL);
INSERT INTO `employees` (`Emp_id`, `name`, `company`, `employee_code`, `aadhar_no`, `pan_no`, `email`, `password_hash`, `role_id`, `Dept_id`, `reporting_to`, `status`, `created_at`, `reset_token`, `reset_token_expires`) VALUES (4, 'omkar thavare', 'Insight Infotech', 'EMP-1042', '234567890123', 'ABCDE1234F', 'omkar@test.com', '$2b$10$62MmUJgzyjoqrAoqeyIWpe3RZmdwoT0alC.i.PhUiXDDkhEZ.K7Vu', 1, 1, 2, 'active', '2026-09-02 06:55:18', NULL, NULL);
INSERT INTO `employees` (`Emp_id`, `name`, `company`, `employee_code`, `aadhar_no`, `pan_no`, `email`, `password_hash`, `role_id`, `Dept_id`, `reporting_to`, `status`, `created_at`, `reset_token`, `reset_token_expires`) VALUES (5, 'Darshan Jagdale', NULL, NULL, NULL, NULL, 'darshan@test.com', '$2b$10$BLIlKs4/UKMeN9rnDsNSD.qytfKYolORqCNX6KXVOZKo/J7m7QJ3O', 1, 1, 2, 'active', '2026-09-02 09:31:29', NULL, NULL);
INSERT INTO `employees` (`Emp_id`, `name`, `company`, `employee_code`, `aadhar_no`, `pan_no`, `email`, `password_hash`, `role_id`, `Dept_id`, `reporting_to`, `status`, `created_at`, `reset_token`, `reset_token_expires`) VALUES (6, 'madhura patil', 'insight infotech', 'emp001', '123456789012', 'ABCDE1231A', 'madhura@test.com', '$2b$10$l..bFnL52H245N0RXh0HHeh8LCMGL9cWTj/xtvfJTAFvwemtbrp3G', 1, 2, 2, 'active', '2026-09-02 16:19:46', NULL, NULL);
INSERT INTO `employees` (`Emp_id`, `name`, `company`, `employee_code`, `aadhar_no`, `pan_no`, `email`, `password_hash`, `role_id`, `Dept_id`, `reporting_to`, `status`, `created_at`, `reset_token`, `reset_token_expires`) VALUES (7, 'giri sir', 'iinsight infotech', 'EMP07', '123456789098', 'ABCDE1122F', 'giri@test.com', '$2b$10$bSRUAjdSh2XCnvs7QoACwO05foeqj.7jfkLrjxYSC8owaJqCs3h9C', 3, NULL, 2, 'active', '2026-09-02 16:28:30', NULL, NULL);
INSERT INTO `employees` (`Emp_id`, `name`, `company`, `employee_code`, `aadhar_no`, `pan_no`, `email`, `password_hash`, `role_id`, `Dept_id`, `reporting_to`, `status`, `created_at`, `reset_token`, `reset_token_expires`) VALUES (8, 'Bharat sir', 'Insight infotech', 'EMP08', '112233445566', 'ABCDE2334A', 'bharat@test.com', '$2b$10$2aRO56NfmBVeXb5qUHh/1On8TL8f6tvRowH86KMsOz8P5vOp8XJRy', 2, 2, 7, 'active', '2026-09-03 10:28:15', NULL, NULL);
INSERT INTO `employees` (`Emp_id`, `name`, `company`, `employee_code`, `aadhar_no`, `pan_no`, `email`, `password_hash`, `role_id`, `Dept_id`, `reporting_to`, `status`, `created_at`, `reset_token`, `reset_token_expires`) VALUES (9, 'Omkar T', 'I. R.S', 'EMP18', '102030405060', 'CBUPT5555T', 'omkarthavare5@gmail.com', '$2b$10$wjW7I3iEL4ln9Tu9Ere/N.2.NQ8eHxLkn/3Kkr0sgLPB9UN4.tXua', 1, 1, 8, 'active', '2026-09-10 10:48:03', NULL, NULL);
INSERT INTO `employees` (`Emp_id`, `name`, `company`, `employee_code`, `aadhar_no`, `pan_no`, `email`, `password_hash`, `role_id`, `Dept_id`, `reporting_to`, `status`, `created_at`, `reset_token`, `reset_token_expires`) VALUES (10, 'aditya dighe', 'rmdssoe', 'EMP19', '453336323212', 'POCDE1902D', 'adityadighe1931@gmail.com', '$2b$10$xEsKQSJRvUNl2a3wFQMwmeW37TdZZr7EvQNRvZtMBuL0IhbFQkcry', 1, 1, 8, 'active', '2026-09-10 10:58:34', NULL, NULL);

-- ----------------------------
-- Table: leave_applications
-- ----------------------------
DROP TABLE IF EXISTS `leave_applications`;
CREATE TABLE `leave_applications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `employee_id` int(11) NOT NULL,
  `leave_type_id` int(11) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `duration_type` varchar(20) NOT NULL DEFAULT 'FULL_DAY',
  `total_days` decimal(4,1) NOT NULL,
  `reason` text DEFAULT NULL,
  `status` enum('pending','approved','rejected','cancelled') NOT NULL DEFAULT 'pending',
  `approver_id` int(11) NOT NULL,
  `applied_on` timestamp NOT NULL DEFAULT current_timestamp(),
  `decided_on` timestamp NULL DEFAULT NULL,
  `start_day_type` enum('FULL_DAY','FIRST_HALF','SECOND_HALF') DEFAULT 'FULL_DAY',
  `end_day_type` enum('FULL_DAY','FIRST_HALF','SECOND_HALF') DEFAULT 'FULL_DAY',
  PRIMARY KEY (`id`),
  KEY `employee_id` (`employee_id`),
  KEY `leave_type_id` (`leave_type_id`),
  KEY `approver_id` (`approver_id`),
  CONSTRAINT `leave_applications_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`Emp_id`),
  CONSTRAINT `leave_applications_ibfk_2` FOREIGN KEY (`leave_type_id`) REFERENCES `leave_types` (`id`),
  CONSTRAINT `leave_applications_ibfk_3` FOREIGN KEY (`approver_id`) REFERENCES `employees` (`Emp_id`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `leave_applications` (`id`, `employee_id`, `leave_type_id`, `start_date`, `end_date`, `duration_type`, `total_days`, `reason`, `status`, `approver_id`, `applied_on`, `decided_on`, `start_day_type`, `end_day_type`) VALUES (1, 3, 1, '2026-09-09 18:30:00', '2026-09-11 18:30:00', 'FULL_DAY', '3.0', 'going to village', 'approved', 2, '2026-09-01 12:15:34', '2026-09-01 13:32:21', 'FULL_DAY', 'FULL_DAY');
INSERT INTO `leave_applications` (`id`, `employee_id`, `leave_type_id`, `start_date`, `end_date`, `duration_type`, `total_days`, `reason`, `status`, `approver_id`, `applied_on`, `decided_on`, `start_day_type`, `end_day_type`) VALUES (2, 3, 1, '2026-09-03 18:30:00', '2026-09-05 18:30:00', 'FULL_DAY', '3.0', 'family function', 'approved', 2, '2026-09-02 15:53:00', '2026-09-02 16:08:34', 'FULL_DAY', 'FULL_DAY');
INSERT INTO `leave_applications` (`id`, `employee_id`, `leave_type_id`, `start_date`, `end_date`, `duration_type`, `total_days`, `reason`, `status`, `approver_id`, `applied_on`, `decided_on`, `start_day_type`, `end_day_type`) VALUES (3, 6, 1, '2026-09-09 18:30:00', '2026-09-13 18:30:00', 'FULL_DAY', '5.0', 'xyz', 'rejected', 2, '2026-09-02 16:23:23', '2026-09-02 16:24:51', 'FULL_DAY', 'FULL_DAY');
INSERT INTO `leave_applications` (`id`, `employee_id`, `leave_type_id`, `start_date`, `end_date`, `duration_type`, `total_days`, `reason`, `status`, `approver_id`, `applied_on`, `decided_on`, `start_day_type`, `end_day_type`) VALUES (4, 4, 1, '2026-09-14 18:30:00', '2026-09-17 18:30:00', 'FULL_DAY', '4.0', '1ad', 'approved', 2, '2026-09-02 16:36:21', '2026-09-02 16:38:39', 'FULL_DAY', 'FULL_DAY');
INSERT INTO `leave_applications` (`id`, `employee_id`, `leave_type_id`, `start_date`, `end_date`, `duration_type`, `total_days`, `reason`, `status`, `approver_id`, `applied_on`, `decided_on`, `start_day_type`, `end_day_type`) VALUES (5, 4, 1, '2026-09-02 18:30:00', '2026-09-04 18:30:00', 'FULL_DAY', '3.0', 'asfdh', 'rejected', 2, '2026-09-02 16:39:20', '2026-09-02 16:39:30', 'FULL_DAY', 'FULL_DAY');
INSERT INTO `leave_applications` (`id`, `employee_id`, `leave_type_id`, `start_date`, `end_date`, `duration_type`, `total_days`, `reason`, `status`, `approver_id`, `applied_on`, `decided_on`, `start_day_type`, `end_day_type`) VALUES (6, 3, 1, '2026-09-03 18:30:00', '2026-09-06 18:30:00', 'FULL_DAY', '4.0', 'xasd', 'rejected', 2, '2026-09-03 05:23:26', '2026-09-03 05:24:22', 'FULL_DAY', 'FULL_DAY');
INSERT INTO `leave_applications` (`id`, `employee_id`, `leave_type_id`, `start_date`, `end_date`, `duration_type`, `total_days`, `reason`, `status`, `approver_id`, `applied_on`, `decided_on`, `start_day_type`, `end_day_type`) VALUES (7, 3, 2, '2026-09-04 18:30:00', '2026-09-07 18:30:00', 'FULL_DAY', '4.0', 'no fill well', 'approved', 2, '2026-09-03 07:10:39', '2026-09-03 07:11:17', 'FULL_DAY', 'FULL_DAY');
INSERT INTO `leave_applications` (`id`, `employee_id`, `leave_type_id`, `start_date`, `end_date`, `duration_type`, `total_days`, `reason`, `status`, `approver_id`, `applied_on`, `decided_on`, `start_day_type`, `end_day_type`) VALUES (8, 3, 3, '2026-09-03 18:30:00', '2026-09-07 18:30:00', 'FULL_DAY', '3.0', 'vacation', 'approved', 2, '2026-09-03 07:26:20', '2026-09-03 07:27:25', 'FULL_DAY', 'FULL_DAY');
INSERT INTO `leave_applications` (`id`, `employee_id`, `leave_type_id`, `start_date`, `end_date`, `duration_type`, `total_days`, `reason`, `status`, `approver_id`, `applied_on`, `decided_on`, `start_day_type`, `end_day_type`) VALUES (9, 8, 3, '2026-09-03 18:30:00', '2026-09-05 18:30:00', 'FULL_DAY', '1.0', 'for personal reason', 'approved', 7, '2026-09-03 14:44:47', '2026-09-03 14:45:32', 'FULL_DAY', 'FULL_DAY');
INSERT INTO `leave_applications` (`id`, `employee_id`, `leave_type_id`, `start_date`, `end_date`, `duration_type`, `total_days`, `reason`, `status`, `approver_id`, `applied_on`, `decided_on`, `start_day_type`, `end_day_type`) VALUES (10, 3, 3, '2026-09-04 18:30:00', '2026-09-07 18:30:00', 'FULL_DAY', '2.0', 'personal reason', 'rejected', 2, '2026-09-03 18:24:21', '2026-09-03 18:25:12', 'FULL_DAY', 'FULL_DAY');
INSERT INTO `leave_applications` (`id`, `employee_id`, `leave_type_id`, `start_date`, `end_date`, `duration_type`, `total_days`, `reason`, `status`, `approver_id`, `applied_on`, `decided_on`, `start_day_type`, `end_day_type`) VALUES (11, 3, 1, '2026-09-04 18:30:00', '2026-09-06 18:30:00', 'FULL_DAY', '1.0', 'xyz', 'rejected', 2, '2026-09-04 06:02:43', '2026-09-07 09:33:27', 'FULL_DAY', 'FULL_DAY');
INSERT INTO `leave_applications` (`id`, `employee_id`, `leave_type_id`, `start_date`, `end_date`, `duration_type`, `total_days`, `reason`, `status`, `approver_id`, `applied_on`, `decided_on`, `start_day_type`, `end_day_type`) VALUES (12, 8, 1, '2026-09-17 18:30:00', '2026-09-20 18:30:00', 'FULL_DAY', '2.0', 'asdf', 'approved', 7, '2026-09-04 06:26:23', '2026-09-04 06:31:35', 'FULL_DAY', 'FULL_DAY');
INSERT INTO `leave_applications` (`id`, `employee_id`, `leave_type_id`, `start_date`, `end_date`, `duration_type`, `total_days`, `reason`, `status`, `approver_id`, `applied_on`, `decided_on`, `start_day_type`, `end_day_type`) VALUES (13, 3, 1, '2026-09-03 18:30:00', '2026-09-06 18:30:00', 'FULL_DAY', '2.0', 'asdd', 'rejected', 2, '2026-09-05 05:15:47', '2026-09-05 05:16:23', 'FULL_DAY', 'FULL_DAY');
INSERT INTO `leave_applications` (`id`, `employee_id`, `leave_type_id`, `start_date`, `end_date`, `duration_type`, `total_days`, `reason`, `status`, `approver_id`, `applied_on`, `decided_on`, `start_day_type`, `end_day_type`) VALUES (14, 3, 1, '2026-09-07 18:30:00', '2026-09-07 18:30:00', 'FULL_DAY', '1.0', 'asdf', 'rejected', 2, '2026-09-07 09:23:30', '2026-09-07 09:33:28', 'FULL_DAY', 'FULL_DAY');
INSERT INTO `leave_applications` (`id`, `employee_id`, `leave_type_id`, `start_date`, `end_date`, `duration_type`, `total_days`, `reason`, `status`, `approver_id`, `applied_on`, `decided_on`, `start_day_type`, `end_day_type`) VALUES (15, 4, 1, '2026-09-08 18:30:00', '2026-09-08 18:30:00', 'FULL_DAY', '1.0', 'medical issue', 'approved', 2, '2026-09-07 18:28:50', '2026-09-07 18:29:34', 'FULL_DAY', 'FULL_DAY');
INSERT INTO `leave_applications` (`id`, `employee_id`, `leave_type_id`, `start_date`, `end_date`, `duration_type`, `total_days`, `reason`, `status`, `approver_id`, `applied_on`, `decided_on`, `start_day_type`, `end_day_type`) VALUES (16, 4, 2, '2026-09-07 18:30:00', '2026-09-07 18:30:00', 'FULL_DAY', '0.5', 'emergency', 'rejected', 2, '2026-09-07 18:35:17', '2026-09-07 18:36:24', 'FIRST_HALF', 'FIRST_HALF');
INSERT INTO `leave_applications` (`id`, `employee_id`, `leave_type_id`, `start_date`, `end_date`, `duration_type`, `total_days`, `reason`, `status`, `approver_id`, `applied_on`, `decided_on`, `start_day_type`, `end_day_type`) VALUES (17, 4, 1, '2026-09-08 18:30:00', '2026-09-08 18:30:00', 'FULL_DAY', '0.5', 'atest', 'rejected', 2, '2026-09-07 18:37:09', '2026-09-07 18:37:22', 'SECOND_HALF', 'FULL_DAY');
INSERT INTO `leave_applications` (`id`, `employee_id`, `leave_type_id`, `start_date`, `end_date`, `duration_type`, `total_days`, `reason`, `status`, `approver_id`, `applied_on`, `decided_on`, `start_day_type`, `end_day_type`) VALUES (18, 4, 1, '2026-09-24 18:30:00', '2026-09-25 18:30:00', 'FULL_DAY', '2.0', 'going to village', 'rejected', 2, '2026-09-08 16:12:19', '2026-09-08 16:12:28', 'FULL_DAY', 'FULL_DAY');
INSERT INTO `leave_applications` (`id`, `employee_id`, `leave_type_id`, `start_date`, `end_date`, `duration_type`, `total_days`, `reason`, `status`, `approver_id`, `applied_on`, `decided_on`, `start_day_type`, `end_day_type`) VALUES (19, 3, 1, '2026-09-14 18:30:00', '2026-09-14 18:30:00', 'FULL_DAY', '0.5', 'asdffdsh', 'approved', 2, '2026-09-09 08:15:45', '2026-09-09 08:22:03', 'FIRST_HALF', 'FULL_DAY');
INSERT INTO `leave_applications` (`id`, `employee_id`, `leave_type_id`, `start_date`, `end_date`, `duration_type`, `total_days`, `reason`, `status`, `approver_id`, `applied_on`, `decided_on`, `start_day_type`, `end_day_type`) VALUES (20, 10, 1, '2026-09-21 18:30:00', '2026-09-22 18:30:00', 'FULL_DAY', '1.5', 'going too village  ', 'rejected', 8, '2026-09-11 11:58:51', '2026-09-11 12:40:59', 'SECOND_HALF', 'FULL_DAY');
INSERT INTO `leave_applications` (`id`, `employee_id`, `leave_type_id`, `start_date`, `end_date`, `duration_type`, `total_days`, `reason`, `status`, `approver_id`, `applied_on`, `decided_on`, `start_day_type`, `end_day_type`) VALUES (21, 10, 1, '2026-09-15 18:30:00', '2026-09-17 18:30:00', 'FULL_DAY', '2.0', ' goin to village', 'approved', 8, '2026-09-12 04:03:01', '2026-09-12 04:04:32', 'FULL_DAY', 'FULL_DAY');

-- ----------------------------
-- Table: leave_approval_logs
-- ----------------------------
DROP TABLE IF EXISTS `leave_approval_logs`;
CREATE TABLE `leave_approval_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `leave_application_id` int(11) NOT NULL,
  `approver_id` int(11) NOT NULL,
  `action` enum('approved','rejected') NOT NULL,
  `remarks` text DEFAULT NULL,
  `action_date` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `leave_application_id` (`leave_application_id`),
  KEY `approver_id` (`approver_id`),
  CONSTRAINT `leave_approval_logs_ibfk_1` FOREIGN KEY (`leave_application_id`) REFERENCES `leave_applications` (`id`),
  CONSTRAINT `leave_approval_logs_ibfk_2` FOREIGN KEY (`approver_id`) REFERENCES `employees` (`Emp_id`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `leave_approval_logs` (`id`, `leave_application_id`, `approver_id`, `action`, `remarks`, `action_date`) VALUES (1, 1, 2, 'approved', 'Go ahead, enjoy the break', '2026-09-01 13:32:21');
INSERT INTO `leave_approval_logs` (`id`, `leave_application_id`, `approver_id`, `action`, `remarks`, `action_date`) VALUES (2, 2, 2, 'approved', 'go and enjoy', '2026-09-02 16:08:35');
INSERT INTO `leave_approval_logs` (`id`, `leave_application_id`, `approver_id`, `action`, `remarks`, `action_date`) VALUES (3, 3, 2, 'rejected', 'no', '2026-09-02 16:24:51');
INSERT INTO `leave_approval_logs` (`id`, `leave_application_id`, `approver_id`, `action`, `remarks`, `action_date`) VALUES (4, 4, 2, 'approved', 'no bro', '2026-09-02 16:38:39');
INSERT INTO `leave_approval_logs` (`id`, `leave_application_id`, `approver_id`, `action`, `remarks`, `action_date`) VALUES (5, 5, 2, 'rejected', '', '2026-09-02 16:39:30');
INSERT INTO `leave_approval_logs` (`id`, `leave_application_id`, `approver_id`, `action`, `remarks`, `action_date`) VALUES (6, 6, 2, 'rejected', 'no ', '2026-09-03 05:24:22');
INSERT INTO `leave_approval_logs` (`id`, `leave_application_id`, `approver_id`, `action`, `remarks`, `action_date`) VALUES (7, 7, 2, 'approved', '', '2026-09-03 07:11:17');
INSERT INTO `leave_approval_logs` (`id`, `leave_application_id`, `approver_id`, `action`, `remarks`, `action_date`) VALUES (8, 8, 2, 'approved', 'complete remaning then go for holiday', '2026-09-03 07:27:25');
INSERT INTO `leave_approval_logs` (`id`, `leave_application_id`, `approver_id`, `action`, `remarks`, `action_date`) VALUES (9, 9, 7, 'approved', 'ok ', '2026-09-03 14:45:32');
INSERT INTO `leave_approval_logs` (`id`, `leave_application_id`, `approver_id`, `action`, `remarks`, `action_date`) VALUES (10, 10, 2, 'rejected', 'no ', '2026-09-03 18:25:12');
INSERT INTO `leave_approval_logs` (`id`, `leave_application_id`, `approver_id`, `action`, `remarks`, `action_date`) VALUES (11, 12, 7, 'approved', 'ok ', '2026-09-04 06:31:35');
INSERT INTO `leave_approval_logs` (`id`, `leave_application_id`, `approver_id`, `action`, `remarks`, `action_date`) VALUES (12, 13, 2, 'rejected', '', '2026-09-05 05:16:23');
INSERT INTO `leave_approval_logs` (`id`, `leave_application_id`, `approver_id`, `action`, `remarks`, `action_date`) VALUES (13, 11, 2, 'rejected', '', '2026-09-07 09:33:27');
INSERT INTO `leave_approval_logs` (`id`, `leave_application_id`, `approver_id`, `action`, `remarks`, `action_date`) VALUES (14, 14, 2, 'rejected', '', '2026-09-07 09:33:28');
INSERT INTO `leave_approval_logs` (`id`, `leave_application_id`, `approver_id`, `action`, `remarks`, `action_date`) VALUES (15, 15, 2, 'approved', 'ok', '2026-09-07 18:29:34');
INSERT INTO `leave_approval_logs` (`id`, `leave_application_id`, `approver_id`, `action`, `remarks`, `action_date`) VALUES (16, 16, 2, 'rejected', '', '2026-09-07 18:36:24');
INSERT INTO `leave_approval_logs` (`id`, `leave_application_id`, `approver_id`, `action`, `remarks`, `action_date`) VALUES (17, 17, 2, 'rejected', '', '2026-09-07 18:37:22');
INSERT INTO `leave_approval_logs` (`id`, `leave_application_id`, `approver_id`, `action`, `remarks`, `action_date`) VALUES (18, 18, 2, 'rejected', '', '2026-09-08 16:12:28');
INSERT INTO `leave_approval_logs` (`id`, `leave_application_id`, `approver_id`, `action`, `remarks`, `action_date`) VALUES (19, 19, 2, 'approved', '', '2026-09-09 08:22:03');
INSERT INTO `leave_approval_logs` (`id`, `leave_application_id`, `approver_id`, `action`, `remarks`, `action_date`) VALUES (20, 20, 8, 'rejected', 'noo', '2026-09-11 12:40:59');
INSERT INTO `leave_approval_logs` (`id`, `leave_application_id`, `approver_id`, `action`, `remarks`, `action_date`) VALUES (21, 21, 8, 'approved', 'ok', '2026-09-12 04:04:32');

-- ----------------------------
-- Table: leave_balances
-- ----------------------------
DROP TABLE IF EXISTS `leave_balances`;
CREATE TABLE `leave_balances` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `employee_id` int(11) NOT NULL,
  `leave_type_id` int(11) NOT NULL,
  `year` int(11) NOT NULL,
  `allocated_days` int(11) NOT NULL,
  `used_days` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `employee_id` (`employee_id`,`leave_type_id`,`year`),
  KEY `leave_type_id` (`leave_type_id`),
  CONSTRAINT `leave_balances_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`Emp_id`),
  CONSTRAINT `leave_balances_ibfk_2` FOREIGN KEY (`leave_type_id`) REFERENCES `leave_types` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `leave_balances` (`id`, `employee_id`, `leave_type_id`, `year`, `allocated_days`, `used_days`) VALUES (1, 3, 1, 2026, 12, 6);
INSERT INTO `leave_balances` (`id`, `employee_id`, `leave_type_id`, `year`, `allocated_days`, `used_days`) VALUES (2, 3, 3, 2026, 12, 3);
INSERT INTO `leave_balances` (`id`, `employee_id`, `leave_type_id`, `year`, `allocated_days`, `used_days`) VALUES (3, 3, 2, 2026, 12, 4);
INSERT INTO `leave_balances` (`id`, `employee_id`, `leave_type_id`, `year`, `allocated_days`, `used_days`) VALUES (4, 4, 1, 2026, 12, 5);
INSERT INTO `leave_balances` (`id`, `employee_id`, `leave_type_id`, `year`, `allocated_days`, `used_days`) VALUES (5, 4, 2, 2026, 10, 0);
INSERT INTO `leave_balances` (`id`, `employee_id`, `leave_type_id`, `year`, `allocated_days`, `used_days`) VALUES (6, 4, 3, 2026, 15, 0);
INSERT INTO `leave_balances` (`id`, `employee_id`, `leave_type_id`, `year`, `allocated_days`, `used_days`) VALUES (7, 5, 1, 2026, 12, 0);
INSERT INTO `leave_balances` (`id`, `employee_id`, `leave_type_id`, `year`, `allocated_days`, `used_days`) VALUES (8, 5, 2, 2026, 10, 0);
INSERT INTO `leave_balances` (`id`, `employee_id`, `leave_type_id`, `year`, `allocated_days`, `used_days`) VALUES (9, 5, 3, 2026, 15, 0);
INSERT INTO `leave_balances` (`id`, `employee_id`, `leave_type_id`, `year`, `allocated_days`, `used_days`) VALUES (10, 6, 1, 2026, 12, 0);
INSERT INTO `leave_balances` (`id`, `employee_id`, `leave_type_id`, `year`, `allocated_days`, `used_days`) VALUES (11, 6, 2, 2026, 10, 0);
INSERT INTO `leave_balances` (`id`, `employee_id`, `leave_type_id`, `year`, `allocated_days`, `used_days`) VALUES (12, 6, 3, 2026, 15, 0);
INSERT INTO `leave_balances` (`id`, `employee_id`, `leave_type_id`, `year`, `allocated_days`, `used_days`) VALUES (13, 7, 1, 2026, 12, 0);
INSERT INTO `leave_balances` (`id`, `employee_id`, `leave_type_id`, `year`, `allocated_days`, `used_days`) VALUES (14, 7, 2, 2026, 10, 0);
INSERT INTO `leave_balances` (`id`, `employee_id`, `leave_type_id`, `year`, `allocated_days`, `used_days`) VALUES (15, 7, 3, 2026, 15, 0);
INSERT INTO `leave_balances` (`id`, `employee_id`, `leave_type_id`, `year`, `allocated_days`, `used_days`) VALUES (16, 8, 1, 2026, 12, 2);
INSERT INTO `leave_balances` (`id`, `employee_id`, `leave_type_id`, `year`, `allocated_days`, `used_days`) VALUES (17, 8, 2, 2026, 10, 0);
INSERT INTO `leave_balances` (`id`, `employee_id`, `leave_type_id`, `year`, `allocated_days`, `used_days`) VALUES (18, 8, 3, 2026, 15, 1);
INSERT INTO `leave_balances` (`id`, `employee_id`, `leave_type_id`, `year`, `allocated_days`, `used_days`) VALUES (19, 9, 1, 2026, 12, 0);
INSERT INTO `leave_balances` (`id`, `employee_id`, `leave_type_id`, `year`, `allocated_days`, `used_days`) VALUES (20, 9, 2, 2026, 10, 0);
INSERT INTO `leave_balances` (`id`, `employee_id`, `leave_type_id`, `year`, `allocated_days`, `used_days`) VALUES (21, 9, 3, 2026, 15, 0);
INSERT INTO `leave_balances` (`id`, `employee_id`, `leave_type_id`, `year`, `allocated_days`, `used_days`) VALUES (22, 10, 1, 2026, 12, 2);
INSERT INTO `leave_balances` (`id`, `employee_id`, `leave_type_id`, `year`, `allocated_days`, `used_days`) VALUES (23, 10, 2, 2026, 10, 0);
INSERT INTO `leave_balances` (`id`, `employee_id`, `leave_type_id`, `year`, `allocated_days`, `used_days`) VALUES (24, 10, 3, 2026, 15, 0);

-- ----------------------------
-- Table: leave_types
-- ----------------------------
DROP TABLE IF EXISTS `leave_types`;
CREATE TABLE `leave_types` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `max_days_per_year` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `leave_types` (`id`, `name`, `max_days_per_year`) VALUES (1, 'Casual Leave', 12);
INSERT INTO `leave_types` (`id`, `name`, `max_days_per_year`) VALUES (2, 'Sick Leave', 10);
INSERT INTO `leave_types` (`id`, `name`, `max_days_per_year`) VALUES (3, 'comp off Leave', 15);

-- ----------------------------
-- Table: notifications
-- ----------------------------
DROP TABLE IF EXISTS `notifications`;
CREATE TABLE `notifications` (
  `notification_id` int(11) NOT NULL AUTO_INCREMENT,
  `recipient_id` int(11) NOT NULL,
  `title` varchar(150) NOT NULL,
  `message` text NOT NULL,
  `type` varchar(50) NOT NULL,
  `reference_id` int(11) DEFAULT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`notification_id`),
  KEY `fk_notification_recipient` (`recipient_id`),
  CONSTRAINT `fk_notification_recipient` FOREIGN KEY (`recipient_id`) REFERENCES `employees` (`Emp_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `notifications` (`notification_id`, `recipient_id`, `title`, `message`, `type`, `reference_id`, `is_read`, `created_at`) VALUES (3, 10, 'Leave Request Approved', 'Your leave request has been approved by Bharat sir.', 'LEAVE_APPROVED', 21, 1, '2026-09-12 04:04:32');

-- ----------------------------
-- Table: password_reset_otps
-- ----------------------------
DROP TABLE IF EXISTS `password_reset_otps`;
CREATE TABLE `password_reset_otps` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `employee_id` int(11) NOT NULL,
  `otp_hash` varchar(255) NOT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `employee_id` (`employee_id`),
  CONSTRAINT `password_reset_otps_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`Emp_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `password_reset_otps` (`id`, `employee_id`, `otp_hash`, `expires_at`, `created_at`) VALUES (7, 4, '$2b$10$zXIThwABcQAEgCvQWms6KOMbm2BX8kY59P0eSShJV3P4lo9QL0b4e', '2026-09-10 10:13:39', '2026-09-10 10:08:39');
INSERT INTO `password_reset_otps` (`id`, `employee_id`, `otp_hash`, `expires_at`, `created_at`) VALUES (8, 3, '$2b$10$GklwN.EiP1NxNv1w1Qz9oup6jTBkmrlEtF0/0vkYx8YjhXo2q9ibe', '2026-09-10 10:30:05', '2026-09-10 10:25:06');

-- ----------------------------
-- Table: public_holidays
-- ----------------------------
DROP TABLE IF EXISTS `public_holidays`;
CREATE TABLE `public_holidays` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `holiday_date` date NOT NULL,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `holiday_date` (`holiday_date`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `public_holidays` (`id`, `holiday_date`, `name`) VALUES (1, '2026-09-04 18:30:00', 'janmashtami');
INSERT INTO `public_holidays` (`id`, `holiday_date`, `name`) VALUES (3, '2026-09-13 18:30:00', 'Ganesh Chaturthi');
INSERT INTO `public_holidays` (`id`, `holiday_date`, `name`) VALUES (4, '2026-09-18 18:30:00', 'Ganesh Visarjan');
INSERT INTO `public_holidays` (`id`, `holiday_date`, `name`) VALUES (5, '2026-09-16 18:30:00', 'gauri poojan');

-- ----------------------------
-- Table: roles
-- ----------------------------
DROP TABLE IF EXISTS `roles`;
CREATE TABLE `roles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `roles` (`id`, `name`) VALUES (1, 'employee');
INSERT INTO `roles` (`id`, `name`) VALUES (2, 'manager');
INSERT INTO `roles` (`id`, `name`) VALUES (3, 'owner');

SET FOREIGN_KEY_CHECKS=1;