CREATE TABLE IF NOT EXISTS `cards` (
`card_id`           int(11)       NOT NULL    AUTO_INCREMENT	COMMENT 'The card id',
`list_id`           int(11)       NOT NULL 				        COMMENT 'FK:The list id',
`name`              varchar(500)  NOT NULL					    COMMENT 'The card name',
`description`       varchar(500)  DEFAULT NULL                  COMMENT 'The card description',
PRIMARY KEY (`card_id`),
FOREIGN KEY (list_id) REFERENCES lists(list_id)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COMMENT="All cards";