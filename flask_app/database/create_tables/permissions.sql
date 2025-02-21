CREATE TABLE IF NOT EXISTS `permissions` (
`permission_id`      int(11)            NOT NULL AUTO_INCREMENT	COMMENT 'The permission id',
`user_id`            int(11)            NOT NULL 				COMMENT 'FK:The user id',
`board_id`           int(11)            NOT NULL				COMMENT 'FK: The board id',
`role`               varchar(100)       NOT NULL                COMMENT 'The role of the user in the board',
PRIMARY KEY (`permission_id`),
FOREIGN KEY (user_id) REFERENCES users(user_id),
FOREIGN KEY (board_id) REFERENCES boards(board_id)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COMMENT="Permission Relationships";