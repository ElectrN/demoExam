<?php
header('Content-Type application/json');
session_start();
if (isset$_SESSION['user_id']){
    echo json_encode([
        'authenticated' => true,
        'user' => [
                    'id' => $_SESSION['id'],
                    'login' => $_SESSION['login'],
                    'fio' => $_SESSION['fio'],
                    'role' => $_SESSION['role']
        ]
    ]);
} else {
    echo json_encode(['authenticated' => false]);
}