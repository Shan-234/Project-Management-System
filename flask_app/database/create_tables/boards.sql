CREATE TABLE IF NOT EXISTS `boards` (
`board_id`      int(11)            NOT NULL AUTO_INCREMENT	COMMENT 'The board id',
`name`          varchar(200)       NOT NULL 				COMMENT 'The board name',
`description`   varchar(500)       DEFAULT NULL 			COMMENT 'The board description',
PRIMARY KEY (`board_id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COMMENT="All Boards";