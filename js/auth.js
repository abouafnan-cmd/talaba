// المتغير الذي يحفظ نوع المستخدم الحالي (الافتراضي: طالب)
let currentRole = 'student';

// وظيفة التبديل بين التبويبات وتغيير شكل النموذج
function switchTab(role) {
    currentRole = role;
    
    // 1. إعادة ضبط الألوان للتبويبات (جعلها غير نشطة)
    document.getElementById('tab-student').className = 'flex-1 py-3 text-center text-sm tab-inactive transition-all duration-300';
    document.getElementById('tab-teacher').className = 'flex-1 py-3 text-center text-sm tab-inactive transition-all duration-300';
    document.getElementById('tab-admin').className = 'flex-1 py-3 text-center text-sm tab-inactive transition-all duration-300';
    
    // 2. تفعيل التبويب الذي تم النقر عليه
    document.getElementById(`tab-${role}`).className = 'flex-1 py-3 text-center text-sm tab-active transition-all duration-300';

    // 3. تغيير الحقول بناءً على نوع المستخدم
    const userLabel = document.getElementById('userLabel');
    const passwordField = document.getElementById('passwordField');
    const passwordInput = document.getElementById('password');

    if (role === 'student') {
        userLabel.innerText = 'الاسم الكامل (للطالب)';
        passwordField.classList.add('hidden'); // إخفاء الرقم السري للطالب
        passwordInput.required = false;
    } else if (role === 'teacher') {
        userLabel.innerText = 'اسم المستخدم (الأستاذ)';
        passwordField.classList.remove('hidden'); // إظهار الرقم السري للأستاذ
        passwordInput.required = true;
    } else if (role === 'admin') {
        userLabel.innerText = 'اسم المستخدم (المدير)';
        passwordField.classList.remove('hidden'); // إظهار الرقم السري للمدير
        passwordInput.required = true;
    }
}

// وظيفة التعامل مع تسجيل الدخول والتوجيه للصفحات
function handleLogin(event) {
    event.preventDefault(); // منع تحديث الصفحة عند الضغط على الزر
    
    // توجيه المستخدم حسب نوعه إلى الصفحة المناسبة داخل مجلد pages
    if (currentRole === 'admin') {
        window.location.href = 'pages/admin.html';
    } else if (currentRole === 'teacher') {
        window.location.href = 'pages/teacher.html';
    } else if (currentRole === 'student') {
        window.location.href = 'pages/student.html';
    }
}