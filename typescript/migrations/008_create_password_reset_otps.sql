-- 008_create_password_reset_otps.sql

CREATE TABLE IF NOT EXISTS `password_reset_otps` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employee_id` int NOT NULL,
  `otp_hash` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),

  KEY `employee_id` (`employee_id`),

  CONSTRAINT `password_reset_otps_ibfk_1`
    FOREIGN KEY (`employee_id`)
    REFERENCES `employees` (`Emp_id`)
    ON DELETE CASCADE
) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_general_ci;