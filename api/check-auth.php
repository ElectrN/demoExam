<?php
// ============================================================
// API: ПРОВЕРКА СТАТУСА АВТОРИЗАЦИИ
// ============================================================

header('Content-Type: application/json');

// Запускаем сессию для доступа к данным пользователя
session_start();

// Если в сессии есть ID пользователя — он авторизован
if (isset($_SESSION['user_id'])) {
    echo json_encode([
        'authenticated' => true,
        'user' => [
            'id' => $_SESSION['user_id'],
            'login' => $_SESSION['user_login'],
            'fio' => $_SESSION['user_fio'],
            'role' => $_SESSION['role']
        ]
    ]);
} else {
    // Пользователь не авторизован
    echo json_encode(['authenticated' => false]);
}