-- Delete all existing transactions and transaction groups
DELETE FROM `transaction`;
DELETE FROM `transaction_group`;

-- SQLite doesn't support ALTER COLUMN, so recreate the table
CREATE TABLE `transaction_new` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `user_id` text NOT NULL,
  `group_id` integer NOT NULL,
  `category_id` integer NOT NULL,
  `name` text NOT NULL,
  `date` text NOT NULL,
  `amount` integer NOT NULL,
  `type` text NOT NULL,
  FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`group_id`) REFERENCES `transaction_group`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`category_id`) REFERENCES `category`(`id`) ON DELETE RESTRICT
);

DROP TABLE `transaction`;
ALTER TABLE `transaction_new` RENAME TO `transaction`;
