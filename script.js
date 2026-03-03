// المتغير الذي يحفظ نوع المستخدم الحالي
let currentRole = 'student';

// وظيفة التبديل بين التبويبات
function switchTab(role) {
    currentRole = role;
    
    // إعادة ضبط الألوان للتبويبات
    document.getElementById('tab-student').className = 'flex-1 py-3 text-center text-sm tab-inactive transition-all duration-300';
    document.getElementById('tab-teacher').className = 'flex-1 py-3 text-center text-sm tab-inactive transition-all duration-300';
    document.getElementById('tab-admin').className = 'flex-1 py-3 text-center text-sm tab-inactive transition-all duration-300';
    
    // تفعيل التبويب المختار
    document.getElementById(`tab-${role}`).className = 'flex-1 py-3 text-center text-sm tab-active transition-all duration-300';

    // تغيير الحقول بناءً على نوع المستخدم
    const userLabel = document.getElementById('userLabel');
    const passwordField = document.getElementById('passwordField');
    const passwordInput = document.getElementById('password');

    if (role === 'student') {
        userLabel.innerText = 'الاسم الكامل';
        passwordField.classList.add('hidden');
        passwordInput.required = false;
    } else if (role === 'teacher') {
        userLabel.innerText = 'اسم المستخدم (الأستاذ)';
        passwordField.classList.remove('hidden');
        passwordInput.required = true;
    } else if (role === 'admin') {
        userLabel.innerText = 'اسم المستخدم (المدير)';
        passwordField.classList.remove('hidden');
        passwordInput.required = true;
    }
}

// وظيفة التعامل مع تسجيل الدخول
function handleLogin(event) {
    event.preventDefault(); // منع تحديث الصفحة
    
    const username = document.getElementById('username').value;
    
    // هنا لاحقاً سنربط الكود بقاعدة البيانات للتحقق
    // مؤقتاً سنقوم بتوجيه المستخدم مباشرة إلى لوحته
    
    alert(`مرحباً بك! جاري توجيهك إلى لوحة تحكم: ${currentRole === 'student' ? 'الطالب' : currentRole === 'teacher' ? 'الأستاذ' : 'الإدارة'}`);

    // أمثلة للتوجيه (سنصمم هذه الصفحات لاحقاً):
    /*
    if (currentRole === 'admin') window.location.href = 'pages/admin.html';
    else if (currentRole === 'teacher') window.location.href = 'pages/teacher.html';
    else window.location.href = 'pages/student.html';
    */
}