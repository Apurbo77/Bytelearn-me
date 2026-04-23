-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 16, 2026 at 08:05 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `bytelearn`
--

-- --------------------------------------------------------

--
-- Table structure for table `ai_chat_interactions`
--

CREATE TABLE `ai_chat_interactions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `lesson_id` bigint(20) UNSIGNED NOT NULL,
  `question` text NOT NULL,
  `answer` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `certificates`
--

CREATE TABLE `certificates` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `course_id` bigint(20) UNSIGNED NOT NULL,
  `verification_code` varchar(100) NOT NULL,
  `issue_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `certificates`
--

INSERT INTO `certificates` (`id`, `user_id`, `course_id`, `verification_code`, `issue_date`, `created_at`, `updated_at`) VALUES
(1, 8, 1, 'CERT-20251225202203-694D9CEB756FC', '2025-12-25 14:22:03', '2025-12-25 14:22:03', '2025-12-25 14:22:03'),
(2, 5, 3, 'CERT-20251227203458-695042F2907EA', '2025-12-27 14:34:58', '2025-12-27 14:34:58', '2025-12-27 14:34:58');

-- --------------------------------------------------------

--
-- Table structure for table `courses`
--

CREATE TABLE `courses` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `instructor_id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `category` varchar(100) DEFAULT NULL,
  `learning_outcomes` text DEFAULT NULL,
  `status` enum('draft','published','archived') DEFAULT 'draft',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `level` varchar(255) DEFAULT 'Beginner',
  `price` decimal(8,2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `courses`
--

INSERT INTO `courses` (`id`, `instructor_id`, `title`, `description`, `category`, `learning_outcomes`, `status`, `created_at`, `updated_at`, `level`, `price`) VALUES
(1, 7, 'JavaScript', 'Java is life', 'Programming', NULL, 'published', '2025-12-25 10:27:10', '2025-12-25 10:31:46', '', 0.00),
(3, 9, 'Introduction of Robotics', 'Robot Banao', 'Robotics', NULL, 'published', '2025-12-26 12:50:23', '2025-12-26 12:53:01', '', 0.00),
(4, 9, 'Software Engineering', 'Soft Engineering is tough.', 'Programming', NULL, 'published', '2025-12-27 15:00:52', '2025-12-27 15:02:36', '', 0.00),
(5, 13, 'mern', 'mern sikho', 'nai', NULL, 'published', '2026-04-10 02:12:46', '2026-04-10 02:42:50', 'beginner', 500.00),
(38, 13, 'amar course', 'yep', 'a', NULL, 'published', '2026-04-10 10:12:28', '2026-04-10 10:14:47', 'Beginner', 0.00),
(40, 13, 'a', 'a', 'ssdsd', NULL, 'draft', '2026-04-10 10:18:47', '2026-04-10 10:18:47', 'Beginner', 0.00),
(41, 13, 'sasa', 'sas', 'sas', NULL, 'draft', '2026-04-10 11:46:33', '2026-04-10 11:46:33', 'Beginner', 0.00),
(42, 13, 'amar naaaammm', 'asa', 'sasa', NULL, 'published', '2026-04-10 13:11:56', '2026-04-10 13:14:10', 'Beginner', 0.00),
(43, 13, 'aaaaaaaaaaa', 'sssssssssss', 'sssssssssssssssssssssssssssssss', NULL, 'draft', '2026-04-10 13:14:25', '2026-04-10 13:14:25', 'Beginner', 0.00),
(44, 13, 'wawa', 'dsdsa', 'sdsd', NULL, 'draft', '2026-04-10 13:16:50', '2026-04-10 13:16:50', 'Beginner', 0.00),
(45, 13, 'as', 'as', 'as', NULL, 'draft', '2026-04-10 13:19:19', '2026-04-10 13:19:19', 'Beginner', 0.00),
(46, 13, '22222', '2222222', '2222222222', NULL, 'published', '2026-04-10 13:21:38', '2026-04-10 13:22:37', 'Beginner', 0.00);

-- --------------------------------------------------------

--
-- Table structure for table `discussions`
--

CREATE TABLE `discussions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `lesson_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `parent_id` bigint(20) UNSIGNED DEFAULT NULL,
  `content` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `discussions`
--

INSERT INTO `discussions` (`id`, `lesson_id`, `user_id`, `parent_id`, `content`, `created_at`) VALUES
(1, 2, 10, NULL, 'Js learner', '2026-04-10 01:53:24'),
(2, 1, 10, NULL, 'i mmmmmm', '2026-04-10 01:55:06'),
(3, 4, 10, NULL, 'aaaaaaa', '2026-04-10 01:58:41'),
(4, 1, 10, NULL, 'aaaaaaaaaaaa', '2026-04-10 02:47:00'),
(5, 1, 10, NULL, 'aaaaaaaaaaa', '2026-04-10 03:29:15'),
(6, 1, 10, NULL, 'a', '2026-04-10 03:50:19'),
(7, 1, 10, NULL, 'ad', '2026-04-10 06:03:05'),
(8, 1, 10, NULL, 'adad', '2026-04-10 06:03:20'),
(9, 4, 10, NULL, '11111111111', '2026-04-10 06:03:49'),
(10, 1, 10, NULL, 'wwwwwww', '2026-04-10 06:09:18'),
(11, 1, 10, NULL, 'amar nam', '2026-04-10 13:11:32');

-- --------------------------------------------------------

--
-- Table structure for table `enrollments`
--

CREATE TABLE `enrollments` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `course_id` bigint(20) UNSIGNED NOT NULL,
  `enrollment_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `progress` decimal(5,2) DEFAULT 0.00,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `enrollments`
