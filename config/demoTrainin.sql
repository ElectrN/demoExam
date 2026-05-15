-- ============================================================
-- ДАМП БАЗЫ ДАННЫХ "demoTrainin"
-- Проект: Портал "Корочки.есть"
-- Тестовые данные: 1 админ, 2 пользователя, 6 заявок
-- ============================================================

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

-- Таблица пользователей
CREATE TABLE `users` (
`id` int(11) NOT NULL AUTO_INCREMENT,
`login` varchar(50) NOT NULL,
`password` varchar(255) NOT NULL,
`fio` varchar(150) NOT NULL,
`phone` varchar(20) NOT NULL,
`email` varchar(100) NOT NULL,
`role` enum('user','admin') NOT NULL DEFAULT 'user',
`created_at` timestamp NOT NULL DEFAULT current_timestamp(),
PRIMARY KEY (`id`),
UNIQUE KEY `login` (`login`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Таблица заявок
CREATE TABLE `applications` (
`id` int(11) NOT NULL AUTO_INCREMENT,
`user_id` int(11) NOT NULL,
`course_name` varchar(150) NOT NULL,
`start_date` date NOT NULL,
`payment_method` enum('Наличными','Перевод по номеру телефона') NOT NULL,
`status` enum('Новая','Идет обучение','Обучение завершено') DEFAULT 'Новая',
`feedback` text DEFAULT NULL,
`created_at` timestamp NOT NULL DEFAULT current_timestamp(),
`updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
PRIMARY KEY (`id`),
KEY `user_id` (`user_id`),
CONSTRAINT `applications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Тестовые пользователи
-- Admin / KorokNET
-- userOne / password123
-- userTwo / password123
INSERT INTO `users` (`id`, `login`, `password`, `fio`, `phone`, `email`, `role`) VALUES
(1, 'Admin', '$2y$10$M/DWKvd90PwIrUWcuXYiAegSCyM7Gz43uEQMRt4clYVIm.GU5RO9G', 'Администратор Системы', '8(000)000-00-00', 'admin@korochki.ru', 'admin'),
(2, 'userOne', '$2y$10$4WGZKiPltndSS1efsKi3i.76HqaQoTWN7REt2VV.rUIAX81dDTeIe', 'Иванов Иван Иванович', '8(123)456-78-90', 'ivan@example.com', 'user'),
(3, 'userTwo', '$2y$10$4WGZKiPltndSS1efsKi3i.76HqaQoTWN7REt2VV.rUIAX81dDTeIe', 'Петрова Мария Сергеевна', '8(987)654-32-10', 'maria@example.com', 'user');

-- Тестовые заявки
INSERT INTO `applications` (`id`, `user_id`, `course_name`, `start_date`, `payment_method`, `status`, `feedback`) VALUES
(1, 2, 'Основы алгоритмизации и программирования', '2026-06-01', 'Наличными', 'Новая', NULL),
(2, 2, 'Основы веб-дизайна', '2026-07-15', 'Перевод по номеру телефона', 'Идет обучение', NULL),
(3, 2, 'Основы проектирования баз данных', '2026-08-20', 'Наличными', 'Обучение завершено', 'Отличный курс! Много практики.'),
(4, 3, 'Основы веб-дизайна', '2026-06-10', 'Перевод по номеру телефона', 'Новая', NULL),
(5, 3, 'Основы алгоритмизации и программирования', '2026-07-01', 'Наличными', 'Идет обучение', NULL),
(6, 3, 'Основы проектирования баз данных', '2026-09-05', 'Перевод по номеру телефона', 'Обучение завершено', 'Преподаватель объясняет понятно.');

ALTER TABLE `users` AUTO_INCREMENT = 4;
ALTER TABLE `applications` AUTO_INCREMENT = 7;

COMMIT;
-- ============================================================
-- СБРОС СЧЁТЧИКОВ AUTO_INCREMENT
-- ============================================================
ALTER TABLE `users` AUTO_INCREMENT = 4;
ALTER TABLE `applications` AUTO_INCREMENT = 7;

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;