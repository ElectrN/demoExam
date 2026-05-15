// ============================================================
// ЕДИНЫЙ СКРИПТ ПРОЕКТА "КОРОЧКИ.ЕСТЬ"
// Автоматически определяет текущую страницу и запускает нужную логику
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
    const el = document.getElementById(elementId);
    if (!el) return; // Если элемент не найден — выходим
    el.textContent = text;
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
        const data = await res.json();

        if (!data.authenticated) {
            window.location.href = 'login.html'; // Перенаправление на вход
            return null;
        }
        return data.user;
    } catch (err) {
        console.log(err);
        window.location.href = 'login.html';
        return null;
    }
}

// ============================================================
// СТРАНИЦА РЕГИСТРАЦИИ (register.html)
// ============================================================
if (document.getElementById('registerForm')) {
    document.getElementById('registerForm').addEventListener('submit', async (e) => {
        e.preventDefault(); // Отменяем стандартную отправку формы

        // Собираем данные из полей формы
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

        if (data.login.length < 6 || !/^[a-zA-Z0-9]+$/.test(data.login)) {
            errors.push('Логин: латиница и цифры, минимум 6 символов');
        }
        if (data.password.length < 8) {
            errors.push('Пароль: минимум 8 символов');
        }
        if (!/^[а-яА-Я\s]+$/.test(data.fio)) {
            errors.push('ФИО: только кириллица и пробелы');
        }
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
                showMessage('message', 'Успешная регистрация! Переход на вход...', false);
                setTimeout(() => window.location.href = 'login.html', 3000);
            } else {
                showMessage('message', result.error, true);
            }
        } catch (err) {
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

        const data = {
            login: document.getElementById('login').value.trim(),
            password: document.getElementById('password').value,
        };

        if (!data.login || !data.password) {
            showMessage('message', 'Введите логин и пароль!', true);
            return;
        }

        try {
            const res = await fetch('../api/login.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const result = await res.json();

            if (res.ok) {
                showMessage('message', 'Успешный вход!', false);
                setTimeout(() => window.location.href = result.redirect, 1000);
            } else {
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

    // Проверка авторизации при загрузке страницы
    checkAuthAndRedirect().then(user => {
        if (user) {
            document.getElementById('welcomeMessage').textContent = `Здравствуйте, ${user.fio}!`;
        }
    });

    // Обработчик кнопки "Выйти"
    document.getElementById('logoutBtn')?.addEventListener('click', async () => {
        await fetch('../api/logout.php', { method: 'POST' });
        window.location.href = 'login.html';
    });

    // Обработчик формы подачи заявки
    document.getElementById('applicationForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = {
            course_name: document.getElementById('course').value,
            start_date: document.getElementById('startDate').value,
            payment: document.getElementById('payment').value
        };

        if (!data.course_name || !data.start_date || !data.payment) {
            showMessage('appMessage', 'Заполните все поля', true);
            return;
        }

        try {
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
    // ФУНКЦИЯ: ЗАГРУЗКА СПИСКА ЗАЯВОК
    // ============================================================
    async function loadApplications() {
        try {
            const res = await fetch('../api/applications.php');
            const result = await res.json();
            const container = document.getElementById('applicationsList');

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
    // ФУНКЦИЯ: ОТПРАВКА ОТЗЫВА
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
                loadApplications();
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

    // Проверка прав администратора
    checkAuthAndRedirect().then(user => {
        if (user && user.role !== 'admin') {
            window.location.href = 'dashboard.html'; // Перенаправляем обычных пользователей
        }
    });

    // ============================================================
    // ФУНКЦИЯ: ЗАГРУЗКА ВСЕХ ЗАЯВОК
    // ============================================================
    async function loadAllApplications() {
        try {
            const res = await fetch('../api/admin.php');
            const result = await res.json();
            const container = document.getElementById('allApplications');

            if (result.error) {
                container.innerHTML = `<div class="alert-error">${result.error}</div>`;
                return;
            }

            // Формируем HTML для отображения заявок
            container.innerHTML = result.length ? result.map(app => `
                <div class="card mb-2 p-2">
                    <strong>${app.user_fio}</strong> — ${app.course_name}<br>
                    Дата: ${app.start_date} | Оплата: ${app.payment_method}<br>
                    Статус: <span id="status-${app.id}">${app.status}</span>
                    <div class="mt-2">
                        <button class="btn btn-sm btn-warning" onclick="updateStatus(${app.id}, 'Идет обучение')">Идет обучение</button>
                        <button class="btn btn-sm btn-success" onclick="updateStatus(${app.id}, 'Обучение завершено')">Завершено</button>
                    </div>
                </div>
            `).join('') : '<p>Нет заявок</p>';
        } catch (err) {
            console.log(err);
            document.getElementById('errorMessage').textContent = err.message;
        }
    }

    // ============================================================
    // ФУНКЦИЯ: ОБНОВЛЕНИЕ СТАТУСА ЗАЯВКИ (глобальная для onclick)
    // ============================================================
    window.updateStatus = async function(id, status) {
        try {
            const res = await fetch('../api/admin.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status })
            });
            if (res.ok) {
                // Обновляем текст статуса на странице без перезагрузки
                document.getElementById(`status-${id}`).textContent = status;
            }
        } catch (err) {
            alert('Ошибка обновления');
        }
    };

    // Обработчик кнопки "Обновить"
    document.getElementById('refreshBtn')?.addEventListener('click', loadAllApplications);

    // Инициализация
    loadAllApplications();
}