--

INSERT INTO `enrollments` (`id`, `user_id`, `course_id`, `enrollment_date`, `progress`, `created_at`, `updated_at`) VALUES
(1, 5, 1, '2025-12-25 13:07:28', 50.00, '2025-12-25 13:21:12', '2025-12-27 14:45:38'),
(2, 8, 1, '2025-12-25 13:34:03', 100.00, '2025-12-25 13:34:03', '2025-12-25 14:22:03'),
(3, 5, 3, '2025-12-26 13:01:17', 100.00, '2025-12-26 13:01:17', '2025-12-27 14:34:58'),
(4, 10, 1, '2026-04-09 20:52:38', 0.00, '2026-04-09 20:52:38', '2026-04-09 20:52:38'),
(5, 11, 1, '2026-04-09 21:17:51', 0.00, '2026-04-09 21:17:51', '2026-04-09 21:17:51'),
(6, 10, 3, '2026-04-10 01:24:04', 0.00, '2026-04-10 01:24:04', '2026-04-10 01:24:04'),
(7, 10, 5, '2026-04-10 03:50:39', 0.00, '2026-04-10 03:50:39', '2026-04-10 03:50:39');

-- --------------------------------------------------------

--
-- Table structure for table `lessons`
--

CREATE TABLE `lessons` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `course_id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(255) NOT NULL,
  `content` text DEFAULT NULL,
  `content_type` enum('video','text','pdf','link','mixed') NOT NULL,
  `video_url` varchar(255) DEFAULT NULL,
  `video_path` varchar(255) DEFAULT NULL,
  `pdf_url` varchar(255) DEFAULT NULL,
  `external_link` varchar(255) DEFAULT NULL,
  `external_link_label` varchar(255) DEFAULT NULL,
  `sequence_number` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `lessons`
--

INSERT INTO `lessons` (`id`, `course_id`, `title`, `content`, `content_type`, `video_url`, `video_path`, `pdf_url`, `external_link`, `external_link_label`, `sequence_number`, `created_at`, `updated_at`) VALUES
(1, 1, 'Basics of JavaScript', '<h2>JavaScript is <strong>a versatile scripting and programming language that is a foundational technology of the World Wide Web, alongside HTML and CSS</strong>. It is primarily used to make web pages <strong>dynamic and interactive.</strong><br>HTML provides the structure of a webpage, CSS controls its visual appearance, and JavaScript programs its behavior.&nbsp;</h2><p></p>', 'mixed', 'https://youtu.be/xwKbtUP87Dk?si=h5xRbHXcTAj9gW06', NULL, 'https://drive.google.com/file/d/1qPtxKikgKPZReKfFiqzB9DKb-5WglAKQ/view?usp=drive_link', NULL, NULL, 1, '2025-12-25 10:31:33', '2025-12-27 12:40:50'),
(2, 3, 'Introduction', '', 'video', 'https://youtu.be/htjRUL3neMg?si=Ry3gj4OjEIIka42f', NULL, 'https://drive.google.com/file/d/1oXYlJOPoOEh9eIqb6slCk136WcSGvNR0/view?usp=sharing', NULL, NULL, 1, '2025-12-26 12:52:57', '2025-12-26 12:52:57'),
(3, 3, 'PART 2', '', 'video', 'https://youtu.be/EAyzRmAKueE?si=MEq2VLvHBnCvNnf1', NULL, NULL, NULL, NULL, 2, '2025-12-26 12:54:56', '2025-12-26 12:54:56'),
(4, 1, 'JavaScript level Intermediate', '<h2>Let us see the differences between NodeJS and JavaScript, and why NodeJS is NOT a language (but rather a runtime environment for JavaScript)</h2><p></p>', 'mixed', 'https://youtu.be/gNrlcDwYlUQ?si=graYrGh9g0D-Pzdn', NULL, NULL, NULL, NULL, 2, '2025-12-27 14:40:23', '2025-12-27 14:40:23'),
(5, 4, 'Software Engineering: What Is It? Why Do We Need Software Engineering?', '<p>Explore the fundamentals of software engineering and its importance. This video details the design, development, and maintenance processes. Learn how software engineering addresses complex problems and ensures reliable software delivery.</p>', 'mixed', 'https://youtu.be/HAathu8U1xc?si=DO1aeRHDEe7xhJLJ', NULL, NULL, NULL, NULL, 1, '2025-12-27 15:02:30', '2025-12-27 15:02:30'),
(6, 5, 'a', '<p>a</p>', 'mixed', NULL, 'lessons/videos/gm93XZIyOOsPDnOG6F8mjgfoWE2UOKIF20StiqKu.mp4', NULL, NULL, NULL, 1, '2026-04-10 02:42:45', '2026-04-14 12:49:38');

-- --------------------------------------------------------

--
-- Table structure for table `locations`
--

CREATE TABLE `locations` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `location_string` varchar(255) DEFAULT NULL,
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `share_email` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `locations`
--

INSERT INTO `locations` (`id`, `user_id`, `location_string`, `latitude`, `longitude`, `share_email`, `created_at`, `updated_at`) VALUES
(1, 10, 'Anondo Nogor Road, Merul Badda, Badda, Dhaka, Dhaka Metropolitan, Dhaka District, Dhaka Division, 1219, Bangladesh', 23.77094512, 90.42862575, 1, '2026-04-16 11:01:57', '2026-04-16 11:02:25'),
(2, 11, 'Nimtoli Mondir Road, Dhaka', 23.77100000, 90.42880000, 1, '2026-04-16 11:02:46', '2026-04-16 11:58:16');

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '2019_12_14_000001_create_personal_access_tokens_table', 1),
(2, '2025_12_26_004000_add_urls_to_lessons_table', 2),
(3, '2025_12_26_000000_add_timestamps_to_enrollments_table', 3),
(4, '2025_12_26_020000_fix_certificates_and_notifications', 4),
(5, '2025_12_27_000000_add_learning_streak_to_users', 5),
(6, '2025_12_27_010000_create_reviews_table', 6),
(7, '2025_12_28_000000_create_quiz_questions_table', 7),
(8, '2024_01_01_000009_make_notes_lesson_id_nullable', 8),
(9, '2026_04_15_000001_add_video_path_to_lessons_table', 9),
(10, '2026_04_16_144143_create_sessions_table', 10),
(11, '2026_04_16_151543_add_location_to_users_table', 11),
(12, '2026_04_16_165940_create_locations_table', 12);

-- --------------------------------------------------------

--
-- Table structure for table `notes`
--

CREATE TABLE `notes` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `lesson_id` bigint(20) UNSIGNED DEFAULT NULL,
  `content` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `notes`
--

INSERT INTO `notes` (`id`, `user_id`, `lesson_id`, `content`, `created_at`, `updated_at`) VALUES
(4, 10, NULL, 'I am a learner', '2026-04-10 01:40:44', '2026-04-10 01:41:09'),
(6, 10, NULL, 'ssssssssssssssss', '2026-04-10 02:44:12', '2026-04-10 02:44:12'),
(7, 10, NULL, 'qqqqqqqqqqqqqqq', '2026-04-10 03:29:10', '2026-04-10 03:29:10'),
(8, 10, NULL, 'awwwwwwwwww', '2026-04-10 03:33:39', '2026-04-10 03:33:39'),
(9, 10, NULL, 'a', '2026-04-10 03:50:12', '2026-04-10 03:50:12'),
(10, 10, NULL, 'a', '2026-04-10 06:02:57', '2026-04-10 06:02:57'),
(12, 10, NULL, 's', '2026-04-10 07:25:40', '2026-04-10 07:25:40'),
(14, 10, NULL, 'a', '2026-04-10 10:05:47', '2026-04-10 10:05:47'),
(16, 10, NULL, 'a', '2026-04-10 11:47:57', '2026-04-10 11:47:57'),
(17, 10, NULL, 'sas', '2026-04-10 11:48:02', '2026-04-10 11:48:02'),
(18, 10, NULL, 'amar nam', '2026-04-10 13:11:22', '2026-04-10 13:11:22');

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `type` varchar(255) NOT NULL DEFAULT 'info',
  `read_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `type`, `read_at`, `created_at`, `updated_at`) VALUES
