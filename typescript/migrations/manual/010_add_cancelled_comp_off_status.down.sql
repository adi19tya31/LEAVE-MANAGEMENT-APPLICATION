
-- Rollback: 010_add_cancelled_comp_off_status
-- Do not remove cancelled while records use that status.

DROP PROCEDURE IF EXISTS rollback_comp_off_cancelled_status;

DELIMITER //

CREATE PROCEDURE rollback_comp_off_cancelled_status()
BEGIN
    DECLARE cancelled_count INT DEFAULT 0;

    SELECT COUNT(*)
    INTO cancelled_count
    FROM comp_off_requests
    WHERE status = 'cancelled';

    IF cancelled_count > 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT =
            'Rollback stopped: cancelled Comp-Off records exist. Handle them before rollback.';
    ELSE
        ALTER TABLE comp_off_requests
        MODIFY COLUMN status
            ENUM('pending', 'approved', 'rejected')
            COLLATE utf8mb4_general_ci
            NOT NULL
            DEFAULT 'pending';
    END IF;
END //

DELIMITER ;

CALL rollback_comp_off_cancelled_status();

DROP PROCEDURE IF EXISTS rollback_comp_off_cancelled_status;
  