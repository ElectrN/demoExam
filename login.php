<?php
header('Content-Type: application/json');
require_once 'db.php';

session_start();

$input = json_decode(file_get_contents('php://input'), true);
$login = trim($input['login' ?? '']);
$password = $input['password'] ?? '';

if(!$login || !$password){
    http_response_code(400);
    echo json_encode(['error' =>'Введите логин и пароль']);
    exit;
}
try{
    $stmt = $pdo->prepare("SELECT id, login, fio, email, password, role FROM users WHERE login = ?");
     $stmt->execute([$login]);
     $user = $stmt->fetch();

     if(!$user || !password_verify($password, $user['password']){
        http_response_code(401);
        echo json_encode(['error' =>'Неверный логин или пароль']);
        exit;
     }

     $_SESSION['user_id'] = $user['id'];
     $_SESSION['user_login'] = $user['login'];
     $_SESSION['user_fio'] = $user['fio'];
     $_SESSION['user_role'] = $user['role'];

     $redirect = ($user['role'] === 'admin') ? 'admin.html' : 'dashboard.html';

     echo json_encode([
        'redirect' => $redirect,
        'user' => [
            'id' => $user['id'],
            'login' => $user['login'],
            'fio' => $user['fio'],
            'role' => $user['role']
        ]
     ]);
} catch (Exception $e){
    http_response_code(500);
    echo json_encode(['error'=>'Ошибка сервера']);
}