(1, 8, 'Certificate Earned!', 'Congratulations! You received a certificate for successfully completing the \"JavaScript\" course.', 'success', NULL, '2025-12-25 14:22:03', '2025-12-25 14:22:03'),
(2, 5, 'Certificate Earned!', 'Congratulations! You received a certificate for successfully completing the \"Introduction of Robotics\" course.', 'success', NULL, '2025-12-27 14:34:58', '2025-12-27 14:34:58');

-- --------------------------------------------------------

--
-- Table structure for table `personal_access_tokens`
--

CREATE TABLE `personal_access_tokens` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tokenable_type` varchar(255) NOT NULL,
  `tokenable_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `token` varchar(64) NOT NULL,
  `abilities` text DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `quizzes`
--

CREATE TABLE `quizzes` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `lesson_id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(255) NOT NULL,
  `ai_generated` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `quizzes`
--

INSERT INTO `quizzes` (`id`, `lesson_id`, `title`, `ai_generated`, `created_at`) VALUES
(1, 1, 'Basics of JavaScript Quiz', 0, '2025-12-27 12:44:20'),
(2, 4, 'JavaScript level Intermediate Quiz', 0, '2025-12-27 14:41:34');

-- --------------------------------------------------------

--
-- Table structure for table `quiz_attempts`
--

CREATE TABLE `quiz_attempts` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `quiz_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `score` int(11) DEFAULT 0,
  `attempt_date` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `quiz_questions`
