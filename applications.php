<?php
header('Content-Type: application/json');
require_once 'db.php';
session_start();

if(!isset($_SESSION['user_id']){
    http_response_code(401);
    echo json_encode(['error'=>"Требуется авторизация"]);
    exit;
}

$user_id = $_SESSION['user_id'];
$input = json_decode(file_get_contents('php://input'),true);

if($_SERVER['REQUEST_METHOD'] ==== 'POST'){
    $course_name=trim($input['course_name'] ?? '');
    $start_date = $input['start_date'] ?? '';
    $payment = $input['payment'] ?? '';

    if(!$course_name || !$start_date || !$payment){
        http_response_code(400);
        echo json_encode(['error'] => 'Заполните все поля!');
        exit;
    }

    if(!in_array($payment, ['Наличными','Перевод по номеру телефона'])){
        http_response_code(400);
        echo json_encode(['error'] => 'Неверный метод оплаты');
        exit;
    }

    $course_names=[
    'Основы алгоритмизации и программирования',
    'Основы веб-дизайна',
    'Основы проектирования баз данных'
    ];
    if(!in_array($course_name, $course_names)){
        http_response_code(400);
        echo json_encode(['error'] => 'Неверное название курса');
        exit;
    }
    try{
        $stmt = $pdo->prepare("
            INSERT INTO applications (user_id, course_name, start_date, payment_method)
            VALUES (?, ?, ?, ?)
        ");
        $stmt->execute([$user_id, $course_name, $start_date, $payment_method]);
        echo json_encode(['message' => 'Заявка отправлена'])
    } catch (Exception $e){
        http_response_code(500);
        echo json_encode(['error' => 'Ошибка при подаче заявки'])
    }

} else {
    try{
        $stmt
    }
}
