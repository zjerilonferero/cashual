CREATE TABLE `category_rule` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`category_id` integer NOT NULL,
	`keywords` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`category_id`) REFERENCES `category`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `category` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`system_category_id` integer,
	`name` text NOT NULL,
	`icon` text,
	`color` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`system_category_id`) REFERENCES `system_category`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `system_category_rule` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`system_category_id` integer NOT NULL,
	`keywords` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`system_category_id`) REFERENCES `system_category`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `system_category` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`icon` text,
	`is_default` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
ALTER TABLE `transaction_group` ADD `name` text NOT NULL;--> statement-breakpoint
ALTER TABLE `transaction` ADD `category_id` integer REFERENCES category(id);--> statement-breakpoint

-- Seed system categories
INSERT INTO `system_category` (`name`, `icon`, `is_default`, `created_at`) VALUES
  ('Groceries', 'shopping-cart', 0, (cast(unixepoch('subsecond') * 1000 as integer))),
  ('Utilities', 'zap', 0, (cast(unixepoch('subsecond') * 1000 as integer))),
  ('Mortgage/Rent', 'home', 0, (cast(unixepoch('subsecond') * 1000 as integer))),
  ('Income', 'dollar-sign', 0, (cast(unixepoch('subsecond') * 1000 as integer))),
  ('Dining Out', 'utensils', 0, (cast(unixepoch('subsecond') * 1000 as integer))),
  ('Uncategorized', 'help-circle', 1, (cast(unixepoch('subsecond') * 1000 as integer)));

--> statement-breakpoint
-- Seed system category rules (Groceries = id 1)
INSERT INTO `system_category_rule` (`system_category_id`, `keywords`, `created_at`) VALUES
  (1, '["Albert Heijn","AH ","AH To Go","Jumbo","Lidl","Aldi","Plus","Dirk","Coop","Spar","Deka","Vomar","Hoogvliet","Picnic","Crisp","Ekoplaza"]', (cast(unixepoch('subsecond') * 1000 as integer)));

--> statement-breakpoint
-- Seed system category rules (Utilities = id 2)
INSERT INTO `system_category_rule` (`system_category_id`, `keywords`, `created_at`) VALUES
  (2, '["Vattenfall","Eneco","Essent","Greenchoice","Budget Energie","Ziggo","KPN","T-Mobile","Vodafone","Ben","Simyo","Waternet","PWN","Dunea","Evides","Gemeente","Belasting"]', (cast(unixepoch('subsecond') * 1000 as integer)));

--> statement-breakpoint
-- Seed system category rules (Mortgage/Rent = id 3)
INSERT INTO `system_category_rule` (`system_category_id`, `keywords`, `created_at`) VALUES
  (3, '["Hypotheek","Mortgage","Huur","Rent","Woningcorporatie","Vesteda","Bouwinvest"]', (cast(unixepoch('subsecond') * 1000 as integer)));

--> statement-breakpoint
-- Seed system category rules (Income = id 4)
INSERT INTO `system_category_rule` (`system_category_id`, `keywords`, `created_at`) VALUES
  (4, '["Salaris","Salary","Loon","Wages","Belastingdienst Toeslagen","DUO","UWV","Dividend","Interest"]', (cast(unixepoch('subsecond') * 1000 as integer)));

--> statement-breakpoint
-- Seed system category rules (Dining Out = id 5)
INSERT INTO `system_category_rule` (`system_category_id`, `keywords`, `created_at`) VALUES
  (5, '["Thuisbezorgd","Uber Eats","Deliveroo","Just Eat","McDonald","Burger King","KFC","Domino","New York Pizza","Subway","Starbucks","Restaurant","Cafe","Eetcafe"]', (cast(unixepoch('subsecond') * 1000 as integer)));