--

CREATE TABLE `quiz_questions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `quiz_id` bigint(20) UNSIGNED NOT NULL,
  `question_text` text NOT NULL,
  `question_type` varchar(255) NOT NULL DEFAULT 'multiple_choice',
  `options` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`options`)),
  `correct_answer` int(11) NOT NULL,
  `explanation` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `quiz_questions`
--

INSERT INTO `quiz_questions` (`id`, `quiz_id`, `question_text`, `question_type`, `options`, `correct_answer`, `explanation`, `created_at`, `updated_at`) VALUES
(4, 1, 'Which of the following is the correct way to declare a variable in modern JavaScript that cannot be reassigned after its initial assignment?', 'multiple_choice', '[\"insaf\",\"zubayer\",\"sunehra\",\"sayem\"]', 0, NULL, '2025-12-27 14:09:12', '2025-12-27 14:09:12'),
(5, 1, 'ajdbckBAKJBC', 'multiple_choice', '[\"BV\",\"C\",\"DEDW\",\"WDC\"]', 3, NULL, '2025-12-27 14:09:12', '2025-12-27 14:09:12'),
(6, 1, 'What is JavaScript primarily used for?', 'multiple_choice', '[\"Web page structure\",\"Visual appearance of web pages\",\"Making web pages dynamic and interactive\",\"Database management\"]', 2, NULL, '2025-12-27 14:09:12', '2025-12-27 14:09:12'),
(7, 1, 'Which of the following technologies works with JavaScript and HTML to build websites?', 'multiple_choice', '[\"Python\",\"Java\",\"CSS\",\"Ruby\"]', 2, NULL, '2025-12-27 14:09:12', '2025-12-27 14:09:12'),
(8, 1, 'What role does HTML play in web development?', 'multiple_choice', '[\"Controls the behavior of the webpage\",\"Defines the visual style of the webpage\",\"Provides the structure of the webpage\",\"Manages server-side logic\"]', 2, NULL, '2025-12-27 14:09:12', '2025-12-27 14:09:12'),
(9, 1, 'In the context of web development, what does CSS control?', 'multiple_choice', '[\"The webpage\'s functionality\",\"The webpage\'s content\",\"The webpage\'s structure\",\"The webpage\'s visual appearance\"]', 3, NULL, '2025-12-27 14:09:12', '2025-12-27 14:09:12'),
(10, 2, 'What is the primary difference between NodeJS and JavaScript?', 'multiple_choice', '[\"NodeJS is a newer version of JavaScript\",\"NodeJS is a JavaScript compiler\",\"NodeJS is a runtime environment for JavaScript\",\"JavaScript is a runtime environment for NodeJS\"]', 2, NULL, '2025-12-27 14:41:34', '2025-12-27 14:41:34'),
(11, 2, 'Is NodeJS a programming language?', 'multiple_choice', '[\"Yes, it\'s a superset of JavaScript\",\"Yes, it\'s a different dialect of JavaScript\",\"No, it\'s a framework built on JavaScript\",\"No, it\'s a runtime environment that executes JavaScript\"]', 3, NULL, '2025-12-27 14:41:34', '2025-12-27 14:41:34'),
(12, 2, 'What does a runtime environment do?', 'multiple_choice', '[\"Translates code into machine language\",\"Provides tools for writing JavaScript\",\"Provides the necessary environment for code to execute\",\"Debugs JavaScript code\"]', 2, NULL, '2025-12-27 14:41:34', '2025-12-27 14:41:34'),
(13, 2, 'Which of the following best describes NodeJS\'s role in relation to JavaScript?', 'multiple_choice', '[\"NodeJS replaces JavaScript\",\"NodeJS extends JavaScript with new syntax\",\"NodeJS allows JavaScript to be run on the server-side\",\"NodeJS is used to create JavaScript code\"]', 2, NULL, '2025-12-27 14:41:34', '2025-12-27 14:41:34'),
(14, 2, 'If JavaScript is the recipe, what is NodeJS?', 'multiple_choice', '[\"The ingredients\",\"The chef\",\"The kitchen\",\"The menu\"]', 2, NULL, '2025-12-27 14:41:34', '2025-12-27 14:41:34'),
(15, 2, 'Where can JavaScript traditionally run?', 'multiple_choice', '[\"Only on NodeJS\",\"Only on web browsers\",\"Both web browsers and NodeJS\",\"Only on servers\"]', 1, NULL, '2025-12-27 14:41:34', '2025-12-27 14:41:34');

-- --------------------------------------------------------

--
-- Table structure for table `reviews`
--

CREATE TABLE `reviews` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `course_id` bigint(20) UNSIGNED NOT NULL,
  `rating` tinyint(3) UNSIGNED NOT NULL,
  `comment` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `reviews`
--

INSERT INTO `reviews` (`id`, `user_id`, `course_id`, `rating`, `comment`, `created_at`, `updated_at`) VALUES
(1, 5, 3, 2, 'UWU', '2025-12-26 13:01:54', '2025-12-26 13:02:37');

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sessions`
--

