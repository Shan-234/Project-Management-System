CREATE TABLE IF NOT EXISTS `lists` (
`list_id`            int(11)            NOT NULL AUTO_INCREMENT	COMMENT 'The list id',
`board_id`           int(11)            NOT NULL				COMMENT 'FK: The board id',
`name`               varchar(500)       NOT NULL                COMMENT 'The list name',
PRIMARY KEY (`list_id`),
FOREIGN KEY (board_id) REFERENCES boards(board_id)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COMMENT="All lists";