// ============================================================
// ЕДИНЫЙ СКРИПТ ПРОЕКТА "КОРОЧКИ.ЕСТЬ"
// Автоматически определяет текущую страницу и запускает нужную логику
// Все пути к API: ../api/ (так как файл лежит в assets/js/)
// ============================================================

// ============================================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ============================================================

/**
 * Показывает сообщение об ошибке или успехе под формой
 * @param {string} elementId - ID элемента для вывода сообщения
 * @param {string} text - Текст сообщения
 * @param {boolean} isError - true = ошибка (красный), false = успех (зелёный)
 */
function showMessage(elementId, text, isError = false) {
    // Находим элемент на странице по его ID
    const el = document.getElementById(elementId);
    // Если элемент не найден — выходим из функции
    if (!el) return;
    // Устанавливаем текст сообщения
    el.textContent = text;
    // Устанавливаем CSS-класс: alert-error или alert-success
    el.className = isError ? 'alert-error' : 'alert-success';
}

/**
 * Проверяет авторизацию пользователя и перенаправляет неавторизованных
 * @returns {Promise<Object|null>} Данные пользователя или null
 */
async function checkAuthAndRedirect() {
    try {
        // Запрос к API для проверки сессии (путь из assets/js/ в api/)
        const res = await fetch('../api/check-auth.php');
        // Преобразуем ответ в JSON
        const data = await res.json();

        // Если пользователь не авторизован — перенаправляем на вход
        if (!data.authenticated) {
            window.location.href = 'login.html';
            return null;
        }
        // Возвращаем данные пользователя для использования на странице
        return data.user;
    } catch (err) {
        // При ошибке сети тоже перенаправляем на вход
        console.log(err);
        window.location.href = 'login.html';
        return null;
    }
}

// ============================================================
// СТРАНИЦА РЕГИСТРАЦИИ (register.html)
// ============================================================
if (document.getElementById('registerForm')) {
    // Назначаем обработчик события "отправка формы"
    document.getElementById('registerForm').addEventListener('submit', async (e) => {
        // Отменяем стандартную отправку формы (перезагрузку страницы)
        e.preventDefault();

        // ============================================================
        // СБОР ДАННЫХ ИЗ ФОРМЫ
        // ============================================================
        const data = {
            login: document.getElementById('login').value,
            password: document.getElementById('password').value,
            fio: document.getElementById('fio').value,
            phone: document.getElementById('phone').value,
            email: document.getElementById('email').value,
        };

        // ============================================================
        // КЛИЕНТСКАЯ ВАЛИДАЦИЯ
        // ============================================================
        let errors = [];

        // Проверка логина: минимум 6 символов, только латиница и цифры
        if (data.login.length < 6 || !/^[a-zA-Z0-9]+$/.test(data.login)) {
            errors.push('Логин: латиница и цифры, минимум 6 символов');
        }
        // Проверка пароля: минимум 8 символов
        if (data.password.length < 8) {
            errors.push('Пароль: минимум 8 символов');
        }
        // Проверка ФИО: только кириллица и пробелы
        if (!/^[а-яА-Я\s]+$/u.test(data.fio)) {
            errors.push('ФИО: только кириллица и пробелы');
        }
        // Проверка телефона: строгий формат 8(XXX)XXX-XX-XX
        if (!/^8\(\d{3}\)\d{3}-\d{2}-\d{2}$/.test(data.phone)) {
            errors.push('Телефон: формат 8(XXX)XXX-XX-XX');
        }

        // Если есть ошибки — показываем их и выходим
        if (errors.length > 0) {
            showMessage('message', errors.join('\n'), true);
            return;
        }

        // ============================================================
        // ОТПРАВКА ДАННЫХ НА СЕРВЕР
        // ============================================================
        try {
            const res = await fetch('../api/register.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const result = await res.json();

            if (res.ok) {
                // Успех: показываем сообщение и перенаправляем на вход
                showMessage('message', 'Успешная регистрация! Переход на вход...', false);
                setTimeout(() => window.location.href = 'login.html', 3000);
            } else {
                // Ошибка сервера: показываем текст ошибки
                showMessage('message', result.error, true);
            }
        } catch (err) {
            // Ошибка сети: не удалось связаться с сервером
            showMessage('message', 'Не удалось подключиться к серверу', true);
        }
    });
}

// ============================================================
// СТРАНИЦА ВХОДА (login.html)
// ============================================================
if (document.getElementById('loginForm')) {
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        // Собираем данные формы
        const data = {
            login: document.getElementById('login').value.trim(),
            password: document.getElementById('password').value,
        };

        // Проверка на пустые поля
        if (!data.login || !data.password) {
            showMessage('message', 'Введите логин и пароль!', true);
            return;
        }

        try {
            // Отправляем запрос на сервер для авторизации
            const res = await fetch('../api/login.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const result = await res.json();

            if (res.ok) {
                // Успех: перенаправляем на страницу, указанную сервером
                showMessage('message', 'Успешный вход!', false);
                setTimeout(() => window.location.href = result.redirect, 1000);
            } else {
                // Ошибка: неверный логин или пароль
                showMessage('message', result.error, true);
            }
        } catch (err) {
            console.log(err);
            showMessage('message', 'Не удалось подключиться к серверу', true);
        }
    });
}

