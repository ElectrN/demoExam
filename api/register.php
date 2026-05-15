<?php
// ============================================================
// API: РЕГИСТРАЦИЯ НОВОГО ПОЛЬЗОВАТЕЛЯ
// ============================================================

// Указываем, что ответ будет в формате JSON
header('Content-Type: application/json');

// Подключаем файл с настройками подключения к БД
require_once '../config/db.php';

// Получаем и декодируем данные из тела запроса (JSON → массив PHP)
$input = json_decode(file_get_contents('php://input'), true);

// Извлекаем и очищаем поля формы от лишних пробелов
$login = trim($input['login'] ?? '');
$password = $input['password'] ?? '';
$fio = trim($input['fio'] ?? '');
$phone = trim($input['phone'] ?? '');
$email = trim($input['email'] ?? '');

// ============================================================
// ВАЛИДАЦИЯ ВХОДНЫХ ДАННЫХ
// ============================================================

// Проверка логина: минимум 6 символов, только латиница и цифры
if (strlen($login) < 6 || !preg_match('/^[a-zA-Z0-9]+$/', $login)) {
    http_response_code(400); // Bad Request
    echo json_encode(['error' => 'Логин: латиница и цифры, минимум 6 символов']);
    exit;
}

// Проверка пароля: минимум 8 символов
if (strlen($password) < 8) {
    http_response_code(400);
    echo json_encode(['error' => 'Пароль: минимум 8 символов']);
    exit;
}

// Проверка ФИО: только кириллица и пробелы (флаг /u для Юникода)
if (!preg_match('/^[а-яА-Я\s]+$/u', $fio)) {
    http_response_code(400);
    echo json_encode(['error' => 'ФИО: только кириллица и пробелы']);
    exit;
}

// Проверка телефона: строгий формат 8(XXX)XXX-XX-XX
if (!preg_match('/^8\(\d{3}\)\d{3}-\d{2}-\d{2}$/', $phone)) {
    http_response_code(400);
    echo json_encode(['error' => 'Телефон: формат 8(XXX)XXX-XX-XX']);
    exit;
}

// Проверка email на корректность
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['error' => 'Неверный email']);
    exit;
}

// ============================================================
// СОХРАНЕНИЕ ПОЛЬЗОВАТЕЛЯ В БАЗУ ДАННЫХ
// ============================================================
try {
    // Проверяем, не занят ли логин другим пользователем
    $stmt = $pdo->prepare("SELECT id FROM users WHERE login = ?");
    $stmt->execute([$login]);

    if ($stmt->fetch()) {
        http_response_code(409); // Conflict
        echo json_encode(['error' => 'Пользователь уже существует']);
        exit;
    }

    // Хешируем пароль с помощью безопасного алгоритма bcrypt
    $hash = password_hash($password, PASSWORD_DEFAULT);

    // Подготавливаем и выполняем запрос на вставку нового пользователя
    $stmt = $pdo->prepare("INSERT INTO users (login, password, fio, phone, email) VALUES (?, ?, ?, ?, ?)");
    $stmt->execute([$login, $hash, $fio, $phone, $email]);

    // Возвращаем успешный ответ
    echo json_encode(['message' => 'Регистрация успешна']);

} catch (Exception $e) {
    // Обработка непредвиденных ошибок сервера
    http_response_code(500);
    echo json_encode(['error' => 'Ошибка сервера']);
}