INSERT INTO `sessions` (`id`, `user_id`, `ip_address`, `user_agent`, `payload`, `last_activity`) VALUES
('j16jFxlQPx6TIjJauuPMz0dc8QO19MwK58dvZ26n', 11, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'YTo0OntzOjY6Il90b2tlbiI7czo0MDoiQ29MeGNTcFI1aFdrNVNqa3ZLeEpsdDlvVFVFT3NpVElxYzZEUDRKWCI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJuZXciO2E6MDp7fXM6Mzoib2xkIjthOjA6e319czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6Mzk6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMC9zdHVkZW50L2Rhc2hib2FyZCI7czo1OiJyb3V0ZSI7czoxNzoic3R1ZGVudC5kYXNoYm9hcmQiO31zOjUwOiJsb2dpbl93ZWJfNTliYTM2YWRkYzJiMmY5NDAxNTgwZjAxNGM3ZjU4ZWE0ZTMwOTg5ZCI7aToxMTt9', 1776362645);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('student','instructor') NOT NULL,
  `picture` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `learning_streak` int(11) NOT NULL DEFAULT 0,
  `last_activity_date` date DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `picture`, `created_at`, `updated_at`, `learning_streak`, `last_activity_date`, `location`) VALUES
(5, 'Sunehra', 'softmartpersonal@gmail.com', '$2y$12$vtAa7O3tNZWsUTfLPLQiIulAJR7kQb5sDB/rwgci6qBKXz1V92JlG', 'student', NULL, '2025-12-22 05:04:18', '2025-12-27 14:13:41', 1, '2025-12-27', NULL),
(7, 'Sayem', 'sayem@gmail.com', '$2y$10$QQHL5Sy6Cf4KfwwO1MR0ZOwPCZ7VYrRHNijo6TBD4A3bAArcdwD5S', 'instructor', NULL, '2025-12-25 09:41:25', '2025-12-25 09:41:25', 0, NULL, NULL),
(8, 'Zubayer', 'zubusad@gmail.com', '$2y$10$faB04R3lcZmSb5k6R0veB.x4PgyJBhWTZt9SsTNPINFZMeNWlUUGq', 'student', NULL, '2025-12-25 13:28:23', '2025-12-25 13:28:23', 0, NULL, NULL),
(9, 'Sadman', 'zuby@gmail.com', '$2y$10$V/I/ty3Djaeu5rndNjWiMODh2T7KSPgYGDWLDKe58hU/PUor07c.2', 'instructor', NULL, '2025-12-26 12:49:25', '2025-12-26 12:49:25', 0, NULL, NULL),
(10, 'student', 'student@gmail.com', '$2y$12$6QR2tIlidQk5WG8tg2BnZOF6AfW78g.rGR.i6DIhmJCrGzAYOTY12', 'student', NULL, '2026-04-09 20:52:27', '2026-04-16 11:01:57', 1, '2026-04-14', 'Anondo Nogor Road, Merul Badda, Badda, Dhaka, Dhaka Metropolitan, Dhaka District, Dhaka Division, 1219, Bangladesh'),
(11, 'STUDENT 2', 'student2@gmail.com', '$2y$12$y1.N23FZ.qdr45OC6V/CXu9S.ouYA8sapu7kqeZp5t0/cTGUlfg8C', 'student', NULL, '2026-04-09 21:15:33', '2026-04-16 17:45:33', 1, '2026-04-10', 'Nimtoli Mondir Road, Merul Badda, Badda, Dhaka, Dhaka Metropolitan, Dhaka District, Dhaka Division, 1219, Bangladesh'),
(12, 'Apurbo', 'apurbobhaket17@gmail.com', '$2y$12$i9jBTm0uxdw/J.mvHCwHieS9.hptYRoN8We6oHHs7EKfpwU5mjrrS', 'instructor', NULL, '2026-04-10 01:14:17', '2026-04-10 01:14:17', 0, NULL, NULL),
(13, 'Apurbo', 'apurboinstructor@gmail.com', '$2y$12$2Q5FjuhlU./pyskCGSo62upBOQjLp1KB1mTwhh6aCguOB5RMotBQ.', 'instructor', NULL, '2026-04-10 02:11:01', '2026-04-16 17:34:42', 0, NULL, 'A, 2 Jahurul Islam Ave, Dhaka 1212');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `ai_chat_interactions`
--
ALTER TABLE `ai_chat_interactions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user` (`user_id`),
  ADD KEY `idx_lesson` (`lesson_id`);

