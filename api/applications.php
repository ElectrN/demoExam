<?php
// ============================================================
// API: РАБОТА С ЗАЯВКАМИ ПОЛЬЗОВАТЕЛЯ
// ============================================================

header('Content-Type: application/json');
require_once '../config/db.php';
session_start();

// Проверка: пользователь должен быть авторизован
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Требуется авторизация']);
    exit;
}

$user_id = $_SESSION['user_id'];
$input = json_decode(file_get_contents('php://input'), true);

// ============================================================
// ОТПРАВКА ОТЗЫВА (POST-запрос)
// ============================================================
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($input['action']) && $input['action'] === 'review') {
    $appId = $input['id'] ?? null;
    $review = trim($input['review'] ?? '');

    if (!$appId || !$review) {
        http_response_code(400);
        echo json_encode(['error' => 'Неверные данные отзыва']);
        exit;
    }

    // Проверяем, принадлежит ли заявка пользователю и завершена ли она
    $stmt = $pdo->prepare("SELECT id FROM applications WHERE id = ? AND user_id = ? AND status = 'Обучение завершено'");
    $stmt->execute([$appId, $user_id]);
    if (!$stmt->fetch()) {
        http_response_code(403);
        echo json_encode(['error' => 'Нельзя оставить отзыв для этой заявки']);
        exit;
    }

    $stmt = $pdo->prepare("UPDATE applications SET feedback = ? WHERE id = ?");
    $stmt->execute([$review, $appId]);
    echo json_encode(['message' => 'Отзыв сохранён']);
    exit;
}

// ============================================================
// СОЗДАНИЕ НОВОЙ ЗАЯВКИ (POST-запрос)
// ============================================================
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $course_name = trim($input['course_name'] ?? '');
    $start_date = $input['start_date'] ?? '';
    $payment = $input['payment'] ?? '';

    // Валидация: все поля обязательны
    if (!$course_name || !$start_date || !$payment) {
        http_response_code(400);
        echo json_encode(['error' => 'Заполните все поля!']);
        exit;
    }

    // Проверка допустимого способа оплаты
    if (!in_array($payment, ['Наличными', 'Перевод по номеру телефона'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Неверный метод оплаты']);
        exit;
    }

    // Список разрешённых названий курсов (защита от некорректных данных)
    $allowed_courses = [
        'Основы алгоритмизации и программирования',
        'Основы веб-дизайна',
        'Основы проектирования баз данных'
    ];
    if (!in_array($course_name, $allowed_courses)) {
        http_response_code(400);
        echo json_encode(['error' => 'Неверное название курса']);
        exit;
    }

    try {
        // Сохраняем заявку в базу данных
        $stmt = $pdo->prepare("
            INSERT INTO applications (user_id, course_name, start_date, payment_method)
            VALUES (?, ?, ?, ?)
        ");
        $stmt->execute([$user_id, $course_name, $start_date, $payment]);

        echo json_encode(['message' => 'Заявка отправлена']);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Ошибка при подаче заявки']);
    }
}
// ============================================================
// ПОЛУЧЕНИЕ СПИСКА ЗАЯВОК (GET-запрос)
// ============================================================
else {
    try {
        // Запрашиваем все заявки текущего пользователя
        $stmt = $pdo->prepare("
            SELECT * FROM applications
            WHERE user_id = ?
            ORDER BY created_at DESC
        ");
        $stmt->execute([$user_id]);
        $applications = $stmt->fetchAll();

        // Добавляем флаг возможности оставить отзыв
        foreach ($applications as &$app) {
            $app['can_review'] = ($app['status'] === 'Обучение завершено');
        }

        echo json_encode($applications);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Не удалось загрузить заявки']);
    }
}