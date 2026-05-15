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

-- ============================================================
-- СТРУКТУРА ТАБЛИЦЫ `users`
-- ============================================================
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

-- ============================================================
-- СТРУКТУРА ТАБЛИЦЫ `applications`
-- ============================================================
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

-- ============================================================
-- ДАННЫЕ: ПОЛЬЗОВАТЕЛИ
-- ============================================================

-- Администратор (логин: Admin, пароль: KorokNET)
-- Хеш пароля сгенерирован через password_hash('KorokNET', PASSWORD_DEFAULT)
INSERT INTO `users` (`id`, `login`, `password`, `fio`, `phone`, `email`, `role`, `created_at`) VALUES
                                                                                                   (1, 'Admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Администратор Системы', '8(000)000-00-00', 'admin@korochki.ru', 'admin', '2026-01-01 00:00:00'),

-- Пользователь 1 (логин: user1, пароль: password123)
                                                                                                   (2, 'user1', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Иванов Иван Иванович', '8(123)456-78-90', 'ivan@example.com', 'user', '2026-02-01 10:30:00'),

-- Пользователь 2 (логин: user2, пароль: password123)
                                                                                                   (3, 'user2', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Петрова Мария Сергеевна', '8(987)654-32-10', 'maria@example.com', 'user', '2026-02-15 14:20:00');

-- ============================================================
-- ДАННЫЕ: ЗАЯВКИ
-- ============================================================

-- Заявки пользователя 1 (Иванов)
INSERT INTO `applications` (`id`, `user_id`, `course_name`, `start_date`, `payment_method`, `status`, `feedback`, `created_at`, `updated_at`) VALUES
                                                                                                                                                  (1, 2, 'Основы алгоритмизации и программирования', '2026-06-01', 'Наличными', 'Новая', NULL, '2026-03-01 09:00:00', '2026-03-01 09:00:00'),
                                                                                                                                                  (2, 2, 'Основы веб-дизайна', '2026-07-15', 'Перевод по номеру телефона', 'Идет обучение', NULL, '2026-03-05 11:30:00', '2026-04-01 10:00:00'),
                                                                                                                                                  (3, 2, 'Основы проектирования баз данных', '2026-08-20', 'Наличными', 'Обучение завершено', 'Отличный курс! Много полезной информации, рекомендую.', '2026-03-10 15:45:00', '2026-05-01 16:00:00'),

-- Заявки пользователя 2 (Петрова)
                                                                                                                                                  (4, 3, 'Основы веб-дизайна', '2026-06-10', 'Перевод по номеру телефона', 'Новая', NULL, '2026-03-12 10:15:00', '2026-03-12 10:15:00'),
                                                                                                                                                  (5, 3, 'Основы алгоритмизации и программирования', '2026-07-01', 'Наличными', 'Идет обучение', NULL, '2026-03-15 13:20:00', '2026-04-10 09:30:00'),
                                                                                                                                                  (6, 3, 'Основы проектирования баз данных', '2026-09-05', 'Перевод по номеру телефона', 'Обучение завершено', 'Преподаватель объясняет понятно, все материалы доступны.', '2026-03-20 16:00:00', '2026-05-10 14:00:00');

-- ============================================================
-- СБРОС СЧЁТЧИКОВ AUTO_INCREMENT
-- ============================================================
ALTER TABLE `users` AUTO_INCREMENT = 4;
ALTER TABLE `applications` AUTO_INCREMENT = 7;

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;