--
-- Indexes for table `certificates`
--
ALTER TABLE `certificates`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `verification_code` (`verification_code`),
  ADD UNIQUE KEY `unique_certificate` (`user_id`,`course_id`),
  ADD KEY `course_id` (`course_id`);

--
-- Indexes for table `courses`
--
ALTER TABLE `courses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_instructor` (`instructor_id`),
  ADD KEY `idx_category` (`category`);

--
-- Indexes for table `discussions`
--
ALTER TABLE `discussions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `parent_id` (`parent_id`),
  ADD KEY `idx_lesson` (`lesson_id`),
  ADD KEY `idx_user` (`user_id`);

--
-- Indexes for table `enrollments`
--
ALTER TABLE `enrollments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_enrollment` (`user_id`,`course_id`),
  ADD KEY `course_id` (`course_id`);

--
-- Indexes for table `lessons`
--
ALTER TABLE `lessons`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_course` (`course_id`),
  ADD KEY `idx_sequence` (`course_id`,`sequence_number`);

--
-- Indexes for table `locations`
--
ALTER TABLE `locations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `locations_user_id_foreign` (`user_id`);

--
-- Indexes for table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `notes`
--
ALTER TABLE `notes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user` (`user_id`),
  ADD KEY `idx_lesson` (`lesson_id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `notifications_user_id_foreign` (`user_id`);

