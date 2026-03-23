CREATE DATABASE road_monitor;
USE road_monitor;
CREATE TABLE `clusters` (
  `id` int NOT NULL AUTO_INCREMENT,
  `latitude` decimal(10,7) NOT NULL,
  `longitude` decimal(10,7) NOT NULL,
  `report_count` int NOT NULL DEFAULT '1',
  `status` enum('Active','Resolved') NOT NULL DEFAULT 'Active',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modified_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `modified_by` int DEFAULT NULL,
  `damage_score` decimal(5,2) DEFAULT '0.00',
  PRIMARY KEY (`id`),
  KEY `idx_lat_lng` (`latitude`,`longitude`),
  KEY `modified_by` (`modified_by`),
  CONSTRAINT `clusters_ibfk_1` FOREIGN KEY (`modified_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `reports` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `description` varchar(1000) DEFAULT NULL,
  `image_url` text,
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `damage_percentage` float DEFAULT NULL,
  `status` varchar(20) DEFAULT 'Pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `damage_score` varchar(10) DEFAULT NULL,
  `location` varchar(100) DEFAULT NULL,
  `cluster_id` int DEFAULT NULL,
  `type` enum('vehicle','user') NOT NULL DEFAULT 'user',
  `damage_tier` varchar(20) DEFAULT NULL,
  `num_detections` int DEFAULT '0',
  `last_seen` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_lat_lng` (`latitude`,`longitude`),
  KEY `cluster_id` (`cluster_id`),
  CONSTRAINT `reports_ibfk_1` FOREIGN KEY (`cluster_id`) REFERENCES `clusters` (`id`) ON DELETE SET NULL,
  CONSTRAINT `reports_ibfk_2` FOREIGN KEY (`cluster_id`) REFERENCES `clusters` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `role` varchar(20) DEFAULT 'public',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `clusters` (`id`, `latitude`, `longitude`, `report_count`, `status`, `created_at`, `modified_at`, `modified_by`, `damage_score`) VALUES
(1, 19.0761200, 72.8774300, 10, 'Active', '2026-03-22 22:50:36', '2026-03-22 23:13:21', NULL, 0.00),
(2, 19.0785000, 72.8791000, 7, 'Active', '2026-03-22 22:50:38', '2026-03-22 23:13:23', NULL, 0.00),
(3, 19.2000000, 72.9000000, 6, 'Active', '2026-03-22 22:50:38', '2026-03-22 23:13:23', NULL, 0.00),
(4, 19.1500000, 72.8500000, 1, 'Active', '2026-03-22 23:13:24', '2026-03-22 23:13:24', NULL, 0.00),
(5, 19.0823000, 72.8831000, 3, 'Active', '2026-03-22 23:16:49', '2026-03-22 23:16:49', NULL, 62.71),
(6, 19.0915000, 72.8912000, 3, 'Active', '2026-03-22 23:16:50', '2026-03-22 23:16:50', NULL, 27.38),
(7, 19.3100000, 72.9500000, 2, 'Active', '2026-03-22 23:16:51', '2026-03-22 23:16:51', NULL, 43.57),
(8, 19.4500000, 73.0100000, 1, 'Active', '2026-03-22 23:16:51', '2026-03-22 23:16:51', NULL, 44.00),
(9, 19.5500000, 73.1000000, 1, 'Active', '2026-03-22 23:16:52', '2026-03-22 23:16:52', NULL, 95.00);

INSERT INTO `reports` (`id`, `user_id`, `description`, `image_url`, `latitude`, `longitude`, `damage_percentage`, `status`, `created_at`, `damage_score`, `location`, `cluster_id`, `type`, `damage_tier`, `num_detections`, `last_seen`) VALUES
(1, NULL, 'testing', '1774185694300-dmg2.jpg', NULL, NULL, NULL, 'Pending', '2026-03-22 18:51:34', '0', '13.0220032, 80.19968', NULL, 'user', NULL, 0, NULL),
(2, NULL, 'testing', '1774187355611-dmg6.jpg', NULL, NULL, NULL, 'Pending', '2026-03-22 19:19:16', '29.88', '13.0220032, 80.19968', NULL, 'user', NULL, 0, NULL),
(3, NULL, 'testing 2', '1774187404643-dmg4.jpg', NULL, NULL, NULL, 'Pending', '2026-03-22 19:20:04', '21.59', '13.0220032, 80.19968', NULL, 'user', NULL, 0, NULL),
(4, NULL, 'Group A - report 1', '1774200220622-dmg2.jpg', 19.07612000, 72.87743000, NULL, 'Pending', '2026-03-22 22:53:40', '82.5', NULL, 1, 'vehicle', 'Critical', 4, '2026-03-22 22:53:40'),
(5, NULL, 'Group A - report 2', '1774200220967-dmg2.jpg', 19.07612500, 72.87743800, NULL, 'Pending', '2026-03-22 22:53:40', '65', NULL, 1, 'vehicle', 'Severe', 3, '2026-03-22 22:53:40'),
(6, NULL, 'Group A - report 3 (user)', '1774200221282-dmg2.jpg', 19.07611800, 72.87742200, NULL, 'Pending', '2026-03-22 22:53:41', '29.14', NULL, 1, 'user', 'Fair', 2, '2026-03-22 22:53:41'),
(7, NULL, 'Group B - report 1', '1774200221734-dmg2.jpg', 19.07850000, 72.87910000, NULL, 'Pending', '2026-03-22 22:53:41', '45', NULL, 2, 'vehicle', 'Poor', 2, '2026-03-22 22:53:41'),
(8, NULL, 'Group B - report 2 (user)', '1774200222044-dmg2.jpg', 19.07850600, 72.87910800, NULL, 'Pending', '2026-03-22 22:53:42', '29.14', NULL, 2, 'user', 'Fair', 2, '2026-03-22 22:53:42'),
(9, NULL, 'Group C - far away', '1774200222445-dmg2.jpg', 19.20000000, 72.90000000, NULL, 'Pending', '2026-03-22 22:53:42', '30', NULL, 3, 'vehicle', 'Fair', 1, '2026-03-22 22:53:42'),
(10, NULL, 'Group C - user near far', '1774200222755-dmg2.jpg', 19.20000500, 72.90000300, NULL, 'Pending', '2026-03-22 22:53:42', '29.14', NULL, 3, 'user', 'Fair', 2, '2026-03-22 22:53:42'),
(11, NULL, 'Group A - vehicle 1', '1774201400670-dmg2.jpg', 19.07612000, 72.87743000, NULL, 'Pending', '2026-03-22 23:13:20', '91', NULL, 1, 'vehicle', 'Critical', 5, '2026-03-22 23:13:20'),
(12, NULL, 'Group A - vehicle 2', '1774201400996-dmg2.jpg', 19.07612500, 72.87743800, NULL, 'Pending', '2026-03-22 23:13:21', '78', NULL, 1, 'vehicle', 'Severe', 4, '2026-03-22 23:13:21'),
(13, NULL, 'Group A - user 1', '1774201401309-dmg2.jpg', 19.07611800, 72.87742200, NULL, 'Pending', '2026-03-22 23:13:21', '29.14', NULL, 1, 'user', 'Fair', 2, '2026-03-22 23:13:21'),
(14, NULL, 'Group A - user 2', '1774201401897-dmg2.jpg', 19.07613000, 72.87744500, NULL, 'Pending', '2026-03-22 23:13:21', '29.14', NULL, 1, 'user', 'Fair', 2, '2026-03-22 23:13:21'),
(15, NULL, 'Group B - vehicle 1', '1774201402307-dmg2.jpg', 19.07850000, 72.87910000, NULL, 'Pending', '2026-03-22 23:13:22', '55', NULL, 2, 'vehicle', 'Poor', 2, '2026-03-22 23:13:22'),
(16, NULL, 'Group B - vehicle 2', '1774201402621-dmg2.jpg', 19.07850800, 72.87911200, NULL, 'Pending', '2026-03-22 23:13:22', '22', NULL, 2, 'vehicle', 'Fair', 1, '2026-03-22 23:13:22'),
(17, NULL, 'Group B - user 1', '1774201402934-dmg2.jpg', 19.07849500, 72.87909500, NULL, 'Pending', '2026-03-22 23:13:23', '29.14', NULL, 2, 'user', 'Fair', 2, '2026-03-22 23:13:23'),
(18, NULL, 'Group C - vehicle 1', '1774201403335-dmg2.jpg', 19.20000000, 72.90000000, NULL, 'Pending', '2026-03-22 23:13:23', '18', NULL, 3, 'vehicle', 'Good', 1, '2026-03-22 23:13:23'),
(19, NULL, 'Group C - user 1', '1774201403652-dmg2.jpg', 19.20000500, 72.90000300, NULL, 'Pending', '2026-03-22 23:13:23', '29.14', NULL, 3, 'user', 'Fair', 2, '2026-03-22 23:13:23'),
(20, NULL, 'Group D - isolated vehicle', '1774201404086-dmg2.jpg', 19.15000000, 72.85000000, NULL, 'Pending', '2026-03-22 23:13:24', '67', NULL, 4, 'vehicle', 'Severe', 3, '2026-03-22 23:13:24'),
(21, NULL, 'Group E - vehicle 1', '1774201609068-dmg2.jpg', 19.08230000, 72.88310000, NULL, 'Pending', '2026-03-22 23:16:49', '88', NULL, 5, 'vehicle', 'Critical', 5, '2026-03-22 23:16:49'),
(22, NULL, 'Group E - vehicle 2', '1774201609390-dmg2.jpg', 19.08230800, 72.88311200, NULL, 'Pending', '2026-03-22 23:16:49', '71', NULL, 5, 'vehicle', 'Severe', 3, '2026-03-22 23:16:49'),
(23, NULL, 'Group E - user 1', '1774201609700-dmg2.jpg', 19.08229500, 72.88309500, NULL, 'Pending', '2026-03-22 23:16:49', '29.14', NULL, 5, 'user', 'Fair', 2, '2026-03-22 23:16:49'),
(24, NULL, 'Group F - vehicle 1', '1774201610128-dmg2.jpg', 19.09150000, 72.89120000, NULL, 'Pending', '2026-03-22 23:16:50', '35', NULL, 6, 'vehicle', 'Fair', 2, '2026-03-22 23:16:50'),
(25, NULL, 'Group F - vehicle 2', '1774201610437-dmg2.jpg', 19.09150800, 72.89121000, NULL, 'Pending', '2026-03-22 23:16:50', '18', NULL, 6, 'vehicle', 'Good', 1, '2026-03-22 23:16:50'),
(26, NULL, 'Group F - user 1', '1774201610763-dmg2.jpg', 19.09149500, 72.89119500, NULL, 'Pending', '2026-03-22 23:16:50', '29.14', NULL, 6, 'user', 'Fair', 2, '2026-03-22 23:16:50'),
(27, NULL, 'Group G - vehicle 1', '1774201611167-dmg2.jpg', 19.31000000, 72.95000000, NULL, 'Pending', '2026-03-22 23:16:51', '58', NULL, 7, 'vehicle', 'Poor', 3, '2026-03-22 23:16:51'),
(28, NULL, 'Group G - user 1', '1774201611482-dmg2.jpg', 19.31000400, 72.95000500, NULL, 'Pending', '2026-03-22 23:16:51', '29.14', NULL, 7, 'user', 'Fair', 2, '2026-03-22 23:16:51'),
(29, NULL, 'Group H - isolated vehicle', '1774201611894-dmg2.jpg', 19.45000000, 73.01000000, NULL, 'Pending', '2026-03-22 23:16:51', '44', NULL, 8, 'vehicle', 'Poor', 2, '2026-03-22 23:16:51'),
(30, NULL, 'Group I - isolated critical', '1774201612212-dmg2.jpg', 19.55000000, 73.10000000, NULL, 'Pending', '2026-03-22 23:16:52', '95', NULL, 9, 'vehicle', 'Critical', 6, '2026-03-22 23:16:52');

INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `created_at`) VALUES
(3, 'admins', 'Admin2004@gmail.com', '123', 'admin', '2026-03-11 10:02:34'),
(4, 'ad', 'ad@gmail.com', '12', 'admin', '2026-03-11 10:02:34'),
(5, 'us', 'us@gmail.com', '12', 'public', '2026-03-11 10:02:34');

select * from reports;
select * from clusters;