// ============================================================
// ЛИЧНЫЙ КАБИНЕТ (dashboard.html)
// ============================================================
if (document.getElementById('applicationForm')) {

    // ============================================================
    // ПРОВЕРКА АВТОРИЗАЦИИ ПРИ ЗАГРУЗКЕ СТРАНИЦЫ
    // ============================================================
    checkAuthAndRedirect().then(user => {
        if (user) {
            // Отображаем приветствие с ФИО пользователя
            document.getElementById('welcomeMessage').textContent = `Здравствуйте, ${user.fio}!`;
        }
    });

    // ============================================================
    // ОБРАБОТЧИК КНОПКИ "ВЫЙТИ"
    // ============================================================
    document.getElementById('logoutBtn')?.addEventListener('click', async () => {
        await fetch('../api/logout.php', { method: 'POST' });
        window.location.href = 'login.html';
    });

    // ============================================================
    // ОБРАБОТЧИК ФОРМЫ ПОДАЧИ ЗАЯВКИ
    // ============================================================
    document.getElementById('applicationForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = {
            course_name: document.getElementById('course').value,
            start_date: document.getElementById('startDate').value,
            payment: document.getElementById('payment').value
        };

        // Проверка заполненности всех полей
        if (!data.course_name || !data.start_date || !data.payment) {
            showMessage('appMessage', 'Заполните все поля', true);
            return;
        }

        try {
            // Отправляем заявку на сервер
            const res = await fetch('../api/applications.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const result = await res.json();

            if (res.ok) {
                showMessage('appMessage', 'Заявка отправлена!', false);
                loadApplications(); // Обновляем список заявок
                document.getElementById('applicationForm').reset(); // Очищаем форму
            } else {
                showMessage('appMessage', result.error, true);
            }
        } catch (err) {
            console.log(err);
            showMessage('appMessage', 'Ошибка сети!', true);
        }
    });

    // ============================================================
    // ФУНКЦИЯ: ЗАГРУЗКА СПИСКА ЗАЯВОК ПОЛЬЗОВАТЕЛЯ
    // ============================================================
    async function loadApplications() {
        try {
            const res = await fetch('../api/applications.php');
            const result = await res.json();
            const container = document.getElementById('applicationsList');

            // Если сервер вернул ошибку
            if (result.error) {
                container.innerHTML = `<div class="alert-error">${result.error}</div>`;
                return;
            }

            // Формируем HTML для каждой заявки
            container.innerHTML = result.length ? result.map(app => `
                <div class="application-item">
                    <strong>${app.course_name}</strong><br>
                    Дата: ${app.start_date} | Статус: ${app.status}<br>
                    ${app.can_review ? `<button class="btn btn-sm btn-outline-primary review-btn" data-id="${app.id}">Оставить отзыв</button>` : ''}
                    ${app.feedback ? `<div class="mt-2"><strong>Отзыв:</strong> ${app.feedback}</div>` : ''}
                </div>
            `).join('') : '<p>У вас нет заявок.</p>';

            // Назначаем обработчики для кнопок "Оставить отзыв"
            document.querySelectorAll('.review-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const id = this.getAttribute('data-id');
                    const review = prompt('Введите ваш отзыв:');
                    if (review) submitReview(id, review);
                });
            });
        } catch (err) {
            document.getElementById('applicationsList').innerHTML = '<div class="alert-error">Ошибка загрузки</div>';
        }
    }

    // ============================================================
    // ФУНКЦИЯ: ОТПРАВКА ОТЗЫВА НА СЕРВЕР
    // ============================================================
    async function submitReview(appId, reviewText) {
        try {
            const res = await fetch('../api/applications.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'review', id: appId, review: reviewText })
            });
            const result = await res.json();

            if (res.ok) {
                alert('Отзыв сохранён!');
                loadApplications(); // Обновляем список после сохранения
            } else {
                alert('Ошибка: ' + (result.error || 'не удалось сохранить'));
            }
        } catch (err) {
            console.log(err);
            alert('Ошибка сети.');
        }
    }

    // Инициализация: загружаем заявки при открытии страницы
    loadApplications();
}

