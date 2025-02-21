CREATE TABLE IF NOT EXISTS `users` (
`user_id`        int(11)            NOT NULL AUTO_INCREMENT	COMMENT 'The user id',
`email`          varchar(100)       NOT NULL 				COMMENT 'The user email',
`password`       varchar(500)       NOT NULL				COMMENT 'The user password',
PRIMARY KEY (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COMMENT="Signed Up Users";