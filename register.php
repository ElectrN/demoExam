<?php
header('Content-Type: application/json');
require_once 'db.php';
$input = json_encode(file_get_contents('php://input'), true);
$login=trim($input['login'] ?? '');
$password=$input['password' ?? ''];
$fio=trim($input['fio'] ?? '');
$phone=trim($input['phone'] ?? '');
$email=trim($input['email'] ?? '');

if(strlen($login) < 6 ||!preg_match('/^[a-zA-Z0-9]+$/', $login)){
    http_response_code(400);
    echo json_encode(['error' => 'Логин:латиница и цифры, минимум 6 символов'])
    exit;
}
if(strlen($password) < 8){
    http_response_code(400);
    echo json_encode(['error' => 'Пароль: минимум 8 символов'])
    exit;
}
if(!preg_match('/[а-яА-Я\s]+$/u',$fio)){
    http_response_code(400);
    echo json_encode(['error' => 'ФИО: только кириллица и пробелы'])
    exit;
}
if(!preg_match('/^8\(\d{3}\)\d{3}-\d{2}-\d{2}$/',$phone){
    http_response_code(400);
    echo json_encode(['error' => 'Телефон: формат 8(ХХХ)ХХХ-ХХ-ХХ'])
    exit;
}
if(!filter_var($email, FILTER_VALIDATE_EMAIL)){
    http_response_code(400);
    echo json_encode(['error' => 'Неверный email'])
    exit;
}

try{
    $stmt = $pdo->prepare("SELECT id from users WHERE login = ?")
    $stmt->execute([$login]);
    if($stmt->fetch()){
        http_response_code(409);
        echo json_encode(['error' => 'Пользователь уже существует'])
            exit;
    }
    $hash = password_hash($password, PASSWORD_DEFAULT)
    $stmt = $pdo->prepare("INSERT INTO users (login,password,fio, phone, email) VALUES (?,?,?,?,?)");
    $stmt->execute([$login,$hash,$fio,$phone,$email]);

    echo json_encode(['message'=>'Регистрация успешна'])
} catch (Exception $e){
    http_response_code(500);
    echo json_encode(['error'=>'Ошибка сервера'])
}
