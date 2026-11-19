DROP TABLE IF EXISTS `employees`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employees` (
  `Emp_id` int NOT NULL AUTO_INCREMENT,
  `keycloak_id` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `name` varchar(150) COLLATE utf8mb4_general_ci NOT NULL,
  `company` varchar(150) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `employee_code` varchar(30) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `aadhar_no` char(12) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `pan_no` char(10) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `email` varchar(150) COLLATE utf8mb4_general_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `role_id` int NOT NULL,
  `Dept_id` int DEFAULT NULL,
  `reporting_to` int DEFAULT NULL,
  `status` enum('active','inactive') COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `reset_token` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `reset_token_expires` datetime DEFAULT NULL,
  PRIMARY KEY (`Emp_id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `employee_code` (`employee_code`),
  UNIQUE KEY `aadhar_no` (`aadhar_no`),
  UNIQUE KEY `pan_no` (`pan_no`),
  UNIQUE KEY `keycloak_id` (`keycloak_id`),
  KEY `role_id` (`role_id`),
  KEY `Dept_id` (`Dept_id`),
  KEY `reporting_to` (`reporting_to`),
  CONSTRAINT `employees_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`),
  /*CONSTRAINT `employees_ibfk_2` FOREIGN KEY (`Dept_id`) REFERENCES `departments` (`id`),*/
  CONSTRAINT `employees_ibfk_3` FOREIGN KEY (`reporting_to`) REFERENCES `employees` (`Emp_id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;