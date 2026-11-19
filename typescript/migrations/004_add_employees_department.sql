ALTER TABLE `employees`
ADD CONSTRAINT `employees_ibfk_2`
FOREIGN KEY (`Dept_id`)
REFERENCES `departments` (`id`);