--
-- Indexes for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  ADD KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`);

--
-- Indexes for table `quizzes`
--
ALTER TABLE `quizzes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_lesson` (`lesson_id`);

--
-- Indexes for table `quiz_attempts`
--
ALTER TABLE `quiz_attempts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_quiz` (`quiz_id`),
  ADD KEY `idx_user` (`user_id`);

--
-- Indexes for table `quiz_questions`
--
ALTER TABLE `quiz_questions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `quiz_questions_quiz_id_foreign` (`quiz_id`);

--
-- Indexes for table `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `reviews_user_id_course_id_unique` (`user_id`,`course_id`),
  ADD KEY `reviews_course_id_foreign` (`course_id`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sessions_user_id_index` (`user_id`),
  ADD KEY `sessions_last_activity_index` (`last_activity`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_role` (`role`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `ai_chat_interactions`
--
ALTER TABLE `ai_chat_interactions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `certificates`
--
ALTER TABLE `certificates`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `courses`
--
ALTER TABLE `courses`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=47;

--
-- AUTO_INCREMENT for table `discussions`
--
ALTER TABLE `discussions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `enrollments`
--
ALTER TABLE `enrollments`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `lessons`
--
ALTER TABLE `lessons`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `locations`
--
ALTER TABLE `locations`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `notes`
--
ALTER TABLE `notes`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `quizzes`
--
ALTER TABLE `quizzes`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `quiz_attempts`
--
ALTER TABLE `quiz_attempts`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `quiz_questions`
--
ALTER TABLE `quiz_questions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `reviews`
--
ALTER TABLE `reviews`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `ai_chat_interactions`
--
ALTER TABLE `ai_chat_interactions`
  ADD CONSTRAINT `ai_chat_interactions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `ai_chat_interactions_ibfk_2` FOREIGN KEY (`lesson_id`) REFERENCES `lessons` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `certificates`
--
ALTER TABLE `certificates`
  ADD CONSTRAINT `certificates_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `certificates_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `courses`
--
ALTER TABLE `courses`
  ADD CONSTRAINT `courses_ibfk_1` FOREIGN KEY (`instructor_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `discussions`
--
ALTER TABLE `discussions`
  ADD CONSTRAINT `discussions_ibfk_1` FOREIGN KEY (`lesson_id`) REFERENCES `lessons` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `discussions_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `discussions_ibfk_3` FOREIGN KEY (`parent_id`) REFERENCES `discussions` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `enrollments`
--
ALTER TABLE `enrollments`
  ADD CONSTRAINT `enrollments_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `enrollments_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `lessons`
--
ALTER TABLE `lessons`
  ADD CONSTRAINT `lessons_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `locations`
--
ALTER TABLE `locations`
  ADD CONSTRAINT `locations_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `notes`
--
ALTER TABLE `notes`
  ADD CONSTRAINT `notes_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `quizzes`
--
ALTER TABLE `quizzes`
  ADD CONSTRAINT `quizzes_ibfk_1` FOREIGN KEY (`lesson_id`) REFERENCES `lessons` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `quiz_attempts`
--
ALTER TABLE `quiz_attempts`
  ADD CONSTRAINT `quiz_attempts_ibfk_1` FOREIGN KEY (`quiz_id`) REFERENCES `quizzes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `quiz_attempts_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `quiz_questions`
--
ALTER TABLE `quiz_questions`
  ADD CONSTRAINT `quiz_questions_quiz_id_foreign` FOREIGN KEY (`quiz_id`) REFERENCES `quizzes` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `reviews`
--
ALTER TABLE `reviews`
  ADD CONSTRAINT `reviews_course_id_foreign` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `reviews_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;