// ============================================================
// ПАНЕЛЬ АДМИНИСТРАТОРА (admin.html)
// ============================================================
if (document.getElementById('allApplications')) {

    // ============================================================
    // ПРОВЕРКА ПРАВ АДМИНИСТРАТОРА
    // ============================================================
    checkAuthAndRedirect().then(user => {
        if (user && user.role !== 'admin') {
            // Если пользователь не админ — перенаправляем в личный кабинет
            window.location.href = 'dashboard.html';
        }
    });

    // ============================================================
    // ОБРАБОТЧИК КНОПКИ "ВЫЙТИ" ДЛЯ АДМИНА
    // ============================================================
    document.getElementById('adminLogoutBtn')?.addEventListener('click', async () => {
        await fetch('../api/logout.php', { method: 'POST' });
        window.location.href = 'login.html';
    });

    // Глобальная переменная для хранения всех заявок (для клиентской фильтрации)
    let allAppsData = [];

    // ============================================================
    // ФУНКЦИЯ: ЗАГРУЗКА ВСЕХ ЗАЯВОК С СЕРВЕРА
    // ============================================================
    async function loadAllApplications() {
        try {
            const res = await fetch('../api/admin.php');
            allAppsData = await res.json(); // Сохраняем для фильтрации
            filterAndRender(); // Применяем текущий фильтр и отрисовываем
        } catch (err) {
            console.log(err);
            document.getElementById('errorMessage').textContent = err.message;
            document.getElementById('errorMessage').style.display = 'block';
        }
    }

    // ============================================================
    // ФУНКЦИЯ: ФИЛЬТРАЦИЯ И ОТРИСОВКА ЗАЯВОК
    // ============================================================
    function filterAndRender() {
        const filter = document.getElementById('statusFilter')?.value || 'all';
        // Фильтруем массив: если 'all' — показываем всё, иначе — только выбранный статус
        const filtered = filter === 'all' ? allAppsData : allAppsData.filter(app => app.status === filter);
        const container = document.getElementById('allApplications');

        if (filtered.error) {
            container.innerHTML = `<div class="alert-error">${filtered.error}</div>`;
            return;
        }

        // Формируем HTML для отображения заявок
        container.innerHTML = filtered.length ? filtered.map(app => `
            <div class="card mb-2 p-2">
                <div class="d-flex flex-wrap align-items-center justify-content-between gap-2">
                    <span><strong>${app.user_fio}</strong> — ${app.course_name}</span>
                    <span class="badge bg-secondary">${app.status}</span>
                </div>
                <div class="mt-1 small text-muted">Дата: ${app.start_date} | Оплата: ${app.payment_method}</div>
                <div class="mt-2">
                    <button class="btn btn-sm btn-warning" onclick="updateStatus(${app.id}, 'Идет обучение')">Идет обучение</button>
                    <button class="btn btn-sm btn-success" onclick="updateStatus(${app.id}, 'Обучение завершено')">Завершено</button>
                </div>
            </div>
        `).join('') : '<p class="text-muted">Нет заявок по выбранному фильтру.</p>';
    }

    // ============================================================
    // ОБРАБОТЧИК ИЗМЕНЕНИЯ ФИЛЬТРА ПО СТАТУСУ
    // ============================================================
    document.getElementById('statusFilter')?.addEventListener('change', filterAndRender);

    // ============================================================
    // ОБРАБОТЧИК КНОПКИ "ОБНОВИТЬ"
    // ============================================================
    document.getElementById('refreshBtn')?.addEventListener('click', loadAllApplications);

    // ============================================================
    // ФУНКЦИЯ: ОБНОВЛЕНИЕ СТАТУСА ЗАЯВКИ (глобальная для onclick в HTML)
    // ============================================================
    window.updateStatus = async function(id, status) {
        try {
            const res = await fetch('../api/admin.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status })
            });
            if (res.ok) {
                // Перезагружаем список, чтобы обновить статус и updated_at
                loadAllApplications();
            }
        } catch (err) {
            alert('Ошибка обновления');
        }
    };

    // Инициализация: загружаем заявки при открытии страницы
    loadAllApplications();
}