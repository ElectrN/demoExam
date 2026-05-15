<?php
// ============================================================
// API: АВТОРИЗАЦИЯ ПОЛЬЗОВАТЕЛЯ
// ============================================================

header('Content-Type: application/json');
require_once '../config/db.php';

// Запускаем сессию для хранения данных авторизации между запросами
session_start();

// Получаем данные из запроса
$input = json_decode(file_get_contents('php://input'), true);
$login = trim($input['login'] ?? '');
$password = $input['password'] ?? '';

// Проверка заполненности обязательных полей
if (!$login || !$password) {
    http_response_code(400);
    echo json_encode(['error' => 'Введите логин и пароль']);
    exit;
}

try {
    // Ищем пользователя по логину и получаем все необходимые данные
    $stmt = $pdo->prepare("SELECT id, login, fio, email, password, role FROM users WHERE login = ?");
    $stmt->execute([$login]);
    $user = $stmt->fetch();

    // Проверяем существование пользователя и корректность пароля
    if (!$user || !password_verify($password, $user['password'])) {
        http_response_code(401); // Unauthorized
        echo json_encode(['error' => 'Неверный логин или пароль']);
        exit;
    }

    // ============================================================
    // СОХРАНЕНИЕ ДАННЫХ В СЕССИЮ
    // ============================================================
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['user_login'] = $user['login'];
    $_SESSION['user_fio'] = $user['fio'];
    $_SESSION['role'] = $user['role'];

    // Определяем страницу для перенаправления в зависимости от роли
    $redirect = ($user['role'] === 'admin') ? 'admin.html' : 'dashboard.html';

    // Возвращаем успешный ответ с данными пользователя
    echo json_encode([
        'redirect' => $redirect,
        'user' => [
            'id' => $user['id'],
            'login' => $user['login'],
            'fio' => $user['fio'],
            'role' => $user['role']
        ]
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Ошибка сервера']);
}