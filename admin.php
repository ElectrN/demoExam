<?php
header('Content-Type: application/json');
require_once 'db.php';
session_start();

if(!isset($_SESSION['role']) || $_SESSION['role'] !== 'admin'){
    http_response_code(403);
    echo json_encode(['error'=>"Требуются права администратора"]);
    exit;
}
if($_SERVER['REQUEST_METHOD'] === 'POST'){
    $input = json_decode(file_get_contents('php://input'), true);
    $application_id = $input['id'] ?? null;
    $status = $input['status'] ?? null;

    if(!$application_id || !in_array($status, ['Идет обучение','Обучение завершено'])){
        http_response_code(400);
        echo json_encode(['error' => 'Неверные данные для обновления']);
    }
    try{
        $stmt = $pdo->prepare("UPDATE applications SET status = ? WHERE id = ?");
        $stmt->execute([$status, $application_id]);
        echo json_encode(['success' => true]);
    } catch (Exception $e){
        http_response_code(500);
        echo json_encode(['error' ->'Ошибка при обновлении статуса']);
    }
} else {
    try{
        $stmt = $pdo->prepare("
            SELECT a.*, u.fio AS user_fio
            FROM applications a
            JOIN users u on a.user_id = u.id
            ORDER BY a.created_at DESC
        ");
        $stmt->execute();
        echo json_encode($stmt->fetchAll());
    } catch (Exception $e){
         http_response_code(500);
         echo json_encode(['error' ->'Ошибка при загрузке заявок']);
    }
}