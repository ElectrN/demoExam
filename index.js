console.log('Happy developing ✨')
function showMessage(elementId, text, isError = false){
    const el = document.getElementById(elementId);
    if(!el) return;
    el.textContent = text;
    el.className = isError ? 'alert-error' : 'alert-success';
}
async function checkAuthAndRedirect(){
    try{
        const res = await fetch('check-auth.php');
        const data = await res.json();
        if(!data.authenticated) {
            window.location.href = 'login.html';
            return null;
        }
            return data.user;
    } catch(err) {
        console.log(err);
        window.location.href = 'login.html';
        return null;
    }
}

if(document.getElementById('registerForm')){
    document.getElementById('registerForm').addEventListener('submit', async(e) =>{
        e.preventDefault();
        const data = {
            login: document.getElementById('login').value,
            password: document.getElementById('password').value,
            fio: document.getElementById('fio').value,
            phone: document.getElementById('phone').value,
            email: document.getElementById('email').value,
        }
        let errors = [];
        if (data.login.length <6 || !/^[a-zA-Z0-9]+$/.test(login)) {
            errors.push('Логин:латиница и цифры, минимум 6 символов')
        }
        if (data.password.length < 8) {
            errors.push("Пароль: минимум 8 символов")
        }
        if(!/^[а-яА-Я\s]+$/.test(data.fio)) {
            errors.push("ФИО: только кириллица и пробелы")
        }
        if(!/^8\(\d{3}\)\d{3}-\d{2}-\d{2}$/.test(data.phone)) {
            errors.push("Телефон: формат 8(ХХХ)ХХХ-ХХ-ХХ")
        }
        if (errors.length > 0){
            showMessage('message', errors.join('\n'), true);
            return ;
        }
        try {
            const res = await fetch('register.php', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(data)
            });
            const result = await res.json();
            if (res.ok) {
                showMessage('message', 'Успешная регистрация! Переход на страницу входа', false);
                setTimeout(() => window.location.href = 'login.html', 3000);
            } else {
                showMessage('message', result.error, true);
            }
        } catch (err){
            showMessage('message', "Не удалось подключиться к серверу", true);
        }
    });
}
if (document.getElementById('loginForm')){
    document.getElementById('loginForm').addEventListener('submit', async(e) =>{
        e.preventDefault();
        const data = {
            login: document.getElementById('login').value,
            password: document.getElementById('password').value,
        }
        if(!data.login || !data.password){
            showMessage('message', 'Введите логин и пароль!',true);
            return ;
        }
        try{
            const res = await fetch('login.php', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(data)
            });
            const result = await res.json();
            if (res.ok) {
                showMessage('message','Успешный вход', false);
                setTimeout(() => window.location.href = result.redirect, 3000);
            } else{
                showMessage('message', result.error, true);
            }
        } catch (err){
            console.log(err);
            showMessage('message', "Не удалось подключиться к серверу", true);
        }
    });
}
if (document.getElementById('applicationForm')) {
    checkAuthAndRedirect().then(user => {
        if (user) {
            document.getElementById('welcomeMessage').textContent = `Здравствуйте, ${user.fio}!`;
        }
    });

    document.getElementById('logoutBtn')?.addEventListener('click', async () => {
        await fetch('logout.php', {method: 'POST'});
        window.location.href = 'login.html';
    });
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
            const res = await fetch('applications.php', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(data)
            });
            const result = await res.json();

            if (res.ok) {
                showMessage('appMessage', 'Заявка отправлена');
                loadApplications();
                document.getElementById('applicationForm').reset();
            } else {
                showMessage('appMessage', result.error, true);
            }
        } catch (err) {
            console.log(err);
            showMessage('appMessage', 'Ошибка сети!', true);
        }
    });

    async function loadApplications() {
        try {
            const res = await fetch('applications.php');
            const result = await res.json();
            const container = document.getElementById('applicationsList');
            if (result.error) {
                container.innerHTML = `<div class="alert-error">${result.error}</div>`;
                return;
            }
            container.innerHTML = result.length ? result.map(app => `
                <div class="application-item">
                    <strong>${app.course_name}</strong>
                    Дата: ${app.start_date} | Статус: ${app.status}<br>
                    ${app.can_review ? `<button class="btn btn-sm btn-outline-primary review-btn" data-id="${app.id}">Оставить отзыв</button>` : ''}
                    ${app.feedback ? `<div class="mt-2><strong>Отзыв</strong>${app.feedback}</div>` : ''}
                </div>
                    `).join('') : `<p>У вас нет заявок.</p>`;
            document.querySelectorAll('.review-btn').forEach(btn => {
                btn.addEventListener('click', function ()
                {
                    const id = this.getAttribute('data-id');
                    const review = prompt('введите ваш отзыв:');
                    if (review) submitReview(id, review);
                }
            )
                ;
            });
        } catch (err) {
            document.getElementById('applicationsList').innerHTML = `<div class="alert-error">Ошибка загрузки</div>`;
        }
    }

    async function submitReview(appId, reviewText) {
        try {
            const res = await fetch('applications.php', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({action: 'review', id: appId, review: reviewText})
            });
            const result = await res.json();
            if (res.ok) {
                alert('Отзыв сохранён!');
                loadApplications();
            } else {
                alert('Ошибка:' + (result.error || 'не удалось сохранить'));
            }
        } catch (err) {
            console.log(err);
            alert('ошибка сети.');
        }
    }
    loadApplications();
}
if (document.getElementById('allApplications')) {
    chechAuthAndRedirect().then(user => {
        if (user && user.role !== 'admin'){
            window.location.href = 'dashboard.html';
        }
    });
    async function loadAllApplications() {
        try {
            const res = await fetch('admin.php');
            const result = await res.json();
            const container = document.getElementById('allApplications');
            if (result.error) {
                container.innerHTML = `<div class="alert-error">${result.error}</div>`;
                return;
            }
            container.innerHTML = result.length ? result.map(app => `
            <div class="card mb-2 p-2">
                <strong>${app.user_fio}</strong> - ${app.course_name}<br>
                Дата: ${app.start_date} | Оплата: ${app.payment}<br>
                Статус: <span id="status-${app.id}">${app.status}</span>
                <div class="mt-2">
                    <button class="btn btn-sm btn-warning" onclick="updateStatus(${app.id}, 'Идет обучение')">'Идет обучение'</button>
                    <button class="btn btn-sm btn-success" onclick="updateStatus(${app.id}, 'Обучние завершено')">Завершено</button>
                </div>
            </div>
            `).join('') : '<p>Нет заявок</p>';
        } catch (err) {
            console.log(err);
            document.getElementById('errorMessage').textContent = err.message;
        }
        window.updateStatus = async function (id, status) {
            try {
                const res = await fetch('admin.php', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({id, status})
                });
                if (res.ok) {
                    document.getElementById('status-${id}').textContent = status;
                }
            } catch (err) {
                alert("Ошибка обновления");
            }
            document.getElementById('refreshBtn').addEventListener('click', loadApplications);
            loadAllApplications();
        }
    }
}


